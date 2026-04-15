// Mock responses for frontend development

export const mockLogin = async () => ({
  access_token: "mock-token-123",
  token_type: "bearer",
})

export const mockRegister = async () => ({
  id: "mock-user-id",
  email: "test@example.com",
  full_name: "Test User",
  role: "worker",
})

export const mockDocuments = [
  { id: "1", title: "OSHA PSM Standard", source_org: "OSHA", pillar: "safety", language: "en", regulation_ref: "29 CFR 1910.119", page_count: 45 },
  { id: "2", title: "COSHH Guidance", source_org: "HSE", pillar: "health", language: "en", regulation_ref: "L5", page_count: 32 },
  { id: "3", title: "KOSHA PSM Guide", source_org: "KOSHA", pillar: "safety", language: "ko", regulation_ref: "KOSHA-H-2023", page_count: 28 },
]

export const mockSearchResult = {
  answer: "Under OSHA 1910.119, processes involving chlorine above 1,500 lbs require a full PSM program including process hazard analysis and operating procedures.",
  citations: [
    { document_title: "OSHA PSM Standard", source_org: "OSHA", regulation_reference: "29 CFR 1910.119", chunk_excerpt: "Processes involving highly hazardous chemicals at or above threshold quantities..." },
  ],
}

export const mockApprovals = [
  { id: "1", operation_type: "Hot work", site_name: "Plant A", status: "approved", risk_score: "Medium", risk_colour: "amber", created_at: "2026-04-10T09:00:00Z" },
  { id: "2", operation_type: "Confined space entry", site_name: "Reactor 3", status: "pending", risk_score: "High", risk_colour: "red", created_at: "2026-04-13T14:00:00Z" },
  { id: "3", operation_type: "Chemical transfer", site_name: "Loading Bay 2", status: "rejected", risk_score: "Low", risk_colour: "green", created_at: "2026-04-12T11:00:00Z" },
]

export const mockApprovalDetail = {
  id: "1",
  requester_id: "user-1",
  operation_type: "Hot work",
  site_name: "Plant A",
  planned_start: "2026-04-15T08:00:00Z",
  planned_end: "2026-04-15T17:00:00Z",
  risk_assessment_json: {},
  risk_notes: "Welding near storage tanks",
  risk_score: "Medium",
  risk_colour: "amber",
  status: "approved",
  reviewer_id: "reviewer-1",
  reviewer_notes: "",
  created_at: "2026-04-10T09:00:00Z",
  updated_at: "2026-04-11T10:00:00Z",
}

export const mockPendingApprovals = [
  { id: "2", requester_id: "user-2", requester_name: "John Smith", operation_type: "Confined space entry", site_name: "Reactor 3", planned_start: "2026-04-16T08:00:00Z", planned_end: "2026-04-16T12:00:00Z", risk_score: "High", risk_colour: "red", status: "pending", created_at: "2026-04-13T14:00:00Z" },
]

export const mockChecklistSteps = [
  { label: "Area inspection - no flammables within 10m", requires_photo: true, regulation_ref: "OSHA 1910.119(f)" },
  { label: "Fire extinguisher present and accessible", requires_photo: true, regulation_ref: "NFPA 30" },
  { label: "Permit displayed at work site", requires_photo: true, regulation_ref: "OSHA 1910.119(f)(4)" },
  { label: "Gas detector reading below 10% LEL", requires_photo: true, regulation_ref: "OSHA 1910.119" },
  { label: "Fire watch assigned and briefed", requires_photo: false, regulation_ref: "NFPA 51B" },
]

export const mockSubmissionResponse = {
  id: "sub-1",
  compliance_gaps: [
    { step: "Atmospheric test documented", regulation: "OSHA 1910.146(c)(5)" },
  ],
  compliance_status: "flagged",
}

export const mockRiskPrefill = {
  hazards: ["Fire/explosion risk from welding sparks", "Fumes from welding process", "Heat exposure"],
  precautions: ["Clear combustibles 10m radius", "Install fire blankets", "Ensure ventilation"],
  ppe_required: ["Welding helmet", "Fire-resistant gloves", "Safety glasses"],
  regulation_reference: "OSHA 1910.119(f)",
}

export const mockRiskScore = {
  risk_level: "Medium" as const,
  reasoning: "Hot work near chemical storage requires additional precautions.",
  colour: "amber" as const,
}

export const mockIncidentResult = {
  regulation: "OSHA 29 CFR 1910.119 - Process Safety Management",
  applies_because: "Incident involves release of a highly hazardous chemical above threshold quantity.",
  required_actions: [
    "Conduct incident investigation within 48 hours",
    "Review PSM program for affected unit",
  ],
  corrective_action: "Isolate affected process unit and conduct PHA review before restart.",
}

export const mockPdfBlob = new Blob(["%PDF-1.4 mock"], { type: "application/pdf" })
