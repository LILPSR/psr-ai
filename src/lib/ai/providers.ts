import { GoogleGenAI } from "@google/genai"
import { Provider, FileData } from "./types"

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
  files?: FileData[]
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
  files?: FileData[]
): Promise<ModelResponse> {
  if (!groqKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const messagesContent: any[] = []
  if (files && files.length > 0) {
    files.forEach((f) => {
      // NOTE: Groq currently mostly supports images natively using this format depending on the model.
      // We will send videos and other attachments if the user provides them, but the LLM must support it.
      messagesContent.push({
        type: "image_url",
        image_url: { url: `data:${f.inlineData.mimeType};base64,${f.inlineData.data}` }
      })
    })
  }
  messagesContent.push({ type: "text", text: prompt })

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
            content: messagesContent,
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

  const rawText =
    data.choices?.[0]?.message?.content ?? ""

  // Remove hidden reasoning blocks if the model returns them.
  const cleanedText = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim()

  return {
    text: cleanedText,
    provider: "groq",
    model,
    tools_used: [],
  }
}

async function callOpenRouter(
  prompt: string,
  model = "openrouter/free",
  files?: FileData[]
): Promise<ModelResponse> {
  if (!openRouterKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured",
    )
  }

  const messagesContent: any[] = []
  if (files && files.length > 0) {
    files.forEach((f) => {
      // NOTE: OpenRouter expects image_url format for multimodality
      messagesContent.push({
        type: "image_url",
        image_url: { url: `data:${f.inlineData.mimeType};base64,${f.inlineData.data}` }
      })
    })
  }
  messagesContent.push({ type: "text", text: prompt })

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
            content: messagesContent,
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

  const rawText =
    data.choices?.[0]?.message?.content ?? ""

  // Remove hidden reasoning blocks from models
  // such as Qwen when they are included in the response.
  const cleanedText = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim()

  return {
    text: cleanedText,
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
  files?: FileData[]
): Promise<ModelResponse> {
  switch (provider) {
    case "gemini":
      return callGemini(
        prompt,
        model,
        useWebSearch,
        files
      )

    case "groq":
      return callGroq(
        prompt,
        model,
        files
      )

    case "openrouter":
      return callOpenRouter(
        prompt,
        model,
        files
      )

    default:
      throw new Error(
        `Unsupported provider: ${provider}`,
      )
  }
}