"use client"

import { useState, useEffect } from "react"
import { PronunciationCard } from "@/components/audio/pronunciation-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shuffle, Filter } from "lucide-react"
import { toeicVocabulary, getWordsByDifficulty, getWordsByCategory, type VocabularyWord } from "@/lib/vocabulary-data"
import Link from "next/link"

export default function PronunciationPage() {
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null)
  const [filter, setFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced" | "business" | "travel" | "daily" | "academic"
  >("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRandomWord()
  }, [])

  const loadRandomWord = () => {
    let words: VocabularyWord[] = []

    if (filter === "all") {
      words = toeicVocabulary
    } else if (["beginner", "intermediate", "advanced"].includes(filter)) {
      words = getWordsByDifficulty(filter as VocabularyWord["difficulty"])
    } else {
      words = getWordsByCategory(filter as VocabularyWord["category"])
    }

    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)]
      setCurrentWord(randomWord)
    }
  }

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    // Load a new word with the new filter
    setTimeout(() => {
      let words: VocabularyWord[] = []

      if (newFilter === "all") {
        words = toeicVocabulary
      } else if (["beginner", "intermediate", "advanced"].includes(newFilter)) {
        words = getWordsByDifficulty(newFilter as VocabularyWord["difficulty"])
      } else {
        words = getWordsByCategory(newFilter as VocabularyWord["category"])
      }

      if (words.length > 0) {
        const randomWord = words[Math.floor(Math.random() * words.length)]
        setCurrentWord(randomWord)
      }
    }, 100)
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pronunciation Practice</h1>
                <p className="text-muted-foreground">Listen and learn correct pronunciation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("all")}
              >
                All Words
              </Button>

              {/* Difficulty Filters */}
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={filter === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(difficulty as typeof filter)}
                    className="capitalize"
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>

              {/* Category Filters */}
              <div className="flex gap-2">
                {["business", "travel", "daily", "academic"].map((category) => (
                  <Button
                    key={category}
                    variant={filter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(category as typeof filter)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Word */}
        {currentWord ? (
          <div className="space-y-6">
            <PronunciationCard word={currentWord} />

            <div className="flex justify-center">
              <Button onClick={loadRandomWord} size="lg" className="gap-2">
                <Shuffle className="w-4 h-4" />
                Next Word
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No words available for the selected filter.</p>
              <Button onClick={() => handleFilterChange("all")} className="mt-4">
                Show All Words
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
