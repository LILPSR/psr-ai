"use client"

import { useState, useCallback } from "react"
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

  const [messages, setMessages] = useState<Message[]>([])
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

    setMessages((prev) => [...prev, userMessage])

    setIsLoading(true)
    setIsRouting(true)
    setRoutingStatus("analyzing")
    setCurrentRoutingStep(0)
    setSelectedModel(null)

    setRoutingSteps([
      {
        id: "1",
        label: "Analyzing prompt...",
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
      // --------------------------------------------------------
      // Call the REAL backend
      // --------------------------------------------------------

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          attachment: attachment,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}`,
        )
      }

      const data = await response.json()

      console.log("PSR AI backend response:", data)

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

      setMessages((prev) => [...prev, assistantMessage])
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

      setMessages((prev) => [...prev, errorMessage])

      setRoutingStatus("idle")
    } finally {
      setIsLoading(false)

      setTimeout(() => {
        setIsRouting(false)
      }, 800)
    }
  }, [])

  // ============================================================
  // NEW CHAT
  // ============================================================

  const handleNewChat = () => {
    setMessages([])
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