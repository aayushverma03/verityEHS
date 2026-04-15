// Internationalization - Korean/English translations
export type Locale = "en" | "ko"

const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      docs: "Docs",
      search: "Search",
      permits: "Permits",
      incident: "Incident",
      signOut: "Sign out",
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
      search: "검색",
      permits: "작업허가",
      incident: "사고조회",
      signOut: "로그아웃",
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
