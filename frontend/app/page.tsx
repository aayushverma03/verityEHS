// Home page for EHS AI Platform
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-14 pb-20 md:pb-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">EHS AI Platform</h1>
          <p className="text-gray-600 mb-8">AI-powered compliance for the chemical industry</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a chemical EHS question..."
                className="pl-10 min-h-[48px] text-base"
              />
            </div>
            <Button type="submit" className="min-h-[48px] min-w-[100px]">
              Search
            </Button>
          </form>
        </div>
      </main>
    </>
  )
}
