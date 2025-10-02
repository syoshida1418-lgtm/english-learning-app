import { get, set, createStore } from 'idb-keyval'

export interface CustomWord extends Omit<import('./vocabulary-data').VocabularyWord, 'id'> {
  id: string
  isCustom: true
  createdAt: Date
  createdBy: string
  notes?: string // optional memo
  // audioUrl is inherited from VocabularyWord (optional)
    audioBlob?: Blob | null
    // audioUrl is a transient field (object URL) created at runtime for playback convenience.
    audioUrl?: string
  }

const STORE_NAME = 'custom-vocab'
const STORE_KEY = 'customVocabulary'

export class CustomVocabularyManager {
  private static instance: CustomVocabularyManager
  private customWords: CustomWord[] = []
  private store = typeof window !== 'undefined' ? createStore('english-learning-app', STORE_NAME) : undefined
  private readyPromise: Promise<void> | null = null
  private readyResolve: (() => void) | null = null
  private readyCallbacks: Array<() => void> = []

  private constructor() {
    // Try to synchronously populate from localStorage (fast fallback) so UI has data
    try {
      if (typeof window !== 'undefined') {
        const ls = localStorage.getItem(STORE_KEY)
        if (ls) {
          const parsed = JSON.parse(ls)
          if (Array.isArray(parsed)) {
            this.customWords = parsed.map((word: any) => ({ ...word, createdAt: new Date(word.createdAt), audioBlob: word.audioBlob || null }))
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    // load asynchronously from IndexedDB to replace/merge local copy
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve
    })
    this.loadCustomWords()
  }

  static getInstance(): CustomVocabularyManager {
    if (!CustomVocabularyManager.instance) {
      CustomVocabularyManager.instance = new CustomVocabularyManager()
    }
    return CustomVocabularyManager.instance
  }

  private loadCustomWords(): void {
    if (typeof window === 'undefined') return

    if (this.store) {
      // idb-keyval returns a Promise
      get(STORE_KEY, this.store)
        .then((saved: any) => {
          if (Array.isArray(saved)) {
            // saved items may include Blobs (audioBlob). Keep blobs intact.
            this.customWords = saved.map((word: any) => ({
              ...word,
              createdAt: new Date(word.createdAt),
              audioBlob: word.audioBlob || null,
            }))
          }
          // notify ready
          if (this.readyResolve) {
            this.readyResolve()
            this.readyResolve = null
          }
          this.readyCallbacks.forEach((cb) => cb())
          this.readyCallbacks = []
        })
        .catch(() => {
          // Fallback to localStorage if indexedDB read fails
          const ls = localStorage.getItem(STORE_KEY)
          if (ls) {
            try {
              const parsed = JSON.parse(ls)
              this.customWords = parsed.map((word: any) => ({ ...word, createdAt: new Date(word.createdAt) }))
            } catch (e) {
              // ignore
            }
          }
          // notify ready even on failure
          if (this.readyResolve) {
            this.readyResolve()
            this.readyResolve = null
          }
          this.readyCallbacks.forEach((cb) => cb())
          this.readyCallbacks = []
        })
    } else {
      // Fallback path for very old environments: localStorage
      try {
        const saved = localStorage.getItem(STORE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          this.customWords = parsed.map((word: any) => ({ ...word, createdAt: new Date(word.createdAt) }))
        }
      } catch (e) {
        // ignore
      }
      if (this.readyResolve) {
        this.readyResolve()
        this.readyResolve = null
      }
      this.readyCallbacks.forEach((cb) => cb())
      this.readyCallbacks = []
    }
  }

  // Returns a promise that resolves when async IndexedDB load completes
  async ready(): Promise<void> {
    if (!this.readyPromise) return Promise.resolve()
    return this.readyPromise
  }

  // Register a callback to be invoked when initial async load completes
  onReady(cb: () => void): void {
    if (!this.readyPromise) {
      cb()
      return
    }
    this.readyCallbacks.push(cb)
  }

  private saveCustomWords(): void {
    if (typeof window === 'undefined') return

    if (this.store) {
      // store asynchronously; don't await to keep API sync-like
      // When saving to IndexedDB via idb-keyval, Blobs are preserved.
      set(STORE_KEY, this.customWords, this.store).catch(() => {
        // fallback to localStorage on error
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(this.customWords))
        } catch (e) {
          // ignore
        }
      })
    } else {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.customWords))
      } catch (e) {
        // ignore
      }
    }
  }

  addWord(wordData: Omit<CustomWord, 'id' | 'isCustom' | 'createdAt' | 'createdBy'>): CustomWord {
    const newWord: CustomWord = {
      ...wordData, // wordData.note もここで含まれる
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date(),
      createdBy: 'user',
    }

    this.customWords.push(newWord)
    this.saveCustomWords()
    return newWord
  }

  updateWord(id: string, updates: Partial<Omit<CustomWord, 'id' | 'isCustom' | 'createdAt' | 'createdBy'>>): boolean {
    const index = this.customWords.findIndex((word) => word.id === id)
    if (index === -1) return false

    this.customWords[index] = { ...this.customWords[index], ...updates }
    this.saveCustomWords()
    return true
  }

  deleteWord(id: string): boolean {
    const index = this.customWords.findIndex((word) => word.id === id)
    if (index === -1) return false

    this.customWords.splice(index, 1)
    this.saveCustomWords()
    return true
  }

  getCustomWords(): CustomWord[] {
    // Return a shallow copy. If any word has audioBlob but no audioUrl, create an object URL
    // for playback convenience. Note: object URLs are not persisted across page reloads.
    return this.customWords.map((w) => {
      const copy = { ...w }
      try {
        if (!copy.audioUrl && copy.audioBlob instanceof Blob) {
          copy.audioUrl = URL.createObjectURL(copy.audioBlob)
        }
      } catch (e) {
        // ignore URL creation issues in restricted environments
      }
      return copy
    })
  }

  getWordById(id: string): CustomWord | undefined {
    return this.customWords.find((word) => word.id === id)
  }

  getWordsByCategory(category: CustomWord['category']): CustomWord[] {
    return this.customWords.filter((word) => word.category === category)
  }

  getWordsByDifficulty(difficulty: CustomWord['difficulty']): CustomWord[] {
    return this.customWords.filter((word) => word.difficulty === difficulty)
  }

  searchWords(query: string): CustomWord[] {
    const lowercaseQuery = query.toLowerCase()
    return this.customWords.filter(
      (word) =>
        word.word.toLowerCase().includes(lowercaseQuery) ||
        word.definition.toLowerCase().includes(lowercaseQuery) ||
        word.exampleSentence.toLowerCase().includes(lowercaseQuery),
    )
  }

  clearAllWords(): void {
    this.customWords = []
    this.saveCustomWords()
  }

  exportWords(): string {
    // Convert audioBlob to data URL for export so JSON is portable.
    const exportable = this.customWords.map((w) => {
      const copy: any = { ...w }
      if (w.audioBlob instanceof Blob) {
        try {
          // synchronous conversion isn't possible; create a placeholder string and note
          // callers should use import/export APIs that support async if they need blobs.
          // We'll include a flag and leave audioBlob out to avoid blocking.
          copy.audioBlob = undefined
          copy.audioUrl = w.audioUrl || null
        } catch (e) {
          copy.audioBlob = undefined
        }
      }
      return copy
    })
    return JSON.stringify(exportable, null, 2)
  }

  importWords(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const words = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      if (!Array.isArray(words)) {
        return { success: false, imported: 0, errors: ['Invalid format: expected an array of words'] }
      }

      words.forEach((wordData, index) => {
        try {
          // Validate required fields
          if (!wordData.word || !wordData.definition || !wordData.exampleSentence) {
            errors.push(`Word ${index + 1}: Missing required fields`)
            return
          }

          // Add the word (preserve audioUrl and notes if available)
          this.addWord({
            word: wordData.word,
            definition: wordData.definition,
            exampleSentence: wordData.exampleSentence,
            blankPosition: wordData.blankPosition || 0,
            difficulty: wordData.difficulty || 'intermediate',
            category: wordData.category || 'daily',
            partOfSpeech: wordData.partOfSpeech || 'noun',
            audioUrl: wordData.audioUrl,
            notes: wordData.notes,
          })
          imported++
        } catch (error) {
          errors.push(`Word ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      return { success: imported > 0, imported, errors }
    } catch (error) {
      return { success: false, imported: 0, errors: ['Invalid JSON format'] }
    }
  }
}
