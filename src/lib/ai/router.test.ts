import { describe, it, expect } from "vitest"
import { route } from "./router"
import { PromptAnalysis } from "./types"

const defaultAnalysis: PromptAnalysis = {
  task_type: "ambiguous",
  difficulty: "low",
  needs_web_search: false,
  needs_code_execution: false,
  needs_multimodal: false,
  is_ambiguous: false,
  ambiguity_clarifying_question: null,
  requires_verification: false,
  reasoning: "Test reasoning",
}

describe("route function", () => {
  describe("Required tools", () => {
    it("should require no tools by default", () => {
      const result = route(defaultAnalysis)
      expect(result.tools_required).toEqual([])
    })

    it("should require web_search when needs_web_search is true", () => {
      const result = route({ ...defaultAnalysis, needs_web_search: true })
      expect(result.tools_required).toContain("web_search")
    })

    it("should require code_execution when needs_code_execution is true", () => {
      const result = route({ ...defaultAnalysis, needs_code_execution: true })
      expect(result.tools_required).toContain("code_execution")
    })

    it("should require multimodal when needs_multimodal is true", () => {
      const result = route({ ...defaultAnalysis, needs_multimodal: true })
      expect(result.tools_required).toContain("multimodal")
    })

    it("should require all tools when all flags are true", () => {
      const result = route({
        ...defaultAnalysis,
        needs_web_search: true,
        needs_code_execution: true,
        needs_multimodal: true,
      })
      expect(result.tools_required).toEqual([
        "web_search",
        "code_execution",
        "multimodal",
      ])
    })
  })

  describe("Task Types", () => {
    describe("current_info", () => {
      it("should return groq/compound as primary model with web search reasons when needs_web_search is true", () => {
        const result = route({ ...defaultAnalysis, task_type: "current_info", needs_web_search: true })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("groq/compound")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("openai/gpt-oss-120b")
        expect(result.confidence).toBe(0.94)
        expect(result.reasons).toContain("The prompt depends on information that may have changed recently.")
        expect(result.reasons).toContain("Real-time web information is required.")
        expect(result.reasons).toContain("Groq Compound is selected because it can use web search and other tools.")
      })

      it("should return groq/compound as primary model without web search reasons when needs_web_search is false", () => {
        const result = route({ ...defaultAnalysis, task_type: "current_info", needs_web_search: false })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("groq/compound")
        expect(result.reasons).toContain("The prompt depends on information that may have changed recently.")
        expect(result.reasons).not.toContain("Real-time web information is required.")
        expect(result.reasons).toContain("Groq Compound is selected because it can use web search and other tools.")
      })
    })

    describe("coding", () => {
      it("should return openai/gpt-oss-120b as primary model", () => {
        const result = route({ ...defaultAnalysis, task_type: "coding" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("openai/gpt-oss-120b")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("qwen/qwen3.6-27b")
        expect(result.confidence).toBe(0.93)
        expect(result.reasons).toContain("The prompt requires writing or designing software.")
        expect(result.reasons).toContain("GPT-OSS 120B is selected for high-capability coding and reasoning.")
      })
    })

    describe("debugging", () => {
      it("should return openai/gpt-oss-120b as primary model", () => {
        const result = route({ ...defaultAnalysis, task_type: "debugging" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("openai/gpt-oss-120b")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("qwen/qwen3.6-27b")
        expect(result.confidence).toBe(0.94)
        expect(result.reasons).toContain("The prompt requires diagnosing or fixing existing code.")
        expect(result.reasons).toContain("GPT-OSS 120B is selected for complex debugging and code reasoning.")
        expect(result.reasons).toContain("A separate Qwen model is used for independent review.")
      })
    })

    describe("math_reasoning", () => {
      it("should return openai/gpt-oss-20b as primary model", () => {
        const result = route({ ...defaultAnalysis, task_type: "math_reasoning" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("openai/gpt-oss-20b")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("qwen/qwen3.6-27b")
        expect(result.confidence).toBe(0.92)
        expect(result.reasons).toContain("The prompt contains a mathematical problem.")
        expect(result.reasons).toContain("GPT-OSS 20B is selected for fast mathematical reasoning.")
        expect(result.reasons).toContain("An independent Qwen model is used as a secondary reasoning check.")
      })
    })

    describe("general_reasoning", () => {
      it("should return openai/gpt-oss-120b as primary model", () => {
        const result = route({ ...defaultAnalysis, task_type: "general_reasoning" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("openai/gpt-oss-120b")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("qwen/qwen3.6-27b")
        expect(result.confidence).toBe(0.91)
        expect(result.reasons).toContain("The prompt requires multi-step reasoning or analysis.")
        expect(result.reasons).toContain("GPT-OSS 120B is selected for deeper reasoning.")
      })
    })

    describe("multimodal", () => {
      it("should return google/gemma-4-31b-it:free as primary model from openrouter", () => {
        const result = route({ ...defaultAnalysis, task_type: "multimodal" })

        expect(result.primary_provider).toBe("openrouter")
        expect(result.primary_model).toBe("google/gemma-4-31b-it:free")
        expect(result.secondary_provider).toBe("openrouter")
        expect(result.secondary_model).toBe("nvidia/nemotron-3-ultra:free")
        expect(result.confidence).toBe(0.86)
        expect(result.reasons).toContain("The request requires interpretation of media.")
        expect(result.reasons).toContain("OpenRouter is used because its model catalog includes multimodal models.")
      })
    })

    describe("creative_writing", () => {
      it("should return aion-labs/aion-3.0-mini as primary model from openrouter", () => {
        const result = route({ ...defaultAnalysis, task_type: "creative_writing" })

        expect(result.primary_provider).toBe("openrouter")
        expect(result.primary_model).toBe("aion-labs/aion-3.0-mini")
        expect(result.secondary_provider).toBe("openrouter")
        expect(result.secondary_model).toBe("google/gemma-4-31b-it:free")
        expect(result.confidence).toBe(0.88)
        expect(result.reasons).toContain("The prompt is primarily a creative-writing task.")
        expect(result.reasons).toContain("A dedicated creative-capable OpenRouter model is selected.")
      })
    })

    describe("factual_qa", () => {
      it("should return llama-3.3-70b-versatile as primary model", () => {
        const result = route({ ...defaultAnalysis, task_type: "factual_qa" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("llama-3.3-70b-versatile")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("qwen/qwen3.6-27b")
        expect(result.confidence).toBe(0.88)
        expect(result.reasons).toContain("The prompt asks for stable factual information.")
        expect(result.reasons).toContain("Llama 3.3 70B is selected for fast general knowledge responses.")
      })
    })

    describe("fallback / ambiguous", () => {
      it("should return fallback model for unknown or ambiguous task types", () => {
        const result = route({ ...defaultAnalysis, task_type: "ambiguous" })

        expect(result.primary_provider).toBe("groq")
        expect(result.primary_model).toBe("llama-3.3-70b-versatile")
        expect(result.secondary_provider).toBe("groq")
        expect(result.secondary_model).toBe("openai/gpt-oss-20b")
        expect(result.confidence).toBe(0.65)
        expect(result.reasons).toContain("The task could not be confidently categorized.")
        expect(result.reasons).toContain("Llama 3.3 70B is used as the general-purpose fallback.")
      })
    })
  })
})
