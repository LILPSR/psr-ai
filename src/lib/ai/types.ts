export type TaskType =
  | "coding"
  | "debugging"
  | "math_reasoning"
  | "general_reasoning"
  | "current_info"
  | "creative_writing"
  | "factual_qa"
  | "multimodal"
  | "ambiguous"

export type Difficulty = "low" | "medium" | "high"

export type Provider =
  | "gemini"
  | "groq"
  | "openrouter"

export type Confidence = "low" | "medium" | "high"

export interface PromptAnalysis {
  task_type: TaskType
  difficulty: Difficulty

  needs_web_search: boolean
  needs_code_execution: boolean
  needs_multimodal: boolean

  is_ambiguous: boolean
  ambiguity_clarifying_question: string | null

  requires_verification: boolean

  reasoning: string
}

export interface RoutingDecision {
  primary_provider: Provider
  primary_model: string

  secondary_provider?: Provider
  secondary_model?: string

  confidence: number

  reasons: string[]

  tools_required: string[]
}

export interface VerificationSignal {
  type:
    | "model_agreement"
    | "math_check"
    | "self_uncertainty"

  passed: boolean
  detail: string
}

export interface Attachment {
  type: "image" | "video"
  url: string
  file?: File
}

export interface VerificationResult {
  signals: VerificationSignal[]
  passed: boolean
  needs_regeneration: boolean
}

export interface ChatResponse {
  answer: string

  selected_model: string
  provider: Provider

  secondary_model?: string
  secondary_provider?: Provider

  task_type: TaskType
  difficulty: Difficulty

  reasoning: string
  route_reasons: string[]

  tools_requested: string[]
  tools_used: string[]

  verification: {
    performed: boolean
    passed: boolean
    signals: VerificationSignal[]
  }

  confidence: Confidence

  needs_clarification?: boolean
}