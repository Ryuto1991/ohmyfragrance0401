// チャットのフェーズ定義 (簡略化)
export type ChatPhase =
  | 'start'      // 会話開始、好みヒアリング
  | 'selecting'  // 香り選択中 (トップ/ミドル/ベース)
  | 'complete';   // レシピ確定、注文へ

// 選択肢の型定義
export type ChoiceOption = string | { name: string; description?: string };

// selectingフェーズ内のノート選択状態
export type NoteSelectionPhase = 'top' | 'middle' | 'base' | null;

export type ChatPhaseId = ChatPhase // 互換性のため残す場合があるが、基本はChatPhaseを使用

// メッセージの型定義
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  choices?: ChoiceOption[]
  choices_descriptions?: string[]
  recipe?: FragranceRecipe // Add recipe property
  emotionScores?: EmotionScores
  error?: string // Existing property for error message text
  should_split?: boolean
  isLoading?: boolean // Add back isLoading for message-specific loading state
}

// Define the structure for a note with amount
export interface RecipeNoteWithAmount {
  name: string;
  amount: number;
}

// フレグランスレシピの型定義 (Update notes to use RecipeNoteWithAmount)
export interface FragranceRecipe {
  topNotes: RecipeNoteWithAmount[]
  middleNotes: RecipeNoteWithAmount[]
  baseNotes: RecipeNoteWithAmount[]
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
  followUpSent: boolean
  lastPhaseChangeTime: number
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
  should_split?: boolean
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
  SESSION: 'chat_session',
  SELECTED_RECIPE: 'selected_recipe'
} as const
