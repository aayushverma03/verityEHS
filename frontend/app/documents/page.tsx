// Document library page
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { Nav } from "@/components/nav"
import { Skeleton } from "@/components/ui/skeleton"
import { getDocuments } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

type Document = {
  id: string
  title: string
  source_org: string
  regulation_ref: string
  pillar: string
  language: string
  page_count: number
  doc_type: string
}

const pillars = ["all", "environment", "safety", "health", "integrated"]
const docTypes = ["all", "regulation", "guideline", "sop", "manual", "quick_card"]

const docTypeLabels: Record<string, string> = {
  all: "All Types",
  regulation: "Regulations",
  guideline: "Guidelines",
  sop: "SOPs",
  manual: "Manuals",
  quick_card: "Quick Cards",
}

function getPillarStyle(pillar: string) {
  switch (pillar) {
    case "environment":
      return "bg-emerald-600 text-white"
    case "safety":
      return "bg-amber-600 text-white"
    case "health":
      return "bg-blue-600 text-white"
    case "integrated":
      return "bg-purple-600 text-white"
    default:
      return "bg-stone-500 text-white"
  }
}

export default function DocumentsPage() {
  const { t } = useLanguage()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pillarFilter, setPillarFilter] = useState("all")
  const [docTypeFilter, setDocTypeFilter] = useState("all")

  const getPillarLabel = (pillar: string) => {
    return t.documents[pillar as keyof typeof t.documents] || pillar
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getDocuments({
          pillar: pillarFilter !== "all" ? pillarFilter : undefined,
          doc_type: docTypeFilter !== "all" ? docTypeFilter : undefined,
        })
        setDocuments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pillarFilter, docTypeFilter])

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="section-title mb-2">{t.documents.title}</h1>
            <p className="text-stone-500">{documents.length} documents</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 animate-fade-in">
            {/* Pillar filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              {pillars.map((p) => (
                <button
                  key={p}
                  onClick={() => setPillarFilter(p)}
                  className={pillarFilter === p ? "filter-chip-active" : "filter-chip-inactive"}
                >
                  {getPillarLabel(p)}
                </button>
              ))}
            </div>

            {/* Document type filters */}
            <div className="flex flex-wrap gap-2">
              {docTypes.map((dt) => (
                <button
                  key={dt}
                  onClick={() => setDocTypeFilter(dt)}
                  className={docTypeFilter === dt ? "filter-chip-active" : "filter-chip-inactive"}
                >
                  {docTypeLabels[dt]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Document grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-stone-200 p-5">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              : documents.map((doc, i) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <div
                      className="card-hover rounded-xl p-5 h-full animate-fade-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-teal-50">
                          <FileText className="h-5 w-5 text-teal-700" />
                        </div>
                        <h3 className="font-semibold text-stone-800 line-clamp-2 flex-1">
                          {doc.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-stone-100 text-stone-700">
                          {doc.source_org}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getPillarStyle(doc.pillar)}`}>
                          {getPillarLabel(doc.pillar)}
                        </span>
                        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-teal-100 text-teal-800">
                          {docTypeLabels[doc.doc_type] || doc.doc_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        {doc.regulation_ref && (
                          <>
                            <span className="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded">
                              {doc.regulation_ref}
                            </span>
                            <span className="text-stone-300">|</span>
                          </>
                        )}
                        <span>{doc.language.toUpperCase()}</span>
                        <span className="text-stone-300">|</span>
                        <span>{doc.page_count} {t.documents.pages}</span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && documents.length === 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center animate-fade-in">
              <FileText className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">{t.documents.noResults}</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
