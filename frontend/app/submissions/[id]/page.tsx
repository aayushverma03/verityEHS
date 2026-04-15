// Submission checklist page with AI-generated steps and compliance gap detection
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, AlertTriangle, Check, X } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { getApproval, getChecklist, submitChecklist } from "@/lib/api"
import { mockChecklistSteps } from "@/lib/mocks"

type ChecklistStep = {
  label: string
  requires_photo: boolean
  regulation_ref: string
}

type ApprovalInfo = {
  id: string
  operation_type: string
  site_name: string
  risk_notes: string
}

type PhotoFile = {
  stepLabel: string
  file: File
}

type ComplianceGap = {
  step: string
  regulation: string
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 10

export default function SubmissionPage() {
  const params = useParams()
  const approvalId = params.id as string

  const [approval, setApproval] = useState<ApprovalInfo | null>(null)
  const [steps, setSteps] = useState<ChecklistStep[]>([])
  const [loadingSteps, setLoadingSteps] = useState(true)
  const [error, setError] = useState("")

  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set())
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [gapModalOpen, setGapModalOpen] = useState(false)
  const [gaps, setGaps] = useState<ComplianceGap[]>([])
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load approval and generate checklist
  useEffect(() => {
    async function load() {
      try {
        const approvalData = await getApproval(approvalId)
        setApproval({
          id: approvalData.id,
          operation_type: approvalData.operation_type,
          site_name: approvalData.site_name,
          risk_notes: approvalData.risk_notes,
        })

        // Generate AI checklist
        try {
          const checklistData = await getChecklist({
            operation_type: approvalData.operation_type,
            site_name: approvalData.site_name,
            risk_notes: approvalData.risk_notes,
          })
          setSteps(checklistData.steps)
        } catch {
          // Fall back to mock steps if AI fails
          setSteps(mockChecklistSteps)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load approval")
      } finally {
        setLoadingSteps(false)
      }
    }
    load()
  }, [approvalId])

  function handleCheck(label: string, checked: boolean) {
    setCheckedSteps((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(label)
      } else {
        next.delete(label)
      }
      return next
    })
  }

  function handlePhotoSelect(stepLabel: string, file: File | null) {
    setPhotoErrors((prev) => {
      const next = { ...prev }
      delete next[stepLabel]
      return next
    })

    if (!file) {
      setPhotos((prev) => prev.filter((p) => p.stepLabel !== stepLabel))
      return
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoErrors((prev) => ({
        ...prev,
        [stepLabel]: "Photo too large - maximum 5 MB",
      }))
      return
    }

    // Check total photo count
    const otherPhotos = photos.filter((p) => p.stepLabel !== stepLabel)
    if (otherPhotos.length >= MAX_PHOTOS) {
      setPhotoErrors((prev) => ({
        ...prev,
        [stepLabel]: "Maximum 10 photos per submission",
      }))
      return
    }

    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.stepLabel !== stepLabel)
      return [...filtered, { stepLabel, file }]
    })
  }

  const completedCount = checkedSteps.size
  const totalCount = steps.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Check if all required steps are done
  const requiredPhotosSteps = steps.filter((s) => s.requires_photo).map((s) => s.label)
  const allRequiredPhotosDone = requiredPhotosSteps.every((label) =>
    photos.some((p) => p.stepLabel === label)
  )
  const canSubmit =
    completedCount === totalCount &&
    allRequiredPhotosDone &&
    Object.keys(photoErrors).length === 0

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    try {
      const checklistJson = steps.map((step) => ({
        label: step.label,
        checked: checkedSteps.has(step.label),
        regulation_ref: step.regulation_ref,
        has_photo: photos.some((p) => p.stepLabel === step.label),
      }))

      const result = await submitChecklist({
        approval_request_id: approvalId,
        checklist_json: JSON.stringify(checklistJson),
        notes: notes || undefined,
        photos,
      })

      setPdfBlob(result.pdfBlob)

      if (result.compliance_gaps.length > 0) {
        setGaps(result.compliance_gaps)
        setGapModalOpen(true)
      } else {
        downloadPdf(result.pdfBlob)
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  function downloadPdf(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "compliance_report.pdf"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleDownloadAnyway() {
    if (pdfBlob) {
      downloadPdf(pdfBlob)
      setSuccess(true)
    }
    setGapModalOpen(false)
  }

  if (success) {
    return (
      <>
        <Nav />
        <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Compliance Report Downloaded</h1>
            <p className="text-gray-600 mb-6">Your submission has been recorded successfully.</p>
            <Button asChild className="min-h-[44px]">
              <Link href="/approvals">Back to Permits</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/approvals/${approvalId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to permit
          </Link>

          {/* Progress bar - fixed on mobile */}
          <div className="sticky top-0 md:top-14 z-30 bg-white py-3 -mx-4 px-4 border-b mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Progress</span>
              <span>
                {completedCount} of {totalCount} steps
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {loadingSteps ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {approval && (
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{approval.operation_type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{approval.site_name}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3 mb-6">
                {steps.map((step, i) => {
                  const isChecked = checkedSteps.has(step.label)
                  const photo = photos.find((p) => p.stepLabel === step.label)
                  const photoError = photoErrors[step.label]

                  return (
                    <Card key={i} className={isChecked ? "border-green-200 bg-green-50/50" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`step-${i}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleCheck(step.label, checked === true)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`step-${i}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {step.label}
                            </Label>
                            <p className="text-xs text-gray-500 mt-0.5">{step.regulation_ref}</p>

                            {step.requires_photo && (
                              <div className="mt-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  ref={(el) => {
                                    fileInputRefs.current[step.label] = el
                                  }}
                                  onChange={(e) =>
                                    handlePhotoSelect(step.label, e.target.files?.[0] || null)
                                  }
                                  className="hidden"
                                />
                                {photo ? (
                                  <div className="flex items-center justify-between bg-gray-100 rounded p-2">
                                    <span className="text-sm text-gray-700 truncate">
                                      {photo.file.name} ({(photo.file.size / 1024).toFixed(0)} KB)
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePhotoSelect(step.label, null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRefs.current[step.label]?.click()}
                                    className="w-full min-h-[44px]"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photo
                                  </Button>
                                )}
                                {photoError && (
                                  <p className="text-xs text-red-500 mt-1">{photoError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Additional Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional observations or comments..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full min-h-[48px]"
                >
                  {submitting ? "Checking compliance..." : "Submit Checklist"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Compliance Gap Alert Dialog */}
      <Dialog open={gapModalOpen} onOpenChange={setGapModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              AI Flagged Potential Compliance Gaps
            </DialogTitle>
            <DialogDescription>
              Review the following issues before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {gaps.map((gap, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-900">{gap.step}</p>
                <p className="text-xs text-amber-700 mt-1">{gap.regulation}</p>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setGapModalOpen(false)} className="min-h-[44px]">
              Go back and review
            </Button>
            <Button onClick={handleDownloadAnyway} className="min-h-[44px]">
              Download anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
