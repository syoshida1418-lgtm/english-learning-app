export interface VocabularyWord {
  id: string
  word: string
  definition: string
  exampleSentence: string
  blankPosition: number // Position of the word in the sentence (0-based index)
  difficulty: "beginner" | "intermediate" | "advanced"
  category: "business" | "travel" | "daily" | "academic"
  audioUrl?: string
  partOfSpeech: string
}

export const toeicVocabulary: VocabularyWord[] = [
  {
    id: "1",
    word: "accomplish",
    definition: "to complete or achieve something successfully",
    exampleSentence: "We need to accomplish this project by the end of the month.",
    blankPosition: 3,
    difficulty: "intermediate",
    category: "business",
    partOfSpeech: "verb",
  },
  {
    id: "2",
    word: "accommodate",
    definition: "to provide space or facilities for someone or something",
    exampleSentence: "The hotel can accommodate up to 200 guests.",
    blankPosition: 4,
    difficulty: "intermediate",
    category: "travel",
    partOfSpeech: "verb",
  },
  {
    id: "3",
    word: "acquire",
    definition: "to obtain or get something",
    exampleSentence: "The company plans to acquire new technology this year.",
    blankPosition: 5,
    difficulty: "advanced",
    category: "business",
    partOfSpeech: "verb",
  },
  {
    id: "4",
    word: "adequate",
    definition: "sufficient or satisfactory",
    exampleSentence: "We need adequate funding for this research project.",
    blankPosition: 2,
    difficulty: "intermediate",
    category: "academic",
    partOfSpeech: "adjective",
  },
  {
    id: "5",
    word: "adjacent",
    definition: "next to or adjoining something",
    exampleSentence: "The parking lot is adjacent to the main building.",
    blankPosition: 4,
    difficulty: "advanced",
    category: "daily",
    partOfSpeech: "adjective",
  },
  {
    id: "6",
    word: "agenda",
    definition: "a list of items to be discussed at a meeting",
    exampleSentence: "Please review the agenda before tomorrow's meeting.",
    blankPosition: 3,
    difficulty: "intermediate",
    category: "business",
    partOfSpeech: "noun",
  },
  {
    id: "7",
    word: "allocate",
    definition: "to distribute or assign resources",
    exampleSentence: "We need to allocate more budget to marketing.",
    blankPosition: 3,
    difficulty: "advanced",
    category: "business",
    partOfSpeech: "verb",
  },
  {
    id: "8",
    word: "anticipate",
    definition: "to expect or predict something",
    exampleSentence: "We anticipate a 20% increase in sales next quarter.",
    blankPosition: 1,
    difficulty: "intermediate",
    category: "business",
    partOfSpeech: "verb",
  },
  {
    id: "9",
    word: "appreciate",
    definition: "to recognize the value or significance of something",
    exampleSentence: "I really appreciate your help with this project.",
    blankPosition: 2,
    difficulty: "beginner",
    category: "daily",
    partOfSpeech: "verb",
  },
  {
    id: "10",
    word: "appropriate",
    definition: "suitable or proper for a particular situation",
    exampleSentence: "Please wear appropriate attire for the business meeting.",
    blankPosition: 2,
    difficulty: "intermediate",
    category: "business",
    partOfSpeech: "adjective",
  },
]

export function getRandomWords(count = 5): VocabularyWord[] {
  // Include custom words from CustomVocabularyManager
  let pool: VocabularyWord[] = [...toeicVocabulary]
  try {
    // Use dynamic import to avoid SSR issues and satisfy lint rules
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import('./custom-vocabulary').then(({ CustomVocabularyManager }) => {
        const manager = CustomVocabularyManager.getInstance()
        const custom = manager.getCustomWords() as VocabularyWord[]
        pool = pool.concat(custom)
      })
    }
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e
  ) {
    // ignore in non-browser contexts
  }
  

  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function getWordsByDifficulty(difficulty: VocabularyWord["difficulty"]): VocabularyWord[] {
  let pool: VocabularyWord[] = [...toeicVocabulary]
  try {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import('./custom-vocabulary').then(({ CustomVocabularyManager }) => {
        const manager = CustomVocabularyManager.getInstance()
        pool = pool.concat(manager.getCustomWords() as VocabularyWord[])
      })
    }
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e
  ) {}
  return pool.filter((word) => word.difficulty === difficulty)
}

export function getWordsByCategory(category: VocabularyWord["category"]): VocabularyWord[] {
  let pool: VocabularyWord[] = [...toeicVocabulary]
  try {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import('./custom-vocabulary').then(({ CustomVocabularyManager }) => {
        const manager = CustomVocabularyManager.getInstance()
        pool = pool.concat(manager.getCustomWords() as VocabularyWord[])
      })
    }
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e
  ) {}
  return pool.filter((word) => word.category === category)
}
