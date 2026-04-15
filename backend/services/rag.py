# RAG service: embedding and chunk retrieval
import logging
from typing import Optional

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config import OPENAI_API_KEY

log = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def embed_text(text_content: str) -> list[float]:
    """Generate embedding for text using OpenAI text-embedding-3-small."""
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text_content,
    )
    return response.data[0].embedding


async def retrieve_chunks(
    db: AsyncSession,
    query: str,
    top_k: int = 5,
) -> list[dict]:
    """Embed query and retrieve top_k similar chunks from pgvector."""
    embedding = await embed_text(query)
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

    result = await db.execute(
        text("""
            SELECT
                dc.content,
                dc.token_count,
                d.id,
                d.title,
                d.source_org,
                d.regulation_ref,
                dc.embedding <=> :embedding as distance
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            ORDER BY dc.embedding <=> :embedding
            LIMIT :top_k
        """),
        {"embedding": embedding_str, "top_k": top_k},
    )

    chunks = []
    for row in result.fetchall():
        # Convert cosine distance to confidence percentage (0-100)
        # Distance ranges from 0 (identical) to 2 (opposite)
        # Typical range for relevant docs is 0.2-0.6
        distance = row[6]
        confidence = max(0, min(100, int((1 - distance) * 100)))
        chunks.append({
            "content": row[0],
            "token_count": row[1],
            "document_id": str(row[2]),
            "document_title": row[3],
            "source_org": row[4],
            "regulation_ref": row[5],
            "confidence": confidence,
        })
    return chunks


def _build_context(chunks: list[dict]) -> str:
    """Build context string from chunks."""
    return "\n\n---\n\n".join(
        f"[{c['source_org']} - {c['document_title']}]\n{c['content']}"
        for c in chunks
    )


def _build_system_prompt(lang: str) -> str:
    """Build system prompt for EHS Q&A."""
    return f"""You are an expert EHS (Environment, Health & Safety) compliance advisor. Your role is to provide comprehensive, well-structured guidance based on the regulatory documents provided.

RESPONSE GUIDELINES:

1. CLARIFICATION FIRST: If the query is ambiguous or could benefit from more context, start by asking 1-2 specific clarifying questions. For example:
   - "To provide the most relevant guidance, could you specify: [specific question]?"
   - "This procedure varies by context. Are you asking about [option A] or [option B]?"

2. STRUCTURE YOUR RESPONSE: Use clear markdown formatting:
   - Use **bold** for key terms and requirements
   - Use bullet points or numbered lists for steps/requirements
   - Use headings (##) to organize sections when appropriate
   - Break down complex procedures into clear steps

3. BE COMPREHENSIVE: Synthesize information from ALL provided documents into a unified, detailed answer. Cover:
   - Key requirements and procedures
   - Safety precautions and PPE requirements
   - Step-by-step guidance where applicable
   - Important warnings or considerations

4. DO NOT CITE SOURCES IN THE RESPONSE: The user will see source citations separately below your answer. Do not write things like "According to OSHA..." or "Source: CFR 1910..." in your response.

5. LANGUAGE: Respond in {lang}.

Your goal is to be a helpful compliance advisor who provides actionable, detailed guidance that helps users understand and follow EHS requirements."""


async def generate_answer(
    query: str,
    chunks: list[dict],
    lang: str = "en",
) -> str:
    """Call GPT-4o-mini to generate an answer based on retrieved chunks."""
    context = _build_context(chunks)
    system_prompt = _build_system_prompt(lang)

    response = await client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


async def generate_answer_stream(
    query: str,
    chunks: list[dict],
    lang: str = "en",
):
    """Stream GPT-4o-mini response for faster perceived latency."""
    context = _build_context(chunks)
    system_prompt = _build_system_prompt(lang)

    stream = await client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ],
        temperature=0.2,
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
