"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Brain, Trophy, Send, Sparkles } from "lucide-react"

const models = [
  { name: "GPT-5", color: "from-emerald-400 to-teal-500" },
  { name: "Claude Sonnet", color: "from-orange-400 to-amber-500" },
  { name: "Gemini Pro", color: "from-blue-400 to-indigo-500" },
]

const mockComparisons = {
  "Write a haiku about AI": [
    {
      model: "GPT-5",
      response: `*Silicon dreams flow*
*Through circuits of endless thought*
*Wisdom born from code*`,
      scores: { quality: 92, speed: 0.8, creativity: 88 }
    },
    {
      model: "Claude Sonnet",
      response: `*Patterns interweave*
*Learning from humanity*
*New minds come alive*`,
      scores: { quality: 95, speed: 0.6, creativity: 94 }
    },
    {
      model: "Gemini Pro",
      response: `*Data streams converge*
*Intelligence emerges*
*Future dawns in code*`,
      scores: { quality: 90, speed: 0.5, creativity: 86 }
    }
  ]
}

export function CompareMode() {
  const [prompt, setPrompt] = useState("")
  const [isComparing, setIsComparing] = useState(false)
  const [results, setResults] = useState<typeof mockComparisons["Write a haiku about AI"] | null>(null)
  const [winner, setWinner] = useState<string | null>(null)

  const handleCompare = async () => {
    if (!prompt.trim()) return
    
    setIsComparing(true)
    setResults(null)
    setWinner(null)
    
    const comparison = mockComparisons["Write a haiku about AI"]
    setResults(comparison)
    
    // Determine winner
    const best = comparison.reduce((a, b) => 
      a.scores.quality > b.scores.quality ? a : b
    )
    
    setWinner(best.model)
    
    setIsComparing(false)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Models</h1>
          <p className="text-muted-foreground">
            See how different AI models respond to the same prompt
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to compare across models..."
              className="w-full px-5 py-4 pr-14 rounded-2xl glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all text-foreground placeholder:text-muted-foreground h-24"
            />
            <motion.button
              onClick={handleCompare}
              disabled={!prompt.trim() || isComparing}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-primary text-background disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isComparing && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">Running comparison across 3 models...</p>
          </motion.div>
        )}

        {/* Results Grid */}
        {results && (
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {results.map((result, index) => {
              const model = models.find(m => m.name === result.model)
              const isWinner = winner === result.model
              
              return (
                <motion.div
                  key={result.model}
                  className={`glass rounded-2xl p-6 relative overflow-hidden ${isWinner ? "ring-2 ring-accent glow-border" : ""}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  {/* Winner Badge */}
                  {isWinner && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <div className="bg-accent text-background px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold">Winner</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Model Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${model?.color} flex items-center justify-center`}>
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{result.model}</h3>
                      <p className="text-xs text-muted-foreground">{result.scores.speed}s response</p>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="bg-secondary/30 rounded-xl p-4 mb-4 min-h-[120px]">
                    <p className="text-sm text-foreground whitespace-pre-line">{result.response}</p>
                  </div>

                  {/* Scores */}
                  <div className="space-y-3">
                    {[
                      { label: "Quality", value: result.scores.quality, icon: Brain },
                      { label: "Creativity", value: result.scores.creativity, icon: Sparkles },
                    ].map((score) => (
                      <div key={score.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <score.icon className="w-3 h-3" />
                            {score.label}
                          </div>
                          <span className="font-medium text-foreground">{score.value}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${score.value}%` }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!results && !isComparing && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Compare</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a prompt above to see how GPT-5, Claude Sonnet, and Gemini Pro respond differently.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
