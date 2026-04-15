# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf", "tiktoken", "langdetect"]
# ///
"""Extract all PDFs from backend/data/raw/ and save chunks to JSON."""

import json
import logging
import re
from pathlib import Path

import fitz  # pymupdf
import tiktoken
from langdetect import DetectorFactory, LangDetectException, detect

DetectorFactory.seed = 0

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "data" / "chunks"
ENCODING = tiktoken.get_encoding("cl100k_base")
CHUNK_SIZE = 800
OVERLAP = 100


def repair_text(text: str) -> str:
    """Fix common PDF extraction issues like missing spaces."""
    # Insert space between lowercase and uppercase (camelCase issues)
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    # Insert space after period/comma if followed by letter (no space)
    text = re.sub(r'([.,:;])([A-Za-z])', r'\1 \2', text)
    # Insert space between letter and opening paren
    text = re.sub(r'([a-zA-Z])(\()', r'\1 \2', text)
    # Insert space between closing paren and letter
    text = re.sub(r'(\))([a-zA-Z])', r'\1 \2', text)
    # Fix common concatenated words (lowercase letter followed by common word starts)
    text = re.sub(r'([a-z])(the|and|for|with|that|this|from|have|must|shall|should|will|can|may)', r'\1 \2', text, flags=re.IGNORECASE)
    # Normalize multiple spaces
    text = re.sub(r' +', ' ', text)
    return text.strip()


def extract_pdf(path: Path) -> dict:
    """Return metadata + full_text from a PDF using pymupdf."""
    doc = fitz.open(path)
    meta = doc.metadata or {}
    pages = []
    for page in doc:
        text = page.get_text("text")
        pages.append(text or "")
    doc.close()

    raw_text = "\n\n".join(pages).strip()
    text = repair_text(raw_text)

    try:
        lang = detect(text[:3000]) if text else None
    except LangDetectException:
        lang = None
    return {
        "filename": path.name,
        "title": meta.get("title"),
        "author": meta.get("author"),
        "subject": meta.get("subject"),
        "page_count": len(pages),
        "text": text,
        "token_count": len(ENCODING.encode(text)),
        "language": lang,
    }


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into token chunks with overlap."""
    tokens = ENCODING.encode(text)
    step = chunk_size - overlap
    chunks = []
    for start in range(0, len(tokens), step):
        chunks.append(ENCODING.decode(tokens[start : start + chunk_size]))
        if start + chunk_size >= len(tokens):
            break
    return chunks


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    all_chunks = []
    paths = sorted(RAW_DIR.glob("*.pdf"))

    for path in paths:
        try:
            doc = extract_pdf(path)
        except Exception as e:
            log.warning("FAIL %s: %s", path.name, e)
            continue

        chunks = chunk_text(doc["text"], CHUNK_SIZE, OVERLAP)
        log.info(
            "OK   %s  pages=%d  tokens=%d  chunks=%d  lang=%s",
            path.name, doc["page_count"], doc["token_count"], len(chunks), doc["language"],
        )

        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "source": path.name,
                "title": doc["title"],
                "chunk_index": i,
                "text": chunk,
                "token_count": len(ENCODING.encode(chunk)),
            })

    output_path = OUTPUT_DIR / "new_documents.json"
    with open(output_path, "w") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)

    log.info("Wrote %d chunks to %s", len(all_chunks), output_path)


if __name__ == "__main__":
    main()
