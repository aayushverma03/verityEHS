// Navigation component with mobile bottom bar
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Search, ClipboardCheck, AlertTriangle, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearToken } from "@/lib/auth"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/documents", label: "Docs", icon: FileText },
  { href: "/search", label: "Search", icon: Search },
  { href: "/approvals", label: "Permits", icon: ClipboardCheck },
  { href: "/incident", label: "Incident", icon: AlertTriangle },
]

export function Nav() {
  const pathname = usePathname()

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
              {item.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
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
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
