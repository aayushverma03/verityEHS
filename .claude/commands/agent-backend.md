# Backend Agent

You are Agent 2 — Backend. Read planning.md fully before doing anything.
Follow all four engineering principles in planning.md at all times.
Write all progress under Plan/backend/. Never write outside this folder
or touch any file under frontend/.

## Gate check — do this first

Before writing a single line of code:
1. Check that Plan/infra/api_contract.md exists
2. If it does not — stop. Write to Plan/backend/progress.md:
   "Blocked: waiting for Plan/infra/api_contract.md from Infra agent."
3. If it exists — read it fully. Build exactly what it specifies.
4. Also read Plan/infra/schema.md for the database schema.

## Your responsibilities

Auth + Steps 4–8: ingestion pipeline, all FastAPI routes and services.
Work in Python only. Never touch frontend/.

---

## Auth — build this first, before any feature routes

No role enforcement. No supervisor-only routes. Any logged-in user can do anything.
Role is stored in the DB for future use but is not checked by any route.

Routes:
- `POST /api/auth/register` — accepts `{email, full_name, password}`,
  hashes password with bcrypt, creates profile with `role='worker'` (hardcoded default),
  returns `{id, email, full_name, role}`
- `POST /api/auth/login` — accepts `{email, password}`, returns `{access_token, token_type}`
- JWT signed with `JWT_SECRET` env var, expiry 24h
- All other routes require `Authorization: Bearer <token>` — return 401 if missing or invalid
- No other auth logic. No role checks anywhere.

Seed passwords in `backend/seed/seed_demo_data.sql` must be bcrypt-hashed.
**Agent 2 writes this file** as part of the auth step — use a Python one-liner to
pre-generate the hashes and embed them directly in the SQL:
```python
import bcrypt; print(bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode())
```
Agent 1 (Infra) runs the file in Step 9 — it does not modify it.

Verify:
```
POST /api/auth/register {email, full_name, password} → 200 with user record (role: "worker")
POST /api/auth/login {email, password} → 200 with access_token
GET /api/documents (no token) → 401
GET /api/documents (valid token) → 200
```
Update Plan/backend/progress.md: auth complete.

---

## Step 4 — Ingestion pipeline

PDF parsing rules (follow directly — no external skill file):
- Use `pdfplumber` — open file, iterate pages, concatenate page text
- Extract `pdf.metadata` for title, author, date — all fields may be None, handle gracefully
- Skip any file where extracted text is empty or under 100 characters — log a warning
- Chunk using the size from Plan/infra/schema.md

Tasks:
- Raw files already exist in `backend/data/raw/` from pre-agent Step 0
- `parse_and_chunk.py` already written in Step 1 — use it
- Write `backend/ingestion/embed_and_load.py`:
  embed each chunk via OpenAI `text-embedding-3-small`, insert into Postgres

Verify:
```
SELECT count(*) FROM documents;       → ≥ 10 (≥ 15 preferred)
SELECT count(*) FROM document_chunks; → ≥ 200
SELECT content FROM document_chunks LIMIT 3; → readable chemical EHS text
Vector similarity query returns results without error
```
Update Plan/backend/progress.md: Step 4 complete.

---

## Step 5 — Document library API

- `GET /api/documents` — list, optional query params: `pillar`, `source_org`
- `GET /api/documents/{id}` — full record

Verify:
```
GET /api/documents → JSON array matching api_contract.md shape
GET /api/documents/{id} → full document record
GET /api/documents?pillar=safety → filtered list
```
Update Plan/backend/progress.md: Step 5 complete.

---

## Step 6 — RAG search API

- `POST /api/search` body: `{query: string}`
- Flow: embed query → pgvector top-5 → detect query language → pass to `gpt-4.1-mini`
  → return answer + citations

**Language handling:**
1. Detect query language before calling GPT. Use `langdetect` library:
   ```python
   from langdetect import detect
   lang = detect(query)  # returns "ko" for Korean, "en" for English, etc.
   ```
2. If detection fails or returns unexpected value, default to `"en"`
3. Pass `lang` to the system prompt so GPT knows which language to reply in:
   ```
   System: "You are an EHS compliance expert. Answer only using the provided
   regulatory documents. Always cite the source organisation, regulation number,
   and section. The user's query is in {lang} — respond in that same language."
   ```
4. This is the only language-detection step needed. Do not translate document content.

- Response: `{answer: string, citations: [{document_title, source_org, regulation_reference, chunk_excerpt}]}`

Verify:
```
POST /api/search {"query": "PSM requirements for chlorine storage"}
→ {answer: <non-empty English>, citations: [≥1 item with document_title and source_org]}

POST /api/search {"query": "밀폐 공간 작업 안전 요건"}
→ answer is in Korean
→ citations still reference English source documents (document content not translated)

POST /api/search {"query": "x"}  (ambiguous, undetectable language)
→ no crash — defaults to English answer
```
Update Plan/backend/progress.md: Step 6 complete.

---

## AI Feature Endpoints (AI2, AI3, AI4, AI5, AI6)

Build all five endpoints before moving to Step 7. They share the same RAG
infrastructure as Step 6 — embed → pgvector → GPT-4.1-mini.

**Shared helper** — reuse from Step 6, do not duplicate:
```python
# services/rag.py
async def retrieve_chunks(query: str, top_k: int = 5) -> list[dict]:
    # embed query → pgvector search → return top_k chunks with metadata
```

---

### AI2 — Risk Assessment Pre-fill
`POST /api/ai/risk-prefill`
Request: `{operation_type: string, site_name: string}`

1. Build query: `f"{operation_type} safety requirements hazards precautions"`
2. Retrieve top 5 chunks via `retrieve_chunks()`
3. Call GPT-4.1-mini with chunks + prompt:
   "Based on the provided EHS regulations, list the hazards, required precautions,
   and PPE for {operation_type} at a chemical facility. Return JSON only."
4. Parse response → return structured JSON

Response: `{hazards: [], precautions: [], ppe_required: [], regulation_reference: string}`

Verify:
```
POST /api/ai/risk-prefill {"operation_type": "Hot work", "site_name": "Plant A"}
→ 200 with non-empty hazards, precautions, ppe_required arrays
→ regulation_reference is non-empty string
```

---

### AI3 — AI Checklist Generation
`POST /api/ai/checklist`
Request: `{operation_type: string, site_name: string, risk_notes: string}`

1. Build query: `f"{operation_type} checklist steps permit requirements"`
2. Retrieve top 5 chunks
3. Call GPT-4.1-mini:
   "Generate a safety checklist for {operation_type} at a chemical plant considering
   these risk notes: {risk_notes}. Each step must state whether a photo is required.
   Return JSON only: {steps: [{label, requires_photo, regulation_ref}]}"
4. Parse and return

Response: `{steps: [{label: string, requires_photo: boolean, regulation_ref: string}]}`

Verify:
```
POST /api/ai/checklist {"operation_type": "Confined space entry", "site_name": "Reactor 3", "risk_notes": "H2S risk"}
→ steps array with ≥ 4 items
→ each step has label, requires_photo (bool), regulation_ref
→ steps differ meaningfully from a generic confined space checklist (H2S mentioned)
```

---

### AI4 — Compliance Gap Detector
**Not a separate endpoint.** Called internally inside `POST /api/submissions`.

After saving submission record, before generating PDF:
1. Get operation_type from linked approval_request
2. Retrieve top 3 regulation chunks for that operation type
3. Call GPT-4.1-mini:
   "Given these regulatory requirements and this completed checklist, list any
   required safety steps that appear to be missing or incomplete. Return JSON:
   {gaps: [{step: string, regulation: string}]}"
4. Store `compliance_gaps` JSON in the submission record
5. Include gaps in PDF "AI Compliance Notes" section
6. Return `compliance_gaps` in the submission response so frontend can show alert

Add `compliance_gaps` column (jsonb) to submissions table.

Verify:
```
POST /api/submissions with a checklist missing 2 steps
→ response includes compliance_gaps with ≥ 1 item
→ PDF contains "AI Compliance Notes" section listing the gaps
POST /api/submissions with all steps completed
→ compliance_gaps is empty array
```

---

### AI5 — Incident-to-Regulation Lookup (Placeholder)
`POST /api/ai/incident-lookup`
Request: `{description: string}`

**Prototype:** return mocked response — do not call GPT. Mock must look realistic.
The endpoint structure is real; swap the mock for `retrieve_chunks()` + GPT call later.

```python
@router.post("/ai/incident-lookup")
async def incident_lookup(body: IncidentLookupRequest):
    # TODO: replace with real RAG call
    return {
        "regulation": "OSHA 29 CFR 1910.119 — Process Safety Management",
        "applies_because": "Incident involves release of a highly hazardous chemical above threshold quantity.",
        "required_actions": [
            "Conduct incident investigation within 48 hours",
            "Review PSM program for affected unit"
        ],
        "corrective_action": "Isolate affected process unit and conduct PHA review before restart."
    }
```

Verify:
```
POST /api/ai/incident-lookup {"description": "chlorine leak in mixing area"}
→ 200 with regulation, applies_because, required_actions, corrective_action
→ response shape matches contract exactly
```

---

### AI6 — Permit Risk Scorer (Placeholder)
`POST /api/ai/risk-score`
Request: `{operation_type: string, site_name: string, risk_notes: string}`

**Prototype:** return mocked response. Vary the mock based on operation_type
so it feels dynamic — hot work returns High, confined space returns Medium.

```python
@router.post("/ai/risk-score")
async def risk_score(body: RiskScoreRequest):
    # TODO: replace with real GPT call
    mock_scores = {
        "Hot work": ("High", "Hot work near chemical storage presents ignition risk.", "red"),
        "Confined space entry": ("Medium", "Atmospheric hazards require monitoring.", "amber"),
        "Chemical transfer": ("Medium", "Spill and exposure risk during transfer.", "amber"),
        "Electrical isolation": ("Low", "LOTO procedure mitigates shock risk.", "green"),
    }
    level, reasoning, colour = mock_scores.get(
        body.operation_type,
        ("Medium", "Standard chemical sector risk profile.", "amber")
    )
    return {"risk_level": level, "reasoning": reasoning, "colour": colour}
```

Verify:
```
POST /api/ai/risk-score {"operation_type": "Hot work", ...} → risk_level: "High", colour: "red"
POST /api/ai/risk-score {"operation_type": "Electrical isolation", ...} → risk_level: "Low", colour: "green"
```

---

## Step 7 — Approvals API

- `POST /api/approvals` — create (body: operation_type, site_name, planned_start,
  planned_end, risk_notes, risk_score, risk_colour)
  Store `risk_score` and `risk_colour` from the request body into the DB record.
  Frontend calls AI6 endpoint first, gets the score, then includes it in this POST.
- `GET /api/approvals` — list for current user
- `GET /api/approvals/{id}` — detail (include risk_score + risk_colour in response)
- `GET /api/approvals/review` — list all pending requests (include risk_score + risk_colour)
- `PATCH /api/approvals/{id}/status` — body: `{status, reviewer_notes}`

Verify:
```
POST /api/approvals with risk_score:"High", risk_colour:"red" → 201, stored in DB
GET /api/approvals/review → each record includes risk_score and risk_colour
PATCH /api/approvals/{id}/status {status:"approved"} → 200
GET /api/approvals/{id} → updated status, reviewer_notes, risk_score all visible
```
Update Plan/backend/progress.md: Step 7 complete.

---

## Step 8 — Submissions + PDF report (single endpoint)

**Single multipart POST only. No separate photo upload endpoint.**

`POST /api/submissions` — multipart form data fields:
- `approval_request_id` — UUID string
- `checklist_json` — JSON string of completed steps
- `notes` — optional string
- `photo_{step_label}` — one file field per step requiring a photo

**Photo size limits (enforce at FastAPI layer):**
- Max 5 MB per photo file — reject individual files over limit with 413
- Max 10 photos per submission
- Total request body cap 50 MB — configure via `max_upload_size` on the router
- Return 413 with clear message if any limit exceeded — do not process partial uploads

What the endpoint does in sequence:
1. Validate size limits — return 413 immediately if exceeded
2. Save submission record to DB (checklist_json, notes, compliance_status, compliance_gaps)
3. Run AI4 gap detection (GPT-4.1-mini) — parse + validate JSON response before storing
4. Collect photo bytes from multipart fields
5. Call `generate_report(submission, photos)` → bytes
6. Return `StreamingResponse(bytes, media_type="application/pdf",
   headers={"Content-Disposition": "attachment; filename=compliance_report.pdf"})`
7. Nothing written to disk at any point

`GET /api/submissions/{id}` — return submission metadata including compliance_gaps

PDF generation rules:
- Use `fpdf2` — build with `BytesIO`, never use a file path
- `backend/services/pdf_report.py` exposes:
  ```python
  def generate_report(submission: dict, photos: dict[str, bytes]) -> bytes
  ```
- Report sections: permit details (include risk_score badge), approval record,
  checklist with timestamps, photo thumbnails (max 400px wide), AI Compliance Notes
  (gaps from AI4 or "No gaps detected"), regulation reference, compliance status
- If a photo fails to embed — log the error, skip that photo, continue

Verify:
```
POST /api/submissions (multipart, checklist + 2 photos under 5MB each)
→ Content-Type: application/pdf
→ non-empty bytes starting with %PDF
→ compliance_gaps written to DB for that submission
→ no files on disk after request

POST /api/submissions with photo > 5MB → 413 response
POST /api/submissions with 11 photos → 413 response

GET /api/submissions/{id} → metadata with compliance_gaps array

generate_report({...}, {"step_1": b"...", "step_2": b"..."})
→ returns bytes starting with %PDF
```
```
Update Plan/backend/progress.md: Steps 8+9 complete. Backend ready.