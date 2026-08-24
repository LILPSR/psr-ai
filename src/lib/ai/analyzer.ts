import { PromptAnalysis } from "./types"

const groqKey = process.env.GROQ_API_KEY

const ANALYZER_SYSTEM = `
You are the routing analyzer for an AI orchestration system.

Your job is NOT to answer the user's question.

Your job is to analyze the user's prompt and determine what kind of task it is and what capabilities are required.

Return ONLY valid JSON.

Use exactly this schema:

{
  "task_type": "coding" | "debugging" | "math_reasoning" | "general_reasoning" | "current_info" | "creative_writing" | "factual_qa" | "multimodal" | "ambiguous",
  "difficulty": "low" | "medium" | "high",
  "needs_web_search": boolean,
  "needs_code_execution": boolean,
  "needs_multimodal": boolean,
  "is_ambiguous": boolean,
  "ambiguity_clarifying_question": string | null,
  "requires_verification": boolean,
  "reasoning": string
}

CLASSIFICATION RULES:

coding:
- Writing new code
- Programming questions
- Creating functions
- Implementing software
- Algorithms
- APIs
- React
- JavaScript
- TypeScript
- Python
- C/C++
- Software architecture

debugging:
- Fixing broken code
- Finding bugs
- Runtime errors
- Compiler errors
- Debugging existing code
- "Why isn't this working?"

math_reasoning:
- Mathematics
- Equations
- Calculations
- Numerical problems
- Probability
- Algebra
- Calculus
- Physics calculations where mathematical derivation is central

general_reasoning:
- Complex reasoning
- Planning
- Analysis
- Comparisons
- Decisions
- Strategy
- Multi-step problems

current_info:
- News
- Current events
- Recent events
- Current prices
- Current sports
- Latest information
- Information that changes over time

creative_writing:
- Stories
- Poems
- Scripts
- Fiction
- Creative concepts
- Characters
- Narrative writing

factual_qa:
- Stable factual questions
- Definitions
- Historical facts
- General knowledge
- Simple factual questions

multimodal:
- Use ONLY when the user actually provides or refers to an image,
  screenshot, audio, video, or other media.

ambiguous:
- Use ONLY when the user's intent genuinely cannot be determined.
- Do NOT mark simple questions as ambiguous.

DIFFICULTY:

low:
- Simple factual questions
- Simple calculations
- Straightforward requests

medium:
- Multiple reasoning steps
- Moderate coding
- Moderate analysis

high:
- Complex coding
- Difficult mathematics
- Deep reasoning
- Multiple constraints
- High-stakes questions

WEB SEARCH:

Set needs_web_search=true when the answer depends on information that may have changed recently.

CODE EXECUTION:

Set needs_code_execution=true only when actually running code would materially improve correctness.

VERIFICATION:

Set requires_verification=true for:
- Mathematics
- Coding
- Debugging
- Factual questions
- Current information
- Objectively checkable answers
- High-stakes questions

Set requires_verification=false for:
- Pure creative writing
- Casual conversation
- Subjective creative requests

IMPORTANT EXAMPLES:

"What is 2 + 2?"
=> math_reasoning, low

"What is the capital of Japan?"
=> factual_qa, low

"Write a Python function to reverse a string"
=> coding

"Why is my React component crashing?"
=> debugging

"What happened with SRM admissions recently?"
=> current_info, needs_web_search=true

"Write me a horror story"
=> creative_writing

"Compare SRM and VIT for CSE"
=> general_reasoning

"Explain quantum computing simply"
=> factual_qa

Always return valid JSON.
`

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
}

function containsAny(
  text: string,
  words: string[],
): boolean {
  return words.some((word) =>
    text.includes(word),
  )
}

// --------------------------------------------------
// Local fallback
// --------------------------------------------------

function localFallback(
  prompt: string,
): PromptAnalysis {
  const lower = prompt.toLowerCase().trim()

  const codingWords = [
    "code",
    "coding",
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "function",
    "program",
    "programming",
    "algorithm",
    "api",
    "react",
    "next.js",
    "nextjs",
    "debug",
    "bug",
    "error",
    "compile",
    "compiler",
    "implement",
    "developer",
    "software",
  ]

  const currentWords = [
    "latest",
    "recent",
    "today",
    "currently",
    "current",
    "news",
    "yesterday",
    "this week",
    "this month",
    "happened",
    "admission",
    "admissions",
    "price",
    "ranking",
    "score",
    "weather",
  ]

  const creativeWords = [
    "story",
    "poem",
    "poetry",
    "fiction",
    "creative",
    "novel",
    "script",
    "character",
    "plot",
  ]

  const mathWords = [
    "calculate",
    "equation",
    "solve",
    "math",
    "mathematics",
    "integral",
    "derivative",
    "probability",
    "percentage",
    "factorial",
    "algebra",
    "calculus",
  ]

  const reasoningWords = [
    "compare",
    "analyze",
    "analysis",
    "decision",
    "strategy",
    "plan",
    "choose",
    "which is better",
    "pros and cons",
  ]

  // Current information
  if (containsAny(lower, currentWords)) {
    return {
      task_type: "current_info",
      difficulty: "medium",
      needs_web_search: true,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: true,
      reasoning:
        "The prompt appears to depend on information that may have changed recently.",
    }
  }

  // Debugging
  if (
    lower.includes("debug") ||
    lower.includes("bug") ||
    lower.includes("not working") ||
    lower.includes("doesn't work") ||
    lower.includes("doesnt work") ||
    lower.includes("error") ||
    lower.includes("crash") ||
    lower.includes("broken")
  ) {
    return {
      task_type: "debugging",
      difficulty: "medium",
      needs_web_search: false,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: true,
      reasoning:
        "The prompt appears to involve debugging or fixing an existing implementation.",
    }
  }

  // Coding
  if (containsAny(lower, codingWords)) {
    return {
      task_type: "coding",
      difficulty: "medium",
      needs_web_search: false,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: true,
      reasoning:
        "The prompt appears to involve programming or software development.",
    }
  }

  // Creative
  if (containsAny(lower, creativeWords)) {
    return {
      task_type: "creative_writing",
      difficulty: "medium",
      needs_web_search: false,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: false,
      reasoning:
        "The prompt is primarily a creative writing request.",
    }
  }

  // Math
  if (
    containsAny(lower, mathWords) ||
    /^\s*\d+\s*[+\-*/]\s*\d+\s*\??\s*$/.test(
      lower,
    )
  ) {
    return {
      task_type: "math_reasoning",
      difficulty: "low",
      needs_web_search: false,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: true,
      reasoning:
        "The prompt contains a mathematical or numerical problem.",
    }
  }

  // General reasoning
  if (containsAny(lower, reasoningWords)) {
    return {
      task_type: "general_reasoning",
      difficulty: "medium",
      needs_web_search: false,
      needs_code_execution: false,
      needs_multimodal: false,
      is_ambiguous: false,
      ambiguity_clarifying_question: null,
      requires_verification: true,
      reasoning:
        "The prompt requires comparison, analysis, planning, or multi-step reasoning.",
    }
  }

  // Default: simple factual question
  return {
    task_type: "factual_qa",
    difficulty: "low",
    needs_web_search: false,
    needs_code_execution: false,
    needs_multimodal: false,
    is_ambiguous: false,
    ambiguity_clarifying_question: null,
    requires_verification: true,
    reasoning:
      "The prompt appears to be a straightforward factual question.",
  }
}

// --------------------------------------------------
// Main analyzer
// --------------------------------------------------

export async function analyzePrompt(
  prompt: string,
): Promise<PromptAnalysis> {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty")
  }

  // If Groq isn't configured, use local classification.
  if (!groqKey) {
    console.warn(
      "GROQ_API_KEY is missing. Using local fallback analyzer.",
    )

    return localFallback(prompt)
  }

  try {
    console.log(
      "Analyzing prompt with Groq:",
      prompt,
    )

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content: ANALYZER_SYSTEM,
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0,

          response_format: {
            type: "json_object",
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText =
        await response.text()

      console.error(
        "Groq analyzer failed:",
        response.status,
        errorText,
      )

      console.warn(
        "Using local fallback analyzer.",
      )

      return localFallback(prompt)
    }

    const data = await response.json()

    const text =
      data.choices?.[0]?.message?.content ?? ""

    if (!text) {
      console.warn(
        "Groq analyzer returned an empty response.",
      )

      return localFallback(prompt)
    }

    const parsed =
      JSON.parse(
        cleanJSON(text),
      ) as Partial<PromptAnalysis>

    return {
      task_type:
        parsed.task_type ??
        "factual_qa",

      difficulty:
        parsed.difficulty ??
        "medium",

      needs_web_search:
        Boolean(
          parsed.needs_web_search,
        ),

      needs_code_execution:
        Boolean(
          parsed.needs_code_execution,
        ),

      needs_multimodal:
        Boolean(
          parsed.needs_multimodal,
        ),

      is_ambiguous:
        Boolean(
          parsed.is_ambiguous,
        ),

      ambiguity_clarifying_question:
        parsed.ambiguity_clarifying_question ??
        null,

      requires_verification:
        parsed.requires_verification ??
        true,

      reasoning:
        parsed.reasoning ??
        "Prompt analyzed by the routing model.",
    }
  } catch (error) {
    console.error(
      "Groq prompt analyzer failed:",
      error,
    )

    console.warn(
      "Using local fallback analyzer.",
    )

    return localFallback(prompt)
  }
}