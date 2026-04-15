// Approval review queue page
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getPendingApprovals, updateApprovalStatus } from "@/lib/api"

type PendingApproval = {
  id: string
  requester_id: string
  requester_name: string
  operation_type: string
  site_name: string
  planned_start: string
  planned_end: string
  risk_score: string
  risk_colour: string
  status: string
  created_at: string
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
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {score} Risk
    </span>
  )
}

export default function ReviewQueuePage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadApprovals()
  }, [])

  async function loadApprovals() {
    try {
      const data = await getPendingApprovals()
      setApprovals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pending approvals")
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      await updateApprovalStatus(id, { status: "approved" })
      setApprovals((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    if (!rejectNotes.trim()) return
    setActionLoading(id)
    try {
      await updateApprovalStatus(id, { status: "rejected", reviewer_notes: rejectNotes })
      setApprovals((prev) => prev.filter((a) => a.id !== id))
      setRejectingId(null)
      setRejectNotes("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject")
    } finally {
      setActionLoading(null)
    }
  }

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

          <h1 className="text-xl md:text-3xl font-bold text-stone-800 mb-6">Review Queue</h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="space-y-4">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="bg-white border border-stone-200">
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
              : approvals.map((approval) => (
                  <Card key={approval.id} className="bg-white border border-stone-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-stone-800">{approval.operation_type}</span>
                            <Badge variant="warning">Pending</Badge>
                            {getRiskBadge(approval.risk_score, approval.risk_colour)}
                          </div>
                          <p className="text-sm text-stone-600">
                            Requested by {approval.requester_name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {approval.site_name} |{" "}
                            {new Date(approval.planned_start).toLocaleDateString()} -{" "}
                            {new Date(approval.planned_end).toLocaleDateString()}
                          </p>
                        </div>

                        {rejectingId === approval.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Enter rejection reason..."
                              value={rejectNotes}
                              onChange={(e) => setRejectNotes(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(approval.id)}
                                disabled={!rejectNotes.trim() || actionLoading === approval.id}
                                className="min-h-[44px] flex-1"
                              >
                                {actionLoading === approval.id ? "Rejecting..." : "Confirm Reject"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setRejectingId(null)
                                  setRejectNotes("")
                                }}
                                className="min-h-[44px]"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="default"
                              onClick={() => handleApprove(approval.id)}
                              disabled={actionLoading === approval.id}
                              className="min-h-[44px] flex-1"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {actionLoading === approval.id ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setRejectingId(approval.id)}
                              disabled={actionLoading === approval.id}
                              className="min-h-[44px] flex-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {!loading && approvals.length === 0 && (
            <p className="text-center text-stone-500 py-8">No pending approvals to review.</p>
          )}
        </div>
      </main>
    </>
  )
}
