# Search route: RAG search over EHS documents
import json
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from langdetect import LangDetectException, detect
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from db import get_db
from models import Citation, SearchRequest, SearchResponse
from services.rag import generate_answer, generate_answer_stream, retrieve_chunks

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search(
    body: SearchRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """RAG search: embed query, retrieve chunks, generate answer."""
    try:
        lang = detect(body.query)
    except LangDetectException:
        lang = "en"

    chunks = await retrieve_chunks(db, body.query, top_k=5)
    answer = await generate_answer(body.query, chunks, lang)

    citations = [
        Citation(
            document_id=c["document_id"],
            document_title=c["document_title"],
            source_org=c["source_org"],
            regulation_reference=c["regulation_ref"],
            chunk_excerpt=c["content"][:300] + "..." if len(c["content"]) > 300 else c["content"],
            confidence=c["confidence"],
        )
        for c in chunks
    ]

    return SearchResponse(answer=answer, citations=citations)


@router.post("/search/stream")
async def search_stream(
    body: SearchRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Streaming RAG search: returns SSE with answer tokens and citations."""
    try:
        lang = detect(body.query)
    except LangDetectException:
        lang = "en"

    chunks = await retrieve_chunks(db, body.query, top_k=5)

    citations = [
        {
            "document_id": c["document_id"],
            "document_title": c["document_title"],
            "source_org": c["source_org"],
            "regulation_reference": c["regulation_ref"],
            "chunk_excerpt": c["content"][:300] + "..." if len(c["content"]) > 300 else c["content"],
            "confidence": c["confidence"],
        }
        for c in chunks
    ]

    async def event_stream():
        # Send citations first
        yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

        # Stream answer tokens
        async for token in generate_answer_stream(body.query, chunks, lang):
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        # Signal completion
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
