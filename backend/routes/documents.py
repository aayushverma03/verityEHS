# Document routes: list and detail
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from db import get_db
from models import DocumentDetail, DocumentListItem

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentListItem])
async def list_documents(
    pillar: Optional[str] = Query(None),
    source_org: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all documents with optional filters."""
    query = """
        SELECT id, title, source_org, regulation_ref, pillar, language, page_count
        FROM documents
        WHERE 1=1
    """
    params = {}

    if pillar:
        query += " AND pillar = :pillar"
        params["pillar"] = pillar
    if source_org:
        query += " AND source_org = :source_org"
        params["source_org"] = source_org

    query += " ORDER BY title"

    result = await db.execute(text(query), params)
    return [
        DocumentListItem(
            id=row[0],
            title=row[1],
            source_org=row[2],
            regulation_ref=row[3],
            pillar=row[4],
            language=row[5],
            page_count=row[6],
        )
        for row in result.fetchall()
    ]


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get full document details."""
    result = await db.execute(
        text("""
            SELECT id, filename, source_url, source_org, regulation_ref, title,
                   pillar, language, page_count, token_count, creation_date, ingested_at
            FROM documents WHERE id = :id
        """),
        {"id": str(doc_id)},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentDetail(
        id=row[0],
        filename=row[1],
        source_url=row[2],
        source_org=row[3],
        regulation_ref=row[4],
        title=row[5],
        pillar=row[6],
        language=row[7],
        page_count=row[8],
        token_count=row[9],
        creation_date=row[10],
        ingested_at=row[11],
    )
