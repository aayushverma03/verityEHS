# Plan/backend/progress.md - Backend Agent Progress

## Auth
**Status: COMPLETE**

Files created:
- `backend/config.py` - environment variables (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY)
- `backend/db.py` - async SQLAlchemy session
- `backend/auth.py` - JWT utilities and `get_current_user` dependency
- `backend/models.py` - Pydantic schemas for all endpoints
- `backend/routes/auth.py` - POST /api/auth/register, POST /api/auth/login
- `backend/seed/seed_demo_data.sql` - 4 demo users with bcrypt-hashed passwords

Routes:
- `POST /api/auth/register` - creates user with role='worker', returns user record
- `POST /api/auth/login` - returns JWT token (24h expiry)
- All other routes require `Authorization: Bearer <token>`

**Verify:** Awaiting Docker to test endpoints.

---

## Step 4 - Ingestion Pipeline
**Status: COMPLETE**

Files created:
- `backend/ingestion/sources.py` - metadata mapping for 34 PDFs
- `backend/ingestion/embed_and_load.py` - embeds chunks and loads into Postgres

Run command:
```bash
OPENAI_API_KEY=<key> DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ehs uv run backend/ingestion/embed_and_load.py
```

**Verify:** Awaiting Docker and OpenAI key to run.

---

## Step 5 - Document Library API
**Status: COMPLETE**

Files created:
- `backend/routes/documents.py`

Routes:
- `GET /api/documents` - list with optional ?pillar= and ?source_org= filters
- `GET /api/documents/{id}` - full document record

---

## Step 6 - RAG Search API
**Status: COMPLETE**

Files created:
- `backend/services/rag.py` - embed_text, retrieve_chunks, generate_answer
- `backend/routes/search.py`

Routes:
- `POST /api/search` - RAG search with language detection (responds in query language)

---

## AI Endpoints (AI2, AI3, AI5, AI6)
**Status: COMPLETE**

Files created:
- `backend/routes/ai.py`

Routes:
- `POST /api/ai/risk-prefill` (AI2) - full RAG implementation
- `POST /api/ai/checklist` (AI3) - full RAG implementation
- `POST /api/ai/incident-lookup` (AI5) - placeholder (mocked response)
- `POST /api/ai/risk-score` (AI6) - placeholder (mocked, varies by operation_type)

---

## Step 7 - Approvals API
**Status: COMPLETE**

Files created:
- `backend/routes/approvals.py`

Routes:
- `POST /api/approvals` - create approval request (stores risk_score, risk_colour)
- `GET /api/approvals` - list current user's requests
- `GET /api/approvals/{id}` - detail view
- `GET /api/approvals/review` - list all pending (includes requester_name)
- `PATCH /api/approvals/{id}/status` - approve/reject

---

## Step 8 - Submissions + PDF
**Status: COMPLETE**

Files created:
- `backend/services/pdf_report.py` - generate_report() using fpdf2, in-memory
- `backend/routes/submissions.py`

Routes:
- `POST /api/submissions` - multipart form, runs AI4 gap detection, returns PDF stream
- `POST /api/submissions/with-photos` - same with photo upload support
- `GET /api/submissions/{id}` - submission metadata

AI4 compliance gap detection runs inside POST /api/submissions.

PDF sections: permit details, approval record, checklist, photo evidence, AI compliance notes, submission info.

**Verify:** Awaiting Docker to test PDF generation.

---

## Updated main.py
All routers registered. CORS configured to expose custom headers (X-Compliance-Gaps, etc).

---

## Summary

All backend code is written and syntax-verified:
- 6 route modules (auth, documents, search, ai, approvals, submissions)
- 2 service modules (rag, pdf_report)
- Config, DB, auth utilities
- Ingestion pipeline ready to run
- Seed SQL with demo users

## Verification Complete

**Tested 2024-04-15:**
- Docker containers running (db, backend, frontend, nginx)
- Migrations applied
- Demo users seeded (password: `password123`)
- Ingestion complete: 32 documents, 1214 chunks embedded
- Auth endpoints verified (register, login, JWT)
- Documents endpoint verified (returns 32 docs)
- RAG search verified (returns AI answer with citations)

**Backend ready for frontend integration.**
