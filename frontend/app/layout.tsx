// Root layout for Verity EHS
import type { Metadata } from "next"
import "./globals.css"
import { AuthGuard } from "@/components/auth-guard"
import { LanguageProvider } from "@/components/language-provider"

export const metadata: Metadata = {
  title: "Verity EHS",
  description: "AI-powered EHS compliance platform for the chemical industry",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <LanguageProvider>
          <AuthGuard>{children}</AuthGuard>
        </LanguageProvider>
      </body>
    </html>
  )
}
