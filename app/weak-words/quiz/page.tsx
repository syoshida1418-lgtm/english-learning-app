"use client"

import { useState, useEffect } from "react"
import { WeakWordQuiz } from "@/components/weak-words/weak-word-quiz"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WeakWordQuizPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleQuizComplete = () => {
    // Refresh the page or redirect after quiz completion
    setTimeout(() => {
      window.location.href = "/weak-words"
    }, 3000)
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/weak-words">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Weak Words Quiz</h1>
                <p className="text-muted-foreground">Focused practice on challenging vocabulary</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <WeakWordQuiz onComplete={handleQuizComplete} />
      </main>
    </div>
  )
}
