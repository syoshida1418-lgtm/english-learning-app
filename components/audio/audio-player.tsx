"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  text: string
  audioUrl?: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  showText?: boolean
  rate?: number
  pitch?: number
  voice?: "male" | "female" | "auto"
}

export function AudioPlayer({
  text,
  audioUrl,
  className,
  variant = "ghost",
  size = "sm",
  showText = false,
  rate = 0.8,
  pitch = 1,
  voice = "auto",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    if (!("speechSynthesis" in window)) {
      setIsSupported(false)
    }

    return () => {
      try {
        speechSynthesis.cancel()
      } catch (e) {}
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch (e) {}
      }
    }
  }, [])

  const getVoice = () => {
    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) return null

    const englishVoices = voices.filter((v) => v.lang && v.lang.startsWith("en"))

    if (voice === "male") {
      return englishVoices.find((v) => v.name.toLowerCase().includes("male")) || englishVoices[0]
    } else if (voice === "female") {
      return englishVoices.find((v) => v.name.toLowerCase().includes("female")) || englishVoices[0]
    }

    return englishVoices[0] || voices[0]
  }

  const playAudio = async () => {
    if (!isSupported || isPlaying) return
    setIsLoading(true)

    try {
      if (audioUrl && typeof window !== "undefined") {
        // Play provided audio URL (data URL or external)
        const audioEl = audioRef.current || document.createElement("audio")
        audioEl.src = audioUrl
        audioEl.preload = "auto"
        audioEl.onplay = () => {
          setIsPlaying(true)
          setIsLoading(false)
        }
        audioEl.onended = () => setIsPlaying(false)
        audioEl.onerror = () => {
          setIsPlaying(false)
          setIsLoading(false)
        }
        audioRef.current = audioEl
        await audioEl.play()
        return
      }

      // Fallback to speech synthesis
      speechSynthesis.cancel()

      if (speechSynthesis.getVoices().length === 0) {
        await new Promise((resolve) => {
          const check = () => {
            if (speechSynthesis.getVoices().length > 0) resolve(true)
            else setTimeout(check, 100)
          }
          check()
        })
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch

      const v = getVoice()
      if (v) utterance.voice = v

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsLoading(false)
      }
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    } catch (err) {
      console.error("Audio playback failed:", err)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    try {
      speechSynthesis.cancel()
    } catch (e) {}
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch (e) {}
    }
    setIsPlaying(false)
  }

  if (!isSupported) {
    return (
      <Button variant="ghost" size={size} disabled className={cn("gap-2", className)}>
        <VolumeX className="w-4 h-4" />
        {showText && "Audio not supported"}
      </Button>
    )
  }

  return (
    <>
      <audio ref={audioRef} style={{ display: "none" }} />
      <Button
        variant={variant}
        size={size}
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className={cn("w-4 h-4", isPlaying && "text-primary")} />}
        {showText && (isLoading ? "Loading..." : isPlaying ? "Playing..." : "Listen")}
      </Button>
    </>
  )
}
