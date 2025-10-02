"use client"

import { useState } from "react"
import { CustomVocabularyManager } from "@/lib/custom-vocabulary"
import { Button } from "@/components/ui/button"

interface AddWordFormProps {
  onWordAdded: () => void
}

export function AddWordForm({ onWordAdded }: AddWordFormProps) {
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [exampleSentence, setExampleSentence] = useState("")
  const [notes, setNotes] = useState("") // 新しく追加
  const [isRecording, setIsRecording] = useState(false)
  const [recorderSupported, setRecorderSupported] = useState(true)
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined)
  const mediaChunksRef = useState<any[]>([])[0]
  let mediaRecorder: MediaRecorder | null = null

  // Initialize support
  if (typeof window !== "undefined" && !("MediaRecorder" in window)) {
    // Not supported
    if (recorderSupported) setRecorderSupported(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      mediaChunksRef.length = 0

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) mediaChunksRef.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(mediaChunksRef, { type: "audio/webm" })
        // store raw blob for durable offline storage
        setAudioBlob(blob)

        // prefer object URL for preview (faster, less memory)
        try {
          const url = URL.createObjectURL(blob)
          setAudioDataUrl(url)
        } catch (e) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAudioDataUrl(reader.result as string)
          }
          reader.readAsDataURL(blob)
        }

        // stop all tracks
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Recording start failed:", error)
      setRecorderSupported(false)
    }
  }

  const stopRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop()
      }
    } catch (error) {
      console.error("Error stopping recorder:", error)
    }
    setIsRecording(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!word || !definition || !exampleSentence) return

    const manager = CustomVocabularyManager.getInstance()
    manager.addWord({
      word,
      definition,
      exampleSentence,
      notes, // ここにメモも保存
      audioBlob: audioBlob,
      blankPosition: 0,
      difficulty: "intermediate",
      category: "daily",
      partOfSpeech: "noun",
    })

    setWord("")
    setDefinition("")
    setExampleSentence("")
    setNotes("")
    onWordAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Word</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Definition</label>
        <input
          type="text"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Example Sentence</label>
        <input
          type="text"
          value={exampleSentence}
          onChange={(e) => setExampleSentence(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Memo (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Pronunciation (recorded)</label>
        <div className="mt-1 flex items-center gap-2">
          {recorderSupported ? (
            <>
              <Button type="button" onClick={isRecording ? stopRecording : startRecording} className="mr-2">
                {isRecording ? "Stop" : "Record"}
              </Button>
              {audioDataUrl ? (
                <audio src={audioDataUrl} controls className="max-w-xs" />
              ) : (
                <div className="text-sm text-muted-foreground">No recording yet</div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Recording not supported in this browser</div>
          )}
        </div>
      </div>
      <Button type="submit">Add Word</Button>
    </form>
  )
}
