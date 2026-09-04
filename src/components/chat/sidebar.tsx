"use client"

import { motion } from "framer-motion"
import { 
  Plus, 
  MessageSquare, 
  BarChart3, 
  GitCompare, 
  Settings,
  ChevronLeft,
  Trash2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  activeTab: "chat" | "analytics" | "compare" | "settings"
  onTabChange: (tab: "chat" | "analytics" | "compare" | "settings") => void
  onNewChat: () => void
}

export function Sidebar({ isCollapsed, onToggle, activeTab, onTabChange, onNewChat }: SidebarProps) {
  const tabs = [
    { id: "chat" as const, icon: MessageSquare, label: "Chats" },
    { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
    { id: "compare" as const, icon: GitCompare, label: "Compare" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ]

  return (
    <motion.aside
      className={cn(
        "h-full flex flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 288 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-foreground">PSR AI</span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all",
            isCollapsed && "justify-center px-3"
          )}
        >
          <Plus className="w-5 h-5 text-primary" />
          {!isCollapsed && <span className="font-medium text-foreground">New Chat</span>}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-3 space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
              activeTab === tab.id
                ? "bg-secondary/80 text-foreground"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              isCollapsed && "justify-center px-3"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Bottom User Section */}
      <div className="p-3 border-t border-border/50">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-background">
            N
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">PSR User</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
