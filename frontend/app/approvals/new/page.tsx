// New approval request page with AI risk scoring and prefill
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createApproval, getRiskScore, getRiskPrefill } from "@/lib/api"

const operationTypes = [
  "Hot work",
  "Confined space entry",
  "Working at height",
  "Electrical work",
  "Chemical transfer",
  "Excavation",
]

type RiskScore = {
  risk_level: "Low" | "Medium" | "High"
  reasoning: string
  colour: "green" | "amber" | "red"
}

type RiskPrefill = {
  hazards: string[]
  precautions: string[]
  ppe_required: string[]
  regulation_reference: string
}

export default function NewApprovalPage() {
  const router = useRouter()
  const [operationType, setOperationType] = useState("")
  const [siteName, setSiteName] = useState("")
  const [plannedStart, setPlannedStart] = useState("")
  const [plannedEnd, setPlannedEnd] = useState("")
  const [riskNotes, setRiskNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // AI6 Risk Scorer state
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null)
  const [scoringRisk, setScoringRisk] = useState(false)

  // AI2 Risk Prefill state
  const [prefillData, setPrefillData] = useState<RiskPrefill | null>(null)
  const [loadingPrefill, setLoadingPrefill] = useState(false)

  // Use ref for riskNotes to avoid re-creating callback on every keystroke
  const riskNotesRef = useRef(riskNotes)
  riskNotesRef.current = riskNotes

  // Risk scoring function - doesn't depend on riskNotes directly
  const fetchRiskScore = useCallback(async () => {
    if (!operationType || !siteName) return
    setScoringRisk(true)
    try {
      const score = await getRiskScore({
        operation_type: operationType,
        site_name: siteName,
        risk_notes: riskNotesRef.current,
      })
      setRiskScore(score)
    } catch {
      setRiskScore(null)
    } finally {
      setScoringRisk(false)
    }
  }, [operationType, siteName])

  // Trigger risk scoring on operation type or site name change
  useEffect(() => {
    if (operationType && siteName) {
      fetchRiskScore()
    }
  }, [operationType, siteName, fetchRiskScore])

  // Debounce risk scoring on risk notes change (separate effect)
  useEffect(() => {
    if (!operationType || !siteName || !riskNotes) return
    const timer = setTimeout(() => {
      fetchRiskScore()
    }, 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskNotes])

  async function handlePrefill() {
    if (!operationType || !siteName) return
    setLoadingPrefill(true)
    try {
      const data = await getRiskPrefill({ operation_type: operationType, site_name: siteName })
      setPrefillData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get AI suggestions")
    } finally {
      setLoadingPrefill(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const approval = await createApproval({
        operation_type: operationType,
        site_name: siteName,
        planned_start: new Date(plannedStart).toISOString(),
        planned_end: new Date(plannedEnd).toISOString(),
        risk_notes: riskNotes,
        risk_score: riskScore?.risk_level,
        risk_colour: riskScore?.colour,
      })
      router.push(`/approvals/${approval.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create permit request")
    } finally {
      setLoading(false)
    }
  }

  const riskColorClass =
    riskScore?.colour === "green"
      ? "bg-green-100 text-green-800 border-green-200"
      : riskScore?.colour === "amber"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200"

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-20 pb-24 md:pt-24 md:pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/approvals"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to permits
          </Link>

          <Card className="bg-white border border-stone-200">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">New Permit Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operationType" className="text-stone-700">Operation Type</Label>
                  <Select value={operationType} onValueChange={setOperationType}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Select operation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {operationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI6 Risk Score Badge */}
                {(scoringRisk || riskScore) && (
                  <div
                    className={`p-3 rounded-lg border ${
                      scoringRisk ? "bg-stone-50 border-stone-200" : riskColorClass
                    }`}
                  >
                    {scoringRisk ? (
                      <p className="text-sm text-stone-600">Assessing risk...</p>
                    ) : riskScore ? (
                      <>
                        <p className="font-medium">Risk Level: {riskScore.risk_level}</p>
                        <p className="text-sm mt-1">{riskScore.reasoning}</p>
                      </>
                    ) : null}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-stone-700">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g., Plant A, Reactor 3"
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plannedStart" className="text-stone-700">Planned Start</Label>
                    <Input
                      id="plannedStart"
                      type="datetime-local"
                      value={plannedStart}
                      onChange={(e) => setPlannedStart(e.target.value)}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plannedEnd" className="text-stone-700">Planned End</Label>
                    <Input
                      id="plannedEnd"
                      type="datetime-local"
                      value={plannedEnd}
                      onChange={(e) => setPlannedEnd(e.target.value)}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="riskNotes" className="text-stone-700">Risk Notes</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePrefill}
                      disabled={!operationType || !siteName || loadingPrefill}
                      className="text-sm text-teal-700 hover:text-teal-800"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {loadingPrefill ? "Loading..." : "Pre-fill with AI"}
                    </Button>
                  </div>
                  <Textarea
                    id="riskNotes"
                    value={riskNotes}
                    onChange={(e) => setRiskNotes(e.target.value)}
                    placeholder="Describe the work and any known risks..."
                    rows={4}
                  />
                </div>

                {/* AI2 Prefill Results */}
                {prefillData && (
                  <div className="space-y-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                    <p className="text-xs text-stone-500">
                      Generated from: {prefillData.regulation_reference}
                    </p>
                    <div>
                      <h4 className="font-medium text-sm text-stone-800 mb-2">Identified Hazards</h4>
                      <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                        {prefillData.hazards.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-stone-800 mb-2">Required Precautions</h4>
                      <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                        {prefillData.precautions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-stone-800 mb-2">PPE Required</h4>
                      <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                        {prefillData.ppe_required.map((ppe, i) => (
                          <li key={i}>{ppe}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full min-h-[44px] btn-primary" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Permit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
