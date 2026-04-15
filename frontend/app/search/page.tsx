// Search results page
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Search, ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLanguage } from "@/components/language-provider"
import { authHeaders } from "@/lib/auth"

type Citation = {
  document_id: string
  document_title: string
  source_org: string
  regulation_reference: string
  chunk_excerpt: string
}

type SearchResult = {
  answer: string
  citations: Citation[]
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, locale } = useLanguage()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [citationsOpen, setCitationsOpen] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  async function performSearch(q: string) {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ query: q }),
      })

      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="pl-10 min-h-[48px] text-base"
              />
            </div>
            <Button type="submit" className="min-h-[48px] min-w-[100px]">
              {t.common.search}
            </Button>
          </form>

          {initialQuery && (
            <p className="text-sm text-gray-500 mb-4">
              {t.search.resultsFor} <span className="font-medium text-gray-900">{initialQuery}</span>
            </p>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {loading ? (
            <Card className="glass-card">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-10 w-10 text-[#0F7B6C] animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {locale === "ko" ? "AI 응답 생성 중..." : "Generating AI response..."}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {locale === "ko" ? "잠시만 기다려 주세요" : "This may take a moment"}
                </p>
              </CardContent>
            </Card>
          ) : result ? (
            <div className="space-y-4">
              {/* Answer card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t.search.aiAnswer}</CardTitle>
                    <Badge variant="secondary">{result.citations.length} {t.search.sources}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
                </CardContent>
              </Card>

              {/* Citations panel */}
              {result.citations.length > 0 && (
                <Collapsible open={citationsOpen} onOpenChange={setCitationsOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center justify-between text-left min-h-[48px]">
                        <span className="font-medium">{t.search.citations} ({result.citations.length})</span>
                        {citationsOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-3">
                        {result.citations.map((citation, i) => (
                          <Link
                            key={i}
                            href={`/documents/${citation.document_id}`}
                            className="block border rounded-lg p-3 hover:border-[#0F7B6C] hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-medium text-sm group-hover:text-[#0F7B6C]">
                                {citation.document_title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {citation.source_org}
                              </Badge>
                              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-[#0F7B6C] ml-auto" />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{citation.regulation_reference}</p>
                            <p className="text-sm text-gray-600 line-clamp-3">{citation.chunk_excerpt}</p>
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}
            </div>
          ) : initialQuery ? (
            <p className="text-center text-gray-500">{t.search.noResults}</p>
          ) : null}
        </div>
      </main>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
