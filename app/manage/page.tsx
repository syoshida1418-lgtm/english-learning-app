"use client"

import { useState, useEffect, useCallback } from "react"
import { AddWordForm } from "@/components/manage/add-word-form"
import { WordList } from "@/components/manage/word-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, List, Upload, Download } from "lucide-react"
import { CustomVocabularyManager, CustomWord } from "@/lib/custom-vocabulary"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ManagePage() {
  const [mounted, setMounted] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [words, setWords] = useState<CustomWord[]>([])
  const { toast } = useToast()

  const loadWords = useCallback(() => {
    const manager = CustomVocabularyManager.getInstance()
    setWords(manager.getCustomWords())
  }, [])

  const updateWordCount = useCallback(() => {
    const manager = CustomVocabularyManager.getInstance()
    setWordCount(manager.getCustomWords().length)
    loadWords()
  }, [loadWords])

  useEffect(() => {
    setMounted(true)
    const manager = CustomVocabularyManager.getInstance()
    manager.ready().then(() => {
      updateWordCount()
      loadWords()
    })
  }, [updateWordCount, loadWords])

  const handleExport = () => {
    const manager = CustomVocabularyManager.getInstance()
    const exportData = manager.exportWords()
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `custom-vocabulary-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: "Export Successful", description: "Vocabulary exported as JSON." })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string
          const manager = CustomVocabularyManager.getInstance()
          const result = manager.importWords(jsonData)
          if (result.success) {
            toast({ title: "Import Successful", description: `Imported ${result.imported} words.` })
            updateWordCount()
          } else {
            toast({ title: "Import Failed", description: result.errors.join(", "), variant: "destructive" })
          }
        } catch {
          toast({ title: "Import Error", description: "Failed to read the file.", variant: "destructive" })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (!mounted) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2" disabled={wordCount === 0}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport} className="gap-2">
              <Upload className="w-4 h-4" /> Import
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Custom Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{wordCount}</div>
                <p className="text-sm text-muted-foreground">Custom Words</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="gap-2">
              <Plus className="w-4 h-4" /> Add Words
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <List className="w-4 h-4" /> Manage Words ({wordCount})
            </TabsTrigger>
          </TabsList>

          {/* Add Words Tab */}
          <TabsContent value="add">
            <AddWordForm onWordAdded={updateWordCount} />
          </TabsContent>

          {/* Manage Words Tab */}
          <TabsContent value="manage">
            <WordList words={words} showNotes={true} /> {/* メモ欄表示 */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
