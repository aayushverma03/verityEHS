// Navigation component with mobile bottom bar
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Search, ClipboardCheck, AlertTriangle, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearToken } from "@/lib/auth"
import { useLanguage } from "./language-provider"
import { LanguageToggle } from "./language-toggle"

type NavKey = "home" | "docs" | "search" | "permits" | "incident"

const navItems: Array<{ href: string; key: NavKey; icon: typeof Home }> = [
  { href: "/", key: "home", icon: Home },
  { href: "/documents", key: "docs", icon: FileText },
  { href: "/search", key: "search", icon: Search },
  { href: "/approvals", key: "permits", icon: ClipboardCheck },
  { href: "/incident", key: "incident", icon: AlertTriangle },
]

export function Nav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  function handleLogout() {
    clearToken()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-14 border-b bg-white z-40 items-center px-4">
        <Link href="/" className="font-semibold text-lg mr-8">
          EHS Platform
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {t.nav.signOut}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-white z-40 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-md",
                isActive ? "text-gray-900" : "text-gray-500"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{t.nav[item.key]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
