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

const navItems: Array<{ href: string; key: NavKey; icon: typeof Home; color: string }> = [
  { href: "/", key: "home", icon: Home, color: "text-teal-600" },
  { href: "/documents", key: "docs", icon: FileText, color: "text-blue-600" },
  { href: "/faq", key: "faq", icon: HelpCircle, color: "text-purple-600" },
  { href: "/approvals", key: "permits", icon: ClipboardCheck, color: "text-amber-600" },
  { href: "/incident", key: "incident", icon: AlertTriangle, color: "text-rose-600" },
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
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-40 items-center px-6">
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : item.color)} />
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors duration-200"
            >
              <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {userName && <span className="hidden lg:inline max-w-[120px] truncate">{userName}</span>}
              <ChevronDown className={cn("h-4 w-4 transition-transform", userMenuOpen && "rotate-180")} />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-stone-200 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
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
      <nav className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-stone-200 z-40 flex items-center justify-between px-4">
        <Link href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {/* Mobile user menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="h-9 w-9 rounded-full bg-teal-700 flex items-center justify-center"
              aria-label="User menu"
            >
              <User className="h-4 w-4 text-white" />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-stone-200 z-50">
                  {userName && (
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-800 truncate">{userName}</p>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
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

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-stone-200 z-40 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-3 rounded-xl transition-colors duration-200",
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-white mb-0.5" : item.color)} />
              <span className={cn("text-xs mt-1 font-medium", isActive ? "text-white" : "text-stone-600")}>{t.nav[item.key]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
