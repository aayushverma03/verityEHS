// Incident lookup page (AI5 - placeholder implementation)
"use client"

import { useState } from "react"
import { Send, Check, AlertTriangle } from "lucide-react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getIncidentLookup } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

type IncidentResult = {
  regulation: string
  applies_because: string
  required_actions: string[]
  corrective_action: string
}

export default function IncidentPage() {
  const { t, locale } = useLanguage()
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<IncidentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Report to supervisor state
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [supervisorEmail, setSupervisorEmail] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [reportSending, setReportSending] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const data = await getIncidentLookup(description)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setDescription("")
    setResult(null)
    setError("")
    setReportSent(false)
  }

  async function handleReportSubmit() {
    if (!supervisorEmail.trim()) return
    setReportSending(true)
    // Simulate API call - in production this would send an email/notification
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setReportSending(false)
    setReportDialogOpen(false)
    setReportSent(true)
    setSupervisorEmail("")
    setAdditionalNotes("")
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-20 pb-24 md:pt-24 md:pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold text-stone-800 mb-2">{t.incident.title}</h1>
          <p className="text-stone-500 mb-6">{t.incident.subtitle}</p>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.incident.placeholder}
                rows={5}
                className="text-base"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={!description.trim() || loading}
                className="w-full min-h-[48px] btn-primary"
              >
                {loading ? t.incident.lookingUp : t.incident.lookup}
              </Button>
            </form>
          ) : null}

          {loading && (
            <Card className="mt-6 bg-white border border-stone-200">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="mt-6 bg-white border border-stone-200">
              <CardHeader>
                <Badge variant="default" className="w-fit mb-2">
                  {result.regulation}
                </Badge>
                <CardTitle className="text-lg">{t.incident.applicableRegulation}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm text-stone-700 mb-2">{t.incident.whyApplies}</h4>
                  <p className="text-sm text-stone-600">{result.applies_because}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-stone-700 mb-2">{t.incident.requiredActions}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.required_actions.map((action, i) => (
                      <li key={i} className="text-sm text-stone-600">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-stone-700 mb-2">{t.incident.correctiveAction}</h4>
                  <p className="text-sm text-stone-600">{result.corrective_action}</p>
                </div>

                <p className="text-xs text-stone-400 italic">{t.incident.disclaimer}</p>

                {reportSent ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-800">
                        {locale === "ko" ? "보고서가 전송되었습니다" : "Report Sent Successfully"}
                      </p>
                      <p className="text-sm text-emerald-600">
                        {locale === "ko" ? "담당자가 곧 검토할 것입니다" : "Your supervisor will review shortly"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setReportDialogOpen(true)}
                    className="w-full min-h-[44px] btn-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {locale === "ko" ? "담당자에게 보고" : "Report to Supervisor"}
                  </Button>
                )}

                <Button variant="outline" onClick={handleReset} className="w-full min-h-[44px]">
                  {t.incident.searchAgain}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Report to Supervisor Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {locale === "ko" ? "사건 보고" : "Report Incident"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ko"
                ? "이 사건과 AI 분석 결과를 담당자에게 보고합니다."
                : "Send this incident and AI analysis to your supervisor for review."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-500 mb-1">
                {locale === "ko" ? "사건 설명" : "Incident Description"}
              </p>
              <p className="text-sm text-stone-700 line-clamp-2">{description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisorEmail" className="text-stone-700">
                {locale === "ko" ? "담당자 이메일" : "Supervisor Email"}
              </Label>
              <Input
                id="supervisorEmail"
                type="email"
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
                placeholder="supervisor@company.com"
                className="min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-stone-700">
                {locale === "ko" ? "추가 메모 (선택)" : "Additional Notes (optional)"}
              </Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={locale === "ko" ? "추가 정보나 맥락을 입력하세요..." : "Add any additional context..."}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              className="min-h-[44px]"
            >
              {locale === "ko" ? "취소" : "Cancel"}
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={!supervisorEmail.trim() || reportSending}
              className="min-h-[44px] btn-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              {reportSending
                ? locale === "ko" ? "전송 중..." : "Sending..."
                : locale === "ko" ? "보고서 전송" : "Send Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
