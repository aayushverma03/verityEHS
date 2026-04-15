// User registration page
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { register } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { Logo } from "@/components/logo"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await register({ full_name: fullName, email, password })
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-col items-center mb-8">
        <Logo variant="mark" className="h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold">
          <span className="text-[#0D3D52]">Verity</span>
          <span className="text-[#0F7B6C] ml-1">EHS</span>
        </h1>
      </div>
      <Card className="w-full max-w-md glass-card border-0">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{t.auth.register}</CardTitle>
          <CardDescription>{t.auth.enterDetails}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.auth.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="min-h-[44px]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full min-h-[44px] btn-primary" disabled={loading}>
              {loading ? t.auth.creatingAccount : t.auth.register}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="text-[#0F7B6C] font-medium hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
