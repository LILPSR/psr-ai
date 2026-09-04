"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Paperclip, X, Image as ImageIcon, Video } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface Attachment {
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
      handleSubmit(e)
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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask anything. PSR AI will automatically route your request to the most suitable AI model.
              </p>
              
              {/* Quick Prompts */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  "Write a Python function to sort a list",
                  "Explain quantum computing simply",
                  "Help me brainstorm startup ideas",
                  "Debug this React component",
                ].map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    className="px-4 py-3 text-left text-sm text-muted-foreground glass rounded-xl hover:border-primary/30 transition-all"
                    onClick={() => setInput(prompt)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {message.role === "assistant" && (
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${modelColors[message.model || "Claude Sonnet"]} flex items-center justify-center shrink-0`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                  {message.role === "assistant" && message.model && (
                    <span className="text-xs text-muted-foreground mb-1.5 block">{message.model}</span>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "glass"
                    }`}
                  >
                    {message.attachment && (
                      <div className="mb-3">
                        {message.attachment.type === "image" ? (
                          <img
                            src={message.attachment.url}
                            alt="Attachment"
                            className="max-h-60 rounded-xl object-contain bg-secondary/20"
                          />
                        ) : (
                          <video
                            src={message.attachment.url}
                            controls
                            className="max-h-60 rounded-xl bg-secondary/20"
                          />
                        )}
                      </div>
                    )}
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-background" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Shimmer */}
          {isLoading && (
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 bg-background/50 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-4 relative inline-block">
              {attachment.type === "image" ? (
                <img src={attachment.url} alt="Attachment" className="max-h-32 rounded-xl object-contain bg-secondary/50" />
              ) : (
                <video src={attachment.url} className="max-h-32 rounded-xl bg-secondary/50" controls />
              )}
              <button
                type="button"
                onClick={clearAttachment}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mb-1 rounded-xl glass border-border/50 hover:bg-secondary/50 transition-colors text-muted-foreground"
              title="Attach image or video"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                className="w-full px-5 py-4 pr-14 rounded-2xl glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all text-foreground placeholder:text-muted-foreground"
                style={{ maxHeight: "200px" }}
              />
              <motion.button
                type="submit"
                disabled={(!input.trim() && !attachment) || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            PSR AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  )
}
