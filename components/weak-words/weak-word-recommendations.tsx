"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Target, BookOpen, Play } from "lucide-react"
import { ProgressManager } from "@/lib/user-progress"
import { toeicVocabulary, type VocabularyWord } from "@/lib/vocabulary-data"
import Link from "next/link"

export function WeakWordRecommendations() {
  const [weakWords, setWeakWords] = useState<VocabularyWord[]>([])
  const [recommendations, setRecommendations] = useState<VocabularyWord[]>([])
  const [accuracyRate, setAccuracyRate] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRecommendations()
  }, [])

  const loadRecommendations = () => {
    const progressManager = ProgressManager.getInstance()
    const progress = progressManager.getProgress()

    // Get current weak words
    const weak = toeicVocabulary.filter((word) => progress.weakWords.includes(word.id))
    setWeakWords(weak)

    // Calculate accuracy rate
    const total = progress.correctAnswers + progress.incorrectAnswers
    const accuracy = total > 0 ? (progress.correctAnswers / total) * 100 : 0
    setAccuracyRate(accuracy)

    // Generate recommendations based on weak word patterns
    const categoryCount: Record<string, number> = {}
    const difficultyCount: Record<string, number> = {}

    weak.forEach((word) => {
      categoryCount[word.category] = (categoryCount[word.category] || 0) + 1
      difficultyCount[word.difficulty] = (difficultyCount[word.difficulty] || 0) + 1
    })

    // Find categories and difficulties with most weak words
    const topCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0]
    const topDifficulty = Object.entries(difficultyCount).sort(([, a], [, b]) => b - a)[0]?.[0]

    // Recommend similar words that aren't already weak or mastered
    const recommended = toeicVocabulary
      .filter((word) => {
        const isNotWeak = !progress.weakWords.includes(word.id)
        const isNotMastered = !progress.masteredWords.includes(word.id)
        const matchesPattern = word.category === topCategory || word.difficulty === topDifficulty
        return isNotWeak && isNotMastered && matchesPattern
      })
      .slice(0, 3)

    setRecommendations(recommended)
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Weak Words Overview */}
      <Card className={weakWords.length > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {weakWords.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <Target className="w-5 h-5 text-green-500" />
            )}
            Weak Words Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{weakWords.length}</div>
              <p className="text-sm text-muted-foreground">Words to practice</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{accuracyRate.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Overall accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {weakWords.length > 0 ? Math.ceil(weakWords.length / 5) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Practice sessions needed</p>
            </div>
          </div>

          {weakWords.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress to clear weak words</span>
                <span className="text-sm text-muted-foreground">{Math.max(0, 10 - weakWords.length)}/10 cleared</span>
              </div>
              <Progress value={Math.max(0, (10 - weakWords.length) / 10) * 100} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weakWords.length > 0 ? (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Practice Weak Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Focus on your {weakWords.length} weak words with targeted practice
              </p>
              <Link href="/weak-words/quiz">
                <Button className="w-full">Start Focused Practice</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Great Progress!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">You have no weak words. Keep up the excellent work!</p>
              <Link href="/quiz">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Review All Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Review your progress and manage your vocabulary list</p>
            <Link href="/review">
              <Button variant="outline" className="w-full bg-transparent">
                Open Review Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recommended Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Based on your weak word patterns, we recommend practicing these similar words:
            </p>
            <div className="space-y-3">
              {recommendations.map((word) => (
                <div key={word.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{word.word}</h4>
                    <p className="text-sm text-muted-foreground">{word.definition}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {word.category}
                    </Badge>
                    <Badge
                      variant={
                        word.difficulty === "beginner"
                          ? "default"
                          : word.difficulty === "intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {word.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
