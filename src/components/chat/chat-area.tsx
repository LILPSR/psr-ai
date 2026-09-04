"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Paperclip, X, FileIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface Attachment {
  id: string
  url: string
  type: "image" | "video" | "file"
  name?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
  timestamp: Date
  attachments?: Attachment[]
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSend: (message: string, files: File[]) => void
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
  const [files, setFiles] = useState<{file: File, previewUrl: string}[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || files.length > 0) && !isLoading) {
      onSend(input.trim(), files.map(f => f.file))
      setInput("")
      setFiles([])
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].previewUrl)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

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
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="relative rounded-lg overflow-hidden border border-border/50 bg-background/50 max-w-[200px]">
                            {attachment.type === "image" ? (
                              <img src={attachment.url} alt={attachment.name || "attachment"} className="w-full object-contain max-h-48" />
                            ) : attachment.type === "video" ? (
                              <video src={attachment.url} controls className="w-full object-contain max-h-48" />
                            ) : (
                              <div className="flex items-center p-3 text-sm">
                                <FileIcon className="w-4 h-4 mr-2" />
                                <span className="truncate">{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
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
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((fileObj, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border/50 bg-background/80 w-20 h-20 flex items-center justify-center">
                  {fileObj.file.type.startsWith('image/') ? (
                    <img src={fileObj.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : fileObj.file.type.startsWith('video/') ? (
                    <video src={fileObj.previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-muted-foreground">
                       <FileIcon className="w-6 h-6 mb-1" />
                       <span className="text-[10px] truncate w-full text-center">{fileObj.file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mb-[2px] rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors shrink-0"
              disabled={isLoading}
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
                disabled={(!input.trim() && files.length === 0) || isLoading}
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
