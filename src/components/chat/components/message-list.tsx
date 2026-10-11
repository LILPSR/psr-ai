import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, User, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Message } from "../chat-area"

interface MessageListProps {
  messages: Message[]
  modelColors: Record<string, string>
}

export function MessageList({ messages, modelColors }: MessageListProps) {
  return (
    <AnimatePresence mode="popLayout">
      {messages.map((message) => (
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
  )
}
