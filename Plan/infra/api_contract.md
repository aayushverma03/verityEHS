# Plan/infra/api_contract.md — API Contract

All FastAPI routes. Frontend and backend agents must match these shapes exactly.

---

## Auth Routes

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "string",
  "full_name": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "role": "worker"
}
```

---

### POST /api/auth/login
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

---

## Document Routes

### GET /api/documents
List all documents. Optional filters via query params.

**Query params:**
- `pillar` (optional): `safety` | `health` | `environment` | `integrated`
- `source_org` (optional): `OSHA` | `HSE` | `ILO` | `EU` | `KOSHA` | `NFPA`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "source_org": "string",
    "regulation_ref": "string",
    "pillar": "string",
    "language": "string",
    "page_count": 0
  }
]
```

---

### GET /api/documents/{id}
Get full document details.

**Response (200):**
```json
{
  "id": "uuid",
  "filename": "string",
  "source_url": "string",
  "source_org": "string",
  "regulation_ref": "string",
  "title": "string",
  "pillar": "string",
  "language": "string",
  "page_count": 0,
  "token_count": 0,
  "creation_date": "string",
  "ingested_at": "datetime"
}
```

---

## Search Route (AI1)

### POST /api/search
RAG search over EHS documents.

**Request:**
```json
{
  "query": "string"
}
```

**Response (200):**
```json
{
  "answer": "string",
  "citations": [
    {
      "document_title": "string",
      "source_org": "string",
      "regulation_reference": "string",
      "chunk_excerpt": "string"
    }
  ]
}
```

---

## Approval Routes

### POST /api/approvals
Create a new approval request.

**Request:**
```json
{
  "operation_type": "string",
  "site_name": "string",
  "planned_start": "datetime",
  "planned_end": "datetime",
  "risk_notes": "string",
  "risk_score": "Low" | "Medium" | "High",
  "risk_colour": "green" | "amber" | "red"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "operation_type": "string",
  "site_name": "string",
  "planned_start": "datetime",
  "planned_end": "datetime",
  "risk_notes": "string",
  "risk_score": "string",
  "risk_colour": "string",
  "status": "pending",
  "created_at": "datetime"
}
```

---

### GET /api/approvals
List current user's approval requests.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "operation_type": "string",
    "site_name": "string",
    "status": "string",
    "risk_score": "string",
    "risk_colour": "string",
    "created_at": "datetime"
  }
]
```

---

### GET /api/approvals/{id}
Get approval request details.

**Response (200):**
```json
{
  "id": "uuid",
  "requester_id": "uuid",
  "operation_type": "string",
  "site_name": "string",
  "planned_start": "datetime",
  "planned_end": "datetime",
  "risk_assessment_json": {},
  "risk_notes": "string",
  "risk_score": "string",
  "risk_colour": "string",
  "status": "string",
  "reviewer_id": "uuid",
  "reviewer_notes": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### GET /api/approvals/review
List all pending approval requests (for review queue).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "requester_name": "string",
    "operation_type": "string",
    "site_name": "string",
    "planned_start": "datetime",
    "planned_end": "datetime",
    "risk_score": "string",
    "risk_colour": "string",
    "status": "pending",
    "created_at": "datetime"
  }
]
```

---

### PATCH /api/approvals/{id}/status
Update approval status (approve/reject).

**Request:**
```json
{
  "status": "approved" | "rejected",
  "reviewer_notes": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "string",
  "reviewer_id": "uuid",
  "reviewer_notes": "string",
  "updated_at": "datetime"
}
```

---

## Submission Routes

### POST /api/submissions
Submit proof checklist with photos. Returns PDF.

**Request:** `multipart/form-data`
- `approval_request_id`: UUID string
- `checklist_json`: JSON string of completed steps
- `notes`: optional string
- `photo_{step_label}`: file (one per step requiring photo)

**Constraints:**
- Max 5 MB per photo
- Max 10 photos total
- Max 50 MB total request body

**Response (200):** `application/pdf` stream
- Header: `Content-Disposition: attachment; filename=compliance_report.pdf`
- Body includes `X-Compliance-Gaps` header with JSON array (or empty)

**Response JSON (on success before PDF):**
```json
{
  "id": "uuid",
  "compliance_gaps": [
    {
      "step": "string",
      "regulation": "string"
    }
  ],
  "compliance_status": "complete" | "incomplete" | "flagged"
}
```

---

### GET /api/submissions/{id}
Get submission metadata.

**Response (200):**
```json
{
  "id": "uuid",
  "approval_request_id": "uuid",
  "submitted_by": "uuid",
  "submitted_at": "datetime",
  "checklist_json": {},
  "compliance_gaps": [],
  "notes": "string",
  "compliance_status": "string"
}
```

---

## AI Routes

### POST /api/ai/risk-prefill (AI2)
Pre-fill risk assessment based on operation type.

**Request:**
```json
{
  "operation_type": "string",
  "site_name": "string"
}
```

**Response (200):**
```json
{
  "hazards": ["string"],
  "precautions": ["string"],
  "ppe_required": ["string"],
  "regulation_reference": "string"
}
```

---

### POST /api/ai/checklist (AI3)
Generate dynamic checklist for permit.

**Request:**
```json
{
  "operation_type": "string",
  "site_name": "string",
  "risk_notes": "string"
}
```

**Response (200):**
```json
{
  "steps": [
    {
      "label": "string",
      "requires_photo": true,
      "regulation_ref": "string"
    }
  ]
}
```

---

### POST /api/ai/incident-lookup (AI5 — Placeholder)
Look up applicable regulation for incident.

**Request:**
```json
{
  "description": "string"
}
```

**Response (200):**
```json
{
  "regulation": "string",
  "applies_because": "string",
  "required_actions": ["string"],
  "corrective_action": "string"
}
```

---

### POST /api/ai/risk-score (AI6 — Placeholder)
Get risk score for permit.

**Request:**
```json
{
  "operation_type": "string",
  "site_name": "string",
  "risk_notes": "string"
}
```

**Response (200):**
```json
{
  "risk_level": "Low" | "Medium" | "High",
  "reasoning": "string",
  "colour": "green" | "amber" | "red"
}
```

---

## Health Check

### GET /health
Returns service status.

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## Error Responses

All endpoints return standard error format:

**4xx/5xx:**
```json
{
  "detail": "string"
}
```

Common codes:
- 400: Bad request / validation error
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden
- 404: Not found
- 413: Payload too large (photo limits)
- 500: Internal server error
