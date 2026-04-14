# Frontend Agent

You are Agent 3 — Frontend. Read planning.md fully before doing anything.
Follow all four engineering principles in planning.md at all times.
Write all progress under Plan/frontend/. Never write outside this folder
or touch any file under backend/.

## Gate check — do this first

Before writing a single line of code:
1. Check that Plan/infra/api_contract.md exists
2. If it does not — stop. Write to Plan/frontend/progress.md:
   "Blocked: waiting for Plan/infra/api_contract.md from Infra agent."
3. If it exists — read it fully. Build exactly against these shapes.
4. Use mock responses matching api_contract.md shapes until backend signals ready.

## Your responsibilities

Auth UI + Steps 5–9: all Next.js pages and components.
Work in TypeScript only. Never touch backend/.

UI design rules (follow directly — no external skill file):
- Use shadcn/ui components for all UI elements
- Tailwind classes only — no inline styles, no CSS modules
- No data logic in components — all API calls go through `lib/api.ts`
- No `any` types
- Every form input has an accessible label
- Loading states: show a skeleton or spinner while any fetch is in progress
- Error states: show a readable error message if a fetch fails — never a blank screen

### Mobile-first design — mandatory, not optional

Every page and component must work at 375px (iPhone SE) and scale up to desktop.
Build mobile layout first, add desktop breakpoints after.

**Layout rules:**
- Use `flex-col` as the default, switch to `flex-row` or grid only at `md:` breakpoint
- No horizontal overflow at any viewport — test every page at 375px before marking done
- Navigation: mobile gets a bottom tab bar or hamburger menu — not a sidebar
- Forms: full-width inputs on mobile (`w-full`), max-width container on desktop (`max-w-2xl mx-auto`)
- Tables: do not use `<table>` on mobile — use card-per-row layout instead, switch to table at `md:`
- Modals and drawers: full-screen on mobile (`fixed inset-0`), centered dialog on desktop

**Touch targets:**
- Every button and interactive element minimum 44×44px (`min-h-[44px] min-w-[44px]`)
- No hover-only interactions — all actions must work on tap
- Sufficient spacing between tappable elements — minimum 8px gap

**Typography:**
- Minimum body font size 16px on mobile (prevents iOS auto-zoom on inputs)
- Headings scale down on mobile — use `text-xl` on mobile, `text-3xl` on desktop

**Key pages — specific mobile behaviour:**
- `/submissions/[id]` checklist: each step is a full-width card, photo upload button
  spans full width, progress bar fixed at top of screen while scrolling
- `/approvals/new` form: risk scorer badge stacks below the operation type dropdown,
  pre-fill sections stack vertically
- `/search` results: answer card full width, citations panel full width below (not sidebar)
- `/documents` library: single column card grid on mobile, two columns at `md:`, three at `lg:`
- `/approvals/review` queue: card-per-permit layout on mobile with approve/reject
  buttons stacked vertically inside each card

**Verify for every page before marking a step complete:**
```
Open browser devtools → set viewport to 375px width
No horizontal scrollbar
All text readable without zooming
All buttons tappable (visually ≥ 44px height)
Forms submit correctly on mobile viewport
```

---

## Auth — build this first

Two pages: register and login. Simple forms, no complexity.

`/register`:
- Fields: full name, email, password only
- No role dropdown — role defaults to `'worker'` on the backend for all registrations
- On submit: `POST /api/auth/register` → on success redirect to `/login`

`/login`:
- Fields: email, password
- On submit: `POST /api/auth/login` → store `access_token` in localStorage →
  redirect to `/`

Auth helper in `lib/auth.ts`:
- `getToken()` — returns token from localStorage or null
- `authHeaders()` — returns `{Authorization: "Bearer <token>"}` or `{}`
- `isLoggedIn()` — returns true if token exists

All API calls in `lib/api.ts` must include `authHeaders()`.
If any API call returns 401 → clear token and redirect to `/login`.

Mock for auth:
```typescript
// lib/mocks.ts
export const mockLogin = async () =>
  ({ access_token: "mock-token-123", token_type: "bearer" })
```

Verify:
```
/register page renders, form submits (mock), redirects to /login
/login page renders, form submits (mock), stores token, redirects to /
Any page accessed without token redirects to /login
```
Update Plan/frontend/progress.md: auth UI complete.

---

## Step 5 — Document library UI

`/documents`:
- Grid of document cards: title, source_org badge, pillar chip
- Filter chips: All / Environment / Safety / Health / Integrated
- Filter chip for source_org (OSHA / HSE / KOSHA / EU-OSHA / All)

`/documents/[id]`:
- Full document: title, metadata row (source_org, language, published_date),
  full text body, link to source URL

Mock:
```typescript
export const mockDocuments = [
  { id: "1", title: "OSHA PSM Standard", source_org: "OSHA", pillar: "safety", language: "en" },
  { id: "2", title: "COSHH Guidance", source_org: "HSE", pillar: "health", language: "en" },
  { id: "3", title: "KOSHA PSM Guide", source_org: "KOSHA", pillar: "safety", language: "ko" },
]
```

Verify:
```
/documents loads with 3 mock cards visible
Filter chip "safety" → only safety pillar cards shown
Click a card → /documents/[id] shows title and metadata
```
Update Plan/frontend/progress.md: Step 5 complete.

---

## Step 6 — Search UI

`/` (homepage):
- Hero search bar, centred, prominent
- Placeholder: "Ask a chemical EHS question..."
- On submit → navigate to `/search?q=<query>`

`/search`:
- Query displayed at top
- While loading: skeleton card
- AI answer card: answer text, source count badge
- Citations panel (collapsible): each citation shows document_title, source_org,
  regulation_reference, chunk_excerpt
- Subsector filter chips: All / Manufacturing / Petrochemical / Pharma

Mock:
```typescript
export const mockSearchResult = {
  answer: "Under OSHA 1910.119, processes involving chlorine above 1,500 lbs require a full PSM program including process hazard analysis and operating procedures.",
  citations: [
    { document_title: "OSHA PSM Standard", source_org: "OSHA",
      regulation_reference: "29 CFR 1910.119", chunk_excerpt: "..." }
  ]
}
```

Verify:
```
Type query on homepage → navigates to /search with query in URL
/search shows skeleton while loading, then answer card
Citations panel expands on click
```
Update Plan/frontend/progress.md: Step 6 complete.

---

## Step 7 — Approvals UI

`/approvals/new`:
- Operation type dropdown (6 types from planning.md)
- Site name input, planned start/end datetime, risk notes textarea
- **AI6 — Permit Risk Scorer badge:** when operation type is selected (and on risk_notes
  change, debounced 800ms), call `POST /api/ai/risk-score` → show badge:
  🟢 Low / 🟡 Medium / 🔴 High with one-sentence reasoning below it.
  While loading: show a grey "Assessing risk..." badge. On error: hide badge silently.
  On form submit: include the last received `risk_score` and `risk_colour` values in
  the POST body to `/api/approvals` so they are stored in the DB.
- **AI2 — Risk Assessment Pre-fill:** "Pre-fill with AI" button next to the risk notes
  field. On click: call `POST /api/ai/risk-prefill` → populate three readonly sections
  below the form: Identified Hazards, Required Precautions, PPE Required (each as a
  bullet list). Show a "Generated from: [regulation_reference]" caption.
  Worker can still edit the risk_notes field above before submitting.
- Submit button → POST to `/api/approvals` (include risk_score + risk_colour in body)

`/approvals`:
- List of current user's requests
- Each row: operation type, site, status badge, created date
- Status badges: Draft (gray) / Pending (amber) / Approved (green) / Rejected (red) / Expired (gray)
- Click row → `/approvals/[id]`

`/approvals/review`:
- List of all pending requests (no role gate)
- Each row: requester name, operation type, site, planned dates
- **AI6 risk badge** per row — read `risk_score` and `risk_colour` from the stored
  approval_request record returned by `GET /api/approvals/review`. No additional API
  call per row. If risk_score is null, show no badge.
- Approve button → PATCH status to "approved"
- Reject button → inline notes input → PATCH status to "rejected" with notes

`/approvals/[id]`:
- Full request details
- AI6 risk badge shown in the detail header
- Status timeline: created → submitted → approved/rejected (with timestamps)
- Reviewer notes if rejected

Mock:
```typescript
export const mockApprovals = [
  { id: "1", operation_type: "Hot work", site_name: "Plant A",
    status: "approved", created_at: "2026-04-10T09:00:00Z" },
  { id: "2", operation_type: "Confined space entry", site_name: "Reactor 3",
    status: "pending", created_at: "2026-04-13T14:00:00Z" },
  { id: "3", operation_type: "Chemical transfer", site_name: "Loading Bay 2",
    status: "rejected", reviewer_notes: "Missing spill containment plan",
    created_at: "2026-04-12T11:00:00Z" },
]
```

Verify:
```
/approvals shows 3 mock requests with correct status badges
/approvals/review shows pending request with approve/reject buttons
Approve → status badge updates to green
/approvals/[id] shows status timeline
```
Update Plan/frontend/progress.md: Step 7 complete.

---

## Step 8 — Submission checklist UI

`/submissions/[id]`:
- Load approval request for this submission
- **AI3 — AI Checklist Generation:** on page load, call `POST /api/ai/checklist`
  with `{operation_type, site_name, risk_notes}` from the linked permit →
  render the returned steps dynamically. Show a loading skeleton while generating.
  On error: fall back to the hardcoded template for that operation type (keep as fallback).
- Each step: label, checkbox, regulation_ref caption in muted text, optional photo
  upload (for steps where `requires_photo: true`)
- **Photo upload validation (client-side — before submit):**
  - Reject files over 5 MB with inline error: "Photo too large — maximum 5 MB"
  - Reject if total photos exceed 10 with message: "Maximum 10 photos per submission"
  - Show file name and size preview after selection so worker can verify
- Progress bar: X of Y steps complete
- Submit button: disabled until all required steps are checked and no validation errors
- On submit:
  1. Build FormData with checklist_json, approval_request_id, notes, photo files
  2. POST to `/api/submissions` as multipart
  3. While waiting: show "Checking compliance..." spinner (AI4 running server-side)
  4. Response includes `compliance_gaps` array:
     - If empty → trigger PDF download immediately
     - If non-empty → show **AI4 Compliance Gap Alert** modal:
       - Title: "AI flagged potential compliance gaps"
       - List each gap: step description + regulation reference
       - Two buttons: "Download anyway" (proceeds) / "Go back and review"
  5. On download: trigger browser PDF download
  6. Show success message: "Compliance report downloaded."

Mocks:
```typescript
export const mockChecklistSteps = [
  { label: "Area inspection — no flammables within 10m", requires_photo: true, regulation_ref: "OSHA 1910.119(f)" },
  { label: "Fire extinguisher present and accessible", requires_photo: true, regulation_ref: "NFPA 30" },
  { label: "Permit displayed at work site", requires_photo: true, regulation_ref: "OSHA 1910.119(f)(4)" },
  { label: "Gas detector reading below 10% LEL", requires_photo: true, regulation_ref: "OSHA 1910.119" },
  { label: "Fire watch assigned and briefed", requires_photo: false, regulation_ref: "NFPA 51B" },
]
export const mockSubmissionResponse = {
  id: "sub-1",
  compliance_gaps: [
    { step: "Atmospheric test documented", regulation: "OSHA 1910.146(c)(5)" }
  ]
}
export const mockPdfBlob = new Blob(["%PDF-1.4 mock"], { type: "application/pdf" })
```

Verify:
```
/submissions/[id] loads → skeleton shows → AI checklist appears with regulation captions
Check all steps, upload photo → submit → "Checking compliance..." spinner appears
Response has gaps → compliance gap modal appears with gap description + regulation
"Download anyway" → PDF downloads, success message shown
```
Update Plan/frontend/progress.md: Step 8 complete.

---

## Incident Page (AI5 — Placeholder)

`/incident`:
- Page title: "Incident & Concern Lookup"
- Subtitle: "Describe a safety incident or concern. AI will identify the applicable
  regulation and recommended corrective actions."
- Large textarea placeholder: "e.g. Chlorine gas detected near mixing vessel during
  routine inspection..."
- "Look up regulation" submit button
- While loading: skeleton result card
- Result card:
  - Regulation badge: regulation name + code
  - "Why this applies" block: applies_because text
  - "Required actions" block: bulleted list
  - "Suggested corrective action" block: corrective_action text
  - Muted caption: "AI-generated suggestion. Verify with your EHS officer before acting."
- "Search again" link resets the form

Mock:
```typescript
export const mockIncidentResult = {
  regulation: "OSHA 29 CFR 1910.119 — Process Safety Management",
  applies_because: "Incident involves release of a highly hazardous chemical above threshold quantity.",
  required_actions: [
    "Conduct incident investigation within 48 hours",
    "Review PSM program for affected unit"
  ],
  corrective_action: "Isolate affected process unit and conduct PHA review before restart."
}
```

Verify:
```
/incident page loads with textarea and submit button
Type any text → submit → skeleton → result card appears
Result card shows all 4 sections: regulation, applies_because, required_actions, corrective_action
"Search again" resets the form and hides the result card
```
Update Plan/frontend/progress.md: incident page complete.

---

## Final task — Wire up real API calls

> This is not a numbered step — it runs after backend Steps 4–8 are complete,
> overlapping with planning.md Step 9 (seed data, owned by Agent 1).
> Label it in progress.md as "API wiring complete" when done.

Check Plan/backend/progress.md — only proceed when Steps 4–9 are marked complete.

If backend is not done yet — update Plan/frontend/progress.md:
"Waiting for backend to complete before removing mocks."
Do not proceed until backend is ready.

When backend is ready:
- Replace all mock calls in `lib/api.ts` with real fetch calls
- Delete `lib/mocks.ts`
- Test each page against the live backend running in Docker
- Confirm PDF download works end-to-end
- Confirm AI checklist generates meaningfully different steps for different operation types
- Confirm risk scorer badge updates on operation type change

Verify:
```
lib/mocks.ts does not exist
Search, permit flow, submission, document library all work with real backend
PDF downloads from a real submission with real photos
AI checklist loads dynamically (not hardcoded)
Risk scorer badge visible on /approvals/new when operation type selected
Incident page returns real response (still mocked on backend — that is correct)
```
Update Plan/frontend/progress.md: API wiring complete. All mocks removed.