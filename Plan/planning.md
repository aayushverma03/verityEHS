# EHS AI Platform — Prototype Planning

---

## Engineering Principles

> Defined in `CLAUDE.md` — read that file. Not duplicated here.
> CLAUDE.md is auto-read by Claude Code every session. planning.md is the reference spec.

---

## Explicit Assumptions

> These must be confirmed before or during implementation. If any assumption is wrong,
> stop and flag it rather than building around it.

| # | Assumption | Risk if wrong |
|---|-----------|---------------|
| ASM1 | Real EHS PDFs from OSHA, HSE, KOSHA are publicly downloadable without auth | Ingestion pipeline cannot be seeded — need alternative sources |
| ASM2 | `pdfplumber` can extract clean text from these PDFs (not scanned images) | Need OCR fallback (e.g. `pytesseract`) — adds complexity |
| ASM3 | OpenAI API key is available for both embeddings and LLM calls | Both ingestion and RAG search cannot function |
| ASM4 | `gpt-4.1-mini` is the LLM for all AI calls | If model is unavailable, fall back to `gpt-4o-mini` (same API, swap model string) |
| ASM5 | pgvector extension can be enabled on the local Postgres container | Need alternative vector store |
| ASM6 | Approval steps are simplified — no real notifications needed | Demo feels incomplete to stakeholders |
| ASM7 | **No persistent file storage.** Photos held in backend memory for the request duration, embedded into the PDF, then discarded. PDF must be downloaded in the same session. Acceptable for prototype. | Mid-session refresh loses photos — acceptable for demo, not for production |

---

## Business Context

**SEIN Infotech** (South Korea) built EHS InfoTrak — Korea's first integrated EHS platform,
widely adopted in domestic chemical companies. In May 2024, **LabVantage Solutions**
(Somerset, NJ) acquired SEIN Infotech to expand into EHS management for the global
chemical industry.

**Prototype purpose:** Showcase for LabVantage + SEIN stakeholders. Demonstrates what
EHS InfoTrak becomes with an AI layer — to be pitched to chemical sector clients globally.

**The one-line pitch:**
> "SEIN's EHS expertise + LabVantage AI = the first intelligent EHS platform for the
> global chemical industry. Workers ask questions in plain language. Compliance proves itself."

---

## Target Industry

**Chemical sector only** for this prototype:
- Chemical manufacturing (bulk, fine, intermediates)
- Petrochemicals (plastics, polymers, resins)
- Specialty chemicals (solvents, coatings, adhesives)
- Pharmaceutical manufacturing (APIs, excipients)
- Agrochemicals (pesticides, herbicides)

**Why chemical sector only?**
Highest EHS complexity (PSM, ATEX, REACH, GHS), highest compliance cost, and strongest
fit for LabVantage's existing LIMS client base. Energy sector is deferred — not because
it is unimportant but because splitting focus would dilute the demo.

---

## Must-Build Features

Four platform features + six AI features. Total: ten deliverables.

### Platform features

| # | Feature | Done when |
|---|---------|-----------|
| P1 | Document library | User can browse and open ingested EHS documents |
| P2 | Work permit request + approval flow | Worker submits permit, any user approves/rejects, status visible |
| P3 | Proof submission checklist with photo upload | Worker completes checklist and uploads photos against approved permit |
| P4 | PDF compliance report generation | PDF generated in memory and downloaded on submission |

### AI features

| # | Feature | Status | Done when |
|---|---------|--------|-----------|
| AI1 | RAG regulatory Q&A | **Full** | User gets AI answer with cited sources for any chemical EHS query |
| AI2 | Risk assessment pre-fill | **Full** | Approval form fields pre-filled by AI based on operation type + regulation |
| AI3 | AI checklist generation | **Full** | Checklist steps generated dynamically per permit context, not hardcoded |
| AI4 | Compliance gap detector | **Full** | AI flags missing steps before PDF is generated |
| AI5 | Incident-to-regulation lookup | **Placeholder** | UI and endpoint built, AI call returns mocked response |
| AI6 | Permit risk scorer | **Placeholder** | UI and endpoint built, risk badge displayed with mocked Low/Medium/High |

> **AI5 is the only "incident" feature.** There is no separate P5 incident log — AI5's
> `/incident` page is the UI surface for incident lookup. No incidents table, no
> persistence — it is a stateless query tool.

**Placeholder means:** the UI, user flow, and API endpoint all exist and work.
The AI call is mocked with a realistic hardcoded response. Swap for a real LLM
call later by changing one function — no structural changes needed.

**What is explicitly out of scope:**
- Live web crawler (pre-seeded documents only)
- Real notifications (email, SMS, push)
- Photo analysis / computer vision
- Incident persistence / incident log history
- Training and certification management
- Analytics dashboard
- Contractor management
- Mobile native app
- ERP / LIMS integration (roadmap narrative only, not built)

---

## AI Features — Detail

### AI1 — RAG Regulatory Q&A
**Where:** `/search` page and homepage search bar
**Flow:** User types question → embed → pgvector top-5 chunks → GPT-4.1-mini → answer + citations
**Prototype:** Full implementation

---

### AI2 — Risk Assessment Pre-fill
**Where:** `/approvals/new` form
**Flow:** Worker selects operation type → frontend calls `POST /api/ai/risk-prefill`
with `{operation_type, site_name}` → backend retrieves top relevant regulation chunks
via pgvector → GPT-4.1-mini generates pre-filled risk assessment JSON →
form fields populate automatically → worker reviews and edits before submitting
**Prototype:** Full implementation

API: `POST /api/ai/risk-prefill`
Request: `{operation_type: string, site_name: string}`
Response: `{hazards: string[], precautions: string[], ppe_required: string[], regulation_reference: string}`

---

### AI3 — AI Checklist Generation
**Where:** `/submissions/[id]` — primary checklist source; hardcoded templates are
fallback only (used if AI call fails or times out)
**Flow:** When worker opens a submission, frontend calls `POST /api/ai/checklist`
with `{operation_type, site_name, risk_notes}` → backend retrieves relevant regulation
chunks → GPT-4.1-mini generates checklist steps tailored to this specific permit context
→ checklist renders dynamically
**Prototype:** Full implementation

API: `POST /api/ai/checklist`
Request: `{operation_type: string, site_name: string, risk_notes: string}`
Response: `{steps: [{label: string, requires_photo: boolean, regulation_ref: string}]}`

---

### AI4 — Compliance Gap Detector
**Where:** Inside `POST /api/submissions` — runs server-side before PDF is built
**Flow:** Backend passes completed checklist + operation type + regulation chunks to
GPT-4.1-mini → AI checks for missing required steps → result embedded in PDF as
"AI Compliance Notes" section → `compliance_gaps` array returned in submission response
→ frontend shows gap alert modal if non-empty
**Prototype:** Full implementation

API: called internally by `POST /api/submissions` — not a separate endpoint
`compliance_gaps` stored in submissions table (jsonb) and returned in response

---

### AI5 — Incident-to-Regulation Lookup
**Where:** `/incident` page — stateless query, no persistence
**Flow:** User describes an incident → `POST /api/ai/incident-lookup` → returns
applicable regulation, why it applies, required actions, corrective action
**Prototype:** Placeholder — UI and endpoint built, AI call returns mocked response

API: `POST /api/ai/incident-lookup`
Request: `{description: string}`
Response: `{regulation, applies_because, required_actions[], corrective_action}`

---

### AI6 — Permit Risk Scorer
**Where:** `/approvals/new` form (live badge) + `/approvals/review` queue (stored badge)
**Flow on form:** `POST /api/ai/risk-score` called on operation type change (debounced
800ms) → badge renders → score + colour saved as fields on the approval_request record
when worker submits the form
**Flow on review queue:** reviewer sees stored `risk_score` + `risk_colour` from the
approval_request record — no additional API call needed
**Prototype:** Placeholder — returns mocked score, but stores and retrieves correctly

API: `POST /api/ai/risk-score`
Request: `{operation_type: string, site_name: string, risk_notes: string}`
Response: `{risk_level: "Low"|"Medium"|"High", reasoning: string, colour: "green"|"amber"|"red"}`



## Tech Stack

**Tradeoff noted:** A pure Next.js app with API routes would be simpler to deploy.
We are choosing the Docker + FastAPI split because the heaviest work (PDF parsing,
embeddings, RAG, PDF generation) is Python-native. Keeping it in FastAPI means the
ingestion scripts and the live API share the same models and dependencies — no
Node↔Python bridging. If this tradeoff is wrong, flag it before building.

### Infrastructure
- **docker-compose.yml** — single command starts/stops everything
  - `frontend` service — Next.js (port 3000)
  - `backend` service — FastAPI (port 8000)
  - `db` service — PostgreSQL 15 + pgvector (port 5432)
  - `nginx` service — reverse proxy (`/api/*` → backend, rest → frontend)

### Frontend
- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- No data logic — UI and routing only
- Calls backend via typed fetch wrappers in `lib/api.ts`

### Backend
- FastAPI (Python 3.11), uvicorn, SQLAlchemy (async), asyncpg
- JWT auth issued and validated here
- All data logic: RAG, embeddings, OpenAI API calls, PDF generation, file handling

### AI
- LLM: OpenAI `gpt-4.1-mini` — AI1 RAG search, AI2 risk pre-fill, AI3 checklist gen,
  AI4 gap detector, AI5 incident lookup (placeholder), AI6 risk scorer (placeholder)
- Embeddings: OpenAI `text-embedding-3-small` (same API key)
- Vector search: pgvector on local Postgres

### File storage
**None.** No object storage, no local volume mounts for user files.

- Proof photos are uploaded to the backend, held in memory, embedded into the PDF
  as base64, then discarded — all within the same HTTP request
- The generated PDF is streamed directly back to the browser as a file download
- Nothing is written to disk after the request completes
- Checklist data and submission metadata are stored in Postgres as text/JSON (negligible cost)

> **Prototype constraint:** If the user refreshes mid-checklist, uploaded photos are
> lost and must be re-uploaded. The PDF cannot be re-downloaded after the session ends.
> Both are acceptable for a controlled demo. A production system would add object storage
> (e.g. S3) as a later step.

---

## Database Schema

### Stable tables — build immediately
These have nothing to do with document content and can be defined now.

```sql
profiles (
  id            uuid primary key,
  full_name     text        not null,
  role          text        not null,  -- worker | supervisor | ehs_officer | admin
  department    text,
  site_name     text,
  language_pref text        not null default 'en',
  created_at    timestamptz not null default now()
)

approval_requests (
  id                   uuid primary key default gen_random_uuid(),
  requester_id         uuid        not null references profiles,
  operation_type       text        not null,
  site_name            text        not null,
  planned_start        timestamptz not null,
  planned_end          timestamptz not null,
  risk_assessment_json jsonb,
  risk_score           text,        -- Low | Medium | High — stored from AI6 on creation
  risk_colour          text,        -- green | amber | red — stored from AI6 on creation
  status               text        not null default 'draft'
                         check (status in ('draft','pending','approved','rejected','expired')),
  reviewer_id          uuid        references profiles,
  reviewer_notes       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
)

submissions (
  id                  uuid primary key default gen_random_uuid(),
  approval_request_id uuid        not null references approval_requests,
  submitted_by        uuid        not null references profiles,
  submitted_at        timestamptz not null default now(),
  checklist_json      jsonb       not null,
  compliance_gaps     jsonb,       -- [{step: string, regulation: string}] — written by AI4
  notes               text,
  compliance_status   text        not null  -- complete | incomplete | flagged
  -- note: no report_file_path — PDF is generated on-the-fly and streamed, never stored
)

-- submission_photos table is not needed — photos are held in memory during the
-- submission request, embedded into the PDF, then discarded. Not persisted.
```

### Deferred tables — define after ingestion experiments

> **Why deferred?** We do not yet know what fields are reliably extractable from real
> EHS PDFs. PDF quality, structure, and metadata vary significantly across OSHA, HSE,
> KOSHA, EU-OSHA, and other publishers. Step 2 of the implementation order is an
> ingestion experiment specifically to answer this question.

```
documents       -- TBD: fields depend on what is extractable from real PDFs
document_chunks -- TBD: chunk size and overlap depend on ingestion test results
```

**Minimum fields we expect (to be confirmed in Step 2):**

| Field | Confidence | Notes |
|-------|-----------|-------|
| `id`, `source_url`, `ingested_at`, `full_text` | High | Always extractable |
| `title`, `source_org`, `language` | Medium | Usually in PDF metadata; may need inference |
| `published_date` | Low | Often missing or inconsistent |
| `pillar`, `hazard_tags` | N/A | AI-tagged post-extraction, not from the PDF |

Document schema will be added here once Step 2 is complete.

---

## Document Sources (Chemical Sector)

Pre-seed these — no live crawler needed for prototype.

| Source | Documents | Regulation |
|--------|-----------|-----------|
| OSHA | 29 CFR 1910.119 — PSM of Highly Hazardous Chemicals | US |
| OSHA | 29 CFR 1910.1000 — PEL table for chemical exposures | US |
| OSHA | 29 CFR 1910.1200 — Hazard Communication / GHS / SDS | US |
| OSHA | 29 CFR 1910.146 — Permit-Required Confined Spaces | US |
| HSE (UK) | COSHH guidance documents | UK |
| HSE (UK) | COMAH regulations | UK |
| EU-OSHA | ATEX Directive 2014/34/EU | EU |
| EU | REACH Regulation | EU |
| EU | CLP Regulation (classification, labelling, packaging) | EU |
| KOSHA | 화학물질 취급 안전 가이드 (chemical handling safety guide) | KR |
| KOSHA | 공정안전관리 (PSM guidelines) | KR |
| ILO | Convention No. 174 — prevention of major industrial accidents | Intl |
| ISO | ISO 45001 (OHS management system) | Intl |
| ISO | ISO 14001 (environmental management system) | Intl |
| NFPA | NFPA 30 — Flammable and Combustible Liquids Code | US |

---

## Skills Required

Skill files at `/mnt/skills/public/` are not available in a local environment.
Guidance for each task is embedded directly in the relevant agent command file.

| Task | Where guidance lives |
|------|---------------------|
| UI design — all pages and components | agent-frontend.md — UI design rules section |
| PDF report generation | agent-backend.md — Steps 8+9 section |
| PDF reading / ingestion parsing | agent-backend.md — Step 4 section |

---

## User Roles

| Role | Can do |
|------|--------|
| Worker | Search, create permit requests, submit proof |
| Supervisor | All above + approve / reject permit requests |
| EHS Officer | All above + manage document library |
| Admin | Full access |

**Demo users (seed at Step 9):**
- `worker@demo.com` — Kim Jae-won, Process Operator
- `supervisor@demo.com` — Park Soo-jin, Production Supervisor
- `ehs@demo.com` — Lee Hyun-kyu, EHS Officer
- `admin@demo.com` — Admin

---

## Routes

```
/                           Homepage — search hero (AI1)
/search                     Search results + AI answer + citations (AI1)
/documents                  Document library (P1)
/documents/[id]             Document detail (P1)

/approvals                  My permits dashboard (P2)
/approvals/new              New permit form — risk pre-fill (AI2) + risk scorer badge (AI6)
/approvals/[id]             Permit detail + status
/approvals/review           Review queue — stored risk scorer badge (AI6)

/submissions/[id]           AI-generated checklist + photo upload (AI3) + gap detector (AI4)
                            ↳ PDF downloads automatically on submit — no /report sub-route exists

/incident                   Incident-to-regulation lookup (AI5)

/login
/register
```

---

## Folder Structure

```
ehs-platform/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
│
├── frontend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── (auth)/login/
│   │   └── (dashboard)/
│   │       ├── page.tsx
│   │       ├── search/page.tsx
│   │       ├── documents/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── approvals/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   ├── review/page.tsx
│   │       │   └── [id]/page.tsx
│   │       └── submissions/[id]/
│   │           └── page.tsx           # Checklist + photo upload + PDF auto-download
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── search/
│   │   ├── approvals/
│   │   └── submissions/
│   ├── lib/
│   │   └── api.ts                 # typed fetch wrappers → FastAPI
│   └── types/index.ts
│
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── search.py
│   │   ├── documents.py
│   │   ├── approvals.py
│   │   └── submissions.py         # POST accepts multipart (checklist + photos), returns PDF stream
│   ├── services/
│   │   ├── rag.py
│   │   ├── embeddings.py
│   │   ├── openai_client.py       # gpt-4.1-mini + text-embedding-3-small
│   │   └── pdf_report.py          # builds PDF in memory, returns bytes — nothing written to disk
│   ├── ingestion/
│   │   ├── fetch_documents.py
│   │   ├── parse_and_chunk.py
│   │   └── embed_and_load.py
│   ├── models/db.py
│   ├── seed/seed_demo_data.sql
│   └── requirements.txt
│
└── planning.md
```

---

## Implementation Order

Each step has an explicit verify condition.
**A step is not done until its verify condition passes.**

---

## Pre-Agent Phase — run manually before invoking any agent

These two steps happen outside of any agent. Agents have nothing to work with
until real documents exist and the schema is decided from actual data.

---

### Step 0 — Web crawling & scraping
**Goal:** Raw EHS documents downloaded locally from all target sources.

Tasks:
- Write `backend/ingestion/fetch_documents.py`
- Download from the pinned URLs below — save each to `backend/data/raw/`
- Log every URL attempted, whether it succeeded, and file size

**Pinned source URLs (try these first — confirmed publicly accessible):**
```
# OSHA
https://www.osha.gov/sites/default/files/publications/osha3132.pdf        # PSM 1910.119
https://www.osha.gov/sites/default/files/publications/OSHA3076.pdf        # Confined Spaces 1910.146
https://www.osha.gov/sites/default/files/publications/osha3111.pdf        # HazCom 1910.1200

# HSE (UK)
https://www.hse.gov.uk/pubns/priced/l5.pdf                                # COSHH ACOP
https://www.hse.gov.uk/pubns/books/hsg250.pdf                             # COMAH guidance

# EU-OSHA / EUR-Lex
https://osha.europa.eu/sites/default/files/publications/documents/en/publications/factsheets/70/report_en.pdf
# ATEX overview

# ILO
https://www.ilo.org/wcmsp5/groups/public/---ed_protect/---protrav/---safework/documents/normativeinstrument/wcms_c174_en.pdf

# ISO (publicly available summaries)
https://www.iso.org/files/live/sites/isoorg/files/store/en/PUB100376.pdf  # ISO 45001 overview

# KOSHA (Korean — download manually if scraping fails)
https://www.kosha.or.kr/kosha/data/guidanceM.do  # Requires manual download
```

If a URL returns a non-200 or redirects to a login page, log it as failed and
continue — do not block. Check assumption ASM1 here.

Verify:
```
ls backend/data/raw/ → ≥ 10 files (15 preferred; 10 is acceptable minimum)
Each file is non-zero bytes and ends in .pdf
Log shows URL, HTTP status, and file size per document
```

**Status: DONE** — 34 PDFs in backend/data/raw/ (regulations, manuals, SOPs, guidelines)

---

### Step 1 — Ingestion experiments (schema discovery)
**Goal:** Know what fields are reliably extractable before writing any schema.

Tasks:
- Write `backend/ingestion/parse_and_chunk.py`
- Run `pdfplumber` on each raw file — log what metadata and text comes out
- Test chunk sizes 500 / 800 / 1200 tokens — inspect quality of each
- Note which fields are always present, sometimes present, never present
- Write `Plan/infra/schema.md` — finalised document + document_chunks schema
  with field confidence table and chosen chunk size with rationale

Check assumption ASM2 here — if pdfplumber produces garbled text (scanned PDFs),
note which files need OCR and decide whether to include or skip them.

Verify:
```
For each PDF: extracted text is non-empty and readable
Plan/infra/schema.md exists with finalised schema and chunk size decision
```

**Status: DONE** — 1214 chunks extracted (800 tokens, 100 overlap) to `backend/data/chunks/new_documents.json`. Two image-based PDFs yielded no text: `23.SOP. Chemical Handling.pdf`, `msds-제도-홍보-영문-리플렛-210401.pdf`.

---

## Agent Phase — invoke agents after Steps 0 and 1 are verified

---

### Step 2 — Docker setup
**Owner: Agent 1 (Infra)**
**Goal:** All services start with one command and can talk to each other.

Tasks:
- Write `docker-compose.yml` with frontend, backend, db, nginx services
- Write `frontend/Dockerfile` and `backend/Dockerfile`
- Write `nginx/nginx.conf` — proxy `/api/*` to backend:8000, rest to frontend:3000
- Confirm pgvector extension loads on the db container

Verify:
```
docker-compose up
curl http://localhost:3000        → Next.js default page loads
curl http://localhost:8000/health → {"status": "ok"}
curl http://localhost/api/health  → same response via nginx
```

**Status: DONE** — All 4 containers running (db, backend, frontend, nginx). Health endpoints verified.

---

### Step 3 — Database migrations
**Owner: Agent 1 (Infra)**
**Goal:** All tables exist in Postgres and pgvector is enabled.

Tasks:
- Write migration SQL for stable tables (profiles, approval_requests, submissions)
- Write migration SQL for document tables using `Plan/infra/schema.md` from Step 1
- Enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector`
- Run migrations inside the db container
- Write `Plan/infra/api_contract.md` — all route paths, HTTP methods, request shapes,
  and response shapes for all endpoints: auth, P1–P4 platform features, and AI1–AI6
  AI endpoints. This gates Agents 2 and 3.

Verify:
```
\dt in psql → lists all tables
\d document_chunks → confirms embedding column is vector(N)
INSERT a test row into each table → no errors
Plan/infra/api_contract.md exists and is non-empty
```

**Status: DONE** — 5 tables created (profiles, documents, document_chunks, approval_requests, submissions). pgvector enabled. api_contract.md written.

---

### Step 4 — Ingestion pipeline (load into DB)
**Owner: Agent 2 (Backend)**
**Goal:** Raw documents from Step 0 are chunked, embedded, and searchable in Postgres.

Tasks:
- Write `backend/ingestion/embed_and_load.py`
- Read raw files from `backend/data/raw/` (already downloaded in Step 0)
- Use chunk logic from `parse_and_chunk.py` (already written in Step 1)
- Embed each chunk via OpenAI `text-embedding-3-small`
- Insert documents + chunks into Postgres

Check assumptions ASM3 (OpenAI accessible) and ASM5 (pgvector works) here.

Verify:
```
SELECT count(*) FROM documents;       → ≥ 10 (≥ 15 preferred)
SELECT count(*) FROM document_chunks; → ≥ 200
SELECT content FROM document_chunks LIMIT 3; → readable chemical EHS text (not garbled)
SELECT embedding FROM document_chunks LIMIT 1; → non-null vector
Vector similarity query returns results without error
```

---

### Step 5 — Document library (API + UI)
**Owner: Agent 2 (Backend) + Agent 3 (Frontend) in parallel**
**Goal:** User can browse all ingested documents and open one to read it.

*

Tasks:
- FastAPI: `GET /api/documents` (list with optional filters) and
  `GET /api/documents/{id}` (detail)
- Next.js: `/documents` page with filter chips (pillar, source org)
- Next.js: `/documents/[id]` page showing full text + metadata + source link

Verify:
```
GET /api/documents → returns JSON array of documents
GET /api/documents/{id} → returns full document record
/documents page loads and shows document cards
Clicking a document opens the detail page with readable content
Filter by source org → list updates correctly
```

---

### Step 6 — AI search / RAG
**Owner: Agent 2 (Backend) + Agent 3 (Frontend) in parallel**
**Goal:** User types a chemical EHS question and gets an AI answer with source citations.

*

Tasks:
- FastAPI: `POST /api/search` — embed query → pgvector similarity search →
  pass top-5 chunks + query to `gpt-4.1-mini` → return answer + citations
- System prompt: EHS compliance expert, answer only from provided documents,
  always cite source org + regulation number + section, answer in query language
- Next.js: `/search` page — search bar, answer card, collapsible citations panel

Assumption to check here: ASM4 (`gpt-4.1-mini` accessible)

Verify:
```
POST /api/search {"query": "PSM requirements for chlorine storage"}
→ response has answer (non-empty) and citations array (≥ 1 item)
→ each citation has: document title, source_org, regulation reference

UI: type the same query → answer displays with citation sources visible
Try a Korean query → answer comes back in Korean
```

---

### Step 7 — Work permit approval flow
**Owner: Agent 2 (Backend) + Agent 3 (Frontend) in parallel**
**Goal:** Worker submits a permit request. Supervisor approves or rejects it. Both see current status.

*

> Approval steps are simplified — no real notifications. Status changes reflect in the
> UI immediately. The goal is to demonstrate the flow visually, not wire up messaging.

Operation types (hardcoded — no need to make this configurable):
- Hot work near flammable materials
- Confined space entry (reactor / vessel)
- Chemical transfer / loading
- Electrical isolation (LOTO)
- Non-routine maintenance on process equipment
- Chemical waste disposal / drumming

Tasks:
- FastAPI: `POST /api/approvals` (create), `GET /api/approvals` (list by user),
  `GET /api/approvals/{id}` (detail), `PATCH /api/approvals/{id}/status` (approve/reject)
- Next.js: `/approvals/new` — form with operation type, site, dates, risk notes
- Next.js: `/approvals` — worker's permit dashboard with status badges
- Next.js: `/approvals/review` — supervisor queue of pending requests
- Next.js: `/approvals/[id]` — detail with status timeline

Verify:
```
As worker: submit a new permit request → status = pending
As supervisor: GET /approvals/review → pending request appears
As supervisor: approve it → status = approved
As worker: reload /approvals → status shows approved
As supervisor: reject a different request with notes → notes visible on detail page
```

---

### Step 8 — Proof submission checklist + photo upload
**Owner: Agent 2 (Backend) + Agent 3 (Frontend) in parallel**
**Goal:** Worker completes a step-by-step checklist and uploads photos. Submission is recorded.

*

**Checklist source — AI3 primary, hardcoded fallback:**
Frontend calls `POST /api/ai/checklist` on page load. If the call succeeds, renders
AI-generated steps. If the call fails or times out (>5s), falls back to the hardcoded
template for that operation type. Hardcoded templates are fallback only — they are not
the contract.

Hardcoded fallback templates (used only on AI3 failure):

Hot work: area inspection, fire extinguisher, permit displayed, LEL reading, fire watch, post-work check.
Confined space entry: atmospheric test, vessel isolated, rescue equipment, attendant assigned, comms tested, log signed.
Chemical transfer: SDS reviewed, PPE donned, bonding/grounding, spill containment, eyewash accessible, transfer complete.

**Single multipart endpoint — no separate photo upload route:**

`POST /api/submissions` accepts multipart form data:
- `approval_request_id` — UUID string
- `checklist_json` — JSON string of completed steps
- `notes` — optional string
- `photo_{step_label}` — one file field per step requiring a photo
- Max 5 MB per photo, max 10 photos, total request cap 50 MB (reject 413 if exceeded)

What the endpoint does in sequence:
1. Validate multipart size limits — return 413 if exceeded
2. Save submission record to DB (checklist_json, notes, compliance_status, compliance_gaps)
3. Run AI4 gap detection (GPT-4.1-mini) — store result in `compliance_gaps` column
4. Collect photo bytes from multipart fields
5. Build PDF in memory via `pdf_report.py` — embed photos, include AI4 gap notes
6. Return `StreamingResponse(pdf_bytes, media_type="application/pdf")`
7. Nothing written to disk at any point

`GET /api/submissions/{id}` — returns submission metadata including `compliance_gaps`

**PDF report contents:**
- Permit details: operation type, site, worker, dates
- Approval record: reviewer, timestamp, notes
- AI6 risk badge: risk_level + reasoning (stored on approval_request)
- Completed checklist: each step with status and timestamp
- Photo thumbnails: max 400px wide, embedded per step
- AI Compliance Notes: gaps from AI4 (or "No gaps detected")
- Regulation reference: from linked document
- Compliance status: overall pass / incomplete / flagged

Tasks:
- `backend/services/pdf_report.py` — build PDF in memory, return bytes
- FastAPI: `POST /api/submissions` as described above
- FastAPI: `GET /api/submissions/{id}`
- Next.js: `/submissions/[id]` — AI checklist load, photo upload, gap modal, download trigger

Assumption to check here: ASM7 (no persistent storage — photos in memory only)

Verify:
```
POST /api/submissions (multipart, checklist + 2 photos under 5MB each)
→ Content-Type: application/pdf, non-empty bytes starting with %PDF
→ compliance_gaps populated in DB for that submission
→ No files on disk after request

POST /api/submissions with photo > 5MB → 413 response

GET /api/submissions/{id} → submission metadata with compliance_gaps

Frontend: /submissions/[id] loads → AI checklist renders with regulation captions
Submit with gaps → gap alert modal shows before download
"Download anyway" → PDF downloads with "AI Compliance Notes" section
```

> **NM7 — Shared ownership verify:** Each agent marks their half complete in their
> own progress.md (backend marks API done, frontend marks UI done). Full end-to-end
> verify for Steps 5–9 happens in Step 11c only.

---

### Step 9 — Seed data
**Owner: Agent 1 (Infra)**
**Goal:** The app looks populated and realistic without manual setup.

Tasks:
- `seed_demo_data.sql` written by Agent 2 (Backend) as part of auth step — Agent 1 runs it
- Insert 4 users (one per role), 3 approval requests in different states
  (approved, pending with risk_score set, rejected with notes), 1 completed submission
  with compliance_gaps populated
- Add a README command to run the seed against the db container

Verify:
```
Run seed script → no SQL errors
Log in as worker@demo.com → permit dashboard shows pre-existing requests
Log in as supervisor@demo.com → pending request with risk badge appears in review queue
```

---

### Step 10 — QA and Correction

**Goal:** Every must-build feature works end-to-end without errors.

#### 10a — Code review
Agent 1 reviews code produced by Agents 2 and 3. Findings written to `Plan/review/`
before anything is fixed. Fix in 10d only after the full review is documented.

- `Plan/review/backend.md` — FastAPI routes, services, ingestion pipeline, AI endpoints
- `Plan/review/frontend.md` — Next.js pages, components, API wiring
- `Plan/review/infra.md` — Docker setup, migrations, ingestion scripts

For each file reviewed, note: principle violations (which principle, which line),
logic errors, incorrect API contract implementation, unnecessary complexity,
code touching more than it should.

**AI endpoints — specific checks (NM6):**
- Confirm AI5 (`/api/ai/incident-lookup`) and AI6 (`/api/ai/risk-score`) are still
  returning mocked responses — not silently calling GPT
- Confirm AI2, AI3, AI4 sanitise LLM JSON response before inserting into DB
  (parse → validate shape → insert; never insert raw LLM string as JSON)
- Confirm AI4 `compliance_gaps` written to submissions table, not just returned in response

Verify:
```
Plan/review/backend.md exists and is non-empty
Plan/review/frontend.md exists and is non-empty
Plan/review/infra.md exists and is non-empty
```

#### 10b — Automated checks
- Backend: `pytest` on all FastAPI routes — happy path per endpoint
- Frontend: `next build` — zero TypeScript errors, zero warnings
- Docker: cold `docker-compose up` — all services healthy within 60s

Verify:
```
pytest → all tests pass
next build → exits 0
Cold docker-compose up → /health returns ok within 60s
```

#### 10c — End-to-end flow walkthrough
Walk through each must-build feature, logging every issue found:

1. Search: type a chemical EHS query → answer loads with citations → click citation → document opens
2. Permit: create as worker (risk scorer badge appears) → AI2 pre-fill runs → approve → worker sees status
3. Submission: AI3 checklist loads → complete steps, upload photos → submit → gap modal if gaps → PDF downloads
4. Document library: filter by pillar → open a document → content is readable
5. Incident page: type description → result card appears with all 4 sections

Verify:
```
All 5 flows complete without errors or blank states
No loading spinners that never resolve
No console errors in browser
PDF contains AI Compliance Notes section
Risk badge visible on approval form and reviewer queue
```

#### 10d — Correction
For every issue found in 10a, 10b, and 10c:
- Fix only the broken thing — do not refactor surrounding code (Principle 3)
- Re-run the relevant verify condition after each fix before moving to the next
- If a fix requires changing more than the immediate bug, flag it before proceeding
- Update `Plan/review/` with resolution notes for each finding

---

### Step 11 — Polish
**Goal:** App looks professional. Bilingual where it matters.

Tasks (only if Steps 0–10 are fully verified):
- Add KR/EN language toggle — translate nav labels, form labels, status badges only
- Loading states for search (skeleton card), AI checklist load, photo upload
- Verify all pages at 375px — no horizontal overflow anywhere
- Write a README: `docker-compose up`, seed command, login credentials

Verify:
```
Toggle to Korean → nav labels and form labels appear in Korean
Search runs → skeleton shows while waiting, replaced by answer on completion
All pages at 375px → no horizontal overflow, all buttons tappable
README: follow from scratch → app runs without consulting anything else
```

---

## Agent Teams

Agent 1 runs first (Steps 2–3), then Agents 2 and 3 run in parallel (Steps 4–8),
then Agent 1 resumes (Steps 9–11). Each agent writes progress and outputs
under its own subfolder in `Plan/`. No agent writes outside its folder except
Agent 1, which writes `Plan/infra/api_contract.md` — the shared handoff document
that gates Agents 2 and 3.

### Dependency gates

```
Pre-agent (manual — no agent invoked)
  Step 0 — Web crawl & scrape       (run standalone)
  Step 1 — Ingestion experiments    (run standalone)
  ↓ Plan/infra/schema.md written here
Agent 1 (Infra) — Phase 1
  Step 2 — Docker setup
  Step 3 — DB migrations + api_contract.md
  ↓ Plan/infra/api_contract.md gates Agents 2 & 3
Agent 2 (Backend) + Agent 3 (Frontend) — parallel
  Steps 4–8 (Agent 2: backend routes; Agent 3: UI pages)
  Each marks their half done in their own progress.md
  Full e2e verify in Step 10c only
  ↓ both signal done in their progress.md
Agent 1 (Infra) — Phase 2
  Steps 9–11 — seed, QA, polish
```

### Agent 1 — Infra
**Steps:** 2 (Docker), 3 (DB migrations), 9 (Seed), 10 (QA), 11 (Polish)
**Plan folder:** `Plan/infra/`
**Outputs that unblock others:**
- `Plan/infra/schema.md` — written in pre-agent Step 1 before agent is invoked
- `Plan/infra/api_contract.md` — written during Step 3, gates Agents 2 & 3

### Agent 2 — Backend
**Steps:** 4 (Load ingested docs into DB), 5–8 (all FastAPI routes and services)
**Plan folder:** `Plan/backend/`
**Gate:** must not start until `Plan/infra/api_contract.md` exists
**Reads:** `Plan/infra/api_contract.md`, `Plan/infra/schema.md`

### Agent 3 — Frontend

**Steps:** 5–9 (all Next.js pages and components)
**Plan folder:** `Plan/frontend/`
**Gate:** must not start until `Plan/infra/api_contract.md` exists
**Reads:** `Plan/infra/api_contract.md`
**Note:** build against mock responses first — swap for real API calls once
Agent 2 signals completion in `Plan/backend/progress.md`

### Plan folder structure

```
Plan/
├── infra/
│   ├── progress.md        # Agent 1 updates after each step
│   ├── schema.md          # Finalised DB schema (written after Step 2)
│   └── api_contract.md    # Route + request/response shapes (written after Step 3)
├── backend/
│   └── progress.md        # Agent 2 updates after each route/service is done
├── frontend/
│   └── progress.md        # Agent 3 updates after each page/component is done
└── review/
    ├── backend.md         # Agent 1 code review of backend (written in Step 10a)
    ├── frontend.md        # Agent 1 code review of frontend (written in Step 10a)
    └── infra.md           # Agent 1 code review of infra (written in Step 10a)
```

### Calling the agents

Agents are invoked via Claude Code custom slash commands defined in
`.claude/commands/`. Run from the project root:

```bash
/agent-infra      # Start Agent 1
/agent-backend    # Start Agent 2 (will self-check gate condition)
/agent-frontend   # Start Agent 3 (will self-check gate condition)
```

Full agent metadata — steps, gates, read/write folders — is in `agent-team.json`.
Note: `agent-team.json` is documentation only. It does not configure Claude Code
directly. The slash commands are the actual invocation mechanism.

---

## Key References

- LabVantage acquisition press release: May 30, 2024
- SEIN Infotech: sein-it.com
- Regulations in scope: OSHA 1910.119, 1910.146, 1910.1200 — KOSHA chemical guidelines
  — EU ATEX, REACH, CLP — HSE COSHH, COMAH — ISO 45001, ISO 14001 — NFPA 30

---

*Last updated: April 2026 | LabVantage × SEIN Infotech EHS AI Prototype*