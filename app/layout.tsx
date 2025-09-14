import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ComplianceAI - Automated Legal Metrology Compliance Checker",
  description:
    "AI-powered automated compliance checker for Legal Metrology enforcement across Indian e-commerce platforms. Monitor violations, ensure regulatory compliance with cutting-edge technology.",
  keywords: "legal metrology, compliance checker, AI, e-commerce monitoring, regulatory enforcement, India",
  authors: [{ name: "Government of India" }],
  creator: "ComplianceAI Team",
  publisher: "Government of India",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
