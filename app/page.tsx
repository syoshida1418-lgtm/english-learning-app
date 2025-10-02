"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Play,
  Plus,
  List,
  Volume2,
  AlertTriangle,
  Settings,
} from "lucide-react"
import { ProgressManager } from "@/lib/user-progress"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import Link from "next/link"
import { WordCountDisplay } from "@/components/WordCountDisplay"


export default function HomePage() {
  const [progress, setProgress] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const progressManager = ProgressManager.getInstance()
    setProgress(progressManager.getProgress())
  }, [])

  if (!mounted || !progress) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const accuracyRate =
    progress.correctAnswers + progress.incorrectAnswers > 0
      ? (progress.correctAnswers / (progress.correctAnswers + progress.incorrectAnswers)) * 100
      : 0

  return (
    <div className="min-h-screen bg-background">
      <InstallPrompt />

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">TOEIC Master</h1>
              <p className="text-muted-foreground mt-1">Master English vocabulary for TOEIC success</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
              <Badge variant="secondary" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {progress.streakDays} day streak
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Studied</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{progress.totalWordsStudied}</div>
              <p className="text-xs text-muted-foreground">Total vocabulary practiced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{accuracyRate.toFixed(1)}%</div>
              <Progress value={accuracyRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weak Words</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{progress.weakWords.length}</div>
              <p className="text-xs text-muted-foreground">Words to review</p>
            </CardContent>
          </Card>
        </div>

        {/* Weak Words Alert */}
        {progress.weakWords.length > 0 && (
          <Card className="mb-8 border-accent bg-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Weak Words Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {progress.weakWords.length} words that need more practice
                  </p>
                </div>
                <Link href="/weak-words">
                  <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-white">
                    Review Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Start Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Practice with fill-in-the-blank questions using TOEIC vocabulary
              </p>
              <Link href="/quiz">
                <Button className="w-full">Begin Practice Session</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Review Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Review your weak words and track your progress</p>
              <Link href="/review">
                <Button variant="outline" className="w-full bg-transparent">
                  Open Review Center
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pronunciation Practice removed per project requirements */}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Custom Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Add your own vocabulary words and create custom quizzes</p>
              <Link href="/manage">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Vocabulary
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(progress.categoryProgress).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <WordCountDisplay count={count as number} />
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((count as number/ 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
