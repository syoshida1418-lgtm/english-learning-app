"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AudioPlayer } from "./audio-player"
import { Volume2, BookOpen } from "lucide-react"
import type { VocabularyWord } from "@/lib/vocabulary-data"

interface PronunciationCardProps {
  word: VocabularyWord
  showDefinition?: boolean
  showExample?: boolean
}

export function PronunciationCard({ word, showDefinition = true, showExample = true }: PronunciationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            {word.word}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{word.partOfSpeech}</Badge>
            <Badge variant="secondary" className="capitalize">
              {word.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Word Pronunciation */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <h3 className="font-semibold text-lg">{word.word}</h3>
            <p className="text-sm text-muted-foreground">Click to hear pronunciation</p>
          </div>
          <AudioPlayer text={word.word} variant="default" size="default" rate={0.7} />
        </div>

        {/* Definition */}
        {showDefinition && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Definition
            </h4>
            <p className="text-muted-foreground pl-6">{word.definition}</p>
            <div className="pl-6">
              <AudioPlayer text={word.definition} showText rate={0.8} />
            </div>
          </div>
        )}

        {/* Example Sentence */}
        {showExample && (
          <div className="space-y-2">
            <h4 className="font-medium">Example Sentence</h4>
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-balance leading-relaxed mb-2">{word.exampleSentence}</p>
              <AudioPlayer text={word.exampleSentence} showText rate={0.8} />
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="capitalize">
            {word.category} vocabulary
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
