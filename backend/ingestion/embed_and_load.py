# /// script
# requires-python = ">=3.11"
# dependencies = ["openai", "asyncpg", "pdfplumber", "tiktoken"]
# ///
"""Embed chunks and load into PostgreSQL with pgvector."""

import asyncio
import json
import logging
import os
from pathlib import Path

import asyncpg
import pdfplumber
from openai import AsyncOpenAI

from sources import get_source_metadata

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
CHUNKS_PATH = DATA_DIR / "chunks" / "new_documents.json"
RAW_DIR = DATA_DIR / "raw"

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ehs_user:ehspass@localhost:5432/ehs_platform")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def embed_text(text: str) -> list[float]:
    """Generate embedding for text using OpenAI text-embedding-3-small."""
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


async def embed_batch(texts: list[str], batch_size: int = 100) -> list[list[float]]:
    """Embed texts in batches."""
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=batch,
        )
        embeddings.extend([d.embedding for d in response.data])
        log.info("Embedded batch %d-%d of %d", i, i + len(batch), len(texts))
    return embeddings


def get_pdf_page_count(filename: str) -> int:
    """Get page count from PDF file."""
    pdf_path = RAW_DIR / filename
    if not pdf_path.exists():
        return 0
    try:
        with pdfplumber.open(pdf_path) as pdf:
            return len(pdf.pages)
    except Exception:
        return 0


async def main():
    if not OPENAI_API_KEY:
        log.error("OPENAI_API_KEY not set")
        return

    # Load chunks
    with open(CHUNKS_PATH) as f:
        all_chunks = json.load(f)
    log.info("Loaded %d chunks from %s", len(all_chunks), CHUNKS_PATH)

    # Group chunks by source file
    docs_data: dict[str, list[dict]] = {}
    for chunk in all_chunks:
        source = chunk["source"]
        if source not in docs_data:
            docs_data[source] = []
        docs_data[source].append(chunk)

    # Connect to database
    conn = await asyncpg.connect(DATABASE_URL)
    log.info("Connected to database")

    try:
        # Process each document
        for filename, chunks in docs_data.items():
            meta = get_source_metadata(filename)
            if meta is None:
                log.warning("SKIP %s (no metadata or image-based)", filename)
                continue

            # Check if document already exists
            existing = await conn.fetchval(
                "SELECT id FROM documents WHERE filename = $1", filename
            )
            if existing:
                log.info("SKIP %s (already ingested)", filename)
                continue

            # Get page count
            page_count = get_pdf_page_count(filename)
            total_tokens = sum(c.get("token_count", 0) for c in chunks)

            # Insert document
            doc_id = await conn.fetchval(
                """
                INSERT INTO documents (filename, source_org, regulation_ref, title, pillar, page_count, token_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                """,
                filename,
                meta["source_org"],
                meta.get("regulation_ref"),
                meta["title"],
                meta["pillar"],
                page_count,
                total_tokens,
            )
            log.info("Inserted document %s (id=%s)", filename, doc_id)

            # Embed all chunks for this document
            texts = [c["text"] for c in chunks]
            embeddings = await embed_batch(texts)

            # Insert chunks
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
                await conn.execute(
                    """
                    INSERT INTO document_chunks (document_id, chunk_index, content, token_count, embedding)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    doc_id,
                    chunk["chunk_index"],
                    chunk["text"],
                    chunk.get("token_count", 0),
                    embedding_str,
                )

            log.info("Inserted %d chunks for %s", len(chunks), filename)

    finally:
        await conn.close()

    log.info("Done")


if __name__ == "__main__":
    asyncio.run(main())
