"use client"

import { motion } from "framer-motion"
import { 
  Settings, 
  Bell, 
  Sparkles,
  Activity,
  Circle
} from "lucide-react"

interface NavbarProps {
  routingStatus: "idle" | "analyzing" | "routing" | "complete"
  selectedModel: string | null
}

export function Navbar({ routingStatus, selectedModel }: NavbarProps) {
  const getStatusColor = () => {
    switch (routingStatus) {
      case "analyzing": return "text-yellow-400"
      case "routing": return "text-primary"
      case "complete": return "text-accent"
      default: return "text-muted-foreground"
    }
  }

  const getStatusText = () => {
    switch (routingStatus) {
      case "analyzing": return "Analyzing..."
      case "routing": return "Routing..."
      case "complete": return selectedModel || "Ready"
      default: return "Ready"
    }
  }

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
      {/* Left - Logo (mobile) */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-background" />
        </div>
        <span className="font-semibold text-foreground">PSR AI</span>
      </div>

      {/* Center - Routing Status */}
      <div className="hidden md:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
        <motion.div
          className="flex items-center gap-3 px-4 py-2 rounded-full glass"
          animate={{
            boxShadow: routingStatus !== "idle" 
              ? ["0 0 0px rgba(100,200,255,0)", "0 0 20px rgba(100,200,255,0.3)", "0 0 0px rgba(100,200,255,0)"]
              : "none"
          }}
          transition={{ duration: 1.5, repeat: routingStatus !== "idle" ? Infinity : 0 }}
        >
          <motion.div
            animate={routingStatus !== "idle" ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Activity className={`w-4 h-4 ${getStatusColor()}`} />
          </motion.div>
          <span className="text-sm font-medium text-foreground">{getStatusText()}</span>
          <Circle className={`w-2 h-2 fill-current ${getStatusColor()}`} />
        </motion.div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-background ml-2">
          N
        </div>
      </div>
    </header>
  )
}
