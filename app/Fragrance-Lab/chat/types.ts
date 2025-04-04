export type ChatPhase = 
  | "welcome"
  | "purpose"
  | "personality"
  | "preferences"
  | "emotions"
  | "result"

export interface EmotionScores {
  calm: number
  refresh: number
  romantic: number
  spiritual: number
  energy: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  choices?: string[]
  emotionScores?: EmotionScores
} 