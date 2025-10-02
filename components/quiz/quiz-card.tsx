"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import type { VocabularyWord } from "@/lib/vocabulary-data"
import { cn } from "@/lib/utils"
import { AudioPlayer } from "@/components/audio/audio-player"

interface QuizCardProps {
  word: VocabularyWord
  onAnswer: (isCorrect: boolean, userAnswer: string, timeTaken: number) => void
  questionNumber: number
  totalQuestions: number
}

export function QuizCard({ word, onAnswer, questionNumber, totalQuestions }: QuizCardProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [startTime] = useState(Date.now())

  // Create the sentence with blank
  const words = word.exampleSentence.split(" ")
  const blankSentence = words.map((w, index) => (index === word.blankPosition ? "______" : w)).join(" ")

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const correct = userAnswer.toLowerCase().trim() === word.word.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)
    onAnswer(correct, userAnswer, timeTaken)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim() && !showResult) {
      handleSubmit()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
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
        <Progress value={(questionNumber / totalQuestions) * 100} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Word Definition */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-2">Definition:</h3>
          <p className="text-muted-foreground">
            <span className="font-medium">({word.partOfSpeech})</span> {word.definition}
          </p>
        </div>

        {/* Example Sentence with Blank */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Complete the sentence:</h3>
            <AudioPlayer text={word.exampleSentence} showText rate={0.8} />
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-4">
            <p className="text-lg leading-relaxed text-balance">
              {blankSentence.split("______").map((part, index) => (
                <span key={index}>
                  {part}
                  {index < blankSentence.split("______").length - 1 && (
                    <span className="inline-block">
                      {showResult ? (
                        <span
                          className={cn(
                            "px-3 py-1 rounded font-semibold",
                            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                          )}
                        >
                          {word.word}
                        </span>
                      ) : (
                        <Input
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="inline-block w-32 mx-1 text-center"
                          placeholder="?"
                          disabled={showResult}
                        />
                      )}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Result Display */}
        {showResult && (
          <div
            className={cn(
              "p-4 rounded-lg border-2",
              isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={cn("font-semibold", isCorrect ? "text-green-800" : "text-red-800")}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>
            {!isCorrect && (
              <div className="text-sm text-muted-foreground">
                <p>
                  Your answer: <span className="font-medium">{userAnswer}</span>
                </p>
                <p>
                  Correct answer: <span className="font-medium text-green-700">{word.word}</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">Listen to correct pronunciation:</span>
                  <AudioPlayer text={word.word} rate={0.7} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!showResult ? (
            <Button onClick={handleSubmit} disabled={!userAnswer.trim()} className="flex-1" size="lg">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Another Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
