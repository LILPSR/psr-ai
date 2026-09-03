"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Mic, MicOff } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
  timestamp: Date
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSend: (message: string) => void
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const isVoiceModeRef = useRef(isVoiceMode)

  useEffect(() => {
      isVoiceModeRef.current = isVoiceMode
  }, [isVoiceMode])

  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isSpeakingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setInput(currentTranscript)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, []) // Initialize only once

  // Handle sending transcript
  useEffect(() => {
     if (isVoiceMode && !isListening && input.trim() && !isLoading && !isSpeakingRef.current) {
         // If we stopped listening, have input, and are not loading/speaking, send the message
         onSend(input.trim())
         setInput("")
     } else if (isVoiceMode && !isListening && !isLoading && !isSpeakingRef.current) {
         // Auto restart listening if voice mode is on and we shouldn't be paused
          try {
              recognitionRef.current?.start()
          } catch (_e) {
              // already started
          }
     }
  }, [isListening, isVoiceMode, input, isLoading, onSend])

  // Keep track of messages that have already been read to avoid reading old messages when voice mode is toggled on,
  // or reading the same message multiple times.
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set())

  // Text to Speech
  useEffect(() => {
    if (isVoiceMode && messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1]
      // Only read if it's an assistant message, we're not currently loading (to avoid reading chunks if streaming),
      // and we haven't read this message ID yet.
      if (lastMessage.role === "assistant" && !readMessages.has(lastMessage.id)) {
        isSpeakingRef.current = true
        // Stop listening while speaking
        try {
            recognitionRef.current?.stop()
        } catch(_e) {}

        const utterance = new SpeechSynthesisUtterance(lastMessage.content)
        utterance.onend = () => {
          isSpeakingRef.current = false
          // Mark as read
          setReadMessages(prev => new Set(prev).add(lastMessage.id))

          // Restart listening after speaking
          if (isVoiceModeRef.current) {
              try {
                  recognitionRef.current?.start()
              } catch(_e) {}
          }
        }
        window.speechSynthesis.speak(utterance)
      }
    }

    return () => {
        // We do not cancel speech synthesis on unmount because we want the utterance to finish reading
        // even if the effect re-runs, to prevent stuttering. We rely on the utterance `onend` to clean up state.
        // If we cancel here, streaming updates or rapid re-renders will chop off the speech.
    }
  }, [messages, isVoiceMode, isLoading, readMessages])

  // Cancel speech if voice mode is turned off
  useEffect(() => {
    if (!isVoiceMode) {
        window.speechSynthesis.cancel()
        isSpeakingRef.current = false
    }
  }, [isVoiceMode])

  const toggleVoiceMode = () => {
    setIsVoiceMode((prev) => {
        if (!prev) {
            // Turning on
            setInput("") // Clear previous input
        } else {
            // Turning off
            try {
                recognitionRef.current?.stop()
            } catch(_e) {}
        }
        return !prev
    })
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input.trim())
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
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
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="w-full px-5 py-4 pr-24 rounded-2xl glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all text-foreground placeholder:text-muted-foreground"
              style={{ maxHeight: "200px" }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <motion.button
                type="button"
                onClick={toggleVoiceMode}
                className={`p-2.5 rounded-xl transition-colors ${
                  isVoiceMode
                    ? isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-primary text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Voice Mode"
              >
                {isVoiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </motion.button>
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed"
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
