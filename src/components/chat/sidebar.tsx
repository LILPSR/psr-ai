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

interface ChatHistory {
  id: string
  title: string
  timestamp: string
  model: string
}

const mockHistory: ChatHistory[] = [
  { id: "1", title: "Python optimization help", timestamp: "2 min ago", model: "DeepSeek" },
  { id: "2", title: "Creative story writing", timestamp: "1 hour ago", model: "Claude Sonnet" },
  { id: "3", title: "Data analysis query", timestamp: "3 hours ago", model: "GPT-5" },
  { id: "4", title: "React component design", timestamp: "Yesterday", model: "Claude Sonnet" },
  { id: "5", title: "Research summary", timestamp: "Yesterday", model: "Gemini Pro" },
]

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
      <div className="px-3 space-y-1">
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

      {/* Chat History */}
      {!isCollapsed && activeTab === "chat" && (
        <motion.div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Chats
          </span>
          {mockHistory.map((chat, index) => (
            <motion.div
              key={chat.id}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{chat.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span className="text-xs text-primary">{chat.model}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Bottom User Section */}
      <div className="mt-auto p-3 border-t border-border/50">
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
