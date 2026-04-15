// Document detail page
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getDocument } from "@/lib/api"
import { authHeaders } from "@/lib/auth"

type DocumentDetail = {
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
}

export default function DocumentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!doc) return
    const filename = doc.filename
    setDownloading(true)
    try {
      const res = await fetch(`/api/documents/${id}/download`, { headers: authHeaders() })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = filename
      link.style.display = "none"
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await getDocument(id)
        setDoc(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/documents"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to library
          </Link>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : doc ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{doc.source_org}</Badge>
                  <Badge variant="secondary">{doc.pillar}</Badge>
                  <Badge variant="secondary">{doc.language.toUpperCase()}</Badge>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Regulation Reference</dt>
                    <dd className="font-medium">{doc.regulation_ref}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Pages</dt>
                    <dd className="font-medium">{doc.page_count}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Filename</dt>
                    <dd className="font-medium break-all">{doc.filename}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Ingested</dt>
                    <dd className="font-medium">
                      {new Date(doc.ingested_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="min-h-[44px] btn-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </>
  )
}
