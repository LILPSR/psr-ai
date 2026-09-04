"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/chat/sidebar"
import { Navbar } from "@/components/chat/navbar"
import { ChatArea, Message, Attachment } from "@/components/chat/chat-area"
import {
  RoutingVisualization,
  RoutingStep,
} from "@/components/chat/routing-visualization"
import { CompareMode } from "@/components/compare-mode"
import { SettingsPanel } from "@/components/settings-panel"
import { CommandPalette } from "@/components/command-palette"
import { ModelDisplayPanel } from "@/components/model-display-panel"
import { Menu, X } from "lucide-react"

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [activeTab, setActiveTab] = useState<
    "chat" | "analytics" | "compare" | "settings"
  >("chat")

  type Conversation = {
    id: string
    topic: string
    messages: Message[]
  }

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Derive messages from active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const messages = activeConversation?.messages || []

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("psr_ai_conversations")
      if (saved) {
        setConversations(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load conversations:", e)
    }
  }, [])

  // Save to localStorage whenever conversations change
  useEffect(() => {
    try {
      if (conversations.length > 0) {
        localStorage.setItem("psr_ai_conversations", JSON.stringify(conversations))
      }
    } catch (e) {
      console.error("Failed to save conversations:", e)
    }
  }, [conversations])
  const [isLoading, setIsLoading] = useState(false)

  const [routingStatus, setRoutingStatus] = useState<
    "idle" | "analyzing" | "routing" | "complete"
  >("idle")

  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [isRouting, setIsRouting] = useState(false)
  const [currentRoutingStep, setCurrentRoutingStep] = useState(0)

  const [routingSteps, setRoutingSteps] = useState<RoutingStep[]>([
    {
      id: "1",
      label: "Analyzing prompt...",
      status: "pending",
    },
    {
      id: "2",
      label: "Classifying intent...",
      status: "pending",
    },
    {
      id: "3",
      label: "Selecting optimal model...",
      status: "pending",
    },
    {
      id: "4",
      label: "Verifying answer...",
      status: "pending",
    },
  ])

  // ============================================================
  // REAL AI ROUTER
  // ============================================================

  const handleSend = useCallback(async (content: string, attachment?: Attachment) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachment,
    }

    setIsLoading(true)
    setIsRouting(true)
    setRoutingStatus("analyzing")
    setCurrentRoutingStep(0)
    setSelectedModel(null)

    setRoutingSteps([
      {
        id: "1",
        label: "Analyzing topic...",
        status: "active",
      },
      {
        id: "2",
        label: "Classifying intent...",
        status: "pending",
      },
      {
        id: "3",
        label: "Selecting optimal model...",
        status: "pending",
      },
      {
        id: "4",
        label: "Verifying answer...",
        status: "pending",
      },
    ])

    try {
      // 1. Topic Matching
      const topicRes = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          topics: conversations.map(c => ({ id: c.id, topic: c.topic }))
        })
      })

      const topicData = await topicRes.json()

      let targetConversationId = activeConversationId

      if (topicData.match) {
        targetConversationId = topicData.match
      } else if (topicData.topicName) {
        const newId = Date.now().toString()
        targetConversationId = newId
        setConversations(prev => [...prev, { id: newId, topic: topicData.topicName, messages: [] }])
      } else if (!targetConversationId) {
         // Fallback if the AI fails
         const newId = Date.now().toString()
         targetConversationId = newId
         setConversations(prev => [...prev, { id: newId, topic: "New Conversation", messages: [] }])
      }

      setActiveConversationId(targetConversationId)

      // Helper to add messages safely by target ID since state updates might be queued
      const addMessageToTarget = (msg: Message, targetId: string) => {
        setConversations((prev) => {
          const active = prev.find((c) => c.id === targetId)
          if (active) {
            return prev.map((c) => (c.id === targetId ? { ...c, messages: [...c.messages, msg] } : c))
          }
          // if not found (shouldn't happen due to above logic), add it
           return [...prev, { id: targetId, topic: "New Conversation", messages: [msg] }]
        })
      }

      addMessageToTarget(userMessage, targetConversationId as string)

      // Build history for the chat API
      // Since we just dispatched a state update for userMessage, we construct the history array manually here
      const targetConv = conversations.find(c => c.id === targetConversationId)
      const messageHistory = targetConv ? targetConv.messages.map(m => ({
        role: m.role,
        content: m.content
      })) : []
      // We don't push the current userMessage to messageHistory because the chat route expects just the past history

      // --------------------------------------------------------
      // Call the REAL backend
      // --------------------------------------------------------

      setRoutingSteps(prev => [
        { ...prev[0], label: "Topic matched", status: "complete" },
        { ...prev[1], status: "active" },
        prev[2],
        prev[3]
      ])

      setCurrentRoutingStep(1)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          attachment: attachment,
          history: messageHistory
        }),
      })

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}`,
        )
      }

      const data = await response.json()

      // --------------------------------------------------------
      // Update routing visualization
      // --------------------------------------------------------

      setRoutingStatus("routing")
      setCurrentRoutingStep(1)

      setRoutingSteps([
        {
          id: "1",
          label: "Prompt analyzed",
          status: "complete",
        },
        {
          id: "2",
          label: `${data.task_type || "Task"} identified`,
          status: "complete",
        },
        {
          id: "3",
          label: `${data.selected_model || "AI model"} selected`,
          status: "complete",
        },
        {
          id: "4",
          label: data.verification?.performed
            ? data.verification?.passed
              ? "Answer verified"
              : "Verification failed"
            : "Answer generated",
          status: "complete",
        },
      ])

      setCurrentRoutingStep(4)
      setRoutingStatus("complete")

      // --------------------------------------------------------
      // Show the REAL selected model
      // --------------------------------------------------------

      setSelectedModel(data.selected_model || "AI Model")

      // --------------------------------------------------------
      // Handle clarification responses
      // --------------------------------------------------------

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.answer ||
          "I wasn't able to generate an answer.",
        model: data.selected_model || "PSR AI",
        timestamp: new Date(),
      }

      addMessageToTarget(assistantMessage, targetConversationId as string)
    } catch (error) {
      console.error("PSR AI request failed:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, something went wrong while processing your request. Please try again.",
        model: "PSR AI",
        timestamp: new Date(),
      }

      // If it failed before targetConversationId was set, we might have an issue. Fallback to activeConversationId
      setConversations((prev) => {
          const target = activeConversationId || (prev.length > 0 ? prev[prev.length - 1].id : null)
          if (target) {
            return prev.map((c) => (c.id === target ? { ...c, messages: [...c.messages, errorMessage] } : c))
          }
          return prev
      })

      setRoutingStatus("idle")
    } finally {
      setIsLoading(false)

      setTimeout(() => {
        setIsRouting(false)
      }, 800)
    }
  }, [activeConversationId, conversations])

  // ============================================================
  // NEW CHAT
  // ============================================================

  const handleNewChat = () => {
    setActiveConversationId(null)
    setSelectedModel(null)
    setRoutingStatus("idle")
    setIsRouting(false)
    setCurrentRoutingStep(0)

    setRoutingSteps([
      {
        id: "1",
        label: "Analyzing prompt...",
        status: "pending",
      },
      {
        id: "2",
        label: "Classifying intent...",
        status: "pending",
      },
      {
        id: "3",
        label: "Selecting optimal model...",
        status: "pending",
      },
      {
        id: "4",
        label: "Verifying answer...",
        status: "pending",
      },
    ])
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleTabChange = (
    tab: "chat" | "analytics" | "compare" | "settings",
  ) => {
    if (tab === "analytics") {
      window.location.href = "/analytics"
      return
    }

    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Command Palette */}
      <CommandPalette />

      {/* Model Display Panel */}
      <AnimatePresence>
        {selectedModel &&
          !isRouting &&
          messages.length > 0 && (
            <ModelDisplayPanel
              model={selectedModel}
              isVisible={true}
            />
          )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 z-50 md:hidden"
        initial={{ x: "-100%" }}
        animate={{
          x: mobileMenuOpen ? 0 : "-100%",
        }}
        transition={{
          type: "spring",
          damping: 20,
        }}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNewChat={handleNewChat}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <Navbar
          routingStatus={routingStatus}
          selectedModel={selectedModel}
        />

        {/* Mobile Menu Button */}
        <button
          className="md:hidden absolute top-4 left-4 z-30 p-2 rounded-lg hover:bg-secondary/50"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {activeTab === "chat" && (
            <>
              <RoutingVisualization
                isActive={isRouting}
                currentStep={currentRoutingStep}
                selectedModel={selectedModel}
                steps={routingSteps}
              />

              <ChatArea
                messages={messages}
                isLoading={isLoading}
                onSend={handleSend}
              />
            </>
          )}

          {activeTab === "compare" && (
            <CompareMode />
          )}

          {activeTab === "settings" && (
            <SettingsPanel />
          )}
        </div>
      </div>
    </div>
  )
}