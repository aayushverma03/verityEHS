// API client for EHS platform
import { authHeaders, clearToken } from "./auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("Unauthorized")
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(error.detail || "Request failed")
  }
  return response.json()
}

// Auth
export async function register(data: { email: string; full_name: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<{ id: string; email: string; full_name: string; role: string }>(res)
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<{ access_token: string; token_type: string }>(res)
}

// Documents
export async function getDocuments(filters?: { pillar?: string; source_org?: string }) {
  const params = new URLSearchParams()
  if (filters?.pillar && filters.pillar !== "all") params.set("pillar", filters.pillar)
  if (filters?.source_org && filters.source_org !== "All") params.set("source_org", filters.source_org)
  const query = params.toString() ? `?${params}` : ""
  const res = await fetch(`${API_BASE}/documents${query}`, { headers: authHeaders() })
  return handleResponse<Array<{
    id: string
    title: string
    source_org: string
    regulation_ref: string
    pillar: string
    language: string
    page_count: number
  }>>(res)
}

export async function getDocument(id: string) {
  const res = await fetch(`${API_BASE}/documents/${id}`, { headers: authHeaders() })
  return handleResponse<{
    id: string
    filename: string
    source_url: string
    source_org: string
    regulation_ref: string
    title: string
    pillar: string
    language: string
    page_count: number
    token_count: number
    creation_date: string
    ingested_at: string
  }>(res)
}

// Search
export async function search(query: string) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ query }),
  })
  return handleResponse<{
    answer: string
    citations: Array<{
      document_title: string
      source_org: string
      regulation_reference: string
      chunk_excerpt: string
    }>
  }>(res)
}

// Approvals
export async function createApproval(data: {
  operation_type: string
  site_name: string
  planned_start: string
  planned_end: string
  risk_notes: string
  risk_score?: string
  risk_colour?: string
}) {
  const res = await fetch(`${API_BASE}/approvals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<{
    id: string
    operation_type: string
    site_name: string
    planned_start: string
    planned_end: string
    risk_notes: string
    risk_score: string
    risk_colour: string
    status: string
    created_at: string
  }>(res)
}

export async function getApprovals() {
  const res = await fetch(`${API_BASE}/approvals`, { headers: authHeaders() })
  return handleResponse<Array<{
    id: string
    operation_type: string
    site_name: string
    status: string
    risk_score: string
    risk_colour: string
    created_at: string
  }>>(res)
}

export async function getApproval(id: string) {
  const res = await fetch(`${API_BASE}/approvals/${id}`, { headers: authHeaders() })
  return handleResponse<{
    id: string
    requester_id: string
    operation_type: string
    site_name: string
    planned_start: string
    planned_end: string
    risk_assessment_json: Record<string, unknown>
    risk_notes: string
    risk_score: string
    risk_colour: string
    status: string
    reviewer_id: string
    reviewer_notes: string
    created_at: string
    updated_at: string
  }>(res)
}

export async function getPendingApprovals() {
  const res = await fetch(`${API_BASE}/approvals/review`, { headers: authHeaders() })
  return handleResponse<Array<{
    id: string
    requester_id: string
    requester_name: string
    operation_type: string
    site_name: string
    planned_start: string
    planned_end: string
    risk_score: string
    risk_colour: string
    status: string
    created_at: string
  }>>(res)
}

export async function updateApprovalStatus(id: string, data: { status: "approved" | "rejected"; reviewer_notes?: string }) {
  const res = await fetch(`${API_BASE}/approvals/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<{
    id: string
    status: string
    reviewer_id: string
    reviewer_notes: string
    updated_at: string
  }>(res)
}

// AI endpoints
export async function getRiskPrefill(data: { operation_type: string; site_name: string }) {
  const res = await fetch(`${API_BASE}/ai/risk-prefill`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<{
    hazards: string[]
    precautions: string[]
    ppe_required: string[]
    regulation_reference: string
  }>(res)
}

export async function getChecklist(data: { operation_type: string; site_name: string; risk_notes: string }) {
  const res = await fetch(`${API_BASE}/ai/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<{
    steps: Array<{
      label: string
      requires_photo: boolean
      regulation_ref: string
    }>
  }>(res)
}

export async function getIncidentLookup(description: string) {
  const res = await fetch(`${API_BASE}/ai/incident-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ description }),
  })
  return handleResponse<{
    regulation: string
    applies_because: string
    required_actions: string[]
    corrective_action: string
  }>(res)
}

export async function getRiskScore(data: { operation_type: string; site_name: string; risk_notes: string }) {
  const res = await fetch(`${API_BASE}/ai/risk-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<{
    risk_level: "Low" | "Medium" | "High"
    reasoning: string
    colour: "green" | "amber" | "red"
  }>(res)
}

// Submissions
export async function submitChecklist(data: {
  approval_request_id: string
  checklist_json: string
  notes?: string
  photos: Array<{ stepLabel: string; file: File }>
}): Promise<{ id: string; compliance_gaps: Array<{ step: string; regulation: string }>; compliance_status: string; pdfBlob: Blob }> {
  const formData = new FormData()
  formData.append("approval_request_id", data.approval_request_id)
  formData.append("checklist_json", data.checklist_json)
  if (data.notes) formData.append("notes", data.notes)
  for (const photo of data.photos) {
    formData.append(`photo_${photo.stepLabel}`, photo.file)
  }

  const res = await fetch(`${API_BASE}/submissions`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("Unauthorized")
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Submission failed" }))
    throw new Error(error.detail || "Submission failed")
  }

  const gapsHeader = res.headers.get("X-Compliance-Gaps")
  const statusHeader = res.headers.get("X-Compliance-Status")
  const idHeader = res.headers.get("X-Submission-Id")
  const pdfBlob = await res.blob()

  return {
    id: idHeader || "unknown",
    compliance_gaps: gapsHeader ? JSON.parse(gapsHeader) : [],
    compliance_status: statusHeader || "complete",
    pdfBlob,
  }
}

export async function getSubmission(id: string) {
  const res = await fetch(`${API_BASE}/submissions/${id}`, { headers: authHeaders() })
  return handleResponse<{
    id: string
    approval_request_id: string
    submitted_by: string
    submitted_at: string
    checklist_json: Record<string, unknown>
    compliance_gaps: Array<{ step: string; regulation: string }>
    notes: string
    compliance_status: string
  }>(res)
}
