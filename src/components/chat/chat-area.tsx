"use client"

import { useState, useRef, useEffect } from "react"
import { EmptyState } from "./components/empty-state"
import { MessageList } from "./components/message-list"
import { LoadingShimmer } from "./components/loading-shimmer"
import { InputArea } from "./components/input-area"

export interface Attachment {
  file?: File
  type: "image" | "video"
  url: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
  timestamp: Date
  attachment?: Attachment
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSend: (message: string, attachment?: Attachment) => void
}

const modelColors: Record<string, string> = {
  "GPT-5": "from-emerald-400 to-teal-500",
  "Claude Sonnet": "from-orange-400 to-amber-500",
  "Gemini Pro": "from-blue-400 to-indigo-500",
  "DeepSeek": "from-cyan-400 to-sky-500",
  "Llama": "from-pink-400 to-rose-500",
}

export function ChatArea({ messages, isLoading, onSend }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const clearAttachment = () => {
    if (attachment?.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url)
    }
    setAttachment(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || attachment) && !isLoading) {
      onSend(input.trim(), attachment || undefined)
      setInput("")
      setAttachment(null) // Do NOT revoke here since it needs to display in the chat history
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const type = file.type.startsWith("video/") ? "video" : "image"

    if (attachment?.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url)
    }

    const objectUrl = URL.createObjectURL(file)
    setAttachment({
      type,
      url: objectUrl,

      file,

    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    // Cleanup any lingering attachment preview on unmount if it wasn't sent
    return () => {
      if (attachment?.url.startsWith("blob:")) {
        URL.revokeObjectURL(attachment.url)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <EmptyState onPromptClick={setInput} />
          )}

          <MessageList messages={messages} modelColors={modelColors} />

          {/* Loading Shimmer */}
          {isLoading && (
            <LoadingShimmer />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <InputArea
        input={input}
        attachment={attachment}
        isLoading={isLoading}
        fileInputRef={fileInputRef}
        textareaRef={textareaRef}
        onInputChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
        onClearAttachment={clearAttachment}
      />
    </div>
  )
}
