// Document library page
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getDocuments } from "@/lib/api"

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

function getPillarColor(pillar: string) {
  switch (pillar) {
    case "environment":
      return "bg-green-100 text-green-800"
    case "safety":
      return "bg-orange-100 text-orange-800"
    case "health":
      return "bg-blue-100 text-blue-800"
    case "integrated":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pillarFilter, setPillarFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("All")

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
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold mb-4">Document Library</h1>

          {/* Pillar filters */}
          <div className="flex flex-wrap gap-2 mb-3">
            {pillars.map((p) => (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                  pillarFilter === p
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Source org filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sourceOrgs.map((org) => (
              <button
                key={org}
                onClick={() => setSourceFilter(org)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                  sourceFilter === org
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {org}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Document grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                  </Card>
                ))
              : documents.map((doc) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg line-clamp-2">
                          {doc.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">{doc.source_org}</Badge>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getPillarColor(
                              doc.pillar
                            )}`}
                          >
                            {doc.pillar}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.regulation_ref} | {doc.language.toUpperCase()} | {doc.page_count} pages
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          {!loading && documents.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No documents found matching your filters.</p>
          )}
        </div>
      </main>
    </>
  )
}
