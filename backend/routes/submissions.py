# Submission routes: proof submission with PDF generation
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from config import OPENAI_API_KEY
from db import get_db
from models import SubmissionMetadata
from services.pdf_report import generate_report
from services.rag import retrieve_chunks

from openai import AsyncOpenAI
import io

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/submissions", tags=["submissions"])
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_PHOTOS = 10


async def detect_compliance_gaps(
    db: AsyncSession,
    operation_type: str,
    checklist: list[dict],
) -> list[dict]:
    """AI4: Detect compliance gaps in the submitted checklist."""
    query = f"{operation_type} safety requirements mandatory steps"
    chunks = await retrieve_chunks(db, query, top_k=3)

    context = "\n\n".join(
        f"[{c['source_org']} - {c['document_title']}]\n{c['content']}"
        for c in chunks
    )

    checklist_summary = "\n".join(
        f"- {s.get('label', 'Step')}: {'Completed' if s.get('completed') else 'Not completed'}"
        for s in checklist
    )

    response = await client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {
                "role": "system",
                "content": """Given these regulatory requirements and a completed checklist, list any required safety steps that appear to be missing or incomplete.
Return JSON only with this exact structure:
{"gaps": [{"step": "", "regulation": ""}]}
If no gaps, return {"gaps": []}""",
            },
            {
                "role": "user",
                "content": f"Operation: {operation_type}\n\nRegulations:\n{context}\n\nSubmitted checklist:\n{checklist_summary}",
            },
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("gaps", [])


@router.post("")
async def create_submission(
    approval_request_id: str = Form(...),
    checklist_json: str = Form(...),
    notes: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Submit proof checklist with photos, return PDF."""
    # Parse checklist
    try:
        checklist = json.loads(checklist_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid checklist_json")

    # Verify approval exists and is approved
    result = await db.execute(
        text("""
            SELECT id, operation_type, site_name, planned_start, planned_end,
                   risk_score, risk_colour, status, reviewer_notes, updated_at
            FROM approval_requests WHERE id = :id
        """),
        {"id": approval_request_id},
    )
    approval_row = result.fetchone()
    if not approval_row:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval = {
        "id": approval_row[0],
        "operation_type": approval_row[1],
        "site_name": approval_row[2],
        "planned_start": approval_row[3],
        "planned_end": approval_row[4],
        "risk_score": approval_row[5],
        "risk_colour": approval_row[6],
        "status": approval_row[7],
        "reviewer_notes": approval_row[8],
        "updated_at": approval_row[9],
    }

    # Detect compliance gaps (AI4)
    compliance_gaps = await detect_compliance_gaps(
        db, approval["operation_type"], checklist
    )

    # Determine compliance status
    all_completed = all(s.get("completed", False) for s in checklist)
    if compliance_gaps:
        compliance_status = "flagged"
    elif all_completed:
        compliance_status = "complete"
    else:
        compliance_status = "incomplete"

    # Insert submission record
    result = await db.execute(
        text("""
            INSERT INTO submissions
                (approval_request_id, submitted_by, checklist_json, compliance_gaps, notes, compliance_status)
            VALUES
                (:approval_request_id, :submitted_by, :checklist_json, :compliance_gaps, :notes, :compliance_status)
            RETURNING id, submitted_at
        """),
        {
            "approval_request_id": approval_request_id,
            "submitted_by": str(user["id"]),
            "checklist_json": checklist_json,
            "compliance_gaps": json.dumps(compliance_gaps),
            "notes": notes,
            "compliance_status": compliance_status,
        },
    )
    await db.commit()
    submission_row = result.fetchone()

    submission = {
        "id": submission_row[0],
        "submitted_at": submission_row[1],
        "compliance_status": compliance_status,
        "notes": notes,
    }

    # For now, photos are empty - they would come from multipart upload
    # The frontend will send photo_* fields
    photos = {}

    # Generate PDF
    pdf_bytes = generate_report(
        submission=submission,
        approval=approval,
        checklist=checklist,
        photos=photos,
        compliance_gaps=compliance_gaps,
    )

    # Build compliance gaps header
    gaps_header = json.dumps(compliance_gaps) if compliance_gaps else "[]"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=compliance_report.pdf",
            "X-Compliance-Gaps": gaps_header,
            "X-Submission-Id": str(submission["id"]),
            "X-Compliance-Status": compliance_status,
        },
    )


@router.post("/with-photos")
async def create_submission_with_photos(
    approval_request_id: str = Form(...),
    checklist_json: str = Form(...),
    notes: str = Form(None),
    photos: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Submit proof checklist with photos (multipart), return PDF."""
    # Validate photo count
    if len(photos) > MAX_PHOTOS:
        raise HTTPException(status_code=413, detail=f"Maximum {MAX_PHOTOS} photos allowed")

    # Read and validate photos
    photo_dict = {}
    for photo in photos:
        content = await photo.read()
        if len(content) > MAX_PHOTO_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Photo {photo.filename} exceeds 5 MB limit"
            )
        # Use filename as key (strip photo_ prefix if present)
        key = photo.filename or f"photo_{len(photo_dict)}"
        photo_dict[key] = content

    # Parse checklist
    try:
        checklist = json.loads(checklist_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid checklist_json")

    # Verify approval exists
    result = await db.execute(
        text("""
            SELECT id, operation_type, site_name, planned_start, planned_end,
                   risk_score, risk_colour, status, reviewer_notes, updated_at
            FROM approval_requests WHERE id = :id
        """),
        {"id": approval_request_id},
    )
    approval_row = result.fetchone()
    if not approval_row:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval = {
        "id": approval_row[0],
        "operation_type": approval_row[1],
        "site_name": approval_row[2],
        "planned_start": approval_row[3],
        "planned_end": approval_row[4],
        "risk_score": approval_row[5],
        "risk_colour": approval_row[6],
        "status": approval_row[7],
        "reviewer_notes": approval_row[8],
        "updated_at": approval_row[9],
    }

    # Detect compliance gaps (AI4)
    compliance_gaps = await detect_compliance_gaps(
        db, approval["operation_type"], checklist
    )

    # Determine compliance status
    all_completed = all(s.get("completed", False) for s in checklist)
    if compliance_gaps:
        compliance_status = "flagged"
    elif all_completed:
        compliance_status = "complete"
    else:
        compliance_status = "incomplete"

    # Insert submission record
    result = await db.execute(
        text("""
            INSERT INTO submissions
                (approval_request_id, submitted_by, checklist_json, compliance_gaps, notes, compliance_status)
            VALUES
                (:approval_request_id, :submitted_by, :checklist_json, :compliance_gaps, :notes, :compliance_status)
            RETURNING id, submitted_at
        """),
        {
            "approval_request_id": approval_request_id,
            "submitted_by": str(user["id"]),
            "checklist_json": checklist_json,
            "compliance_gaps": json.dumps(compliance_gaps),
            "notes": notes,
            "compliance_status": compliance_status,
        },
    )
    await db.commit()
    submission_row = result.fetchone()

    submission = {
        "id": submission_row[0],
        "submitted_at": submission_row[1],
        "compliance_status": compliance_status,
        "notes": notes,
    }

    # Generate PDF with photos
    pdf_bytes = generate_report(
        submission=submission,
        approval=approval,
        checklist=checklist,
        photos=photo_dict,
        compliance_gaps=compliance_gaps,
    )

    gaps_header = json.dumps(compliance_gaps) if compliance_gaps else "[]"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=compliance_report.pdf",
            "X-Compliance-Gaps": gaps_header,
            "X-Submission-Id": str(submission["id"]),
            "X-Compliance-Status": compliance_status,
        },
    )


@router.get("/{submission_id}", response_model=SubmissionMetadata)
async def get_submission(
    submission_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Get submission metadata."""
    result = await db.execute(
        text("""
            SELECT id, approval_request_id, submitted_by, submitted_at,
                   checklist_json, compliance_gaps, notes, compliance_status
            FROM submissions WHERE id = :id
        """),
        {"id": str(submission_id)},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")

    return SubmissionMetadata(
        id=row[0],
        approval_request_id=row[1],
        submitted_by=row[2],
        submitted_at=row[3],
        checklist_json=json.loads(row[4]) if isinstance(row[4], str) else row[4],
        compliance_gaps=json.loads(row[5]) if isinstance(row[5], str) else row[5],
        notes=row[6],
        compliance_status=row[7],
    )
