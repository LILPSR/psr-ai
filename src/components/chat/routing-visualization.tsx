"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Brain, Zap, DollarSign, CheckCircle2 } from "lucide-react"

export interface RoutingStep {
  id: string
  label: string
  status: "pending" | "active" | "complete"
}

interface RoutingVisualizationProps {
  isActive: boolean
  currentStep: number
  selectedModel: string | null
  steps: RoutingStep[]
}

const modelInfo: Record<
  string,
  {
    color: string
    reason: string
    scores: {
      intelligence: number
      speed: number
      cost: number
    }
  }
> = {
  "GPT-5": {
    color: "from-emerald-400 to-teal-500",
    reason: "Best for complex reasoning and multi-step analysis",
    scores: { intelligence: 98, speed: 85, cost: 60 },
  },

  "Claude Sonnet": {
    color: "from-orange-400 to-amber-500",
    reason: "Excellent for coding, writing, and technical tasks",
    scores: { intelligence: 96, speed: 90, cost: 75 },
  },

  "Gemini Pro": {
    color: "from-blue-400 to-indigo-500",
    reason: "Excellent for research, factual and multimodal tasks",
    scores: { intelligence: 94, speed: 92, cost: 80 },
  },

  "DeepSeek": {
    color: "from-cyan-400 to-sky-500",
    reason: "Specialized for code generation and debugging",
    scores: { intelligence: 95, speed: 88, cost: 90 },
  },

  "Llama": {
    color: "from-pink-400 to-rose-500",
    reason: "Fast and effective for creative and general tasks",
    scores: { intelligence: 90, speed: 95, cost: 95 },
  },

  // Current real model names used by the backend
  "openai/gpt-oss-120b": {
    color: "from-emerald-400 to-teal-500",
    reason: "High-capability reasoning and coding model",
    scores: { intelligence: 96, speed: 90, cost: 88 },
  },

  "openai/gpt-oss-20b": {
    color: "from-emerald-400 to-teal-500",
    reason: "Fast reasoning and mathematical problem solving",
    scores: { intelligence: 93, speed: 96, cost: 94 },
  },

  "llama-3.3-70b-versatile": {
    color: "from-pink-400 to-rose-500",
    reason: "Fast general-purpose language model",
    scores: { intelligence: 92, speed: 94, cost: 92 },
  },

  "groq/compound": {
    color: "from-blue-400 to-indigo-500",
    reason: "Tool-enabled model for current information and web research",
    scores: { intelligence: 94, speed: 88, cost: 82 },
  },

  "qwen/qwen3.6-27b": {
    color: "from-cyan-400 to-sky-500",
    reason: "Strong reasoning and coding capabilities",
    scores: { intelligence: 94, speed: 91, cost: 90 },
  },

  "aion-labs/aion-3.0-mini": {
    color: "from-pink-400 to-rose-500",
    reason: "Optimized for creative generation and writing",
    scores: { intelligence: 90, speed: 93, cost: 94 },
  },

  "google/gemma-4-31b-it:free": {
    color: "from-blue-400 to-indigo-500",
    reason: "Multimodal-capable model for image and text tasks",
    scores: { intelligence: 91, speed: 90, cost: 96 },
  },

  "nvidia/nemotron-3-ultra:free": {
    color: "from-purple-400 to-violet-500",
    reason: "Alternative multimodal reasoning model",
    scores: { intelligence: 93, speed: 86, cost: 94 },
  },
}

export function RoutingVisualization({
  isActive,
  currentStep,
  selectedModel,
  steps,
}: RoutingVisualizationProps) {
  const info = selectedModel
    ? modelInfo[selectedModel]
    : null

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-md z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="w-full max-w-sm px-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="text-center mb-7">
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
              >
                <Brain className="w-6 h-6 text-primary" />
              </motion.div>

              <h3 className="text-lg font-semibold text-foreground">
                Choosing the best AI
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                Analyzing your request
              </p>
            </div>

            {/* Routing Steps */}
            <div className="space-y-2.5">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      step.status === "complete"
                        ? "bg-accent/15"
                        : step.status === "active"
                          ? "bg-primary/15"
                          : "bg-secondary/70"
                    }`}
                  >
                    {step.status === "complete" ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : step.status === "active" ? (
                      <motion.div
                        className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>

                  <span
                    className={`text-sm ${
                      step.status === "complete"
                        ? "text-accent"
                        : step.status === "active"
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Selected Model */}
            <AnimatePresence>
              {selectedModel && info && currentStep >= steps.length && (
                <motion.div
                  className="glass rounded-2xl p-5 mt-7"
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center`}
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Selected model
                      </p>

                      <h3 className="text-sm font-semibold text-foreground">
                        {selectedModel}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    {info.reason}
                  </p>

                  {/* Scores */}
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Intelligence",
                        value: info.scores.intelligence,
                        icon: Brain,
                        color: "bg-primary",
                      },
                      {
                        label: "Speed",
                        value: info.scores.speed,
                        icon: Zap,
                        color: "bg-accent",
                      },
                      {
                        label: "Cost Efficiency",
                        value: info.scores.cost,
                        icon: DollarSign,
                        color: "bg-chart-4",
                      },
                    ].map((score) => (
                      <div key={score.label}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <score.icon className="w-3 h-3" />
                            {score.label}
                          </div>

                          <span className="text-foreground font-medium">
                            {score.value}%
                          </span>
                        </div>

                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${score.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${score.value}%`,
                            }}
                            transition={{
                              duration: 0.35,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}