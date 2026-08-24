"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { 
  Zap, Brain, DollarSign, Settings2, Moon, Sun, 
  RotateCcw, Save, ArrowLeft, Sparkles, Bell,
  Shield, Key, Palette, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SettingToggle {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: React.ElementType
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    { id: "speed", label: "Prioritize Speed", description: "Choose faster models when possible", enabled: false, icon: Zap },
    { id: "intelligence", label: "Prioritize Intelligence", description: "Always use the smartest model available", enabled: true, icon: Brain },
    { id: "cost", label: "Prioritize Cost Efficiency", description: "Optimize for lower token usage", enabled: false, icon: DollarSign },
    { id: "auto", label: "Auto Routing", description: "Let PSR AI automatically select models", enabled: true, icon: Settings2 },
  ])

  const [notifications, setNotifications] = useState<SettingToggle[]>([
    { id: "email", label: "Email Notifications", description: "Receive updates via email", enabled: true, icon: Bell },
    { id: "usage", label: "Usage Alerts", description: "Get notified about usage limits", enabled: true, icon: Shield },
  ])

  const [darkMode, setDarkMode] = useState(true)
  const [manualOverride, setManualOverride] = useState<string | null>(null)

  const models = ["GPT-5", "Claude Sonnet", "Gemini Pro", "DeepSeek", "Llama"]

  const toggleSetting = (id: string, settingsArray: SettingToggle[], setSettingsArray: React.Dispatch<React.SetStateAction<SettingToggle[]>>) => {
    setSettingsArray(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat" className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold text-foreground">Settings</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Chat
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Routing Preferences */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Routing Preferences</h2>
              <p className="text-sm text-muted-foreground">Configure how PSR AI routes your requests</p>
            </div>
          </div>
          <div className="space-y-3">
            {settings.map((setting, index) => (
              <motion.div
                key={setting.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    setting.enabled ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <setting.icon className={cn(
                      "w-5 h-5",
                      setting.enabled ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id, settings, setSettings)}
                  className={cn(
                    "relative w-12 h-7 rounded-full transition-colors",
                    setting.enabled ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ left: setting.enabled ? 24 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Manual Model Override */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Model Override</h2>
              <p className="text-sm text-muted-foreground">Force all requests to use a specific model</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setManualOverride(null)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                manualOverride === null 
                  ? "bg-primary text-background" 
                  : "glass hover:border-primary/30"
              )}
            >
              Auto (Recommended)
            </button>
            {models.map((model) => (
              <button
                key={model}
                onClick={() => setManualOverride(model)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  manualOverride === model 
                    ? "bg-primary text-background" 
                    : "glass hover:border-primary/30"
                )}
              >
                {model}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            {notifications.map((setting, index) => (
              <motion.div
                key={setting.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    setting.enabled ? "bg-chart-4/20" : "bg-secondary"
                  )}>
                    <setting.icon className={cn(
                      "w-5 h-5",
                      setting.enabled ? "text-chart-4" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id, notifications, setNotifications)}
                  className={cn(
                    "relative w-12 h-7 rounded-full transition-colors",
                    setting.enabled ? "bg-chart-4" : "bg-secondary"
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ left: setting.enabled ? 24 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                darkMode ? "bg-chart-3/20" : "bg-secondary"
              )}>
                {darkMode ? (
                  <Moon className="w-5 h-5 text-chart-3" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                darkMode ? "bg-chart-3" : "bg-secondary"
              )}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ left: darkMode ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.section>

        {/* API Keys */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
              <p className="text-sm text-muted-foreground">Manage your API credentials</p>
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-foreground">PSR AI API Key</p>
                <p className="text-sm text-muted-foreground font-mono">nxai_sk_****************************7f2e</p>
              </div>
              <button className="px-4 py-2 rounded-xl glass hover:border-primary/30 text-sm font-medium transition-all">
                Regenerate
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep your API key secret. Do not share it or expose it in client-side code.
            </p>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-background font-medium hover:opacity-90 transition-opacity">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          <button className="px-6 py-3 rounded-xl glass hover:border-primary/30 transition-all flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </motion.div>
      </main>
    </div>
  )
}
