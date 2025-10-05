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
            const parsed: unknown = JSON.parse(ls)
            if (Array.isArray(parsed)) {
              this.customWords = parsed.map((word: unknown) => {
                const obj = word as Partial<CustomWord>
                return {
                  ...(obj as Partial<CustomWord>),
                  createdAt: obj.createdAt ? new Date(obj.createdAt as unknown as string) : new Date(),
                } as CustomWord
              })
          }
        }
      }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _
    ) {
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

    const finishReady = () => {
      if (this.readyResolve) {
        this.readyResolve()
        this.readyResolve = null
      }
      this.readyCallbacks.forEach((cb) => cb())
      this.readyCallbacks = []
    }

    if (!this.store) {
      // No IndexedDB available: fallback to localStorage
      try {
        const saved = localStorage.getItem(STORE_KEY)
        if (saved) {
          const parsed: unknown = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            this.customWords = parsed.map((word: unknown) => {
              const obj = word as Partial<CustomWord>
              return {
                ...(obj as Partial<CustomWord>),
                createdAt: obj.createdAt ? new Date(obj.createdAt as unknown as string) : new Date(),
                audioBlob: (obj as unknown as { audioBlob?: Blob })?.audioBlob ?? null,
              } as CustomWord
            })
          }
        }
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _e
      ) {
        // ignore
      }
      finishReady()
      return
    }

    // Try IndexedDB first
    get(STORE_KEY, this.store)
  .then((saved: unknown) => {
        if (Array.isArray(saved)) {
          this.customWords = saved.map((word: unknown) => {
            const obj = word as Partial<CustomWord>
            return {
              ...(obj as Partial<CustomWord>),
              createdAt: obj.createdAt ? new Date(obj.createdAt as unknown as string) : new Date(),
            } as CustomWord
          })
        }
      })
  .catch((
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _err
  ) => {
        // Fallback to localStorage if IndexedDB read fails
        try {
          const ls = localStorage.getItem(STORE_KEY)
          if (ls) {
            const parsed: unknown = JSON.parse(ls)
            if (Array.isArray(parsed)) {
              this.customWords = parsed.map((word: unknown) => {
                const obj = word as Partial<CustomWord>
                return {
                  ...(obj as Partial<CustomWord>),
                  createdAt: obj.createdAt ? new Date(obj.createdAt as unknown as string) : new Date(),
                } as CustomWord
              })
            }
          }
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _
        ) {
            // ignore
          }
      })
      .finally(() => finishReady())
    
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
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _
        ) {
          // ignore
        }
      })
    } else {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.customWords))
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _
      ) {
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
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _
      ) {
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
    // For portability, omit Blob data (audioBlob) from exported JSON and keep audioUrl
    const exportable = this.customWords.map((w) => {
      // Create a portable copy and remove Blob data
      const copy = JSON.parse(JSON.stringify(w)) as Record<string, unknown>
      if (copy && typeof copy === 'object') {
        // remove Blob data for portability without using `any`
        delete (copy as Record<string, unknown>)['audioBlob']
      }
      copy.audioUrl = w.audioUrl || null
      return copy
    })
    return JSON.stringify(exportable, null, 2)
  }

  importWords(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const parsed: unknown = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      if (!Array.isArray(parsed)) {
        return { success: false, imported: 0, errors: ['Invalid format: expected an array of words'] }
      }

      parsed.forEach((wordData, index) => {
        try {
          if (typeof wordData !== 'object' || wordData === null) {
            errors.push(`Word ${index + 1}: Invalid entry`) 
            return
          }
          const wd = wordData as Record<string, unknown>

          const word = wd['word']
          const definition = wd['definition']
          const exampleSentence = wd['exampleSentence']

          // Validate required fields
          if (typeof word !== 'string' || typeof definition !== 'string' || typeof exampleSentence !== 'string') {
            errors.push(`Word ${index + 1}: Missing or invalid required fields`)
            return
          }

          // Helper to read optional string fields
          const readString = (key: string, fallback?: string) => {
            const v = wd[key]
            return typeof v === 'string' ? v : fallback
          }

          // Add the word (preserve audioUrl and notes if available)
          const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
          const CATEGORIES = ['business', 'travel', 'daily', 'academic'] as const
          type Difficulty = typeof DIFFICULTIES[number]
          type Category = typeof CATEGORIES[number]

          const difficultyRaw = readString('difficulty', 'intermediate')
          const difficulty = (DIFFICULTIES.includes(difficultyRaw as Difficulty) ? (difficultyRaw as Difficulty) : 'intermediate') as Difficulty

          const categoryRaw = readString('category', 'daily')
          const category = (CATEGORIES.includes(categoryRaw as Category) ? (categoryRaw as Category) : 'daily') as Category

          this.addWord({
            word: word,
            definition: definition,
            exampleSentence: exampleSentence,
            blankPosition: typeof wd['blankPosition'] === 'number' ? (wd['blankPosition'] as number) : 0,
            difficulty: difficulty,
            category: category,
            partOfSpeech: readString('partOfSpeech', 'noun') as string,
            audioUrl: readString('audioUrl', undefined),
            notes: readString('notes', undefined),
          })
          imported++
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _err
        ) {
          errors.push(`Word ${index + 1}: Unknown error`)
        }
      })

      return { success: imported > 0, imported, errors }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _err
    ) {
      return { success: false, imported: 0, errors: ['Invalid JSON format'] }
    }
  }
}
