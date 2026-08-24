"use client"

import { motion } from "framer-motion"
import {
  Brain,
  Zap,
  DollarSign,
  Clock,
  Cpu,
  Target,
} from "lucide-react"

interface ModelDisplayPanelProps {
  model: string
  isVisible: boolean
}

interface ModelInfo {
  displayName: string
  color: string
  description: string
  strengths: string[]
  scores: {
    intelligence: number
    speed: number
    cost: number
    reasoning: number
  }
  estimatedLatency: string
  tokenCost: string
}

const getModelInfo = (model: string): ModelInfo => {
  const normalized = model.toLowerCase()

  // --------------------------------------------------
  // GROQ COMPOUND
  // --------------------------------------------------

  if (
    normalized.includes("groq/compound") ||
    normalized === "compound"
  ) {
    return {
      displayName: "Groq Compound",
      color: "from-violet-400 to-purple-500",
      description:
        "Tool-capable model selected for current information and web-assisted tasks.",
      strengths: [
        "Web Search",
        "Current Information",
        "Tool Use",
      ],
      scores: {
        intelligence: 93,
        speed: 94,
        cost: 88,
        reasoning: 91,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // GPT-OSS 120B
  // --------------------------------------------------

  if (
    normalized.includes("gpt-oss-120b")
  ) {
    return {
      displayName: "GPT-OSS 120B",
      color: "from-emerald-400 to-teal-500",
      description:
        "High-capability open-weight model selected for coding, debugging, and complex reasoning.",
      strengths: [
        "Coding",
        "Debugging",
        "Reasoning",
      ],
      scores: {
        intelligence: 95,
        speed: 90,
        cost: 91,
        reasoning: 95,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // GPT-OSS 20B
  // --------------------------------------------------

  if (
    normalized.includes("gpt-oss-20b")
  ) {
    return {
      displayName: "GPT-OSS 20B",
      color: "from-emerald-400 to-teal-500",
      description:
        "Fast open-weight reasoning model selected for mathematical and numerical problems.",
      strengths: [
        "Mathematics",
        "Reasoning",
        "Speed",
      ],
      scores: {
        intelligence: 91,
        speed: 96,
        cost: 94,
        reasoning: 92,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // QWEN
  // --------------------------------------------------

  if (
    normalized.includes("qwen")
  ) {
    return {
      displayName: "Qwen 3.6 27B",
      color: "from-cyan-400 to-sky-500",
      description:
        "Independent reasoning model used for secondary review and answer verification.",
      strengths: [
        "Verification",
        "Reasoning",
        "Analysis",
      ],
      scores: {
        intelligence: 92,
        speed: 91,
        cost: 93,
        reasoning: 93,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // LLAMA
  // --------------------------------------------------

  if (
    normalized.includes("llama")
  ) {
    return {
      displayName: "Llama 3.3 70B",
      color: "from-pink-400 to-rose-500",
      description:
        "Fast general-purpose model selected for straightforward factual questions.",
      strengths: [
        "General Knowledge",
        "Factual Q&A",
        "Fast Responses",
      ],
      scores: {
        intelligence: 91,
        speed: 95,
        cost: 94,
        reasoning: 89,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // AION
  // --------------------------------------------------

  if (
    normalized.includes("aion")
  ) {
    return {
      displayName: "Aion 3.0 Mini",
      color: "from-orange-400 to-amber-500",
      description:
        "Creative-capable model selected for storytelling, creative writing, and brainstorming.",
      strengths: [
        "Creative Writing",
        "Storytelling",
        "Brainstorming",
      ],
      scores: {
        intelligence: 89,
        speed: 93,
        cost: 94,
        reasoning: 86,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // GEMMA
  // --------------------------------------------------

  if (
    normalized.includes("gemma")
  ) {
    return {
      displayName: "Gemma 4 31B",
      color: "from-blue-400 to-indigo-500",
      description:
        "Multimodal-capable model selected for understanding images and other media.",
      strengths: [
        "Multimodal",
        "Image Understanding",
        "Reasoning",
      ],
      scores: {
        intelligence: 92,
        speed: 91,
        cost: 92,
        reasoning: 90,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // NEMOTRON
  // --------------------------------------------------

  if (
    normalized.includes("nemotron")
  ) {
    return {
      displayName: "NVIDIA Nemotron",
      color: "from-green-400 to-emerald-500",
      description:
        "Secondary model used for independent multimodal verification.",
      strengths: [
        "Verification",
        "Reasoning",
        "Multimodal",
      ],
      scores: {
        intelligence: 93,
        speed: 87,
        cost: 91,
        reasoning: 93,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // GEMINI
  // --------------------------------------------------

  if (
    normalized.includes("gemini")
  ) {
    return {
      displayName: "Gemini",
      color: "from-blue-400 to-indigo-500",
      description:
        "Google model available for reasoning, factual questions, and multimodal tasks.",
      strengths: [
        "Reasoning",
        "Factual Q&A",
        "Multimodal",
      ],
      scores: {
        intelligence: 94,
        speed: 92,
        cost: 80,
        reasoning: 92,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // CLAUDE
  // --------------------------------------------------

  if (
    normalized.includes("claude") ||
    normalized.includes("anthropic")
  ) {
    return {
      displayName: "Claude",
      color: "from-orange-400 to-amber-500",
      description:
        "Strong model for coding, writing, analysis, and detailed explanations.",
      strengths: [
        "Coding",
        "Writing",
        "Analysis",
      ],
      scores: {
        intelligence: 96,
        speed: 90,
        cost: 75,
        reasoning: 95,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // DEEPSEEK
  // --------------------------------------------------

  if (
    normalized.includes("deepseek")
  ) {
    return {
      displayName: "DeepSeek",
      color: "from-cyan-400 to-sky-500",
      description:
        "Strong model for coding, debugging, algorithms, and technical reasoning.",
      strengths: [
        "Coding",
        "Debugging",
        "Algorithms",
      ],
      scores: {
        intelligence: 95,
        speed: 88,
        cost: 90,
        reasoning: 94,
      },
      estimatedLatency: "Dynamic",
      tokenCost: "API dependent",
    }
  }

  // --------------------------------------------------
  // UNKNOWN MODEL
  // --------------------------------------------------

  return {
    displayName: model,
    color: "from-violet-400 to-purple-500",
    description:
      "The AI model selected by PSR AI for this request.",
    strengths: [
      "Task-specific",
      "AI reasoning",
    ],
    scores: {
      intelligence: 90,
      speed: 90,
      cost: 90,
      reasoning: 90,
    },
    estimatedLatency: "Dynamic",
    tokenCost: "API dependent",
  }
}

export function ModelDisplayPanel({
  model,
  isVisible,
}: ModelDisplayPanelProps) {
  if (!model || !isVisible) return null

  const data = getModelInfo(model)

  return (
    <motion.div
      className="fixed right-6 top-24 w-80 glass rounded-2xl p-6 z-40"
      initial={{
        opacity: 0,
        x: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: 20,
        scale: 0.95,
      }}
      transition={{
        type: "spring",
        damping: 20,
      }}
    >
      {/* Header */}

      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${data.color} flex items-center justify-center`}
        >
          <Brain className="w-6 h-6 text-white" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {data.displayName}
          </h3>

          <p className="text-xs text-muted-foreground">
            Selected Model
          </p>
        </div>
      </div>

      {/* Actual model ID */}

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Model ID
        </p>

        <code className="text-xs text-foreground break-all">
          {model}
        </code>
      </div>

      {/* Description */}

      <p className="text-sm text-muted-foreground mb-6">
        {data.description}
      </p>

      {/* Strengths */}

      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Best For
        </h4>

        <div className="flex flex-wrap gap-2">
          {data.strengths.map((strength) => (
            <span
              key={strength}
              className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Scores */}

      <div className="space-y-3 mb-6">
        {[
          {
            label: "Intelligence",
            value: data.scores.intelligence,
            icon: Brain,
            color: "bg-primary",
          },
          {
            label: "Speed",
            value: data.scores.speed,
            icon: Zap,
            color: "bg-accent",
          },
          {
            label: "Cost Efficiency",
            value: data.scores.cost,
            icon: DollarSign,
            color: "bg-chart-4",
          },
          {
            label: "Reasoning",
            value: data.scores.reasoning,
            icon: Target,
            color: "bg-chart-3",
          },
        ].map((score) => (
          <div
            key={score.label}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <score.icon className="w-3 h-3" />
                {score.label}
              </div>

              <span className="font-medium text-foreground">
                {score.value}%
              </span>
            </div>

            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${score.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${score.value}%`,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            Latency
          </div>

          <p className="text-sm font-medium text-foreground">
            {data.estimatedLatency}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Cpu className="w-3 h-3" />
            Cost
          </div>

          <p className="text-sm font-medium text-foreground">
            {data.tokenCost}
          </p>
        </div>
      </div>
    </motion.div>
  )
}