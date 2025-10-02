export interface AppData {
  progress: any
  customWords: any[]
  settings: AppSettings
  lastBackup: Date
  version: string
}

export interface AppSettings {
  autoSave: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  soundEnabled: boolean
  speechRate: number
  theme: "light" | "dark" | "system"
  notifications: boolean
}

export class DataManager {
  private static instance: DataManager
  private settings: AppSettings
  private autoSaveInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.settings = this.loadSettings()
    this.initializeAutoSave()
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  private loadSettings(): AppSettings {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appSettings")
      if (saved) {
        return JSON.parse(saved)
      }
    }

    return {
      autoSave: true,
      backupFrequency: "weekly",
      soundEnabled: true,
      speechRate: 0.8,
      theme: "system",
      notifications: true,
    }
  }

  private saveSettings(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("appSettings", JSON.stringify(this.settings))
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings }
  }

  updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates }
    this.saveSettings()

    // Restart auto-save if the setting changed
    if (updates.autoSave !== undefined) {
      this.initializeAutoSave()
    }
  }

  private initializeAutoSave(): void {
    // Clear existing interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }

    // Set up new interval if auto-save is enabled
    if (this.settings.autoSave) {
      // Auto-save every 30 seconds
      this.autoSaveInterval = setInterval(() => {
        this.performAutoSave()
      }, 30000)
    }
  }

  private performAutoSave(): void {
    try {
      // Force save all managers
      const { ProgressManager } = require("./user-progress")
      const { CustomVocabularyManager } = require("./custom-vocabulary")

      const progressManager = ProgressManager.getInstance()
      const customVocabManager = CustomVocabularyManager.getInstance()

      // These managers already save to localStorage, so we just trigger their save methods
      progressManager.saveProgress()
      // CustomVocabularyManager saves automatically on changes

      console.log("[DataManager] Auto-save completed")
    } catch (error) {
      console.error("[DataManager] Auto-save failed:", error)
    }
  }

  exportAllData(): string {
    try {
      const { ProgressManager } = require("./user-progress")
      const { CustomVocabularyManager } = require("./custom-vocabulary")

      const progressManager = ProgressManager.getInstance()
      const customVocabManager = CustomVocabularyManager.getInstance()

      const appData: AppData = {
        progress: progressManager.getProgress(),
        customWords: customVocabManager.getCustomWords(),
        settings: this.settings,
        lastBackup: new Date(),
        version: "1.0.0",
      }

      return JSON.stringify(appData, null, 2)
    } catch (error) {
      throw new Error("Failed to export data: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  importAllData(jsonData: string): { success: boolean; message: string } {
    try {
      const appData: AppData = JSON.parse(jsonData)

      // Validate data structure
      if (!appData.progress || !appData.customWords || !appData.settings) {
        return { success: false, message: "Invalid data format" }
      }

      const { ProgressManager } = require("./user-progress")
      const { CustomVocabularyManager } = require("./custom-vocabulary")

      // Import progress
      const progressManager = ProgressManager.getInstance()
      // We need to manually set the progress since there's no direct import method
      if (typeof window !== "undefined") {
        localStorage.setItem("englishLearningProgress", JSON.stringify(appData.progress))
      }

      // Import custom words
      const customVocabManager = CustomVocabularyManager.getInstance()
      customVocabManager.clearAllWords()
      appData.customWords.forEach((word) => {
        customVocabManager.addWord({
          word: word.word,
          definition: word.definition,
          exampleSentence: word.exampleSentence,
          blankPosition: word.blankPosition,
          difficulty: word.difficulty,
          category: word.category,
          partOfSpeech: word.partOfSpeech,
        })
      })

      // Import settings
      this.updateSettings(appData.settings)

      return {
        success: true,
        message: `Successfully imported data from ${new Date(appData.lastBackup).toLocaleDateString()}`,
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to import data: " + (error instanceof Error ? error.message : "Unknown error"),
      }
    }
  }

  createBackup(): { success: boolean; message: string; data?: string } {
    try {
      const backupData = this.exportAllData()
      const backupInfo = {
        timestamp: new Date().toISOString(),
        size: new Blob([backupData]).size,
      }

      // Store backup info
      if (typeof window !== "undefined") {
        const backups = JSON.parse(localStorage.getItem("backupHistory") || "[]")
        backups.unshift(backupInfo)
        // Keep only last 10 backups
        backups.splice(10)
        localStorage.setItem("backupHistory", JSON.stringify(backups))
      }

      return {
        success: true,
        message: "Backup created successfully",
        data: backupData,
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to create backup: " + (error instanceof Error ? error.message : "Unknown error"),
      }
    }
  }

  getBackupHistory(): Array<{ timestamp: string; size: number }> {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("backupHistory") || "[]")
    }
    return []
  }

  clearAllData(): { success: boolean; message: string } {
    try {
      if (typeof window !== "undefined") {
        // Clear all app-related localStorage
        localStorage.removeItem("englishLearningProgress")
        localStorage.removeItem("customVocabulary")
        localStorage.removeItem("appSettings")
        localStorage.removeItem("backupHistory")
      }

      // Reset managers
      const { ProgressManager } = require("./user-progress")
      const { CustomVocabularyManager } = require("./custom-vocabulary")

      const progressManager = ProgressManager.getInstance()
      const customVocabManager = CustomVocabularyManager.getInstance()

      progressManager.resetProgress()
      customVocabManager.clearAllWords()

      // Reset settings to defaults
      this.settings = {
        autoSave: true,
        backupFrequency: "weekly",
        soundEnabled: true,
        speechRate: 0.8,
        theme: "system",
        notifications: true,
      }
      this.saveSettings()

      return { success: true, message: "All data cleared successfully" }
    } catch (error) {
      return {
        success: false,
        message: "Failed to clear data: " + (error instanceof Error ? error.message : "Unknown error"),
      }
    }
  }

  getStorageUsage(): { used: number; available: number; percentage: number } {
    if (typeof window === "undefined") {
      return { used: 0, available: 0, percentage: 0 }
    }

    try {
      let used = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }

      // Estimate available storage (5MB is typical localStorage limit)
      const available = 5 * 1024 * 1024 // 5MB in bytes
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }
}

// Initialize data manager when module loads
if (typeof window !== "undefined") {
  DataManager.getInstance()
}
