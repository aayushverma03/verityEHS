-- Initial migration for EHS AI Platform
-- Combines document schema (schema.md) + stable tables (planning.md)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table (users)
CREATE TABLE profiles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           text        UNIQUE NOT NULL,
    password_hash   text        NOT NULL,
    full_name       text        NOT NULL,
    role            text        NOT NULL DEFAULT 'worker',
    department      text,
    site_name       text,
    language_pref   text        NOT NULL DEFAULT 'en',
    created_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_role CHECK (role IN ('worker', 'supervisor', 'ehs_officer', 'admin'))
);

-- Documents table (EHS regulations)
CREATE TABLE documents (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        text        NOT NULL,
    source_url      text,
    source_org      text        NOT NULL,
    regulation_ref  text,
    title           text        NOT NULL,
    pillar          text        NOT NULL,
    language        text        NOT NULL DEFAULT 'en',
    page_count      int         NOT NULL,
    token_count     int         NOT NULL,
    creation_date   text,
    ingested_at     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_pillar CHECK (pillar IN ('safety', 'health', 'environment', 'integrated'))
);

-- Document chunks table (for RAG)
CREATE TABLE document_chunks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     uuid        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index     int         NOT NULL,
    content         text        NOT NULL,
    token_count     int         NOT NULL,
    embedding       vector(1536) NOT NULL,
    UNIQUE (document_id, chunk_index)
);

-- Approval requests table (work permits)
CREATE TABLE approval_requests (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id         uuid        NOT NULL REFERENCES profiles(id),
    operation_type       text        NOT NULL,
    site_name            text        NOT NULL,
    planned_start        timestamptz NOT NULL,
    planned_end          timestamptz NOT NULL,
    risk_assessment_json jsonb,
    risk_notes           text,
    risk_score           text,
    risk_colour          text,
    status               text        NOT NULL DEFAULT 'pending',
    reviewer_id          uuid        REFERENCES profiles(id),
    reviewer_notes       text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'expired')),
    CONSTRAINT valid_risk_score CHECK (risk_score IS NULL OR risk_score IN ('Low', 'Medium', 'High')),
    CONSTRAINT valid_risk_colour CHECK (risk_colour IS NULL OR risk_colour IN ('green', 'amber', 'red'))
);

-- Submissions table (proof submissions)
CREATE TABLE submissions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id uuid        NOT NULL REFERENCES approval_requests(id),
    submitted_by        uuid        NOT NULL REFERENCES profiles(id),
    submitted_at        timestamptz NOT NULL DEFAULT now(),
    checklist_json      jsonb       NOT NULL,
    compliance_gaps     jsonb,
    notes               text,
    compliance_status   text        NOT NULL,
    CONSTRAINT valid_compliance_status CHECK (compliance_status IN ('complete', 'incomplete', 'flagged'))
);

-- Create index for vector similarity search (optional for prototype size)
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops);
