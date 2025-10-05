export interface UserProgress {
  userId: string
  totalWordsStudied: number
  correctAnswers: number
  incorrectAnswers: number
  streakDays: number
  lastStudyDate: Date
  weakWords: string[] // word IDs
  masteredWords: string[] // word IDs
  categoryProgress: {
    business: number
    travel: number
    daily: number
    academic: number
  }
  difficultyProgress: {
    beginner: number
    intermediate: number
    advanced: number
  }
}

import type { VocabularyWord } from './vocabulary-data'

export interface QuizResult {
  wordId: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  timestamp: Date
  timeTaken: number // in seconds
}

export class ProgressManager {
  private static instance: ProgressManager
  private progress: UserProgress

  private constructor() {
    this.progress = this.loadProgress()
  }

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  private loadProgress(): UserProgress {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("englishLearningProgress")
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          lastStudyDate: new Date(parsed.lastStudyDate),
        }
      }
    }

    return {
      userId: "default",
      totalWordsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streakDays: 0,
      lastStudyDate: new Date(),
      weakWords: [],
      masteredWords: [],
      categoryProgress: {
        business: 0,
        travel: 0,
        daily: 0,
        academic: 0,
      },
      difficultyProgress: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    }
  }

  saveProgress(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("englishLearningProgress", JSON.stringify(this.progress))
    }
  }

  getProgress(): UserProgress {
    return { ...this.progress }
  }

  recordQuizResult(result: QuizResult, word: VocabularyWord): void {
    this.progress.totalWordsStudied++

    if (result.isCorrect) {
      this.progress.correctAnswers++
      // Remove from weak words if answered correctly
      this.progress.weakWords = this.progress.weakWords.filter((id) => id !== result.wordId)

      // Add to mastered if answered correctly multiple times
      if (!this.progress.masteredWords.includes(result.wordId)) {
        this.progress.masteredWords.push(result.wordId)
      }
    } else {
      this.progress.incorrectAnswers++
      // Add to weak words if answered incorrectly
      if (!this.progress.weakWords.includes(result.wordId)) {
        this.progress.weakWords.push(result.wordId)
      }
    }

    // Update category progress
    this.progress.categoryProgress[word.category as keyof typeof this.progress.categoryProgress]++

    // Update difficulty progress
    this.progress.difficultyProgress[word.difficulty as keyof typeof this.progress.difficultyProgress]++

    // Update streak
    const today = new Date()
    const lastStudy = new Date(this.progress.lastStudyDate)
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      this.progress.streakDays++
    } else if (daysDiff > 1) {
      this.progress.streakDays = 1
    }

    this.progress.lastStudyDate = today
    this.saveProgress()
  }

  getAccuracyRate(): number {
    const total = this.progress.correctAnswers + this.progress.incorrectAnswers
    return total > 0 ? (this.progress.correctAnswers / total) * 100 : 0
  }

  getWeakWords(): string[] {
    return [...this.progress.weakWords]
  }

  getMasteredWords(): string[] {
    return [...this.progress.masteredWords]
  }

  resetProgress(): void {
    this.progress = {
      userId: "default",
      totalWordsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streakDays: 0,
      lastStudyDate: new Date(),
      weakWords: [],
      masteredWords: [],
      categoryProgress: {
        business: 0,
        travel: 0,
        daily: 0,
        academic: 0,
      },
      difficultyProgress: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    }
    this.saveProgress()
  }
}
