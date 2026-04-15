// Auth guard component to protect routes
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isLoggedIn } from "@/lib/auth"

const publicPaths = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const isPublic = publicPaths.includes(pathname)
    const loggedIn = isLoggedIn()

    if (!isPublic && !loggedIn) {
      router.push("/login")
    } else if (isPublic && loggedIn) {
      router.push("/")
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  return <>{children}</>
}
