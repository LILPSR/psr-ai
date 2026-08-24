"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Zap, Brain, DollarSign, Settings2, Moon, Sun, RotateCcw, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingToggle {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: React.ElementType
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    { id: "speed", label: "Prioritize Speed", description: "Choose faster models when possible", enabled: false, icon: Zap },
    { id: "intelligence", label: "Prioritize Intelligence", description: "Always use the smartest model available", enabled: true, icon: Brain },
    { id: "cost", label: "Prioritize Cost Efficiency", description: "Optimize for lower token usage", enabled: false, icon: DollarSign },
    { id: "auto", label: "Auto Routing", description: "Let PSR AI automatically select models", enabled: true, icon: Settings2 },
  ])

  const [darkMode, setDarkMode] = useState(true)
  const [manualOverride, setManualOverride] = useState<string | null>(null)

  const models = ["GPT-5", "Claude Sonnet", "Gemini Pro", "DeepSeek", "Llama"]

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ))
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure how PSR AI routes your requests
          </p>
        </motion.div>

        {/* Routing Preferences */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Routing Preferences</h2>
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
                  onClick={() => toggleSetting(setting.id)}
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Manual Model Override</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Force all requests to use a specific model
          </p>
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

        {/* Appearance */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                darkMode ? "bg-primary/20" : "bg-secondary"
              )}>
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
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
                darkMode ? "bg-primary" : "bg-secondary"
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

        {/* Actions */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      </div>
    </div>
  )
}
