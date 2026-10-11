import { motion } from "framer-motion"
import { Send, Paperclip, X } from "lucide-react"
import { RefObject } from "react"
import { Attachment } from "../chat-area"

interface InputAreaProps {
  input: string
  attachment: Attachment | null
  isLoading: boolean
  fileInputRef: RefObject<HTMLInputElement>
  textareaRef: RefObject<HTMLTextAreaElement>
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSubmit: (e: React.FormEvent) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearAttachment: () => void
}

export function InputArea({
  input,
  attachment,
  isLoading,
  fileInputRef,
  textareaRef,
  onInputChange,
  onKeyDown,
  onSubmit,
  onFileChange,
  onClearAttachment,
}: InputAreaProps) {
  return (
    <div className="border-t border-border/50 p-4 bg-background/50 backdrop-blur-xl">
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
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
              onClick={onClearAttachment}
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
            onChange={onFileChange}
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
              onChange={onInputChange}
              onKeyDown={onKeyDown}
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
  )
}
