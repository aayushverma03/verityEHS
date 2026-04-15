# Pydantic models for request/response schemas
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# Auth
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class RegisterResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str


# Documents
class DocumentListItem(BaseModel):
    id: UUID
    title: str
    source_org: str
    regulation_ref: Optional[str]
    pillar: str
    language: str
    page_count: int


class DocumentDetail(BaseModel):
    id: UUID
    filename: str
    source_url: Optional[str]
    source_org: str
    regulation_ref: Optional[str]
    title: str
    pillar: str
    language: str
    page_count: int
    token_count: int
    creation_date: Optional[str]
    ingested_at: datetime


# Search
class SearchRequest(BaseModel):
    query: str


class Citation(BaseModel):
    document_title: str
    source_org: str
    regulation_reference: Optional[str]
    chunk_excerpt: str


class SearchResponse(BaseModel):
    answer: str
    citations: list[Citation]


# Approvals
class ApprovalCreateRequest(BaseModel):
    operation_type: str
    site_name: str
    planned_start: datetime
    planned_end: datetime
    risk_notes: Optional[str] = None
    risk_score: Optional[str] = None
    risk_colour: Optional[str] = None


class ApprovalCreateResponse(BaseModel):
    id: UUID
    operation_type: str
    site_name: str
    planned_start: datetime
    planned_end: datetime
    risk_notes: Optional[str]
    risk_score: Optional[str]
    risk_colour: Optional[str]
    status: str
    created_at: datetime


class ApprovalListItem(BaseModel):
    id: UUID
    operation_type: str
    site_name: str
    status: str
    risk_score: Optional[str]
    risk_colour: Optional[str]
    created_at: datetime


class ApprovalDetail(BaseModel):
    id: UUID
    requester_id: UUID
    operation_type: str
    site_name: str
    planned_start: datetime
    planned_end: datetime
    risk_assessment_json: Optional[dict]
    risk_notes: Optional[str]
    risk_score: Optional[str]
    risk_colour: Optional[str]
    status: str
    reviewer_id: Optional[UUID]
    reviewer_notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class ApprovalReviewItem(BaseModel):
    id: UUID
    requester_id: UUID
    requester_name: str
    operation_type: str
    site_name: str
    planned_start: datetime
    planned_end: datetime
    risk_score: Optional[str]
    risk_colour: Optional[str]
    status: str
    created_at: datetime


class ApprovalStatusUpdate(BaseModel):
    status: str
    reviewer_notes: Optional[str] = None


class ApprovalStatusResponse(BaseModel):
    id: UUID
    status: str
    reviewer_id: UUID
    reviewer_notes: Optional[str]
    updated_at: datetime


# Submissions
class SubmissionMetadata(BaseModel):
    id: UUID
    approval_request_id: UUID
    submitted_by: UUID
    submitted_at: datetime
    checklist_json: dict
    compliance_gaps: Optional[list]
    notes: Optional[str]
    compliance_status: str


class ComplianceGap(BaseModel):
    step: str
    regulation: str


class SubmissionResponse(BaseModel):
    id: UUID
    compliance_gaps: list[ComplianceGap]
    compliance_status: str


# AI endpoints
class RiskPrefillRequest(BaseModel):
    operation_type: str
    site_name: str


class RiskPrefillResponse(BaseModel):
    hazards: list[str]
    precautions: list[str]
    ppe_required: list[str]
    regulation_reference: str


class ChecklistRequest(BaseModel):
    operation_type: str
    site_name: str
    risk_notes: str


class ChecklistStep(BaseModel):
    label: str
    requires_photo: bool
    regulation_ref: str


class ChecklistResponse(BaseModel):
    steps: list[ChecklistStep]


class IncidentLookupRequest(BaseModel):
    description: str


class IncidentLookupResponse(BaseModel):
    regulation: str
    applies_because: str
    required_actions: list[str]
    corrective_action: str


class RiskScoreRequest(BaseModel):
    operation_type: str
    site_name: str
    risk_notes: str


class RiskScoreResponse(BaseModel):
    risk_level: str
    reasoning: str
    colour: str
