// Internationalization - Korean/English translations
export type Locale = "en" | "ko"

const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      docs: "Docs",
      faq: "FAQ",
      permits: "Permits",
      incident: "Incident",
      signOut: "Sign out",
      profile: "Profile",
    },
    // Auth
    auth: {
      signIn: "Sign In",
      register: "Register",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      signingIn: "Signing in...",
      creatingAccount: "Creating account...",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      enterCredentials: "Enter your credentials to access Verity EHS",
      enterDetails: "Enter your details to register for Verity EHS",
    },
    // Home
    home: {
      title: "Verity EHS",
      subtitle: "AI-powered compliance for the chemical industry",
      searchPlaceholder: "Ask a chemical EHS question...",
    },
    // Documents
    documents: {
      title: "Document Library",
      noResults: "No documents found matching your filters.",
      pages: "pages",
      all: "All",
      environment: "Environment",
      safety: "Safety",
      health: "Health",
      integrated: "Integrated",
    },
    // Search
    search: {
      resultsFor: "Results for:",
      aiAnswer: "AI Answer",
      sources: "sources",
      citations: "Citations",
      noResults: "No results found.",
    },
    // Approvals
    approvals: {
      title: "My Permits",
      reviewQueue: "Review Queue",
      newPermit: "New Permit",
      noPermits: "No permit requests yet.",
      createFirst: "Create your first permit request",
      newRequest: "New Permit Request",
      operationType: "Operation Type",
      selectOperation: "Select operation type",
      siteName: "Site Name",
      siteNamePlaceholder: "e.g., Plant A, Reactor 3",
      plannedStart: "Planned Start",
      plannedEnd: "Planned End",
      riskNotes: "Risk Notes",
      riskNotesPlaceholder: "Describe the work and any known risks...",
      prefillAI: "Pre-fill with AI",
      submit: "Submit Permit Request",
      submitting: "Submitting...",
      backToPermits: "Back to permits",
      riskLevel: "Risk Level:",
      assessingRisk: "Assessing risk...",
      identifiedHazards: "Identified Hazards",
      requiredPrecautions: "Required Precautions",
      ppeRequired: "PPE Required",
      generatedFrom: "Generated from:",
      // Status
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
      expired: "Expired",
      // Review
      noPending: "No pending approvals to review.",
      approve: "Approve",
      reject: "Reject",
      confirmReject: "Confirm Reject",
      cancel: "Cancel",
      rejectReason: "Enter rejection reason...",
      requestedBy: "Requested by",
      // Detail
      site: "Site",
      plannedPeriod: "Planned Period",
      reviewerNotes: "Reviewer Notes",
      statusTimeline: "Status Timeline",
      created: "Created",
      awaitingReview: "Awaiting Review",
      submitProof: "Submit Compliance Proof",
    },
    // Submissions
    submissions: {
      progress: "Progress",
      steps: "steps",
      of: "of",
      uploadPhoto: "Upload Photo",
      additionalNotes: "Additional Notes (optional)",
      notesPlaceholder: "Any additional observations or comments...",
      submitChecklist: "Submit Checklist",
      checkingCompliance: "Checking compliance...",
      backToPermit: "Back to permit",
      // Compliance gap modal
      gapTitle: "AI Flagged Potential Compliance Gaps",
      gapDescription: "Review the following issues before proceeding.",
      goBack: "Go back and review",
      downloadAnyway: "Download anyway",
      // Success
      reportDownloaded: "Compliance Report Downloaded",
      submissionRecorded: "Your submission has been recorded successfully.",
      backToPermits: "Back to Permits",
      // Errors
      photoTooLarge: "Photo too large - maximum 5 MB",
      maxPhotos: "Maximum 10 photos per submission",
    },
    // Incident
    incident: {
      title: "Incident & Concern Lookup",
      subtitle: "Describe a safety incident or concern. AI will identify the applicable regulation and recommended corrective actions.",
      placeholder: "e.g., Chlorine gas detected near mixing vessel during routine inspection...",
      lookup: "Look up regulation",
      lookingUp: "Looking up...",
      applicableRegulation: "Applicable Regulation",
      whyApplies: "Why This Applies",
      requiredActions: "Required Actions",
      correctiveAction: "Suggested Corrective Action",
      disclaimer: "AI-generated suggestion. Verify with your EHS officer before acting.",
      searchAgain: "Search again",
    },
    // FAQ
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about Verity EHS and chemical safety compliance",
      q1: "What is Verity EHS?",
      a1: "Verity EHS is an AI-powered compliance platform designed specifically for the chemical industry. It helps organizations manage work permits, track regulatory compliance, and access up-to-date safety documentation from OSHA, KOSHA, HSE, and EU-OSHA.",
      q2: "How does the AI search work?",
      a2: "Our AI uses retrieval-augmented generation (RAG) to search through regulatory documents and provide accurate, citation-backed answers to your EHS questions. Every response includes references to the source regulations.",
      q3: "What types of work permits can I create?",
      a3: "Verity EHS supports six permit types: Hot Work, Confined Space Entry, Working at Height, Chemical Transfer, Electrical Work, and Excavation. Each permit type includes AI-generated checklists based on relevant regulations.",
      q4: "How does the risk assessment work?",
      a4: "When creating a permit, our AI analyzes the operation type and site conditions to provide a risk score (Low/Medium/High). It also pre-fills hazard identification, required precautions, and PPE requirements based on applicable regulations.",
      q5: "What regulations does the system cover?",
      a5: "The document library includes regulations from OSHA (US), KOSHA (Korea), HSE (UK), and EU-OSHA. Coverage spans Process Safety Management (PSM), chemical handling, confined space entry, and general workplace safety.",
      q6: "How do I submit compliance proof?",
      a6: "After your permit is approved, navigate to the permit details and click 'Submit Compliance Proof'. Complete the AI-generated checklist, upload required photos, and submit. The system will generate a PDF compliance report.",
      q7: "What happens if compliance gaps are detected?",
      a7: "The AI reviews your submission against regulatory requirements. If gaps are found, you'll see a detailed list showing which steps may not meet compliance. You can choose to review and fix the issues or proceed with the download.",
      q8: "Is my data secure?",
      a8: "Yes. All data is encrypted in transit and at rest. Photos and documents are processed in memory and not stored permanently. Access requires authentication, and all actions are logged for audit purposes.",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      search: "Search",
    },
  },
  ko: {
    // Navigation
    nav: {
      home: "홈",
      docs: "문서",
      faq: "FAQ",
      permits: "작업허가",
      incident: "사고조회",
      signOut: "로그아웃",
      profile: "프로필",
    },
    // Auth
    auth: {
      signIn: "로그인",
      register: "회원가입",
      email: "이메일",
      password: "비밀번호",
      fullName: "이름",
      signingIn: "로그인 중...",
      creatingAccount: "계정 생성 중...",
      noAccount: "계정이 없으신가요?",
      haveAccount: "이미 계정이 있으신가요?",
      enterCredentials: "Verity EHS에 접속하려면 자격 증명을 입력하세요",
      enterDetails: "Verity EHS에 등록하려면 정보를 입력하세요",
    },
    // Home
    home: {
      title: "Verity EHS",
      subtitle: "화학 산업을 위한 AI 기반 규정 준수",
      searchPlaceholder: "화학 EHS 질문을 입력하세요...",
    },
    // Documents
    documents: {
      title: "문서 라이브러리",
      noResults: "필터와 일치하는 문서가 없습니다.",
      pages: "페이지",
      all: "전체",
      environment: "환경",
      safety: "안전",
      health: "보건",
      integrated: "통합",
    },
    // Search
    search: {
      resultsFor: "검색 결과:",
      aiAnswer: "AI 답변",
      sources: "출처",
      citations: "인용",
      noResults: "결과를 찾을 수 없습니다.",
    },
    // Approvals
    approvals: {
      title: "내 작업허가",
      reviewQueue: "검토 대기열",
      newPermit: "새 허가",
      noPermits: "작업허가 요청이 없습니다.",
      createFirst: "첫 번째 작업허가 요청 생성",
      newRequest: "새 작업허가 요청",
      operationType: "작업 유형",
      selectOperation: "작업 유형 선택",
      siteName: "현장명",
      siteNamePlaceholder: "예: 공장 A, 반응기 3",
      plannedStart: "예정 시작",
      plannedEnd: "예정 종료",
      riskNotes: "위험 메모",
      riskNotesPlaceholder: "작업 및 알려진 위험을 설명하세요...",
      prefillAI: "AI로 자동 작성",
      submit: "작업허가 요청 제출",
      submitting: "제출 중...",
      backToPermits: "허가 목록으로",
      riskLevel: "위험 수준:",
      assessingRisk: "위험 평가 중...",
      identifiedHazards: "확인된 위험",
      requiredPrecautions: "필요한 예방 조치",
      ppeRequired: "필요한 보호구",
      generatedFrom: "출처:",
      // Status
      approved: "승인됨",
      pending: "대기 중",
      rejected: "거부됨",
      expired: "만료됨",
      // Review
      noPending: "검토 대기 중인 승인이 없습니다.",
      approve: "승인",
      reject: "거부",
      confirmReject: "거부 확인",
      cancel: "취소",
      rejectReason: "거부 사유를 입력하세요...",
      requestedBy: "요청자",
      // Detail
      site: "현장",
      plannedPeriod: "예정 기간",
      reviewerNotes: "검토자 메모",
      statusTimeline: "상태 타임라인",
      created: "생성됨",
      awaitingReview: "검토 대기 중",
      submitProof: "준수 증빙 제출",
    },
    // Submissions
    submissions: {
      progress: "진행률",
      steps: "단계",
      of: "/",
      uploadPhoto: "사진 업로드",
      additionalNotes: "추가 메모 (선택사항)",
      notesPlaceholder: "추가 관찰 또는 의견...",
      submitChecklist: "체크리스트 제출",
      checkingCompliance: "규정 준수 확인 중...",
      backToPermit: "허가로 돌아가기",
      // Compliance gap modal
      gapTitle: "AI가 잠재적 규정 준수 격차를 발견했습니다",
      gapDescription: "진행하기 전에 다음 문제를 검토하세요.",
      goBack: "돌아가서 검토",
      downloadAnyway: "그래도 다운로드",
      // Success
      reportDownloaded: "규정 준수 보고서 다운로드됨",
      submissionRecorded: "제출이 성공적으로 기록되었습니다.",
      backToPermits: "허가 목록으로",
      // Errors
      photoTooLarge: "사진이 너무 큽니다 - 최대 5 MB",
      maxPhotos: "제출당 최대 10장의 사진",
    },
    // Incident
    incident: {
      title: "사고 및 우려 조회",
      subtitle: "안전 사고 또는 우려 사항을 설명하세요. AI가 해당 규정과 권장 시정 조치를 식별합니다.",
      placeholder: "예: 정기 점검 중 혼합 용기 근처에서 염소 가스가 감지됨...",
      lookup: "규정 조회",
      lookingUp: "조회 중...",
      applicableRegulation: "해당 규정",
      whyApplies: "적용 이유",
      requiredActions: "필요한 조치",
      correctiveAction: "권장 시정 조치",
      disclaimer: "AI 생성 제안. 조치 전에 EHS 담당자와 확인하세요.",
      searchAgain: "다시 검색",
    },
    // FAQ
    faq: {
      title: "자주 묻는 질문",
      subtitle: "Verity EHS 및 화학 안전 규정 준수에 대한 일반적인 질문",
      q1: "Verity EHS란 무엇인가요?",
      a1: "Verity EHS는 화학 산업을 위해 특별히 설계된 AI 기반 규정 준수 플랫폼입니다. 조직이 작업 허가를 관리하고, 규정 준수를 추적하며, OSHA, KOSHA, HSE 및 EU-OSHA의 최신 안전 문서에 접근할 수 있도록 도와줍니다.",
      q2: "AI 검색은 어떻게 작동하나요?",
      a2: "AI는 검색 증강 생성(RAG)을 사용하여 규정 문서를 검색하고 EHS 질문에 대해 정확하고 인용이 포함된 답변을 제공합니다. 모든 응답에는 출처 규정에 대한 참조가 포함됩니다.",
      q3: "어떤 종류의 작업 허가를 만들 수 있나요?",
      a3: "Verity EHS는 화기 작업, 밀폐 공간 진입, 고소 작업, 화학물질 이송, 전기 작업, 굴착의 6가지 허가 유형을 지원합니다. 각 허가 유형에는 관련 규정을 기반으로 AI가 생성한 체크리스트가 포함됩니다.",
      q4: "위험 평가는 어떻게 작동하나요?",
      a4: "허가 생성 시 AI가 작업 유형과 현장 조건을 분석하여 위험 점수(낮음/중간/높음)를 제공합니다. 또한 해당 규정에 따라 위험 식별, 필요한 예방 조치, PPE 요구 사항을 자동으로 채웁니다.",
      q5: "시스템에서 어떤 규정을 다루나요?",
      a5: "문서 라이브러리에는 OSHA(미국), KOSHA(한국), HSE(영국), EU-OSHA의 규정이 포함됩니다. 공정안전관리(PSM), 화학물질 취급, 밀폐 공간 진입, 일반 작업장 안전을 다룹니다.",
      q6: "규정 준수 증빙은 어떻게 제출하나요?",
      a6: "허가가 승인되면 허가 세부 정보로 이동하여 '규정 준수 증빙 제출'을 클릭하세요. AI가 생성한 체크리스트를 완료하고 필요한 사진을 업로드한 후 제출하세요. 시스템이 PDF 규정 준수 보고서를 생성합니다.",
      q7: "규정 준수 격차가 감지되면 어떻게 되나요?",
      a7: "AI가 규정 요구 사항에 대해 제출물을 검토합니다. 격차가 발견되면 규정 준수를 충족하지 못할 수 있는 단계를 보여주는 상세 목록이 표시됩니다. 문제를 검토하고 수정하거나 다운로드를 진행할 수 있습니다.",
      q8: "내 데이터는 안전한가요?",
      a8: "예. 모든 데이터는 전송 중 및 저장 시 암호화됩니다. 사진과 문서는 메모리에서 처리되며 영구적으로 저장되지 않습니다. 접근에는 인증이 필요하며, 감사를 위해 모든 작업이 기록됩니다.",
    },
    // Common
    common: {
      loading: "로딩 중...",
      error: "오류",
      search: "검색",
    },
  },
}

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string
}

export type TranslationKeys = DeepStringify<typeof translations.en>

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] as TranslationKeys
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en"
  return (localStorage.getItem("locale") as Locale) || "en"
}

export function setStoredLocale(locale: Locale): void {
  localStorage.setItem("locale", locale)
}
