import {
  PromptAnalysis,
  RoutingDecision,
} from "./types"

export function route(
  analysis: PromptAnalysis,
): RoutingDecision {
  const reasons: string[] = []
  const toolsRequired: string[] = []

  // --------------------------------------------------
  // Required tools
  // --------------------------------------------------

  if (analysis.needs_web_search) {
    toolsRequired.push("web_search")
  }

  if (analysis.needs_code_execution) {
    toolsRequired.push("code_execution")
  }

  if (analysis.needs_multimodal) {
    toolsRequired.push("multimodal")
  }

  // ==================================================
  // CURRENT INFORMATION
  // ==================================================

  if (analysis.task_type === "current_info") {
    reasons.push(
      "The prompt depends on information that may have changed recently.",
    )

    if (analysis.needs_web_search) {
      reasons.push(
        "Real-time web information is required.",
      )
    }

    reasons.push(
      "Groq Compound is selected because it can use web search and other tools.",
    )

    return {
      primary_provider: "groq",
      primary_model: "groq/compound",

      secondary_provider: "groq",
      secondary_model: "openai/gpt-oss-120b",

      confidence: 0.94,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // CODING
  // ==================================================

  if (analysis.task_type === "coding") {
    reasons.push(
      "The prompt requires writing or designing software.",
    )

    reasons.push(
      "GPT-OSS 120B is selected for high-capability coding and reasoning.",
    )

    return {
      primary_provider: "groq",
      primary_model: "openai/gpt-oss-120b",

      secondary_provider: "groq",
      secondary_model: "qwen/qwen3.6-27b",

      confidence: 0.93,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // DEBUGGING
  // ==================================================

  if (analysis.task_type === "debugging") {
    reasons.push(
      "The prompt requires diagnosing or fixing existing code.",
    )

    reasons.push(
      "GPT-OSS 120B is selected for complex debugging and code reasoning.",
    )

    reasons.push(
      "A separate Qwen model is used for independent review.",
    )

    return {
      primary_provider: "groq",
      primary_model: "openai/gpt-oss-120b",

      secondary_provider: "groq",
      secondary_model: "qwen/qwen3.6-27b",

      confidence: 0.94,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // MATH
  // ==================================================

  if (analysis.task_type === "math_reasoning") {
    reasons.push(
      "The prompt contains a mathematical problem.",
    )

    reasons.push(
      "GPT-OSS 20B is selected for fast mathematical reasoning.",
    )

    reasons.push(
      "An independent Qwen model is used as a secondary reasoning check.",
    )

    return {
      primary_provider: "groq",
      primary_model: "openai/gpt-oss-20b",

      secondary_provider: "groq",
      secondary_model: "qwen/qwen3.6-27b",

      confidence: 0.92,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // GENERAL REASONING
  // ==================================================

  if (analysis.task_type === "general_reasoning") {
    reasons.push(
      "The prompt requires multi-step reasoning or analysis.",
    )

    reasons.push(
      "GPT-OSS 120B is selected for deeper reasoning.",
    )

    return {
      primary_provider: "groq",
      primary_model: "openai/gpt-oss-120b",

      secondary_provider: "groq",
      secondary_model: "qwen/qwen3.6-27b",

      confidence: 0.91,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // MULTIMODAL
  // ==================================================

  if (analysis.task_type === "multimodal") {
    reasons.push(
      "The request requires interpretation of media.",
    )

    reasons.push(
      "OpenRouter is used because its model catalog includes multimodal models.",
    )

    return {
      primary_provider: "openrouter",
      primary_model: "google/gemma-4-31b-it:free",

      secondary_provider: "openrouter",
      secondary_model: "nvidia/nemotron-3-ultra:free",

      confidence: 0.86,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // CREATIVE WRITING
  // ==================================================

  if (analysis.task_type === "creative_writing") {
    reasons.push(
      "The prompt is primarily a creative-writing task.",
    )

    reasons.push(
      "A dedicated creative-capable OpenRouter model is selected.",
    )

    return {
      primary_provider: "openrouter",
      primary_model: "aion-labs/aion-3.0-mini",

      secondary_provider: "openrouter",
      secondary_model: "google/gemma-4-31b-it:free",

      confidence: 0.88,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // FACTUAL QUESTIONS
  // ==================================================

  if (analysis.task_type === "factual_qa") {
    reasons.push(
      "The prompt asks for stable factual information.",
    )

    reasons.push(
      "Llama 3.3 70B is selected for fast general knowledge responses.",
    )

    return {
      primary_provider: "groq",
      primary_model: "llama-3.3-70b-versatile",

      secondary_provider: "groq",
      secondary_model: "qwen/qwen3.6-27b",

      confidence: 0.88,

      reasons,
      tools_required: toolsRequired,
    }
  }

  // ==================================================
  // AMBIGUOUS / FALLBACK
  // ==================================================

  reasons.push(
    "The task could not be confidently categorized.",
  )

  reasons.push(
    "Llama 3.3 70B is used as the general-purpose fallback.",
  )

  return {
    primary_provider: "groq",
    primary_model: "llama-3.3-70b-versatile",

    secondary_provider: "groq",
    secondary_model: "openai/gpt-oss-20b",

    confidence: 0.65,

    reasons,
    tools_required: toolsRequired,
  }
}