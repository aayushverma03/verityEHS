# Review — planning.md, CLAUDE.md, agent-{infra,backend,frontend}.md

## Round 3 review (current)

Reviewed: `planning.md` (976), `CLAUDE.md` (175), `agent-infra.md` (102),
`agent-backend.md` (363), `agent-frontend.md` (366), `agent-team.json` (92).

### Round 1 + Round 2 findings — almost all resolved

| Finding | Round 3 status |
|---------|---------------|
| B1 `submission_photos` contradiction | **Fixed** |
| B2 two-endpoint vs multipart | **Fixed** (planning.md Step 8 now single multipart) |
| B3 A7 wording | **Fixed** (ASM7 now "no persistent storage — photos in memory only") |
| B4 "Claude API" in OpenAI stack | **Fixed** (line 207 now "OpenAI API calls") |
| C2 Engineering principles duplicated | **Fixed** (planning.md references CLAUDE.md) |
| C3 `approval_requests.status` enum | **Fixed** (CHECK constraint added) |
| C4 Routes section `/report` warning | **Fixed** (route comment added) |
| C6 Orphan bullets at EOF | **Fixed** (`## Key References` + `## What Not To Do` headings added) |
| G1 Auth | **Fixed** |
| G2 Photo size limits | **Fixed** (5 MB/photo, 10 photos, 50 MB total — enforced client + server) |
| G3 Step 0 PDF URLs | **Fixed** (pinned) |
| G4 Step 4 success rate | **Fixed** (`≥ 10`, `≥ 200` — binary) |
| G5 Korean handling | **Fixed** (`langdetect` with English fallback) |
| NB1 `compliance_gaps` column | **Fixed** (added to submissions schema) |
| NB2 `risk_score` column | **Fixed** (added to approval_requests schema + backend stores it) |
| NB3 Step 7 heading | **Fixed** |
| NB4 planning.md Step 8 two-endpoint | **Fixed** |
| NB5 A1–A7 vs A1–A6 collision | **Fixed** (ASM1–7 for assumptions, AI1–6 for AI features, P1–P4 for platform) |
| NH1 hardcoded vs AI checklist | **Fixed** (AI3 primary, hardcoded fallback) |
| NH2 P5 vs AI5 duplicate | **Fixed** (P5 removed; AI5 owns `/incident`) |
| NH3 seed file authorship | **Fixed** (Agent 2 writes, Agent 1 runs) |
| NH4 role dropdown | **Fixed** (removed from register form; server defaults to `'worker'`) |
| NM5 photo size limits | **Fixed** |
| NM6 AI endpoint review checks | **Fixed** (added to agent-infra.md 10a) |
| NM7 shared-ownership verify | **Fixed** (explicit note in planning.md + agent-team.json) |
| C1 folder casing `Plan/` vs `PLAN/` | **Still open** |
| NM4 orphan bullets | **Fixed** in planning.md, **fixed** in CLAUDE.md too |
| NM1 stale Step numbering | **Partially fixed** — see R3.F below |

---

## New Round 3 findings

### Blocking

**R3.A — Duplicate "Step 10c" walkthrough in planning.md**
Lines 822–836 contain `#### 11c — End-to-end flow walkthrough` (the label `11c` is wrong — it sits inside Step 10). Lines 838–854 then repeat the same section correctly as `#### 10c`. The first block is an unmodified stale copy (still says "4 flows", lacks AI4/AI6 mentions). Delete lines 822–836.

**R3.B — "Step 9" means two different things**
- `planning.md` Step 9 = Seed data (Agent 1)
- `agent-frontend.md` Step 9 = Wire up real API calls (Agent 3)

Both are labeled "Step 9" but are unrelated work. Either:
- renumber the frontend wire-up step (e.g. call it "Final — Wire up real API calls"), or
- split Agent 3's range as "Steps 5–8 + wire-up phase" in planning.md.

Today a reader of `Plan/frontend/progress.md` writing "Step 9 complete" is ambiguous.

**R3.C — `agent-backend.md` auth verify still lists `role` in request body**
Line 30 correctly says `POST /api/auth/register` accepts `{email, full_name, password}`. Line 48 verify line still says `POST /api/auth/register {email, full_name, password, role}`. Drop the `role` field from the verify example.

### High

**R3.D — `agent-backend.md` scope mis-stated**
Line 19: *"Auth + Steps 4–9"*. Backend owns Steps 4–8; Step 9 is seed (Agent 1). Line 364: *"Steps 8+9 complete. Backend ready."* — Step 9 is not in backend's scope. Change to `Steps 4–8` and `Step 8 complete`.

**R3.E — `planning.md` line 926: frontend Steps 5–9**
Same problem as R3.B — line 926 says Agent 3 owns Steps 5–9. If "Step 9 = seed", this puts Agent 3 in Agent 1's territory. If "Step 9 = wire-up", that step number is already taken.

**R3.F — Stale "Features 1–5" reference**
Line 560 Step 3 task list: *"request shapes, and response shapes for Features 1–5"*. New numbering is P1–P4 + AI1–AI6. Fix the reference so the infra agent writes `api_contract.md` covering the right endpoint set. The agent-infra.md command file already says this correctly on line 32 — just planning.md is stale.

**R3.G — "Three agents run in parallel" wording in planning.md line 886**
Only Agents 2 and 3 run in parallel. Agent 1 runs sequentially before and after. Reword to *"Agents 2 and 3 run in parallel after Step 3"*.

### Medium

**R3.H — `Plan/` vs `PLAN/` folder casing (carryover C1)**
Still unresolved. On macOS APFS (case-insensitive) this works, but pushing to a case-sensitive host (CI Linux, Docker build context with tar) will break. Either `mv PLAN Plan` locally or update every reference to `PLAN/`. Pick one and apply consistently.

**R3.I — `Plan/{infra,backend,frontend,review}` subfolders do not exist**
`CLAUDE.md` line 147 instructs `mkdir -p Plan/infra Plan/backend Plan/frontend Plan/review` as a pre-agent step but it has not been run. Agents will fail their first write. Either:
- run the mkdir now, or
- have agents self-create their own subfolder in their gate-check.

### Low / cosmetic

**R3.J — `agent-backend.md` line 362–364 has a stray ``` fence**
Extra closing backtick block immediately after the verify block. Harmless but reads oddly.

**R3.K — `agent-team.json` `phase_2.steps` = [4,5,6,7,8]** is correct. Agent 3's steps `[5,6,7,8]` — does not include the wire-up. If wire-up is kept as "Step 9" for frontend only, `agent-team.json` should reflect it. Symptom of R3.B.

---

## Summary

**The doc tree is now 90% coherent.** 30+ findings from Rounds 1 and 2 have been resolved cleanly. What remains is all surface-level: one stale duplicate block (R3.A), one ambiguous step number (R3.B/E), a few stale scope annotations (R3.C/D/F/G), and the environmental setup gaps (R3.H/I).

**Is it feasible to call the agents now?** Not quite:
1. Fix R3.A, R3.B, R3.C (they actively mislead the agent reading the file).
2. Fix R3.H or run the mkdir in R3.I — agents need their subfolders before their first write.
3. Verify `OPENAI_API_KEY` and `JWT_SECRET` are in `.env` (CLAUDE.md expects both).
4. Run pre-agent Steps 0 and 1 to produce `Plan/infra/schema.md` — without it, the infra agent will stop at its Phase 1 gate check.

Once those are done, `/agent-infra` is safe to run alone, and the Phase 2 pair can follow once `api_contract.md` exists.

---

## Round 2 review (preserved below for reference)

Reviewed files:
- `PLAN/planning.md` (981 lines)
- `CLAUDE.md` (173 lines)
- `.claude/commands/agent-infra.md` (90 lines)
- `.claude/commands/agent-backend.md` (321 lines)
- `.claude/commands/agent-frontend.md` (356 lines)

---

## Status of Round 1 findings

| Finding | Status | Notes |
|---------|--------|-------|
| B1 `submission_photos` contradiction | **Fixed** | Planning.md Step 3 no longer lists the table (line 572). Schema note at line 317 preserved. |
| B2 two-endpoint vs multipart submit | **Partially fixed** | `agent-backend.md` (lines 278–295) correctly defines a single multipart POST. **But `planning.md` Step 8 (lines 731–732) still lists a separate `POST /api/submissions/{id}/photos` endpoint.** Agents now read two conflicting specs. |
| B3 A7 wording mismatch | **Not fixed** | `planning.md` line 736 still says *"A7 (photo upload as file, not base64)"* — A7 is about no-persistence, not base64. |
| B4 "Claude API" in OpenAI stack | **Not fixed** | `planning.md` line 251 still reads *"RAG, embeddings, Claude API, PDF generation"*. Should be OpenAI API. |
| C1 Folder casing drift `Plan/` vs `PLAN/` | **Not fixed** | Filesystem has `PLAN/`. All docs and agents reference `Plan/`. macOS APFS hides it now; a case-sensitive filesystem will break. |
| C2 Engineering principles duplicated | **Not fixed** | Still in both `CLAUDE.md` and `planning.md`. |
| C3 `approval_requests.status` enum | **Not fixed** | Still just `text not null default 'draft'` at line 299. |
| C4 Routes section `/submissions/[id]/report` warning | **Not fixed** | Routes block (lines 402–418) does not flag the missing report route. |
| C5 `.claude/settings.json` role overstated | **Fixed** | `planning.md` line 967–969 now explicitly says `agent-team.json` is documentation only. |
| C6 Orphan bullets at EOF | **Not fixed** | Still present at `planning.md` lines 975–978 and `CLAUDE.md` lines 166–173. |
| G1 Auth undefined | **Fixed** | Register + login defined in `CLAUDE.md`, `agent-backend.md` (lines 24–46), `agent-frontend.md` (lines 74–108). Bcrypt + JWT + 24h + no role checks. Good. |
| G2 Photo size limits | **Not fixed** | No upper bound on photo bytes, photo count, or total multipart size anywhere. A 100 MB image still OOMs the backend. |
| G3 Step 2 (now Step 1) PDF URLs | **Not fixed** | Still "Download 5 real PDFs from different sources" with no pinned URLs. |
| G4 Step 4 acceptable success rate | **Not fixed** | Still `≥ 15`, `several hundred rows`. *"Several hundred"* is not binary. |
| G5 Korean query handling | **Partially fixed** | `agent-backend.md` line 96 puts language mirroring in the system prompt — good. No explicit language-detection step, which is fine given the prompt approach. |

---

## New blocking issues from Round 2

### NB1. Missing `compliance_gaps` column on `submissions`
`agent-backend.md` line 183: *"Add `compliance_gaps` column (jsonb) to submissions table."*
`planning.md` submissions schema (lines 306–315) does not include this column. Migrations are owned by Agent 1 (Infra) based on `planning.md` + `Plan/infra/schema.md`. Backend agent cannot add columns — it does not own migrations. A4 (Compliance Gap Detector) will fail at runtime on the first INSERT. Add the column to `planning.md` schema.

### NB2. Missing `risk_score` field on `approval_requests`
`agent-frontend.md` line 203: *"A6 risk badge per row (colour coded) — loaded from the stored `risk_score` field"*.
`planning.md` `approval_requests` schema has no `risk_score` column, and `agent-backend.md` A6 is stateless (returns mock per-request, never writes). Frontend's *"load from stored risk_score"* will return undefined. Three possible resolutions:
- Add `risk_score` column + have backend write it on approval creation, or
- Have frontend call `/api/ai/risk-score` per row on render (inefficient), or
- Remove the review-queue badge requirement.

Pick one and reflect in planning.md, backend agent, and frontend agent consistently.

### NB3. `agent-backend.md` Step 7 heading is missing
Line 259–260 opens a route list for approvals but with no `## Step 7 — Approvals API` heading. A reader going top-to-bottom loses the section boundary. The routes read as a continuation of the A6 block. Add the heading.

### NB4. B2 still half-unresolved
The backend agent builds single-multipart submission; `planning.md` Step 8 still tells readers and any future agent that a separate `/photos` endpoint exists. The frontend agent (line 249–258) also uses single multipart. Align `planning.md` Step 8 by removing `POST /api/submissions/{id}/photos` from the task list.

### NB5. Feature ID collision — A1–A7 (assumptions) vs A1–A6 (AI features)
- `planning.md` assumptions table uses `A1–A7`.
- `planning.md` AI features table uses `A1–A6`.
- `/approvals/new` route annotation at line 409 says `(A2)` and `(A6)` — which A's?
- `CLAUDE.md` line 47–54 uses A1–A6 for AI features only — further drift.

One scheme will be misread. Rename either assumptions (→ `ASM1–ASM7`) or AI features (→ `AI1–AI6`). Update every cross-reference.

---

## New high-severity issues

### NH1. Hardcoded vs AI-generated checklist contradiction
- `planning.md` Step 8 (lines 704–728) documents three hardcoded checklist templates in full.
- `planning.md` A3 (lines 152–164) says checklist is AI-generated, replacing hardcoded templates.
- `agent-frontend.md` line 243 uses AI as primary, hardcoded as error fallback.

Pick the contract. If A3 is full-implementation (planning.md says so), the hardcoded templates are only a fallback, not the contract. Rewrite Step 8 in planning.md to describe AI-generated behaviour first with hardcoded as fallback explicitly, or drop the hardcoded list entirely.

### NH2. P5 Incident log vs A5 Incident-lookup — same feature or different?
- Platform feature table line 100: *"P5 Incident log page — User can describe an incident and see regulation lookup result"*.
- AI feature A5 lines 181–200: *"Incident-to-Regulation Lookup — same RAG pipeline..."* at `/incident`.

They appear to be the same feature. There is no `incidents` table, no persistence, no "log" — just an ad-hoc lookup returning mocked regulation info. Either merge (P5 = A5's UI surface) or add a real log (table + history view). Right now two feature IDs compete for the same UI.

### NH3. Seed file ownership for bcrypt-hashed passwords
- `agent-backend.md` line 37: *"Seed passwords in `backend/seed/seed_demo_data.sql` must be bcrypt-hashed"*.
- `agent-infra.md` Step 10: *"Run `backend/seed/seed_demo_data.sql` against the db container"*.
- Nowhere does it say who **writes** the seed SQL with pre-hashed passwords.

Agent 1 runs it, but neither agent is assigned authorship. Either have Agent 2 produce the seed SQL as part of auth (line 46 "auth complete") or have Agent 1 generate bcrypt hashes via a Python one-liner before inserting. Specify explicitly.

### NH4. `register` form collects `role` but `role` is never used by any route
- Simplicity principle: *"No features beyond what was asked."*
- `agent-backend.md` line 34: *"Role is stored in the DB for future use but is not checked by any route."*
- `agent-frontend.md` line 79: role dropdown on register form.

Collecting a field for *"future use"* violates the principle. Either use it (role enforcement) or drop the dropdown + column default. Given the decision to skip role enforcement for the prototype, simplest fix: remove the dropdown, seed `role='worker'` for all registrations.

---

## New medium-severity issues

### NM1. Step numbering references are stale
- `planning.md` line 874: Step 12 says *"only if Steps 1–11 are fully verified"*. Step 1 is now the pre-agent ingestion experiment, not part of the agent-driven chain. Should read *"Steps 0–11"* or *"all prior steps"*.
- `planning.md` line 894: *"Three agents run in parallel after Step 3"* — Agent 1 runs Step 3 then Agents 2+3 kick off. Wording is slightly ambiguous about Step 4 being backend-only vs shared.

### NM2. `Step 9 — PDF compliance report` in planning.md still describes separate flow
Lines 748–789 still describe Step 9 as its own thing, but `agent-backend.md` (line 278) merges Steps 8 + 9 under *"Submissions + PDF report (single endpoint)"*. Planning.md should reflect the single-endpoint merge, or the agent should keep them separate — pick one.

### NM3. Mobile-first rules duplicated in `CLAUDE.md` and `agent-frontend.md`
`CLAUDE.md` lines 132–133 summarise mobile rules. `agent-frontend.md` lines 31–70 restate them in detail. Two places to maintain = drift risk. Keep the detail in the agent file and replace the CLAUDE.md version with a one-line pointer.

### NM4. Orphan bullets at EOF (persisted from Round 1)
Both `CLAUDE.md` (lines 166–173) and `planning.md` (lines 975–978) end with un-headed bullet lists. Add a `## Constraints` or `## What Not To Do` heading — currently these read as floating notes.

### NM5. Photo upload size limits still unbounded
No `max_bytes_per_photo`, no `max_photos_per_submission`, no multipart size cap. Add a concrete limit (e.g. 5 MB per photo × 10 photos = 50 MB max request) and reject at the FastAPI layer. Without this, a single phone camera upload can OOM the backend during the demo.

### NM6. `agent-infra.md` Step 11 does NOT include AI endpoint review
Step 11a review lists backend routes + ingestion + frontend pages, but does not call out the six new AI endpoints (A1–A6). Worth adding a line: *"Confirm A5 and A6 are still mock-returning, not secretly calling GPT; confirm A2/A3/A4 sanitise the LLM JSON response before inserting into DB."*

### NM7. Shared ownership on Steps 5–9 — verify ambiguity
Planning.md marks Steps 5–9 as *"Owner: Agent 2 + Agent 3 in parallel"*. Each agent verifies its own half. True end-to-end verify only happens in Step 11. If backend passes its verify but frontend fails, is Step 5 done? Unstated. Acceptable in practice but worth a one-line clarification: *"Each agent marks their half complete in their own progress.md; full e2e verify is Step 11c."*

---

## New low-severity / cosmetic

### NL1. Agent 3 uses `/` not `/home` for the search hero
`agent-frontend.md` line 144 places hero search at `/`. Planning.md route table line 403 also says `/`. Consistent. OK.

### NL2. CLAUDE.md `## Auth` section sits under no parent heading
Line 156 `## Auth` is at the same level as `## Stack`, but content-wise reads more like a subsection of "Before running any agent" (line 142). Low impact but structurally off.

### NL3. `agent-team.json` still lists steps 1–3 for phase_1 Agent 1
File references old numbering (phase_1 steps `[1, 2, 3]` and agents `[1, 2, 3, 10, 11, 12]`). New planning.md moves Step 1 to pre-agent and Agent 1 starts at Step 2. Cosmetic because the JSON is documentation-only, but a future reader will spot the drift.

---

## Summary — priority order to unblock agents

1. **NB1** (compliance_gaps column) and **NB2** (risk_score column) — without these, A4 and A6 fail at runtime. Edit planning.md schema and regenerate `Plan/infra/schema.md`.
2. **B2 / NB4** — remove the separate photo-upload endpoint from `planning.md` Step 8 so backend and planning agree.
3. **NB3** — add the `## Step 7` heading in `agent-backend.md`.
4. **NB5** — pick one feature-ID scheme (assumptions vs AI features).
5. **NH1** — resolve hardcoded-vs-AI-generated checklist in planning.md.
6. **NH2** — merge P5 and A5, or split them meaningfully.
7. **NH3** — assign seed file authorship.
8. **NH4** — remove role dropdown or use the field.
9. **B3, B4** — tiny edits still outstanding from Round 1.
10. **NM5** — add photo size limits before running Step 8.
11. **C1** — normalise `Plan/` vs `PLAN/` before any case-sensitive environment gets involved.
12. Rest — housekeeping.

**Feasibility:** once NB1–NB5 and NH1–NH4 are resolved, running `/agent-infra` in isolation is safe. Agents 2 and 3 remain risky until the contradictions in `planning.md` are reconciled, because each agent will pick the interpretation that happens to be in the file it opens first.

---

## Round 1 review (preserved below for reference)

The plan is well-structured, scoped tightly to the five must-build features, and surfaces tradeoffs explicitly. The strongest parts are the per-step verify conditions, the stable-vs-deferred schema split, and the explicit out-of-scope list.

Round 1 identified four blocking contradictions (B1–B4), six consistency issues (C1–C6), and five gaps (G1–G5). See the status table at the top of this file for which are fixed in Round 2.
