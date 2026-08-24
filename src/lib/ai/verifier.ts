import { callModel } from "./providers"
import {
  Provider,
  TaskType,
  VerificationResult,
  VerificationSignal,
} from "./types"

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
}

async function askVerifier(
  provider: Provider,
  model: string,
  system: string,
  content: string,
) {
  const response = await callModel(
    provider,
    `${system}\n\n${content}`,
    model,
  )

  const cleaned = cleanJSON(response.text)

  return JSON.parse(cleaned)
}

// --------------------------------------------------
// 1. Model agreement
// --------------------------------------------------

async function checkAgreement(
  primaryAnswer: string,
  secondaryAnswer: string,
): Promise<VerificationSignal> {
  try {
    const result = await askVerifier(
      "groq",
      "openai/gpt-oss-20b",

      `
You are an independent answer verifier.

Compare two answers to the same user question.

Determine whether they reach the same substantive conclusion.

Do NOT judge them based on writing style.

Reply ONLY with valid JSON:

{
  "passed": boolean,
  "detail": string
}

"passed" should be true only when the answers are substantively consistent.
`,

      `
PRIMARY ANSWER:

${primaryAnswer}

SECONDARY ANSWER:

${secondaryAnswer}
`,
    )

    return {
      type: "model_agreement",
      passed: Boolean(result.passed),
      detail:
        result.detail ||
        "No verification detail was provided.",
    }
  } catch (error) {
    console.error(
      "Agreement verification failed:",
      error,
    )

    return {
      type: "model_agreement",
      passed: false,
      detail:
        "The independent agreement check failed.",
    }
  }
}

// --------------------------------------------------
// 2. Self uncertainty
// --------------------------------------------------

async function checkSelfUncertainty(
  answer: string,
): Promise<VerificationSignal> {
  try {
    const result = await askVerifier(
      "groq",
      "openai/gpt-oss-20b",

      `
Analyze the following AI answer.

Determine whether the answer explicitly indicates uncertainty about
its own correctness.

Examples include:
- "I'm not sure"
- "I may be wrong"
- "This could be incorrect"
- "I don't have enough information"

Do NOT flag normal qualifications that are part of a correct explanation.

Reply ONLY with valid JSON:

{
  "passed": boolean,
  "detail": string
}

"passed" is true when the answer does not contain problematic
self-uncertainty.
`,

      answer,
    )

    return {
      type: "self_uncertainty",
      passed: Boolean(result.passed),
      detail:
        result.detail ||
        "No uncertainty detail was provided.",
    }
  } catch (error) {
    console.error(
      "Uncertainty verification failed:",
      error,
    )

    return {
      type: "self_uncertainty",
      passed: false,
      detail:
        "The uncertainty check failed.",
    }
  }
}

// --------------------------------------------------
// 3. Independent math check
// --------------------------------------------------

async function checkMath(
  prompt: string,
  primaryAnswer: string,
): Promise<VerificationSignal> {
  try {
    const result = await askVerifier(
      "groq",
      "openai/gpt-oss-20b",

      `
You are an independent mathematical verifier.

Solve the user's mathematical problem independently.

Then compare your independently derived result with the proposed
AI answer.

Focus on mathematical correctness, not writing style.

If the proposed answer is mathematically correct, passed should be true.

If the proposed answer is mathematically incorrect, incomplete in a
way that changes the result, or contradicts your independent solution,
passed should be false.

Reply ONLY with valid JSON:

{
  "passed": boolean,
  "detail": string
}
`,

      `
USER'S ORIGINAL QUESTION:

${prompt}

PROPOSED AI ANSWER:

${primaryAnswer}
`,
    )

    return {
      type: "math_check",
      passed: Boolean(result.passed),
      detail:
        result.detail ||
        "No mathematical verification detail was provided.",
    }
  } catch (error) {
    console.error(
      "Math verification failed:",
      error,
    )

    return {
      type: "math_check",
      passed: false,
      detail:
        "The independent mathematical check failed.",
    }
  }
}

// --------------------------------------------------
// Main verification
// --------------------------------------------------

export async function verify(
  prompt: string,
  primaryAnswer: string,
  secondaryAnswer?: string,
  taskType?: TaskType,
): Promise<VerificationResult> {
  const signals: VerificationSignal[] = []

  // Compare primary and secondary answers when available.
  if (secondaryAnswer) {
    signals.push(
      await checkAgreement(
        primaryAnswer,
        secondaryAnswer,
      ),
    )
  }

  // Mathematical questions receive an
  // independent mathematical verification.
  if (taskType === "math_reasoning") {
    signals.push(
      await checkMath(
        prompt,
        primaryAnswer,
      ),
    )
  }

  // Check for problematic uncertainty.
  signals.push(
    await checkSelfUncertainty(
      primaryAnswer,
    ),
  )

  const passed = signals.every(
    (signal) => signal.passed,
  )

  return {
    signals,
    passed,
    needs_regeneration: !passed,
  }
}