"use client"

import { useState, useEffect } from "react"
import { QuizCard } from "@/components/quiz/quiz-card"
import { QuizResults } from "@/components/quiz/quiz-results"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Target } from "lucide-react"
import { ProgressManager, type QuizResult } from "@/lib/user-progress"
import { toeicVocabulary, type VocabularyWord } from "@/lib/vocabulary-data"
import Link from "next/link"

interface WeakWordQuizProps {
  onComplete?: () => void
}

export function WeakWordQuiz({ onComplete }: WeakWordQuizProps) {
  const [weakWords, setWeakWords] = useState<VocabularyWord[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [quizStartTime] = useState(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadWeakWords()
  }, [])

  const loadWeakWords = () => {
    const progressManager = ProgressManager.getInstance()
    const progress = progressManager.getProgress()

    // Get weak words from vocabulary
    const weak = toeicVocabulary.filter((word) => progress.weakWords.includes(word.id))

    // If no weak words, add some random words to practice
    if (weak.length === 0) {
      const randomWords = toeicVocabulary.slice(0, 3)
      setWeakWords(randomWords)
    } else {
      // Limit to 5 words for focused practice
      setWeakWords(weak.slice(0, 5))
    }
  }

  const handleAnswer = (isCorrect: boolean, userAnswer: string, timeTaken: number) => {
    const currentWord = weakWords[currentQuestionIndex]
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
    if (currentQuestionIndex < weakWords.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 2000)
    } else {
      setTimeout(() => {
        setIsQuizComplete(true)
        onComplete?.()
      }, 2000)
    }
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (weakWords.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            No Weak Words!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Great job! You do not have any weak words to practice right now.</p>
          <Link href="/quiz">
            <Button className="w-full">Take Regular Quiz</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const totalQuizTime = Math.floor((Date.now() - quizStartTime) / 1000)

  if (isQuizComplete) {
    return <QuizResults results={quizResults} words={weakWords} totalTime={totalQuizTime} />
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Weak Words Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Focus on these words that need more practice. Getting them right will remove them from your weak words list.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{weakWords.length} words to practice</Badge>
            <Badge variant="destructive">Focused Practice</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <QuizCard
        word={weakWords[currentQuestionIndex]}
        onAnswer={handleAnswer}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={weakWords.length}
      />
    </div>
  )
}
