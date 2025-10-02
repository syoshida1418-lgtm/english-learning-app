"use client"

import { useState, useEffect } from "react"
import { WordReviewCard } from "@/components/review/word-review-card"
import { ProgressChart } from "@/components/progress/progress-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import { ProgressManager, type UserProgress } from "@/lib/user-progress"
import { toeicVocabulary, type VocabularyWord } from "@/lib/vocabulary-data"
import { CustomVocabularyManager } from "@/lib/custom-vocabulary"
import Link from "next/link"

export default function ReviewPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [weakWords, setWeakWords] = useState<VocabularyWord[]>([])
  const [masteredWords, setMasteredWords] = useState<VocabularyWord[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const manager = CustomVocabularyManager.getInstance()
    manager.ready().then(() => {
      loadProgress()
    })
  }, [])

  const loadProgress = () => {
    const progressManager = ProgressManager.getInstance()
    const currentProgress = progressManager.getProgress()
    setProgress(currentProgress)
    // Merge base vocabulary with custom words
    const customManager = CustomVocabularyManager.getInstance()
    const allWords = toeicVocabulary.concat(customManager.getCustomWords() as VocabularyWord[])

    // Get weak words
    const weak = allWords.filter((word) => currentProgress.weakWords.includes(word.id))
    setWeakWords(weak)

    // Get mastered words
    const mastered = allWords.filter((word) => currentProgress.masteredWords.includes(word.id))
    setMasteredWords(mastered)
  }

  const handleMarkAsKnown = (wordId: string) => {
    const progressManager = ProgressManager.getInstance()
    const currentProgress = progressManager.getProgress()

    // Remove from weak words and add to mastered
    currentProgress.weakWords = currentProgress.weakWords.filter((id) => id !== wordId)
    if (!currentProgress.masteredWords.includes(wordId)) {
      currentProgress.masteredWords.push(wordId)
    }

    progressManager.saveProgress()
    loadProgress()
  }

  const handleMarkAsUnknown = (wordId: string) => {
    const progressManager = ProgressManager.getInstance()
    const currentProgress = progressManager.getProgress()

    // Remove from mastered and add to weak words
    currentProgress.masteredWords = currentProgress.masteredWords.filter((id) => id !== wordId)
    if (!currentProgress.weakWords.includes(wordId)) {
      currentProgress.weakWords.push(wordId)
    }

    progressManager.saveProgress()
    loadProgress()
  }

  if (!mounted || !progress) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Review Center</h1>
                <p className="text-muted-foreground">Track your progress and review vocabulary</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{progress.totalWordsStudied} words studied</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="weak" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Weak Words ({weakWords.length})
            </TabsTrigger>
            <TabsTrigger value="mastered" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Mastered ({masteredWords.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              All Words
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <ProgressChart progress={progress} />
          </TabsContent>

          {/* Weak Words Tab */}
          <TabsContent value="weak">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Words That Need Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    These words were answered incorrectly in recent quizzes. Focus on these to improve your vocabulary.
                  </p>
                </CardContent>
              </Card>

              {weakWords.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Great job!</h3>
                    <p className="text-muted-foreground">You don't have any weak words right now.</p>
                    <Link href="/quiz">
                      <Button className="mt-4">Take a Quiz</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {weakWords.map((word) => (
                    <WordReviewCard
                      key={word.id}
                      word={word}
                      isWeak={true}
                      onMarkAsKnown={() => handleMarkAsKnown(word.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mastered Words Tab */}
          <TabsContent value="mastered">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Mastered Vocabulary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Congratulations! These are the words you've mastered through consistent practice.
                  </p>
                </CardContent>
              </Card>

              {masteredWords.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keep practicing!</h3>
                    <p className="text-muted-foreground">Master words by answering them correctly in quizzes.</p>
                    <Link href="/quiz">
                      <Button className="mt-4">Start Practicing</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {masteredWords.map((word) => (
                    <WordReviewCard
                      key={word.id}
                      word={word}
                      isMastered={true}
                      onMarkAsUnknown={() => handleMarkAsUnknown(word.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Words Tab */}
          <TabsContent value="all">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All TOEIC Vocabulary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse through all available vocabulary words. Mark words as known or unknown to track your
                    progress.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {toeicVocabulary.concat(CustomVocabularyManager.getInstance().getCustomWords() as VocabularyWord[]).map((word) => (
                  <WordReviewCard
                    key={word.id}
                    word={word}
                    isWeak={progress.weakWords.includes(word.id)}
                    isMastered={progress.masteredWords.includes(word.id)}
                    onMarkAsKnown={() => handleMarkAsKnown(word.id)}
                    onMarkAsUnknown={() => handleMarkAsUnknown(word.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
