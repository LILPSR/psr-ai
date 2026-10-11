import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void
}

const prompts = [
  "Write a Python function to sort a list",
  "Explain quantum computing simply",
  "Help me brainstorm startup ideas",
  "Debug this React component",
]

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
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
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            className="px-4 py-3 text-left text-sm text-muted-foreground glass rounded-xl hover:border-primary/30 transition-all"
            onClick={() => onPromptClick(prompt)}
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
  )
}
