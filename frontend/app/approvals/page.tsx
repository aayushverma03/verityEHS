// Approvals list page - current user's requests
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getApprovals } from "@/lib/api"

type Approval = {
  id: string
  operation_type: string
  site_name: string
  status: string
  risk_score: string
  risk_colour: string
  created_at: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>
    case "pending":
      return <Badge variant="warning">Pending</Badge>
    case "rejected":
      return <Badge variant="danger">Rejected</Badge>
    case "expired":
      return <Badge variant="secondary">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getRiskBadge(score: string, colour: string) {
  if (!score) return null
  const colorClass =
    colour === "green"
      ? "bg-green-100 text-green-800"
      : colour === "amber"
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800"
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}>{score}</span>
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await getApprovals()
        setApprovals(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load approvals")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-3xl font-bold">My Permits</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link href="/approvals/review">Review Queue</Link>
              </Button>
              <Button asChild className="min-h-[44px]">
                <Link href="/approvals/new">
                  <Plus className="h-4 w-4 mr-1" />
                  New Permit
                </Link>
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              : approvals.map((approval) => (
                  <Link key={approval.id} href={`/approvals/${approval.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{approval.operation_type}</span>
                              {getStatusBadge(approval.status)}
                              {getRiskBadge(approval.risk_score, approval.risk_colour)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {approval.site_name} | {new Date(approval.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          {!loading && approvals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No permit requests yet.</p>
              <Button asChild className="min-h-[44px]">
                <Link href="/approvals/new">Create your first permit request</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
