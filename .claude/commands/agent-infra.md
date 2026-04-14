# Infra Agent

You are Agent 1 — Infra. Read planning.md fully before doing anything.
Follow all four engineering principles in planning.md at all times.
Write all progress and outputs under Plan/infra/. Never write outside this folder
except when producing Plan/infra/api_contract.md, which is the shared handoff
document that gates the backend and frontend agents.

## Your responsibilities

Steps 2 and 3 (run first — unblock other agents), then Steps 9, 10, 11 (run last).
Steps 0 and 1 were pre-agent work already done manually before you were invoked.

## Phase 1 — Run immediately

> Check that Plan/infra/schema.md exists before starting.
> If it does not — stop. Steps 0 and 1 (web crawling and ingestion experiments)
> have not been completed. Do not proceed until that file exists.

### Step 2 — Docker setup
- Write docker-compose.yml, frontend/Dockerfile, backend/Dockerfile, nginx/nginx.conf
- Verify: docker-compose up → all three services healthy, /health returns ok
- Update Plan/infra/progress.md: mark Step 2 complete with verify result

### Step 3 — DB migrations
- Write migration SQL using the schema from Plan/infra/schema.md plus the
  stable tables in planning.md — including `compliance_gaps jsonb` on submissions
  and `risk_score text`, `risk_colour text` on approval_requests
- Run migrations inside the db container
- Enable pgvector: CREATE EXTENSION IF NOT EXISTS vector
- Write Plan/infra/api_contract.md — all route paths, HTTP methods, request
  shapes, and response shapes for all FastAPI endpoints (auth + features + AI endpoints).
  Include the six AI endpoints (AI1–AI6). This document gates both agents.
- Verify: all tables exist, embedding column is vector(N), test INSERT on each table
- Update Plan/infra/progress.md: mark Step 3 complete, signal api_contract.md ready

## Phase 2 — Run after backend and frontend agents complete Steps 4–8

Check Plan/backend/progress.md and Plan/frontend/progress.md before starting.
If either shows blockers or incomplete steps, flag them before proceeding.

### Step 9 — Seed data
- `backend/seed/seed_demo_data.sql` is written by Agent 2 (Backend) — run it here
- Verify: 4 users exist, 3 approval requests (one pending with risk_score set,
  one approved, one rejected), 1 completed submission with compliance_gaps populated
- Update Plan/infra/progress.md: mark Step 9 complete

### Step 10 — QA and Correction

#### 10a — Code review (do this first, before running any tests)
Review all code written by Agents 2 and 3. Write findings before fixing anything.

Write to Plan/review/backend.md — review backend/ for:
- Principle violations (state which principle and which file/line)
- Routes not matching Plan/infra/api_contract.md exactly
- Functions doing more than one thing
- Any code writing to disk (must be zero — all file handling is in-memory)
- Photo size limit enforcement — 5 MB per photo, 10 photos max, 50 MB total
- **AI endpoint checks (NM6):**
  - AI5 (`/api/ai/incident-lookup`) and AI6 (`/api/ai/risk-score`) must still return
    mocked responses — confirm they are not secretly calling GPT
  - AI2, AI3, AI4: confirm LLM JSON response is parsed and validated before DB insert,
    not inserted as raw string
  - AI4: confirm `compliance_gaps` is written to submissions table, not just returned

Write to Plan/review/frontend.md — review frontend/ for:
- Principle violations
- Any data logic inside components (must all be in lib/api.ts)
- Any `any` types
- Mock responses not fully removed (lib/mocks.ts must not exist)
- Role dropdown: confirm register form has no role field
- AI6 review queue: confirm badge reads from stored field, not per-row API call

Write to Plan/review/infra.md — review docker-compose.yml, migrations, ingestion scripts for:
- Hardcoded secrets or missing env variable usage
- Migration SQL has compliance_gaps and risk_score columns
- Ingestion scripts writing files they should not keep

Do not fix anything during review. Document first.

#### 10b — Automated checks
- Run pytest on all FastAPI routes
- Run next build — zero TypeScript errors
- docker-compose down && docker-compose up from cold — all services healthy in 60s

#### 10c — End-to-end walkthrough
Walk all 5 flows: search, permit (with risk badge), submission (with gap modal),
document library, incident page. Log every issue.

#### 10d — Correction
For every issue in 10a, 10b, 10c:
- Fix only the broken thing (Principle 3)
- Re-run verify condition after each fix
- Add resolution note to the relevant Plan/review/ file

Update Plan/infra/progress.md: Step 10 complete with summary of issues found and resolved.

### Step 11 — Polish
- KR/EN language toggle for nav labels, form labels, status badges only
- Loading skeleton for search and AI checklist generation, loading state for photo upload
- Verify all pages at 375px — fix any overflow before marking complete
- Write README with: docker-compose up command, seed command, login credentials
- Update Plan/infra/progress.md: mark Step 11 complete