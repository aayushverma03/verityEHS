# AI routes: risk-prefill, checklist, incident-lookup, risk-score
import json
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from config import OPENAI_API_KEY
from db import get_db
from models import (
    ChecklistRequest,
    ChecklistResponse,
    ChecklistStep,
    IncidentLookupRequest,
    IncidentLookupResponse,
    RiskPrefillRequest,
    RiskPrefillResponse,
    RiskScoreRequest,
    RiskScoreResponse,
)
from services.rag import retrieve_chunks

from openai import AsyncOpenAI

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["ai"])
client = AsyncOpenAI(api_key=OPENAI_API_KEY)


@router.post("/risk-prefill", response_model=RiskPrefillResponse)
async def risk_prefill(
    body: RiskPrefillRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """AI2: Pre-fill risk assessment based on operation type."""
    query = f"{body.operation_type} safety requirements hazards precautions"
    chunks = await retrieve_chunks(db, query, top_k=5)

    context = "\n\n".join(
        f"[{c['source_org']} - {c['document_title']}]\n{c['content']}"
        for c in chunks
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Based on the provided EHS regulations, list the hazards, required precautions, and PPE for the given operation at a chemical facility.
Return JSON only with this exact structure:
{"hazards": [], "precautions": [], "ppe_required": [], "regulation_reference": ""}""",
            },
            {
                "role": "user",
                "content": f"Operation: {body.operation_type}\nSite: {body.site_name}\n\nRegulations:\n{context}",
            },
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return RiskPrefillResponse(
        hazards=data.get("hazards", []),
        precautions=data.get("precautions", []),
        ppe_required=data.get("ppe_required", []),
        regulation_reference=data.get("regulation_reference", ""),
    )


@router.post("/checklist", response_model=ChecklistResponse)
async def generate_checklist(
    body: ChecklistRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """AI3: Generate dynamic checklist for permit."""
    query = f"{body.operation_type} checklist steps permit requirements"
    chunks = await retrieve_chunks(db, query, top_k=5)

    context = "\n\n".join(
        f"[{c['source_org']} - {c['document_title']}]\n{c['content']}"
        for c in chunks
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Generate a safety checklist for the given operation at a chemical plant.
Each step must state whether a photo is required for evidence.
Return JSON only with this exact structure:
{"steps": [{"label": "", "requires_photo": true/false, "regulation_ref": ""}]}""",
            },
            {
                "role": "user",
                "content": f"Operation: {body.operation_type}\nSite: {body.site_name}\nRisk notes: {body.risk_notes}\n\nRegulations:\n{context}",
            },
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    steps = [
        ChecklistStep(
            label=s.get("label", ""),
            requires_photo=s.get("requires_photo", False),
            regulation_ref=s.get("regulation_ref", ""),
        )
        for s in data.get("steps", [])
    ]
    return ChecklistResponse(steps=steps)


@router.post("/incident-lookup", response_model=IncidentLookupResponse)
async def incident_lookup(
    body: IncidentLookupRequest,
    _user: dict = Depends(get_current_user),
):
    """AI5: Incident-to-regulation lookup (placeholder - mocked response)."""
    # TODO: replace with real RAG call
    return IncidentLookupResponse(
        regulation="OSHA 29 CFR 1910.119 - Process Safety Management",
        applies_because="Incident involves release of a highly hazardous chemical above threshold quantity.",
        required_actions=[
            "Conduct incident investigation within 48 hours",
            "Review PSM program for affected unit",
        ],
        corrective_action="Isolate affected process unit and conduct PHA review before restart.",
    )


@router.post("/risk-score", response_model=RiskScoreResponse)
async def risk_score(
    body: RiskScoreRequest,
    _user: dict = Depends(get_current_user),
):
    """AI6: Permit risk scorer (placeholder - mocked response)."""
    # TODO: replace with real GPT call
    mock_scores = {
        "Hot work": ("High", "Hot work near chemical storage presents ignition risk.", "red"),
        "Confined space entry": ("Medium", "Atmospheric hazards require monitoring.", "amber"),
        "Chemical transfer": ("Medium", "Spill and exposure risk during transfer.", "amber"),
        "Electrical isolation": ("Low", "LOTO procedure mitigates shock risk.", "green"),
    }
    level, reasoning, colour = mock_scores.get(
        body.operation_type,
        ("Medium", "Standard chemical sector risk profile.", "amber"),
    )
    return RiskScoreResponse(risk_level=level, reasoning=reasoning, colour=colour)
