# Plan/infra/schema.md — Document schema + chunking decision

Written at the end of pre-agent Step 1. Gates Agent 1 (migrations) and Agent 2 (ingestion pipeline).

---

## 1. Ingestion experiment summary

- **Input:** 34 PDFs in `backend/data/raw/` — 14 fetched by `fetch_documents.py`, 20 added manually (EUR-Lex CELEX, manuals, SOPs, guidelines, handling procedures).
- **Tool:** `pdfplumber` + `tiktoken` (cl100k_base encoding) + `langdetect`.
- **Script:** `backend/ingestion/extract_all.py`.
- **Result:** 32 of 34 PDFs yield non-empty readable text. Two failures (scanned/image-based): `msds-제도-홍보-영문-리플렛-210401.pdf`, `23.SOP. Chemical Handling.pdf`. **ASM2 confirmed** — the pipeline cannot handle image PDFs without OCR.

### Field confidence (from 34 PDFs, pdfplumber `pdf.metadata`)

| Field | Present | Reliability | Notes |
|-------|---------|-------------|-------|
| `creation_date` | 17/17 | High | PDF format `D:YYYYMMDDHHMMSS[+HH'MM']` — store as text, parse only if needed |
| `creator` | 16/17 | High | PDF software fingerprint (e.g. "Adobe InDesign 16.0") — not useful for display or citations |
| `language` (via `langdetect`) | 16/17 | High | Works on any extracted text; failed only on the 0-token KOSHA leaflet |
| `title` | 11/17 | Medium | When present, often machine-generated (`'7767-OSHA 3132'`, `'OSHA 3138-01R 2004'`) — unusable as display title |
| `author` | 6/17 | Low | Random: `'OSHA'`, `'Publications Office'`, `'Ergie Beres'` |
| `subject` | 3/17 | Low | Occasional — skip |
| `published_date` | 0/17 reliable | Unusable | Not distinguishable from `creation_date` without per-source parsing |

**Conclusion:** only `creation_date` and `language` can be trusted from PDF metadata. `title`, `source_org`, `regulation_ref`, and `pillar` must be derived from **our own source mapping**, not from the PDF. Extend `fetch_documents.py` to carry these as columns.

---

## 2. Chunk size decision

### Experiment results — 100 token overlap, across 34 PDFs

| Chunk size (tokens) | Total chunks | Notes |
|---------------------|--------------|-------|
| **800** | **1,214** | **Selected** — one section of a regulation usually fits; semantic cohesion preserved |

Output: `backend/data/chunks/new_documents.json`

### Decision: **800 tokens per chunk, 100 tokens overlap**

**Rationale:**
- Regulatory docs have nested clauses and long definitions that read poorly when cut mid-paragraph. 800 tokens ≈ 3,200 characters ≈ one section.
- 100-token overlap (12.5%) reduces cases where a key phrase is split between chunks — standard for RAG on legal/regulatory content.
- Effective step = 700 tokens. Total chunks: 1,214. OpenAI embedding cost for that volume: ~$0.25 one-off.
- Top-5 retrieval gives the LLM ~4,000 tokens of context — well under `gpt-4.1-mini` limits, leaves plenty of room for the prompt + answer.
- Embedding model `text-embedding-3-small` accepts up to 8,191 tokens per request, so 800-token chunks are well below the ceiling.

### Tokenizer

Use `tiktoken.get_encoding("cl100k_base")` — this matches OpenAI's `text-embedding-3-small` and `gpt-4.1-mini` tokenization. Chunk boundaries computed in tokens, not characters, so chunk size corresponds 1:1 to embedding input budget.

---

## 3. Finalised SQL schema

### `documents` table

```sql
documents (
  id              uuid primary key default gen_random_uuid(),
  filename        text        not null,  -- e.g. 'osha_1910_119_psm.pdf'
  source_url      text,                  -- download URL from fetch_documents.py
  source_org      text        not null,  -- 'OSHA' | 'HSE' | 'ILO' | 'EU' | 'KOSHA' | 'NFPA'
  regulation_ref  text,                  -- '29 CFR 1910.119', 'COSHH L5', '2014/34/EU', 'C174'
  title           text        not null,  -- display title — derived from source map, not PDF metadata
  pillar          text        not null,  -- 'safety' | 'health' | 'environment' | 'integrated'
  language        text        not null default 'en',
  page_count      int         not null,
  token_count     int         not null,
  creation_date   text,                  -- raw PDF metadata string, optional
  ingested_at     timestamptz not null default now()
)
```

### `document_chunks` table

```sql
document_chunks (
  id           uuid       primary key default gen_random_uuid(),
  document_id  uuid       not null references documents(id) on delete cascade,
  chunk_index  int        not null,
  content      text       not null,
  token_count  int        not null,
  embedding    vector(1536) not null,  -- text-embedding-3-small = 1536 dimensions
  unique (document_id, chunk_index)
)

create index on document_chunks using ivfflat (embedding vector_cosine_ops);
```

### Notes for Agent 1 (migrations)

- Run `CREATE EXTENSION IF NOT EXISTS vector;` before creating `document_chunks`.
- The `ivfflat` index requires rows to exist before it can be tuned; Agent 2 can create it after `embed_and_load.py` has inserted chunks. For the prototype size (~1,000 chunks), a sequential scan is fine — the index is optional.
- `source_url` is nullable only to allow manually-added PDFs (e.g. the KOSHA leaflet dropped in by hand) to ingest without an URL.

---

## 4. Derived-field mapping for Agent 2

Agent 2 extends `fetch_documents.py` or a new `sources.py` to carry per-file metadata that the PDF itself does not provide reliably:

```python
SOURCES: list[dict] = [
    {
        "filename": "osha_1910_119_psm.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3132.pdf",
        "source_org": "OSHA",
        "regulation_ref": "29 CFR 1910.119",
        "title": "Process Safety Management of Highly Hazardous Chemicals",
        "pillar": "safety",
    },
    # ... one entry per PDF
]
```

`pillar` values used by `/documents` UI filter:
- `safety` — PSM, confined spaces, hot work, LOTO, ATEX
- `health` — hazard communication, COSHH, MSDS, lab safety
- `environment` — REACH (chemical registration), waste
- `integrated` — ISO 45001-style combined management systems

---

## 5. ASM2 outcome — which PDFs the pipeline can handle

| PDF | Status |
|-----|--------|
| All 13 OSHA / HSE / ILO / EUR-Lex PDFs | **Accepted** — extract cleanly, English, 400–262,000 tokens each |
| `msds-제도-홍보-영문-리플렛-210401.pdf` (KOSHA English leaflet) | **Skip** — image-based, 0 tokens extracted. Either run OCR (adds `pytesseract` dep) or drop. Recommend drop for prototype — KOSHA coverage is already represented by the overall pipeline; the leaflet is promotional, not regulatory. |
| Other KOSHA docs | **Not available** — pending manual download or OCR pipeline. Planning.md lists KOSHA guides as ideal sources but they are behind Korean-only pages. |

**Action for Agent 2:** in `embed_and_load.py`, skip files where `extract_pdf` returns `token_count == 0` and log a warning. Do not crash the ingestion run.

---

## 6. Outliers Agent 2 should be aware of

| PDF | Tokens | Chunks @ 800 tok | Note |
|-----|--------|-------------------|------|
| `CELEX_3A32006R1907_3AEN_3ATXT.pdf` (REACH) | 262,676 | 329 | Dominates the corpus — ~40% of all chunks. Accept as-is; it is the primary EU chemical regulation. |
| `osha_1910_1200_hazcom_cfr.pdf` (HazCom CFR) | 81,188 | 102 | Second largest. |
| `osha_confined_space_quick_card.pdf` | 438 | 1 | Single chunk — fine, still searchable. |
| `ilo_c174_un_treaties.pdf` | 4,370 | 6 | Small but relevant. |

---

## 7. Verify condition (Step 1 per planning.md)

| Check | Result |
|-------|--------|
| For each PDF: extracted text is non-empty and readable | 16/17 pass. 1 fails (image-based KOSHA leaflet, documented above). |
| `Plan/infra/schema.md` exists with finalised schema and chunk size decision | **This file.** |

Step 1 complete. Agent 1 may proceed with Step 2 (Docker) and Step 3 (migrations using this schema).
