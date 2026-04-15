// Incident lookup page (AI5 - placeholder implementation)
"use client"

import { useState } from "react"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getIncidentLookup } from "@/lib/api"

type IncidentResult = {
  regulation: string
  applies_because: string
  required_actions: string[]
  corrective_action: string
}

export default function IncidentPage() {
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<IncidentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-4 pb-20 md:pt-16 md:pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Incident & Concern Lookup</h1>
          <p className="text-gray-600 mb-6">
            Describe a safety incident or concern. AI will identify the applicable regulation and
            recommended corrective actions.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Chlorine gas detected near mixing vessel during routine inspection..."
                rows={5}
                className="text-base"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={!description.trim() || loading}
                className="w-full min-h-[48px]"
              >
                {loading ? "Looking up..." : "Look up regulation"}
              </Button>
            </form>
          ) : null}

          {loading && (
            <Card className="mt-6">
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
            <Card className="mt-6">
              <CardHeader>
                <Badge variant="default" className="w-fit mb-2">
                  {result.regulation}
                </Badge>
                <CardTitle className="text-lg">Applicable Regulation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Why This Applies</h4>
                  <p className="text-sm">{result.applies_because}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Required Actions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.required_actions.map((action, i) => (
                      <li key={i} className="text-sm">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Suggested Corrective Action
                  </h4>
                  <p className="text-sm">{result.corrective_action}</p>
                </div>

                <p className="text-xs text-gray-500 italic">
                  AI-generated suggestion. Verify with your EHS officer before acting.
                </p>

                <Button variant="outline" onClick={handleReset} className="w-full min-h-[44px]">
                  Search again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
