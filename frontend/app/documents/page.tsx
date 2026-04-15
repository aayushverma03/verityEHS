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
}

const pillars = ["all", "environment", "safety", "health", "integrated"]
const sourceOrgs = ["All", "OSHA", "HSE", "KOSHA", "EU", "NFPA", "ILO"]

function getPillarStyle(pillar: string) {
  switch (pillar) {
    case "environment":
      return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
    case "safety":
      return "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
    case "health":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
    case "integrated":
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export default function DocumentsPage() {
  const { t } = useLanguage()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pillarFilter, setPillarFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("All")

  const getPillarLabel = (pillar: string) => {
    return t.documents[pillar as keyof typeof t.documents] || pillar
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getDocuments({
          pillar: pillarFilter !== "all" ? pillarFilter : undefined,
          source_org: sourceFilter !== "All" ? sourceFilter : undefined,
        })
        setDocuments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pillarFilter, sourceFilter])

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="section-title gradient-text mb-2">{t.documents.title}</h1>
            <p className="text-gray-500">{documents.length} documents</p>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 mb-6 animate-fade-in">
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

            {/* Source org filters */}
            <div className="flex flex-wrap gap-2">
              {sourceOrgs.map((org) => (
                <button
                  key={org}
                  onClick={() => setSourceFilter(org)}
                  className={sourceFilter === org ? "filter-chip-active" : "filter-chip-inactive"}
                >
                  {org === "All" ? t.documents.all : org}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="glass-card rounded-2xl p-4 mb-6 border-red-200 bg-red-50/50">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Document grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              : documents.map((doc, i) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <div
                      className="glass-card-hover rounded-2xl p-5 h-full animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                          {doc.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                          {doc.source_org}
                        </span>
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium shadow-sm ${getPillarStyle(doc.pillar)}`}>
                          {getPillarLabel(doc.pillar)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {doc.regulation_ref && (
                          <>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {doc.regulation_ref}
                            </span>
                            <span className="text-gray-300">|</span>
                          </>
                        )}
                        <span>{doc.language.toUpperCase()}</span>
                        <span className="text-gray-300">|</span>
                        <span>{doc.page_count} {t.documents.pages}</span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && documents.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t.documents.noResults}</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
