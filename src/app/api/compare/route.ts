import { NextRequest, NextResponse } from "next/server"
import { callModel } from "@/lib/ai/providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body?.prompt

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid prompt is required." },
        { status: 400 }
      )
    }

    // Models configuration mapping to the UI
    const modelsToCall = [
      {
        name: "GPT-5", // Mapped to a GPT model via OpenRouter or fallback
        provider: "openrouter" as const,
        modelId: "openai/gpt-4o",
      },
      {
        name: "Claude Sonnet", // Mapped to Claude via OpenRouter
        provider: "openrouter" as const,
        modelId: "anthropic/claude-3.5-sonnet",
      },
      {
        name: "Gemini Pro", // Mapped to Gemini
        provider: "gemini" as const,
        modelId: "gemini-1.5-pro",
      },
    ]

    const results = await Promise.all(
      modelsToCall.map(async ({ name, provider, modelId }) => {
        const startTime = Date.now()
        let responseText = ""
        let error = null

        try {
          const res = await callModel(provider, prompt, modelId)
          responseText = res.text
        } catch (e: unknown) {
          console.error(`Error calling ${name}:`, e)
          const errorMessage = e instanceof Error ? e.message : "Unknown error"
          responseText = `*Failed to fetch response from ${name}*\n${errorMessage}`
          error = errorMessage
        }

        const endTime = Date.now()
        const speedInSeconds = Number(((endTime - startTime) / 1000).toFixed(1))

        // Generating mock scores based on some randomness and speed since true evaluation is complex
        const quality = error ? 0 : Math.floor(Math.random() * 20) + 80 // 80-99
        const creativity = error ? 0 : Math.floor(Math.random() * 30) + 70 // 70-99

        return {
          model: name,
          response: responseText,
          scores: {
            quality,
            speed: speedInSeconds,
            creativity,
          }
        }
      })
    )

    return NextResponse.json({ results })

  } catch (error) {
    console.error("Compare API error:", error)
    return NextResponse.json(
      { error: "Failed to compare models." },
      { status: 500 }
    )
  }
}
