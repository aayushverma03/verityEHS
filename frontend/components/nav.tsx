// Navigation component with mobile bottom bar
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Search, ClipboardCheck, AlertTriangle, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearToken } from "@/lib/auth"
import { useLanguage } from "./language-provider"
import { LanguageToggle } from "./language-toggle"
import { Logo } from "./logo"

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
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 z-40 items-center px-6 shadow-sm">
        <Link href="/" className="mr-10 flex items-center">
          <Logo className="h-10 w-auto" />
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.nav[item.key]}
              </Link>
            )
          })}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-300"
          >
            {t.nav.signOut}
          </button>
        </div>
      </nav>

      {/* Mobile top bar with logo */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 z-40 flex items-center justify-between px-4">
        <Link href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <LanguageToggle />
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 z-40 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-3 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                  : "text-gray-500 hover:bg-gray-100/80"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "mb-0.5")} />
              <span className={cn("text-xs mt-1 font-medium", isActive && "text-white")}>{t.nav[item.key]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
