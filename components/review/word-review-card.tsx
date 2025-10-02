"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioPlayer } from "@/components/audio/audio-player"
import { CheckCircle, XCircle, RotateCcw, BookOpen } from "lucide-react"
import type { VocabularyWord } from "@/lib/vocabulary-data"

interface WordReviewCardProps {
  word: VocabularyWord
  isWeak?: boolean
  isMastered?: boolean
  onMarkAsKnown?: () => void
  onMarkAsUnknown?: () => void
  showActions?: boolean
}

export function WordReviewCard({
  word,
  isWeak = false,
  isMastered = false,
  onMarkAsKnown,
  onMarkAsUnknown,
  showActions = true,
}: WordReviewCardProps) {
  return (
    <Card
      className={`w-full ${isWeak ? "border-red-200 bg-red-50" : isMastered ? "border-green-200 bg-green-50" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {word.word}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{word.partOfSpeech}</Badge>
            <Badge
              variant={
                word.difficulty === "beginner"
                  ? "default"
                  : word.difficulty === "intermediate"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize"
            >
              {word.difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {word.category}
            </Badge>
            {isWeak && <Badge variant="destructive">Weak</Badge>}
            {isMastered && <Badge variant="default">Mastered</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Word with Audio */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <h3 className="font-semibold text-xl">{word.word}</h3>
            <p className="text-sm text-muted-foreground">Click to hear pronunciation</p>
          </div>
          <AudioPlayer text={word.word} variant="default" rate={0.7} />
        </div>

        {/* Definition */}
        <div className="space-y-2">
          <h4 className="font-medium">Definition</h4>
          <p className="text-muted-foreground">{word.definition}</p>
          <AudioPlayer text={word.definition} showText rate={0.8} />
        </div>

        {/* Example Sentence */}
        <div className="space-y-2">
          <h4 className="font-medium">Example Sentence</h4>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-balance leading-relaxed mb-2">{word.exampleSentence}</p>
            <AudioPlayer text={word.exampleSentence} showText rate={0.8} />
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {!isMastered && (
              <Button
                onClick={onMarkAsKnown}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 bg-green-50 border-green-200 hover:bg-green-100"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Known
              </Button>
            )}
            {!isWeak && (
              <Button
                onClick={onMarkAsUnknown}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 bg-red-50 border-red-200 hover:bg-red-100"
              >
                <XCircle className="w-4 h-4" />
                Need More Practice
              </Button>
            )}
            <Button
              onClick={() => window.open(`/quiz?word=${word.id}`, "_blank")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Practice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
