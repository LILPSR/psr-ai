import { GoogleGenAI } from "@google/genai"
import { Provider } from "./types"

const geminiKey = process.env.GEMINI_API_KEY
const groqKey = process.env.GROQ_API_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY

const gemini = geminiKey
  ? new GoogleGenAI({ apiKey: geminiKey })
  : null

export interface ModelResponse {
  text: string
  provider: Provider
  model: string
  tools_used?: string[]
}

async function callGemini(
  prompt: string,
  model = "gemini-3.6-flash",
  useWebSearch = false,
): Promise<ModelResponse> {
  if (!gemini) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const config: Record<string, unknown> = {
    temperature: 0.2,
  }

  /*
   * Enable Google's built-in web search grounding
   * when the router determines that current information
   * is required.
   */
  if (useWebSearch) {
    config.tools = [
      {
        googleSearch: {},
      },
    ]
  }

  const response = await gemini.models.generateContent({
    model,
    contents: prompt,
    config,
  })

  return {
    text: response.text ?? "",
    provider: "gemini",
    model,
    tools_used: useWebSearch
      ? ["google_search"]
      : [],
  }
}

async function callGroq(
  prompt: string,
  model = "openai/gpt-oss-20b",
): Promise<ModelResponse> {
  if (!groqKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },

      body: JSON.stringify({
        model,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      `Groq API error ${response.status}: ${errorText}`,
    )
  }

  const data = await response.json()

  return {
    text:
      data.choices?.[0]?.message?.content ??
      "",
    provider: "groq",
    model,
    tools_used: [],
  }
}

async function callOpenRouter(
  prompt: string,
  model = "openrouter/free",
): Promise<ModelResponse> {
  if (!openRouterKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured",
    )
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000",
        "X-Title": "AI Router",
      },

      body: JSON.stringify({
        model,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      `OpenRouter API error ${response.status}: ${errorText}`,
    )
  }

  const data = await response.json()

  const actualModel =
    data.model ?? model

  return {
    text:
      data.choices?.[0]?.message?.content ??
      "",

    provider: "openrouter",
    model: actualModel,
    tools_used: [],
  }
}

export async function callModel(
  provider: Provider,
  prompt: string,
  model?: string,
  useWebSearch = false,
): Promise<ModelResponse> {
  switch (provider) {
    case "gemini":
      return callGemini(
        prompt,
        model,
        useWebSearch,
      )

    case "groq":
      return callGroq(
        prompt,
        model,
      )

    case "openrouter":
      return callOpenRouter(
        prompt,
        model,
      )

    default:
      throw new Error(
        `Unsupported provider: ${provider}`,
      )
  }
}