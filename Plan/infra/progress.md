# Plan/infra/progress.md — Infra Agent Progress

## Step 2 — Docker Setup
**Status: COMPLETE**

Files created:
- `docker-compose.yml` — 4 services (db, backend, frontend, nginx)
- `backend/Dockerfile` — Python 3.11-slim
- `backend/requirements.txt` — FastAPI, SQLAlchemy, OpenAI, etc.
- `backend/main.py` — minimal app with /health
- `frontend/Dockerfile` — Node 20-alpine
- `frontend/package.json` — Next.js 14
- `frontend/app/` — layout, page, globals.css
- `nginx/nginx.conf` — reverse proxy config

**Verify result:**
```
curl http://localhost:8000/health → {"status":"ok"}
curl http://localhost:3000 → HTML loads
curl http://localhost/api/health → {"status":"ok"}
docker compose ps → all 4 containers running
```

---

## Step 3 — DB Migrations + API Contract
**Status: COMPLETE**

Files created:
- `backend/migrations/001_init.sql` — all tables + pgvector
- `Plan/infra/api_contract.md` — full API contract

**Tables created:**
- profiles (users + auth)
- documents (EHS regulations)
- document_chunks (RAG embeddings, vector(1536))
- approval_requests (work permits, includes risk_score/risk_colour)
- submissions (proof submissions, includes compliance_gaps)

**Verify result:**
```sql
\dt → 5 tables exist
\d document_chunks → embedding vector(1536) column present
CREATE EXTENSION vector → already enabled
```

**API contract ready:** `Plan/infra/api_contract.md`
- Auth routes (register, login)
- Document routes (list, detail)
- Search route (AI1 RAG)
- Approval routes (CRUD + review queue)
- Submission routes (multipart + PDF)
- AI routes (AI2, AI3, AI5, AI6)

---

## Next Steps

Steps 4-8 are owned by Backend and Frontend agents.
Infra agent resumes at Step 9 (seed data) after those complete.
