"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Calendar, Target, BookOpen } from "lucide-react"
import type { UserProgress } from "@/lib/user-progress"

interface ProgressChartProps {
  progress: UserProgress
}

export function ProgressChart({ progress }: ProgressChartProps) {
  const accuracyRate =
    progress.correctAnswers + progress.incorrectAnswers > 0
      ? (progress.correctAnswers / (progress.correctAnswers + progress.incorrectAnswers)) * 100
      : 0

  const totalCategoryWords = Object.values(progress.categoryProgress).reduce((sum, count) => sum + count, 0)
  const totalDifficultyWords = Object.values(progress.difficultyProgress).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{progress.totalWordsStudied}</div>
            <p className="text-xs text-muted-foreground">Words practiced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{accuracyRate.toFixed(1)}%</div>
            <Progress value={accuracyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{progress.streakDays}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{progress.masteredWords.length}</div>
            <p className="text-xs text-muted-foreground">Words mastered</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.categoryProgress).map(([category, count]) => {
              const percentage = totalCategoryWords > 0 ? (count / totalCategoryWords) * 100 : 0
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} words ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.difficultyProgress).map(([difficulty, count]) => {
              const percentage = totalDifficultyWords > 0 ? (count / totalDifficultyWords) * 100 : 0
              const badgeVariant =
                difficulty === "beginner" ? "default" : difficulty === "intermediate" ? "secondary" : "destructive"

              return (
                <div key={difficulty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant} className="capitalize">
                        {difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} words ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{progress.correctAnswers}</div>
              <p className="text-sm text-green-600">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{progress.incorrectAnswers}</div>
              <p className="text-sm text-red-600">Incorrect Answers</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Badge
              variant={accuracyRate >= 80 ? "default" : accuracyRate >= 60 ? "secondary" : "destructive"}
              className="text-sm"
            >
              {accuracyRate >= 80
                ? "Excellent Performance"
                : accuracyRate >= 60
                  ? "Good Progress"
                  : "Needs More Practice"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
