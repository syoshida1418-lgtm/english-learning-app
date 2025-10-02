import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import dynamic from "next/dynamic"

// Client-only helper to unregister existing service workers in development
const DisableServiceWorkerInDev = dynamic(
  async () => {
    const Comp = () => {
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister())
          }).catch(() => {})
        }
      }
      return null
    }
    return Comp
  },
  { ssr: false }
)
import { Suspense } from "react"
import "./globals.css"

const geistSans = GeistSans.variable
const geistMono = GeistMono.variable

export const metadata: Metadata = {
  title: "TOEIC Learn",
  description: "Interactive TOEIC vocabulary learning app",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TOEIC Learn",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TOEIC Learn",
    title: "TOEIC Learn - Interactive Vocabulary App",
    description: "Master TOEIC vocabulary with interactive quizzes and pronunciation practice",
  },
  icons: {
    shortcut: "/icon-192x192.png",
    apple: [{ url: "/icon-192x192.png" }, { url: "/icon-512x512.png", sizes: "512x512" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans} ${geistMono} antialiased`}>
      <head>
        <meta name="application-name" content="TOEIC Learn" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TOEIC Learn" />
        <meta name="description" content="Interactive TOEIC vocabulary learning app" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f97316" />

        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icon-192x192.png" />

        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <body>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <OfflineIndicator />
            <DisableServiceWorkerInDev />
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
