// Approval detail page
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ClipboardCheck } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getApproval } from "@/lib/api"

type ApprovalDetail = {
  id: string
  requester_id: string
  operation_type: string
  site_name: string
  planned_start: string
  planned_end: string
  risk_assessment_json: Record<string, unknown>
  risk_notes: string
  risk_score: string
  risk_colour: string
  status: string
  reviewer_id: string
  reviewer_notes: string
  created_at: string
  updated_at: string
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
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${colorClass}`}>
      {score} Risk
    </span>
  )
}

export default function ApprovalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [approval, setApproval] = useState<ApprovalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await getApproval(id)
        setApproval(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load approval")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-20 pb-24 md:pt-24 md:pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/approvals"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to permits
          </Link>

          {loading ? (
            <Card className="bg-white border border-stone-200">
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : approval ? (
            <div className="space-y-4">
              <Card className="bg-white border border-stone-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-xl md:text-2xl">{approval.operation_type}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(approval.status)}
                      {getRiskBadge(approval.risk_score, approval.risk_colour)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-stone-500">Site</dt>
                      <dd className="font-medium text-stone-800">{approval.site_name}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-500">Planned Period</dt>
                      <dd className="font-medium text-stone-800">
                        {new Date(approval.planned_start).toLocaleString()} -{" "}
                        {new Date(approval.planned_end).toLocaleString()}
                      </dd>
                    </div>
                  </dl>

                  {approval.risk_notes && (
                    <div>
                      <h4 className="text-sm text-stone-500 mb-1">Risk Notes</h4>
                      <p className="text-sm text-stone-700">{approval.risk_notes}</p>
                    </div>
                  )}

                  {approval.reviewer_notes && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Reviewer Notes</h4>
                      <p className="text-sm text-red-700">{approval.reviewer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card className="bg-white border border-stone-200">
                <CardHeader>
                  <CardTitle className="text-lg">Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div className="w-0.5 h-full bg-stone-200" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-sm text-stone-800">Created</p>
                        <p className="text-sm text-stone-500">
                          {new Date(approval.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {approval.status !== "pending" && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              approval.status === "approved" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-stone-800 capitalize">{approval.status}</p>
                          <p className="text-sm text-stone-500">
                            {new Date(approval.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {approval.status === "pending" && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-stone-800">Awaiting Review</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Proof Button - only show for approved permits */}
              {approval.status === "approved" && (
                <Button
                  onClick={() => router.push(`/submissions/${approval.id}`)}
                  className="w-full min-h-[48px] btn-primary"
                >
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Submit Compliance Proof
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}
