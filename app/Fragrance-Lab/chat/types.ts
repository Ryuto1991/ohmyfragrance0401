// チャットのフェーズ定義
export type ChatPhase = 
  | 'welcome'
  | 'intro'
  | 'themeSelected'
  | 'top'
  | 'middle'
  | 'base'
  | 'finalized'
  | 'complete';

export type ChatPhaseId = ChatPhase

export interface ChatPhaseInfo {
  id: ChatPhaseId
  step: number
}

export const CHAT_PHASES: Record<ChatPhaseId, ChatPhaseInfo> = {
  welcome: { id: 'welcome', step: 0 },
  intro: { id: 'intro', step: 1 },
  themeSelected: { id: 'themeSelected', step: 2 },
  top: { id: 'top', step: 3 },
  middle: { id: 'middle', step: 4 },
  base: { id: 'base', step: 5 },
  finalized: { id: 'finalized', step: 6 },
  complete: { id: 'complete', step: 7 }
}

// メッセージの型定義
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  choices?: string[]
  choices_descriptions?: string[]
  recipe?: FragranceRecipe
  emotionScores?: EmotionScores
  error?: string
}

// フレグランスレシピの型定義
export interface FragranceRecipe {
  topNotes: string[]
  middleNotes: string[]
  baseNotes: string[]
  name?: string
  description?: string
}

// エッセンシャルオイルの型定義
export interface EssentialOil {
  name: string
  category: 'top' | 'middle' | 'base'
  description: string
}

// 感情スコアの型定義
export interface EmotionScores {
  joy: number
  sadness: number
  anger: number
  fear: number
  surprise: number
  disgust: number
}

// チャット状態の型定義
export interface ChatState {
  messages: Message[]
  currentPhaseId: ChatPhase
  selectedScents: {
    top: string[]
    middle: string[]
    base: string[]
  }
  isLoading: boolean
  sessionId: string
  error: Error | null
}

// APIレスポンスの型定義
export interface ChatResponse {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  choices?: string[]
  choices_descriptions?: string[]
  recipe?: FragranceRecipe
  emotionScores?: EmotionScores
}

// チャットフローのオプション
export interface ChatFlowOptions {
  messages: Message[]
  currentPhase: ChatPhase
  systemPrompt?: string
  initialDelay?: number
  messageDelay?: number
  typingDelay?: number
  onPhaseAdvance?: () => void
  onError?: (error: Error) => void
}

// ローカルストレージのキー
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'chat_history',
  SESSION_ID: 'chat_session_id',
  LAST_VISIT: 'last_visit',
  SESSION: 'chat_session'
} as const 