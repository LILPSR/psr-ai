import { NextRequest, NextResponse } from "next/server"

import { analyzePrompt } from "@/lib/ai/analyzer"
import { callModel } from "@/lib/ai/providers"
import { route } from "@/lib/ai/router"
import { verify } from "@/lib/ai/verifier"

import {
  ChatResponse,
  Confidence,
  VerificationResult,
  Attachment,
} from "@/lib/ai/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body?.prompt
    const attachment = body?.attachment

    if ((typeof prompt !== "string" || !prompt.trim()) && !attachment) {
      return NextResponse.json(
        {
          error: "A valid prompt or attachment is required.",
        },
        { status: 400 },
      )
    }

    // --------------------------------------------------
    // 1. ANALYZE PROMPT
    // --------------------------------------------------

    const analysis = await analyzePrompt(prompt || (attachment ? `Look at this ${attachment.type} I uploaded` : ""))

    // --------------------------------------------------
    // 2. HANDLE AMBIGUOUS REQUESTS
    // --------------------------------------------------

    if (analysis.is_ambiguous) {
      const response: ChatResponse = {
        answer:
          analysis.ambiguity_clarifying_question ??
          "Could you clarify what you would like me to do?",

        selected_model: "n/a",
        provider: "gemini",

        task_type: analysis.task_type,
        difficulty: analysis.difficulty,

        reasoning: analysis.reasoning,

        route_reasons: [
          "The request requires clarification before routing.",
        ],

        tools_requested: [],
        tools_used: [],

        verification: {
          performed: false,
          passed: true,
          signals: [],
        },

        confidence: "low",

        needs_clarification: true,
      }

      return NextResponse.json(response)
    }

    // --------------------------------------------------
    // 3. ROUTE TO THE BEST MODEL
    // --------------------------------------------------

    const decision = route(analysis)

    let primaryProvider = decision.primary_provider
    let primaryModel = decision.primary_model

    console.log("Routing decision:", {
      provider: primaryProvider,
      model: primaryModel,
      task: analysis.task_type,
      difficulty: analysis.difficulty,
    })

    // --------------------------------------------------
    // 4. CURRENT INFORMATION
    // --------------------------------------------------

    if (analysis.needs_web_search) {
      primaryProvider = "gemini"
      primaryModel = "gemini-3.6-flash"
    }

    // --------------------------------------------------
    // 5. DECIDE WHETHER VERIFICATION IS NEEDED
    //
    // Simple questions should NOT trigger:
    // - secondary model
    // - agreement check
    // - math check
    // - uncertainty check
    //
    // This keeps simple requests fast.
    // --------------------------------------------------

    const shouldVerify =
      analysis.requires_verification &&
      (
        analysis.difficulty === "high" ||
        analysis.task_type === "debugging" ||
        analysis.task_type === "current_info" ||
        (
          analysis.task_type === "math_reasoning" &&
          analysis.difficulty === "medium"
        )
      )

    console.log("Verification required:", shouldVerify)

    // --------------------------------------------------
    // 6. GENERATE PRIMARY ANSWER
    // --------------------------------------------------

    let primaryAnswer = ""
    let toolsUsed: string[] = []

    const finalPrompt = prompt || (attachment ? `Look at this ${attachment.type} I uploaded` : "")

    try {
      const primary = await callModel(
        primaryProvider,
        finalPrompt,
        primaryModel,
        analysis.needs_web_search,
        attachment
      )

      primaryAnswer = primary.text
      primaryProvider = primary.provider
      primaryModel = primary.model

      toolsUsed = primary.tools_used ?? []

    } catch (error) {
      console.error(
        "Primary model failed:",
        error,
      )

      // ------------------------------------------------
      // FALLBACK TO SECONDARY MODEL
      // ------------------------------------------------

      if (
        decision.secondary_provider &&
        decision.secondary_model
      ) {
        console.log(
          "Using fallback model:",
          decision.secondary_model,
        )

        const fallback = await callModel(
          decision.secondary_provider,
          finalPrompt,
          decision.secondary_model,
          false,
          attachment
        )

        primaryAnswer = fallback.text
        primaryProvider = fallback.provider
        primaryModel = fallback.model

        toolsUsed = fallback.tools_used ?? []
      } else {
        throw error
      }
    }

    // --------------------------------------------------
    // 7. VERIFICATION
    //
    // Only runs when genuinely useful.
    // --------------------------------------------------

    let verificationResult: VerificationResult = {
      signals: [],
      passed: true,
      needs_regeneration: false,
    }

    let secondaryProvider:
      | typeof decision.secondary_provider
      | undefined = undefined

    let secondaryModel:
      | typeof decision.secondary_model
      | undefined = undefined

    if (shouldVerify) {
      console.log("Starting verification...")

      let secondaryAnswer: string | undefined

      // ----------------------------------------------
      // Generate secondary answer
      // ----------------------------------------------

      if (
        decision.secondary_provider &&
        decision.secondary_model
      ) {
        try {
          const secondary = await callModel(
            decision.secondary_provider,
            finalPrompt,
            decision.secondary_model,
            false,
            attachment
          )

          secondaryAnswer = secondary.text

          secondaryProvider = secondary.provider
          secondaryModel = secondary.model

        } catch (error) {
          console.error(
            "Secondary model failed:",
            error,
          )
        }
      }

      // ----------------------------------------------
      // Verify answer
      // ----------------------------------------------

      try {
        verificationResult = await verify(
          prompt,
          primaryAnswer,
          secondaryAnswer,
          analysis.task_type,
        )

      } catch (error) {
        console.error(
          "Verification failed:",
          error,
        )

        // A verifier failure should NOT destroy
        // an otherwise valid primary answer.

        verificationResult = {
          signals: [],
          passed: true,
          needs_regeneration: false,
        }
      }
    }

    // --------------------------------------------------
    // 8. CONFIDENCE
    // --------------------------------------------------

    const confidence = scoreConfidence(
      shouldVerify,
      verificationResult,
      decision.confidence,
    )

    // --------------------------------------------------
    // 9. ROUTING REASONS
    // --------------------------------------------------

    const routeReasons = [...decision.reasons]

    if (analysis.needs_web_search) {
      routeReasons.unshift(
        "The request requires current information.",
      )

      routeReasons.push(
        "Google Search grounding was enabled.",
      )
    }

    if (!shouldVerify) {
      routeReasons.push(
        "Verification was skipped because the request is low-risk or does not require independent checking.",
      )
    }

    // --------------------------------------------------
    // 10. FINAL RESPONSE
    // --------------------------------------------------

    const response: ChatResponse = {
      answer: primaryAnswer,

      selected_model: primaryModel,
      provider: primaryProvider,

      secondary_model: secondaryModel,
      secondary_provider: secondaryProvider,

      task_type: analysis.task_type,
      difficulty: analysis.difficulty,

      reasoning: analysis.reasoning,

      route_reasons: routeReasons,

      tools_requested: analysis.needs_web_search
        ? ["google_search"]
        : decision.tools_required,

      tools_used: toolsUsed,

      verification: {
        performed: shouldVerify,
        passed: verificationResult.passed,
        signals: verificationResult.signals,
      },

      confidence,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error(
      "AI Router error:",
      error,
    )

    return NextResponse.json(
      {
        error:
          "The AI router encountered an unexpected error.",
      },
      { status: 500 },
    )
  }
}

// --------------------------------------------------
// CONFIDENCE SCORING
// --------------------------------------------------

function scoreConfidence(
  wasVerified: boolean,
  verification: {
    signals: {
      passed: boolean
    }[]
    passed: boolean
  },
  routingConfidence: number,
): Confidence {

  // No verification required
  if (!wasVerified) {
    if (routingConfidence >= 0.85) {
      return "high"
    }

    if (routingConfidence >= 0.70) {
      return "medium"
    }

    return "low"
  }

  // Verification failed
  if (!verification.passed) {
    return "low"
  }

  // Multiple successful verification signals
  if (
    verification.signals.length >= 2 &&
    routingConfidence >= 0.85
  ) {
    return "high"
  }

  return "medium"
}