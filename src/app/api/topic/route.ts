import { NextRequest, NextResponse } from "next/server"
import { callModel } from "@/lib/ai/providers"

export async function POST(request: NextRequest) {
  try {
    const { prompt, activeTopicId, topics } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
    }

    if (!topics || topics.length === 0) {
      return NextResponse.json({ action: "new", name: "General Chat" })
    }

    const availableTopics = topics.map((t: any) => ({ id: t.id, name: t.name }))

    const systemPrompt = `
You are an intelligent conversation router.
Analyze the user's prompt and determine its topic.
Currently active topic ID: ${activeTopicId || "None"}
Available topics: ${JSON.stringify(availableTopics)}

Rules:
1. If the prompt is a continuation of the active topic, return {"action": "continue"}.
2. If it perfectly matches another available topic, return {"action": "switch", "topicId": "<id>"}.
3. If it represents a genuinely new and unrelated topic, return {"action": "new", "name": "<short descriptive name>"}.

Output ONLY valid JSON. No markdown formatting, no backticks, no reasoning. Just the JSON object.
`
    const promptFull = systemPrompt + "\nUser prompt: " + prompt;
    let response;
    try {
      response = await callModel("gemini", promptFull, "gemini-3.6-flash");
    } catch {
      try {
        response = await callModel("groq", promptFull, "llama-3.3-70b-versatile");
      } catch {
        response = await callModel("openrouter", promptFull, "openrouter/free");
      }
    }
    let jsonMatch = response!.text.trim()

    try {
      if (jsonMatch.startsWith('```json')) {
        jsonMatch = jsonMatch.substring(7, jsonMatch.length - 3).trim()
      } else if (jsonMatch.startsWith('```')) {
        jsonMatch = jsonMatch.substring(3, jsonMatch.length - 3).trim()
      }
      const data = JSON.parse(jsonMatch)
      return NextResponse.json(data)
    } catch (e) {
      console.error("Failed to parse topic response:", response.text)
      return NextResponse.json({ action: activeTopicId ? "continue" : "new", name: "New Topic" })
    }

  } catch (error) {
    console.error("Topic detection error:", error)
    return NextResponse.json({ action: "continue" })
  }
}
