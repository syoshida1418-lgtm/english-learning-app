// components/manage/word-list.tsx
"use client"

import { useState, useEffect } from "react"  // ← これが必要
import { CustomVocabularyManager, CustomWord } from "@/lib/custom-vocabulary"

interface WordListProps {
  words?: CustomWord[]       // 外部から単語を渡せるように
  onRefresh?: () => void
  showNotes?: boolean        // メモ表示の有無
}

export function WordList({ words, onRefresh, showNotes = true }: WordListProps) {
  const [customWords, setCustomWords] = useState<CustomWord[]>(words || [])

  useEffect(() => {
    if (!words) {
      const manager = CustomVocabularyManager.getInstance()
      setCustomWords(manager.getCustomWords())
    }
  }, [words])

  const handleDelete = (id: string) => {
    const manager = CustomVocabularyManager.getInstance()
    manager.deleteWord(id)
    setCustomWords(manager.getCustomWords())
    onRefresh?.()
  }

  return (
    <div className="space-y-2">
      {customWords.map((word) => (
        <div key={word.id} className="p-2 border rounded">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{word.word}</div>
              <div className="text-sm text-muted-foreground">{word.definition}</div>
              <div className="text-xs text-muted-foreground italic">{word.exampleSentence}</div>
              {showNotes && word.notes && (
                <div className="mt-1 text-xs text-blue-600">Memo: {word.notes}</div>
              )}
            </div>
            <button
              onClick={() => handleDelete(word.id)}
              className="ml-2 text-red-500 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
