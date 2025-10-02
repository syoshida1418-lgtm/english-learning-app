"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Target, Clock, TrendingUp } from "lucide-react"
import type { QuizResult } from "@/lib/user-progress"
import type { VocabularyWord } from "@/lib/vocabulary-data"
import Link from "next/link"

interface QuizResultsProps {
  results: QuizResult[]
  words: VocabularyWord[]
  totalTime: number
}

export function QuizResults({ results, words, totalTime }: QuizResultsProps) {
  const correctCount = results.filter((r) => r.isCorrect).length
  const accuracy = (correctCount / results.length) * 100
  const averageTime = totalTime / results.length

  const getWordById = (id: string) => words.find((w) => w.id === id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overall Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {correctCount}/{results.length}
              </div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{accuracy.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{averageTime.toFixed(1)}s</div>
              <p className="text-sm text-muted-foreground">Avg. Time</p>
            </div>
          </div>
          <Progress value={accuracy} className="mb-4" />
          <div className="flex gap-2 justify-center">
            <Badge variant={accuracy >= 80 ? "default" : accuracy >= 60 ? "secondary" : "destructive"}>
              {accuracy >= 80 ? "Excellent" : accuracy >= 60 ? "Good" : "Needs Practice"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => {
              const word = getWordById(result.wordId)
              if (!word) return null

              return (
                <div
                  key={result.wordId}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">{word.word}</span>
                      <Badge variant="outline" className="text-sm px-2 py-1">
                        {word.partOfSpeech}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {result.timeTaken}s
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{word.definition}</p>

                  <div className="text-sm">
                    <p className="mb-1">
                      <span className="font-medium">Sentence:</span> {word.exampleSentence}
                    </p>
                    {!result.isCorrect && (
                      <div className="flex gap-4">
                        <span>
                          Your answer: <span className="font-medium text-red-700">{result.userAnswer}</span>
                        </span>
                        <span>
                          Correct: <span className="font-medium text-green-700">{result.correctAnswer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Link href="/quiz">
          <Button size="lg">Take Another Quiz</Button>
        </Link>
        <Link href="/review">
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <TrendingUp className="w-4 h-4" />
            Review Mistakes
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
