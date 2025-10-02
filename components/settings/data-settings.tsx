"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Database, Download, Upload, Trash2, Save, HardDrive, Clock, AlertTriangle } from "lucide-react"
import { DataManager, type AppSettings } from "@/lib/data-manager"
import { useToast } from "@/hooks/use-toast"

export function DataSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [storageUsage, setStorageUsage] = useState({ used: 0, available: 0, percentage: 0 })
  const [backupHistory, setBackupHistory] = useState<Array<{ timestamp: string; size: number }>>([])
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    const dataManager = DataManager.getInstance()
    setSettings(dataManager.getSettings())
    setStorageUsage(dataManager.getStorageUsage())
    setBackupHistory(dataManager.getBackupHistory())
  }

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    if (!settings) return

    const dataManager = DataManager.getInstance()
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    dataManager.updateSettings({ [key]: value })

    toast({
      title: "Settings Updated",
      description: `${key} has been updated successfully.`,
    })
  }

  const handleExportData = () => {
    try {
      const dataManager = DataManager.getInstance()
      const exportData = dataManager.exportAllData()

      // Create and download file
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `toeic-master-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your complete app data has been exported.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleImportData = () => {
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
          const dataManager = DataManager.getInstance()
          const result = dataManager.importAllData(jsonData)

          if (result.success) {
            toast({
              title: "Import Successful",
              description: result.message,
            })
            loadData()
            // Refresh the page to reflect imported data
            setTimeout(() => window.location.reload(), 2000)
          } else {
            toast({
              title: "Import Failed",
              description: result.message,
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to read the file. Please check the format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleCreateBackup = () => {
    const dataManager = DataManager.getInstance()
    const result = dataManager.createBackup()

    if (result.success && result.data) {
      // Auto-download the backup
      const blob = new Blob([result.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `toeic-master-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Backup Created",
        description: result.message,
      })
      loadData()
    } else {
      toast({
        title: "Backup Failed",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This action cannot be undone.")) {
      const dataManager = DataManager.getInstance()
      const result = dataManager.clearAllData()

      if (result.success) {
        toast({
          title: "Data Cleared",
          description: result.message,
        })
        loadData()
        // Refresh the page to reflect cleared data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast({
          title: "Clear Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!mounted || !settings) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Auto-Save Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            Auto-Save Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Enable Auto-Save</Label>
              <p className="text-sm text-muted-foreground">Automatically save your progress every 30 seconds</p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Backup Frequency</Label>
            <Select
              value={settings.backupFrequency}
              onValueChange={(value) => handleSettingChange("backupFrequency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Used Storage</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.available)}
              </span>
            </div>
            <Progress value={storageUsage.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {storageUsage.percentage.toFixed(1)}% of available browser storage used
            </p>
          </div>

          {storageUsage.percentage > 80 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Storage is getting full. Consider exporting and clearing old data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
            <Button onClick={handleImportData} variant="outline" className="gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
            <Button onClick={handleCreateBackup} className="gap-2">
              <Save className="w-4 h-4" />
              Create Backup
            </Button>
            <Button onClick={handleClearAllData} variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Backups
            </h4>
            {backupHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups created yet</p>
            ) : (
              <div className="space-y-2">
                {backupHistory.slice(0, 5).map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{new Date(backup.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(backup.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <Badge variant="outline">{formatBytes(backup.size)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
