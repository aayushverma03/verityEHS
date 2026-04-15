# Search route: RAG search over EHS documents
import logging

from fastapi import APIRouter, Depends
from langdetect import LangDetectException, detect
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from db import get_db
from models import Citation, SearchRequest, SearchResponse
from services.rag import generate_answer, retrieve_chunks

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search(
    body: SearchRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """RAG search: embed query, retrieve chunks, generate answer."""
    # Detect query language
    try:
        lang = detect(body.query)
    except LangDetectException:
        lang = "en"

    # Retrieve relevant chunks
    chunks = await retrieve_chunks(db, body.query, top_k=5)

    # Generate answer
    answer = await generate_answer(body.query, chunks, lang)

    # Build citations
    citations = [
        Citation(
            document_title=c["document_title"],
            source_org=c["source_org"],
            regulation_reference=c["regulation_ref"],
            chunk_excerpt=c["content"][:300] + "..." if len(c["content"]) > 300 else c["content"],
        )
        for c in chunks
    ]

    return SearchResponse(answer=answer, citations=citations)
