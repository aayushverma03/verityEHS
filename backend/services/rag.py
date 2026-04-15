# RAG service: embedding, retrieval, and answer generation
import logging
import re

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config import OPENAI_API_KEY

log = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

DEFAULT_TOP_K = 5
MAX_DISTANCE = 0.55
MAX_CHARS_PER_CHUNK = 1400


async def embed_text(text_content: str) -> list[float]:
    """Generate embedding for text using OpenAI text-embedding-3-small."""
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text_content,
    )
    return response.data[0].embedding


def _to_chunk_dict(row) -> dict:
    """Convert SQL row to API chunk dict with bounded confidence."""
    distance = float(row[6])
    similarity = max(0.0, min(1.0, 1.0 - distance))
    confidence = int(round(similarity * 100))

    return {
        "content": row[0],
        "token_count": row[1],
        "document_id": str(row[2]),
        "document_title": row[3],
        "source_org": row[4],
        "regulation_ref": row[5],
        "confidence": confidence,
        "distance": distance,
    }


async def retrieve_chunks(
    db: AsyncSession,
    query: str,
    top_k: int = DEFAULT_TOP_K,
    max_distance: float = MAX_DISTANCE,
) -> list[dict]:
    """Retrieve relevant chunks with a relevance threshold and nearest fallback."""
    embedding = await embed_text(query)
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

    # Pass 1: only sufficiently relevant chunks
    filtered = await db.execute(
        text(
            """
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
            WHERE dc.embedding <=> :embedding <= :max_distance
            ORDER BY dc.embedding <=> :embedding
            LIMIT :top_k
            """
        ),
        {"embedding": embedding_str, "max_distance": max_distance, "top_k": top_k},
    )
    rows = filtered.fetchall()

    # Pass 2 fallback: if threshold removes everything, use nearest neighbors
    if not rows:
        nearest = await db.execute(
            text(
                """
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
                """
            ),
            {"embedding": embedding_str, "top_k": top_k},
        )
        rows = nearest.fetchall()

    return [_to_chunk_dict(row) for row in rows]


def _normalize_chunk_text(text_content: str) -> str:
    """Normalize noisy extraction text and cap per-chunk size in prompt context."""
    squashed = " ".join(text_content.split())
    return squashed[:MAX_CHARS_PER_CHUNK]


def _build_context(chunks: list[dict]) -> str:
    """Build compact context string from chunks."""
    parts = []
    for idx, chunk in enumerate(chunks, start=1):
        source = chunk.get("source_org") or "Unknown source"
        title = chunk.get("document_title") or "Untitled document"
        content = _normalize_chunk_text(chunk.get("content", ""))
        parts.append(f"[Source {idx}: {source} | {title}]\n{content}")
    return "\n\n---\n\n".join(parts)


def _build_system_prompt(lang: str) -> str:
    """Build strict, readable system prompt for EHS Q&A."""
    return f"""You are an expert EHS compliance advisor.

PRIORITY:
- Give a direct, conclusive answer first.
- Keep it concise and practical.
- Use only information grounded in the provided context.

FORMAT RULES (STRICT):
- Output plain Markdown only.
- Do not use headings.
- Do not use bold or italics.
- Do not output asterisks like * or ** anywhere.
- Do not print "Answer" or "Overview" labels.
- Start with 1-2 short plain-text lines.
- Use section labels ending with ":" only when helpful (example: "HSE says:").
- Use bullet points only for actual item lists (not every sentence).
- Never make section labels into bullet items.
- Keep blank lines between paragraphs and sections.
- Do not repeat points or add filler text.

LENGTH RULES:
- If the question is definitional (for example: "What is PPE handling?"):
  - Target 60-120 words.
  - Include: plain definition + why it matters + key practice points.
- For broader procedural questions, keep it brief and actionable.

AMBIGUITY RULE:
- If context is insufficient or ambiguous, end with:
  Clarifying question: <one short, specific question>

LANGUAGE: {lang}"""


def _response_budget_for(query: str) -> int:
    """Set tighter completion budgets so answers stay focused."""
    q = query.strip().lower()
    word_count = len(q.split())

    definitional_prefixes = (
        "what is",
        "what are",
        "define",
        "meaning of",
        "explain",
    )
    is_definition = q.startswith(definitional_prefixes)

    if is_definition and word_count <= 10:
        return 300
    if word_count <= 18:
        return 420
    return 620


def _build_user_prompt(query: str, context: str) -> str:
    """Build user message payload for generation."""
    return f"Question:\n{query}\n\nContext:\n{context}"


def _format_answer_for_readability(answer: str) -> str:
    """Normalize markdown while preserving natural paragraph flow."""
    text_content = (answer or "").replace("\r\n", "\n")
    if not text_content.strip():
        return ""

    cleaned: list[str] = []
    for raw_line in text_content.split("\n"):
        line = raw_line.strip()
        if not line:
            cleaned.append("")
            continue

        line = re.sub(r"^#{1,6}\s*", "", line).strip()
        line = re.sub(r"^\d+\)\s*", "- ", line)
        line = re.sub(r"^\d+\.\s*", "- ", line)
        line = re.sub(r"^[•]\s*", "- ", line)
        line = line.replace("**", "").replace("__", "").replace("*", "")
        line = re.sub(r"\s+", " ", line).strip()

        # Section labels should not be bullets.
        if line.startswith("- ") and line[2:].strip().endswith(":"):
            line = line[2:].strip()

        # Keep clarifying question as plain paragraph text.
        if line.lower().startswith("- clarifying question:"):
            line = "Clarifying question:" + line.split(":", 1)[1]

        cleaned.append(line)

    # Drop generic leading labels.
    while cleaned and cleaned[0].strip().lower() in {"", "answer", "overview", "response", "key points", "key points:"}:
        cleaned.pop(0)

    if not cleaned:
        return ""

    formatted: list[str] = []

    def push_blank() -> None:
        if formatted and formatted[-1] != "":
            formatted.append("")

    for line in cleaned:
        if not line:
            push_blank()
            continue

        is_bullet = line.startswith("- ")
        is_section_label = line.endswith(":") and len(line) <= 80 and not is_bullet
        is_clarifying = line.lower().startswith("clarifying question:")

        # Add spacing before sections/lists for readability.
        if is_section_label:
            push_blank()
            formatted.append(line)
            push_blank()
            continue

        if is_bullet and formatted and not (formatted[-1] == "" or formatted[-1].endswith(":") or formatted[-1].startswith("- ")):
            push_blank()

        if (not is_bullet) and formatted and formatted[-1].startswith("- "):
            push_blank()

        if is_clarifying:
            push_blank()

        formatted.append(line)

    # Collapse repeated blank lines and trim edges.
    compact: list[str] = []
    prev_blank = True
    for line in formatted:
        blank = line == ""
        if blank and prev_blank:
            continue
        compact.append(line)
        prev_blank = blank

    while compact and compact[0] == "":
        compact.pop(0)
    while compact and compact[-1] == "":
        compact.pop()

    return "\n".join(compact).strip()


async def generate_answer(
    query: str,
    chunks: list[dict],
    lang: str = "en",
) -> str:
    """Generate answer based on retrieved chunks."""
    context = _build_context(chunks)
    system_prompt = _build_system_prompt(lang)

    response = await client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_prompt(query, context)},
        ],
        temperature=0.0,
        max_completion_tokens=_response_budget_for(query),
    )
    raw_answer = response.choices[0].message.content or ""
    return _format_answer_for_readability(raw_answer)


async def generate_answer_stream(
    query: str,
    chunks: list[dict],
    lang: str = "en",
):
    """Stream response with same constraints as non-streaming mode."""
    context = _build_context(chunks)
    system_prompt = _build_system_prompt(lang)

    stream = await client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_prompt(query, context)},
        ],
        temperature=0.0,
        max_completion_tokens=_response_budget_for(query),
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
