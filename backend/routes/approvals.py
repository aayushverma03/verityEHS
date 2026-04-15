# Approval routes: CRUD for work permits
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from db import get_db
from models import (
    ApprovalCreateRequest,
    ApprovalCreateResponse,
    ApprovalDetail,
    ApprovalListItem,
    ApprovalReviewItem,
    ApprovalStatusResponse,
    ApprovalStatusUpdate,
)

router = APIRouter(prefix="/api/approvals", tags=["approvals"])


@router.post("", response_model=ApprovalCreateResponse, status_code=201)
async def create_approval(
    body: ApprovalCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Create a new approval request."""
    result = await db.execute(
        text("""
            INSERT INTO approval_requests
                (requester_id, operation_type, site_name, planned_start, planned_end,
                 risk_notes, risk_score, risk_colour, status)
            VALUES
                (:requester_id, :operation_type, :site_name, :planned_start, :planned_end,
                 :risk_notes, :risk_score, :risk_colour, 'pending')
            RETURNING id, operation_type, site_name, planned_start, planned_end,
                      risk_notes, risk_score, risk_colour, status, created_at
        """),
        {
            "requester_id": str(user["id"]),
            "operation_type": body.operation_type,
            "site_name": body.site_name,
            "planned_start": body.planned_start,
            "planned_end": body.planned_end,
            "risk_notes": body.risk_notes,
            "risk_score": body.risk_score,
            "risk_colour": body.risk_colour,
        },
    )
    await db.commit()
    row = result.fetchone()
    return ApprovalCreateResponse(
        id=row[0],
        operation_type=row[1],
        site_name=row[2],
        planned_start=row[3],
        planned_end=row[4],
        risk_notes=row[5],
        risk_score=row[6],
        risk_colour=row[7],
        status=row[8],
        created_at=row[9],
    )


@router.get("", response_model=list[ApprovalListItem])
async def list_approvals(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """List current user's approval requests."""
    result = await db.execute(
        text("""
            SELECT id, operation_type, site_name, status, risk_score, risk_colour, created_at
            FROM approval_requests
            WHERE requester_id = :user_id
            ORDER BY created_at DESC
        """),
        {"user_id": str(user["id"])},
    )
    return [
        ApprovalListItem(
            id=row[0],
            operation_type=row[1],
            site_name=row[2],
            status=row[3],
            risk_score=row[4],
            risk_colour=row[5],
            created_at=row[6],
        )
        for row in result.fetchall()
    ]


@router.get("/review", response_model=list[ApprovalReviewItem])
async def list_pending_approvals(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """List all pending approval requests for review."""
    result = await db.execute(
        text("""
            SELECT ar.id, ar.requester_id, p.full_name, ar.operation_type, ar.site_name,
                   ar.planned_start, ar.planned_end, ar.risk_score, ar.risk_colour,
                   ar.status, ar.created_at
            FROM approval_requests ar
            JOIN profiles p ON p.id = ar.requester_id
            WHERE ar.status = 'pending'
            ORDER BY ar.created_at DESC
        """),
    )
    return [
        ApprovalReviewItem(
            id=row[0],
            requester_id=row[1],
            requester_name=row[2],
            operation_type=row[3],
            site_name=row[4],
            planned_start=row[5],
            planned_end=row[6],
            risk_score=row[7],
            risk_colour=row[8],
            status=row[9],
            created_at=row[10],
        )
        for row in result.fetchall()
    ]


@router.get("/{approval_id}", response_model=ApprovalDetail)
async def get_approval(
    approval_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get approval request details."""
    result = await db.execute(
        text("""
            SELECT id, requester_id, operation_type, site_name, planned_start, planned_end,
                   risk_assessment_json, risk_notes, risk_score, risk_colour, status,
                   reviewer_id, reviewer_notes, created_at, updated_at
            FROM approval_requests
            WHERE id = :id
        """),
        {"id": str(approval_id)},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")

    return ApprovalDetail(
        id=row[0],
        requester_id=row[1],
        operation_type=row[2],
        site_name=row[3],
        planned_start=row[4],
        planned_end=row[5],
        risk_assessment_json=row[6],
        risk_notes=row[7],
        risk_score=row[8],
        risk_colour=row[9],
        status=row[10],
        reviewer_id=row[11],
        reviewer_notes=row[12],
        created_at=row[13],
        updated_at=row[14],
    )


@router.patch("/{approval_id}/status", response_model=ApprovalStatusResponse)
async def update_approval_status(
    approval_id: UUID,
    body: ApprovalStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Update approval status (approve/reject)."""
    if body.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    result = await db.execute(
        text("""
            UPDATE approval_requests
            SET status = :status, reviewer_id = :reviewer_id, reviewer_notes = :reviewer_notes,
                updated_at = now()
            WHERE id = :id
            RETURNING id, status, reviewer_id, reviewer_notes, updated_at
        """),
        {
            "id": str(approval_id),
            "status": body.status,
            "reviewer_id": str(user["id"]),
            "reviewer_notes": body.reviewer_notes,
        },
    )
    await db.commit()
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Approval request not found")

    return ApprovalStatusResponse(
        id=row[0],
        status=row[1],
        reviewer_id=row[2],
        reviewer_notes=row[3],
        updated_at=row[4],
    )
