// Navigation component with mobile bottom bar
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, ClipboardCheck, AlertTriangle, Home, HelpCircle, User, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearToken, getUserName } from "@/lib/auth"
import { useLanguage } from "./language-provider"
import { LanguageToggle } from "./language-toggle"
import { Logo } from "./logo"

type NavKey = "home" | "docs" | "faq" | "permits" | "incident"

const navItems: Array<{ href: string; key: NavKey; icon: typeof Home }> = [
  { href: "/", key: "home", icon: Home },
  { href: "/documents", key: "docs", icon: FileText },
  { href: "/faq", key: "faq", icon: HelpCircle },
  { href: "/approvals", key: "permits", icon: ClipboardCheck },
  { href: "/incident", key: "incident", icon: AlertTriangle },
]

export function Nav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userName = getUserName()

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
          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-300"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0F7B6C] to-[#0A5C8A] flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {userName && <span className="hidden lg:inline max-w-[120px] truncate">{userName}</span>}
              <ChevronDown className={cn("h-4 w-4 transition-transform", userMenuOpen && "rotate-180")} />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/60 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.signOut}
                  </button>
                </div>
              </>
            )}
          </div>
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
