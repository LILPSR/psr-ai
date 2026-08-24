"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, MessageSquare, BarChart3, Settings, 
  Command, Sparkles, Zap, Moon, Sun
} from "lucide-react"
import { useRouter } from "next/navigation"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  shortcut?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  const commands: CommandItem[] = [
    { id: "chat", label: "New Chat", description: "Start a new conversation", icon: MessageSquare, action: () => router.push("/chat"), shortcut: "N" },
    { id: "analytics", label: "Analytics", description: "View usage analytics", icon: BarChart3, action: () => router.push("/analytics"), shortcut: "A" },
    { id: "settings", label: "Settings", description: "Configure preferences", icon: Settings, action: () => router.push("/settings"), shortcut: "S" },
    { id: "home", label: "Home", description: "Go to homepage", icon: Sparkles, action: () => router.push("/"), shortcut: "H" },
    { id: "speed", label: "Toggle Speed Priority", description: "Prioritize faster responses", icon: Zap, action: () => {}, shortcut: "1" },
    { id: "theme", label: "Toggle Theme", description: "Switch dark/light mode", icon: Moon, action: () => {}, shortcut: "T" },
  ]

  const filteredCommands = commands.filter(
    cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const executeCommand = (command: CommandItem) => {
    command.action()
    setIsOpen(false)
    setSearch("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="glass rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground">ESC</kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((command, index) => (
                    <motion.button
                      key={command.id}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => executeCommand(command)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
                        <command.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{command.label}</p>
                        {command.description && (
                          <p className="text-sm text-muted-foreground">{command.description}</p>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground">
                          {command.shortcut}
                        </kbd>
                      )}
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-secondary rounded">↑↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-secondary rounded">↵</kbd> Select
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3" /> + K to toggle
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
