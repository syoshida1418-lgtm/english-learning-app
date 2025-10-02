"use client"

import { useState, useEffect } from "react"
import { QuizCard } from "@/components/quiz/quiz-card"
import { QuizResults } from "@/components/quiz/quiz-results"
import { getRandomWords, type VocabularyWord } from "@/lib/vocabulary-data"
import { ProgressManager, type QuizResult } from "@/lib/user-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function QuizPage() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [quizStartTime] = useState(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize quiz with 5 random words
    const randomWords = getRandomWords(5)
    setWords(randomWords)
  }, [])

  const handleAnswer = (isCorrect: boolean, userAnswer: string, timeTaken: number) => {
    const currentWord = words[currentQuestionIndex]
    const result: QuizResult = {
      wordId: currentWord.id,
      isCorrect,
      userAnswer,
      correctAnswer: currentWord.word,
      timestamp: new Date(),
      timeTaken,
    }

    // Record the result in progress manager
    const progressManager = ProgressManager.getInstance()
    progressManager.recordQuizResult(result, currentWord)

    // Add to results
    const newResults = [...quizResults, result]
    setQuizResults(newResults)

    // Move to next question or complete quiz
    if (currentQuestionIndex < words.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 2000) // Show result for 2 seconds before next question
    } else {
      setTimeout(() => {
        setIsQuizComplete(true)
      }, 2000)
    }
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Words Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">There are no vocabulary words available for the quiz.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuizTime = Math.floor((Date.now() - quizStartTime) / 1000)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">TOEIC Quiz</h1>
                <p className="text-muted-foreground">Fill in the missing words</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {isQuizComplete ? "Complete" : `${currentQuestionIndex + 1}/${words.length}`}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isQuizComplete ? (
          <QuizResults results={quizResults} words={words} totalTime={totalQuizTime} />
        ) : (
          <QuizCard
            word={words[currentQuestionIndex]}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={words.length}
          />
        )}
      </main>
    </div>
  )
}
