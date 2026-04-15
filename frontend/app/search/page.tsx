// Search results page with markdown rendering and follow-up questions
"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Search, ChevronDown, ChevronUp, ExternalLink, Send, Clock, X } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLanguage } from "@/components/language-provider"
import { authHeaders } from "@/lib/auth"
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from "@/lib/search-history"

type Citation = {
  document_id: string
  document_title: string
  source_org: string
  regulation_reference: string
  chunk_excerpt: string
  confidence: number
}

type GroupedCitation = {
  document_id: string
  document_title: string
  source_org: string
  regulation_reference: string
  confidence: number
  excerpts: string[]
}

type Message = {
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
}

function groupCitations(citations: Citation[]): GroupedCitation[] {
  const grouped = new Map<string, GroupedCitation>()
  for (const c of citations) {
    const existing = grouped.get(c.document_id)
    if (existing) {
      existing.excerpts.push(c.chunk_excerpt)
      if (c.confidence > existing.confidence) {
        existing.confidence = c.confidence
      }
    } else {
      grouped.set(c.document_id, {
        document_id: c.document_id,
        document_title: c.document_title,
        source_org: c.source_org,
        regulation_reference: c.regulation_reference,
        confidence: c.confidence,
        excerpts: [c.chunk_excerpt],
      })
    }
  }
  return Array.from(grouped.values()).sort((a, b) => b.confidence - a.confidence)
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, locale } = useLanguage()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [followUp, setFollowUp] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [citationsOpen, setCitationsOpen] = useState<Record<number, boolean>>({})
  const [expandedExcerpts, setExpandedExcerpts] = useState<Record<string, boolean>>({})
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  async function performSearch(q: string) {
    setLoading(true)
    setError("")
    setShowHistory(false)
    addToSearchHistory(q)
    setSearchHistory(getSearchHistory())

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: q }])

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ query: q }),
      })

      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()

      // Add assistant message with citations
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, citations: data.citations },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setMessages([])
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleFollowUp(e: React.FormEvent) {
    e.preventDefault()
    if (followUp.trim() && !loading) {
      performSearch(followUp.trim())
      setFollowUp("")
    }
  }

  function toggleCitations(index: number) {
    setCitationsOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-20 pb-24 md:pt-24 md:pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                placeholder={t.home.searchPlaceholder}
                className="pl-10 min-h-[48px] text-base"
              />
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                      {locale === "ko" ? "최근 검색" : "Recent Searches"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        clearSearchHistory()
                        setSearchHistory([])
                        setShowHistory(false)
                      }}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      {locale === "ko" ? "지우기" : "Clear"}
                    </button>
                  </div>
                  {searchHistory.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(item)
                        setShowHistory(false)
                        setMessages([])
                        router.push(`/search?q=${encodeURIComponent(item)}`)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-stone-400 flex-shrink-0" />
                      <span className="text-sm text-stone-700 truncate">{item}</span>
                    </button>
                  ))}
                </div>
              )}
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

          {/* Conversation messages */}
          {messages.length > 0 && (
            <div className="space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end mb-2">
                      <div className="bg-teal-700 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Card className="bg-white border border-stone-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-stone-800">{t.search.aiAnswer}</CardTitle>
                            {msg.citations && (
                              <Badge variant="secondary">
                                {msg.citations.length} {t.search.sources}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="max-w-none text-stone-700">
                            <ReactMarkdown
                              components={{
                                p: (props) => <p className="mb-3 leading-7 last:mb-0">{props.children}</p>,
                                ul: (props) => <ul className="mb-3 ml-6 list-disc space-y-1">{props.children}</ul>,
                                ol: (props) => <ol className="mb-3 ml-6 list-decimal space-y-1">{props.children}</ol>,
                                li: (props) => <li className="leading-7">{props.children}</li>,
                                strong: (props) => <strong className="font-semibold text-stone-900">{props.children}</strong>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Citations for this message */}
                      {msg.citations && msg.citations.length > 0 && (() => {
                        const grouped = groupCitations(msg.citations)
                        return (
                          <Collapsible open={citationsOpen[idx]} onOpenChange={() => toggleCitations(idx)}>
                            <Card className="bg-white border border-stone-200">
                              <CollapsibleTrigger asChild>
                                <button className="w-full p-4 flex items-center justify-between text-left min-h-[48px]">
                                  <span className="font-medium text-stone-700">
                                    {t.search.citations} ({grouped.length})
                                  </span>
                                  {citationsOpen[idx] ? (
                                    <ChevronUp className="h-5 w-5 text-stone-500" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-stone-500" />
                                  )}
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-4 pb-4 space-y-3">
                                  {grouped.map((citation) => {
                                    const isExpanded = expandedExcerpts[citation.document_id]
                                    const hasMore = citation.excerpts.length > 1
                                    return (
                                      <div
                                        key={citation.document_id}
                                        className="border border-stone-200 rounded-lg p-3 hover:border-teal-600 hover:bg-stone-50 transition-colors group"
                                      >
                                        <Link href={`/documents/${citation.document_id}`}>
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-medium text-sm text-stone-800 group-hover:text-teal-700">
                                              {citation.document_title}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {citation.source_org}
                                            </Badge>
                                            <span className="relative group/tooltip">
                                              <Badge
                                                variant="secondary"
                                                className={`text-xs cursor-help ${
                                                  citation.confidence >= 70
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : citation.confidence >= 50
                                                      ? "bg-amber-100 text-amber-700"
                                                      : "bg-stone-100 text-stone-600"
                                                }`}
                                              >
                                                {citation.confidence}%
                                              </Badge>
                                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-stone-800 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                                                {locale === "ko" ? "신뢰도 지수" : "Confidence Index"}
                                              </span>
                                            </span>
                                            <ExternalLink className="h-3 w-3 text-stone-400 group-hover:text-teal-700 ml-auto" />
                                          </div>
                                          <p className="text-xs text-stone-500 mb-2">
                                            {citation.regulation_reference}
                                          </p>
                                        </Link>
                                        <p className="text-sm text-stone-600 line-clamp-3">
                                          {citation.excerpts[0]}
                                        </p>
                                        {isExpanded && citation.excerpts.slice(1).map((excerpt, i) => (
                                          <p key={i} className="text-sm text-stone-600 line-clamp-3 mt-2 pt-2 border-t border-stone-100">
                                            {excerpt}
                                          </p>
                                        ))}
                                        {hasMore && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setExpandedExcerpts((prev) => ({
                                                ...prev,
                                                [citation.document_id]: !prev[citation.document_id],
                                              }))
                                            }}
                                            className="text-xs text-teal-700 hover:text-teal-800 mt-2 font-medium"
                                          >
                                            {isExpanded
                                              ? (locale === "ko" ? "접기" : "Show less")
                                              : (locale === "ko" ? `+${citation.excerpts.length - 1}개 더 보기` : `Show ${citation.excerpts.length - 1} more`)}
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        )
                      })()}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <Card className="bg-white border border-stone-200">
                  <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-semibold text-teal-700">Verity IQ</span>
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {locale === "ko" ? "생각하는 중..." : "Thinking..."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up input */}
              {!loading && (
                <form onSubmit={handleFollowUp} className="flex gap-2">
                  <Input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder={locale === "ko" ? "추가 질문하기..." : "Ask a follow-up question..."}
                    className="flex-1 min-h-[48px]"
                  />
                  <Button type="submit" disabled={!followUp.trim()} className="min-h-[48px] btn-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Initial loading state */}
          {loading && messages.length === 0 && (
            <Card className="bg-white border border-stone-200">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-semibold text-teal-700">Verity IQ</span>
                  <span className="flex gap-1">
                    <span className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
                <p className="text-base text-stone-500">
                  {locale === "ko" ? "생각하는 중..." : "Thinking..."}
                </p>
              </CardContent>
            </Card>
          )}
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
