// Search results page with streaming AI response
"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLanguage } from "@/components/language-provider"
import { authHeaders } from "@/lib/auth"

type Citation = {
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
  const { t } = useLanguage()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState("")
  const [citationsOpen, setCitationsOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
    return () => {
      abortRef.current?.abort()
    }
  }, [initialQuery])

  async function performSearch(q: string) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setStreaming(false)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/search/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ query: q }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error("Search failed")
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ""
      let citations: Citation[] = []

      setLoading(false)
      setStreaming(true)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "citations") {
                citations = data.citations
                setResult({ answer: "", citations })
              } else if (data.type === "token") {
                answer += data.content
                setResult({ answer, citations })
              } else if (data.type === "done") {
                setStreaming(false)
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Search failed")
      }
    } finally {
      setLoading(false)
      setStreaming(false)
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
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {result.answer}
                    {streaming && <span className="inline-block w-2 h-4 bg-[#0F7B6C] ml-1 animate-pulse" />}
                  </p>
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
                          <div key={i} className="border rounded-lg p-3">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="font-medium text-sm">{citation.document_title}</span>
                              <Badge variant="outline" className="text-xs">
                                {citation.source_org}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{citation.regulation_reference}</p>
                            <p className="text-sm text-gray-600 line-clamp-3">{citation.chunk_excerpt}</p>
                          </div>
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
