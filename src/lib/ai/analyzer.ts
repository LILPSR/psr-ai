import { PromptAnalysis } from "./types"

// --------------------------------------------------
// Fast local prompt analyzer
// --------------------------------------------------
//
// IMPORTANT:
// We intentionally do NOT call an AI model here.
//
// The analyzer's job is classification, not answering.
// Using another AI call just to classify every prompt
// adds unnecessary latency and API usage.
//
// Common prompts are classified locally in milliseconds.
// --------------------------------------------------

function makeAnalysis(
  task_type: PromptAnalysis["task_type"],
  difficulty: PromptAnalysis["difficulty"],
  options: {
    needs_web_search?: boolean
    needs_code_execution?: boolean
    needs_multimodal?: boolean
    requires_verification?: boolean
    reasoning: string
  },
): PromptAnalysis {
  return {
    task_type,
    difficulty,

    needs_web_search:
      options.needs_web_search ?? false,

    needs_code_execution:
      options.needs_code_execution ?? false,

    needs_multimodal:
      options.needs_multimodal ?? false,

    is_ambiguous: false,

    ambiguity_clarifying_question: null,

    requires_verification:
      options.requires_verification ?? true,

    reasoning: options.reasoning,
  }
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function includesAny(
  text: string,
  words: string[],
): boolean {
  return words.some((word) =>
    text.includes(word),
  )
}

function looksLikeMath(prompt: string): boolean {
  const text = prompt
    .toLowerCase()
    .trim()

  // Very simple arithmetic such as:
  // 2 + 2
  // 15 * 7
  // 100 / 4
  // 25 - 9
  if (
    /^\s*-?\d+(?:\.\d+)?\s*[+\-*/%]\s*-?\d+(?:\.\d+)?\s*\??\s*$/.test(
      text,
    )
  ) {
    return true
  }

  const mathWords = [
    "calculate",
    "calculation",
    "math",
    "mathematics",
    "equation",
    "solve",
    "integral",
    "derivative",
    "differentiate",
    "integration",
    "probability",
    "statistics",
    "percentage",
    "percent",
    "factorial",
    "algebra",
    "calculus",
    "matrix",
    "matrices",
    "determinant",
    "vector",
    "vectors",
    "geometry",
    "trigonometry",
    "logarithm",
    "quadratic",
    "permutation",
    "combination",
  ]

  return includesAny(text, mathWords)
}

// --------------------------------------------------
// Multimodal detection
// --------------------------------------------------

function looksMultimodal(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const mediaWords = [
    "image",
    "picture",
    "photo",
    "photograph",
    "screenshot",
    "screen shot",
    "diagram",
    "chart",
    "graph",
    "image i uploaded",
    "picture i uploaded",
    "photo i uploaded",
    "screenshot i uploaded",
    "look at this",
    "look at the image",
    "look at this image",
    "what's in this image",
    "what is in this image",
    "analyze this image",
    "analyze the screenshot",
  ]

  return includesAny(text, mediaWords)
}

// --------------------------------------------------
// Current information detection
// --------------------------------------------------

function looksCurrentInfo(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const currentWords = [
    "latest",
    "recent",
    "recently",
    "today",
    "tonight",
    "yesterday",
    "currently",
    "current",
    "right now",
    "this week",
    "this month",
    "this year",
    "breaking news",
    "news",
    "what happened",
    "what's happening",
    "whats happening",
    "what is happening",
    "just happened",
    "new update",
    "new updates",
    "update on",
    "updates on",
    "admission",
    "admissions",
    "deadline",
    "deadlines",
    "price",
    "prices",
    "stock price",
    "share price",
    "weather",
    "forecast",
    "score",
    "scores",
    "standings",
    "ranking",
    "rankings",
    "results",
    "election",
    "elections",
  ]

  return includesAny(text, currentWords)
}

// --------------------------------------------------
// Coding detection
// --------------------------------------------------

function looksCoding(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const codingWords = [
    "write code",
    "write a program",
    "write a function",
    "write python",
    "write javascript",
    "write typescript",
    "write java",
    "write c code",
    "write c++",
    "code",
    "coding",
    "programming",
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "html",
    "css",
    "react",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "api",
    "sdk",
    "function",
    "class",
    "algorithm",
    "algorithms",
    "database",
    "sql",
    "query",
    "program",
    "implement",
    "implementation",
    "software",
    "developer",
    "development",
    "github",
    "git",
    "component",
    "backend",
    "frontend",
    "full stack",
    "full-stack",
  ]

  return includesAny(text, codingWords)
}

// --------------------------------------------------
// Debugging detection
// --------------------------------------------------

function looksDebugging(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const debuggingWords = [
    "debug",
    "debugging",
    "bug",
    "bugs",
    "error",
    "errors",
    "exception",
    "stack trace",
    "traceback",
    "crash",
    "crashing",
    "broken",
    "not working",
    "doesn't work",
    "doesnt work",
    "isn't working",
    "isnt working",
    "why does this fail",
    "why is this failing",
    "why isn't this working",
    "why isnt this working",
    "fix this code",
    "fix my code",
    "fix the code",
    "compiler error",
    "compile error",
    "runtime error",
    "syntax error",
  ]

  return includesAny(text, debuggingWords)
}

// --------------------------------------------------
// Creative writing detection
// --------------------------------------------------

function looksCreative(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const creativeWords = [
    "write a story",
    "write me a story",
    "write a poem",
    "write me a poem",
    "poem",
    "poetry",
    "short story",
    "fiction",
    "novel",
    "screenplay",
    "script",
    "creative writing",
    "creative",
    "character",
    "plot",
    "dialogue",
    "horror story",
    "love story",
    "funny story",
    "comedy sketch",
    "lyrics",
  ]

  return includesAny(text, creativeWords)
}

// --------------------------------------------------
// General reasoning detection
// --------------------------------------------------

function looksReasoning(prompt: string): boolean {
  const text = prompt.toLowerCase()

  const reasoningWords = [
    "compare",
    "comparison",
    "compare these",
    "compare them",
    "which is better",
    "which should i choose",
    "what should i choose",
    "should i",
    "pros and cons",
    "advantages and disadvantages",
    "analyze",
    "analyse",
    "analysis",
    "evaluate",
    "decision",
    "decide",
    "strategy",
    "strategize",
    "plan",
    "planning",
    "recommend",
    "recommendation",
    "why should",
    "how should i",
    "what would be better",
    "tradeoff",
    "trade-offs",
    "explain why",
  ]

  return includesAny(text, reasoningWords)
}

// --------------------------------------------------
// Code execution detection
// --------------------------------------------------

function needsCodeExecution(prompt: string): boolean {
  const text = prompt.toLowerCase()

  return includesAny(text, [
    "run this code",
    "execute this code",
    "execute the code",
    "run the program",
    "run this program",
    "test this code",
    "calculate using python",
    "use python to calculate",
    "simulate this",
    "simulation",
  ])
}

// --------------------------------------------------
// Main analyzer
// --------------------------------------------------

export async function analyzePrompt(
  prompt: string,
): Promise<PromptAnalysis> {
  const trimmed = prompt.trim()

  if (!trimmed) {
    throw new Error("Prompt cannot be empty")
  }

  const lower = trimmed.toLowerCase()

  console.log(
    "Analyzing prompt locally:",
    trimmed,
  )

  // ------------------------------------------------
  // 1. Multimodal
  // ------------------------------------------------

  if (looksMultimodal(trimmed)) {
    return makeAnalysis(
      "multimodal",
      "medium",
      {
        needs_multimodal: true,
        requires_verification: true,
        reasoning:
          "The prompt refers to an image, screenshot, diagram, chart, or other media.",
      },
    )
  }

  // ------------------------------------------------
  // 2. Current information
  // ------------------------------------------------
  //
  // This must come before generic factual questions.
  // Example:
  // "What happened to SRM admissions?"
  // -> current_info
  // -> web search required
  // ------------------------------------------------

  if (looksCurrentInfo(trimmed)) {
    return makeAnalysis(
      "current_info",
      "medium",
      {
        needs_web_search: true,
        requires_verification: true,
        reasoning:
          "The prompt depends on information that may have changed recently, so current web information is required.",
      },
    )
  }

  // ------------------------------------------------
  // 3. Debugging
  // ------------------------------------------------
  //
  // Debugging comes before coding because a debugging
  // request can contain words such as Python, React,
  // JavaScript, etc.
  // ------------------------------------------------

  if (looksDebugging(trimmed)) {
    return makeAnalysis(
      "debugging",
      trimmed.length > 500
        ? "high"
        : "medium",
      {
        needs_code_execution:
          needsCodeExecution(trimmed),
        requires_verification: true,
        reasoning:
          "The prompt appears to involve diagnosing or fixing an existing implementation.",
      },
    )
  }

  // ------------------------------------------------
  // 4. Coding
  // ------------------------------------------------

  if (looksCoding(trimmed)) {
    return makeAnalysis(
      "coding",
      trimmed.length > 700
        ? "high"
        : "medium",
      {
        needs_code_execution:
          needsCodeExecution(trimmed),
        requires_verification: true,
        reasoning:
          "The prompt requires programming or software-development knowledge.",
      },
    )
  }

  // ------------------------------------------------
  // 5. Math
  // ------------------------------------------------

  if (looksLikeMath(trimmed)) {
    return makeAnalysis(
      "math_reasoning",
      "low",
      {
        requires_verification: true,
        reasoning:
          "The prompt contains a mathematical or numerical problem.",
      },
    )
  }

  // ------------------------------------------------
  // 6. Creative writing
  // ------------------------------------------------

  if (looksCreative(trimmed)) {
    return makeAnalysis(
      "creative_writing",
      trimmed.length > 1000
        ? "medium"
        : "low",
      {
        requires_verification: false,
        reasoning:
          "The prompt is primarily a creative-writing request.",
      },
    )
  }

  // ------------------------------------------------
  // 7. General reasoning
  // ------------------------------------------------

  if (looksReasoning(trimmed)) {
    return makeAnalysis(
      "general_reasoning",
      trimmed.length > 500
        ? "high"
        : "medium",
      {
        requires_verification: true,
        reasoning:
          "The prompt requires comparison, analysis, planning, or multi-step reasoning.",
      },
    )
  }

  // ------------------------------------------------
  // 8. Very long prompts
  // ------------------------------------------------
  //
  // Long prompts are more likely to contain complex
  // instructions even when they don't contain obvious
  // keywords.
  //
  // We still classify them as general reasoning rather
  // than making another API request.
  // ------------------------------------------------

  if (trimmed.length > 1200) {
    return makeAnalysis(
      "general_reasoning",
      "high",
      {
        requires_verification: true,
        reasoning:
          "The prompt contains substantial instructions or constraints and is therefore treated as a complex reasoning task.",
      },
    )
  }

  // ------------------------------------------------
  // 9. Default
  // ------------------------------------------------
  //
  // A normal question should NEVER become ambiguous
  // just because the classifier doesn't recognize a
  // keyword.
  // ------------------------------------------------

  return makeAnalysis(
    "factual_qa",
    "low",
    {
      requires_verification: true,
      reasoning:
        "The prompt appears to be a straightforward factual question.",
    },
  )
}