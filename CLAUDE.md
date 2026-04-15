# CLAUDE.md — EHS AI Platform

This file is read automatically by Claude Code at the start of every session.
Every agent must read and follow everything here before writing any code.

---

## Engineering Principles

These are non-negotiable. Apply them to every task, every file, every line.

### 1. Think Before Coding
- State assumptions explicitly before starting
- If a requirement is ambiguous, list the interpretations and ask — do not silently pick one
- If a simpler approach exists than what was asked, say so before building
- If something is unclear, name what is unclear and stop

### 2. Simplicity First
- No features beyond what was asked
- No abstractions for single-use code
- No configurability that was not requested
- If 200 lines could be 50, rewrite it
- Test: would a senior engineer call this overcomplicated? If yes, simplify.

### 3. Surgical Changes
- Touch only what the task requires
- Do not improve adjacent code, comments, or formatting
- Match existing style even if you would do it differently
- If your changes make an import or variable unused, remove it
- If you notice pre-existing dead code, mention it — do not delete it

### 4. Goal-Driven Execution
- Every task has a verify condition in planning.md
- A task is not done until its verify condition passes — not when the code is written
- For multi-step work, state a brief plan with verify steps before starting

---

## Project Overview

EHS AI platform prototype for LabVantage × SEIN Infotech. Chemical sector only.

**Platform features:** Document library (P1), work permit + approval (P2), proof
submission checklist + PDF report (P3+P4).

**AI features:**
| ID | Feature | Implementation |
|----|---------|---------------|
| AI1 | RAG regulatory Q&A | Full — pgvector + GPT-4.1-mini |
| AI2 | Risk assessment pre-fill | Full — RAG → structured JSON |
| AI3 | AI checklist generation | Full — RAG → dynamic steps |
| AI4 | Compliance gap detector | Full — runs inside POST /api/submissions |
| AI5 | Incident-to-regulation lookup | Placeholder — mocked response, real UI at /incident |
| AI6 | Permit risk scorer | Placeholder — mocked response, stored on approval record |

Full details in `planning.md`. Assumptions table uses ASM1–ASM7.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.11), SQLAlchemy async, asyncpg |
| Database | PostgreSQL 15 + pgvector |
| LLM | OpenAI `gpt-5.4-mini` |
| Embeddings | OpenAI `text-embedding-3-small` |
| Infrastructure | Docker Compose (frontend + backend + db + nginx) |
| File storage | None — photos held in memory, embedded in PDF, then discarded |

Start everything: `docker-compose up`
Stop everything: `docker-compose down`

---

## Folder Rules

```
frontend/     ← Agent 3 (Frontend) only. Never touched by backend agent.
backend/      ← Agent 2 (Backend) only. Never touched by frontend agent.
Plan/infra/   ← Agent 1 (Infra) writes here
Plan/backend/ ← Agent 2 (Backend) writes here
Plan/frontend/← Agent 3 (Frontend) writes here
Plan/review/  ← Agent 1 writes code review findings here after Step 10
```

No agent writes outside its assigned folder except `Plan/infra/api_contract.md`
and `Plan/infra/schema.md`, which are shared handoff documents.

---

## Agent Commands

```bash
/agent-infra      # Agent 1 — Docker, ingestion experiments, DB, seed, QA, polish
/agent-backend    # Agent 2 — FastAPI routes, services, ingestion pipeline
/agent-frontend   # Agent 3 — Next.js pages and components
```

Agent 2 and Agent 3 must not start until `Plan/infra/api_contract.md` exists.
Agent 3 builds against mocks first, swaps for real calls when Agent 2 signals done.

---

## Skills

Skill files at `/mnt/skills/public/` are not available locally.
Follow these inline rules instead — they are embedded directly in each agent command file.

| Task | Where guidance lives |
|------|---------------------|
| UI components and pages | Inline in agent-frontend.md — UI design rules section |
| PDF report generation | Inline in agent-backend.md — Steps 8+9 section |
| PDF reading / ingestion | Inline in agent-backend.md — Step 4 section |

---

## Document Ingestion

PDFs are stored in `backend/data/raw/` (34 files). Extraction pipeline:

```bash
uv run backend/ingestion/extract_all.py
```

Output: `backend/data/chunks/new_documents.json` (1214 chunks, 800 tokens each, 100 token overlap)

Two PDFs are image-based with no extractable text:
- `23.SOP. Chemical Handling.pdf`
- `msds-제도-홍보-영문-리플렛-210401.pdf`

---

## Key Conventions

**Backend (Python)**
- All routes return JSON matching the shapes in `Plan/infra/api_contract.md` exactly
- No route does more than one thing — split into service functions
- No print statements — use Python `logging`
- All DB calls are async

**Frontend (TypeScript)**
- No data logic in components — all API calls go through `lib/api.ts`
- No `any` types
- No inline styles — Tailwind classes only
- Mock responses live in `lib/mocks.ts` — removed entirely in Step 9
- Mobile-first layout required — full rules in `agent-frontend.md` UI design rules section

**General**
- No `.env` values hardcoded in source — use environment variables
- No TODO comments left in merged code
- Every new file gets a one-line comment at the top stating its purpose

---

## Before Running Any Agent

The following must be true or agents will fail immediately:

```bash
# 1. Plan/ subfolders must exist
mkdir -p Plan/infra Plan/backend Plan/frontend Plan/review

# 2. Pre-agent steps must be complete
#    Plan/infra/schema.md must exist (written during Step 1)
#    backend/data/raw/ must contain 34 PDF files (regulations, manuals, SOPs)
#    backend/data/chunks/new_documents.json must exist (1214 chunks extracted)
```

---

## Auth

Simple register + login. No role enforcement anywhere.

- `POST /api/auth/register` — create account, defaults role to `'worker'`
- `POST /api/auth/login` — returns JWT
- All other routes require `Authorization: Bearer <token>` — 401 if missing
- Any user can call any route. Role stored in DB only — never checked by the API.
- Register form has no role dropdown — role is always defaulted server-side.

---

## Recent Implementations

**UI/UX:**
- Color scheme: Stone + Deep Teal palette
- Branding: "Verity IQ" for AI responses with animated thinking dots
- Search history: localStorage-based, last 5 queries, dropdown on focus
- Citations: Grouped by document, confidence index (%) with tooltip, expandable excerpts
- Document filters: Hybrid (pillars + doc types), Korean translations included
- Mobile: Bottom nav, user menu access, proper header padding

**RAG Search:**
- Vector index: HNSW (replaced IVFFlat for accuracy)
- Relevance threshold: max_distance 0.55 with fallback to nearest neighbors
- Response budget: Dynamic token limits based on query type
- Prompt: Structured markdown output, minimal bold, clarifying questions when ambiguous

**Document Types:**
- regulation, guideline, sop, manual, quick_card
- Stored in `documents.doc_type` column
- Filterable via `/api/documents?doc_type=...`

---

## What Not To Do

- Do not add features not listed in the must-build list in planning.md
- Do not create a `/submissions/[id]/report` route — PDF streams on submit, no preview page
- Do not write to disk for photos or PDFs — memory only
- Do not add real-time notifications — status updates reflect in UI on page load
- Do not touch the other agent's folder
- Do not run Steps 9–11 until all prior step verify conditions pass
- Do not insert raw LLM response strings into the DB — always parse and validate first


