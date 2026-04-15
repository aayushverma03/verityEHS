// Root layout for EHS AI Platform
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EHS AI Platform',
  description: 'AI-powered EHS compliance platform for the chemical industry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
