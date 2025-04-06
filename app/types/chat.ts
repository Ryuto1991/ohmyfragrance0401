// チャットのステップ定義
export type Step = 
  | 'intro'         // 初期フェーズ：イメージ入力
  | 'themeSelected' // テーマ選択完了
  | 'top'          // トップノート選択
  | 'middle'       // ミドルノート選択
  | 'base'         // ベースノート選択
  | 'finalized'    // レシピ確定
  | 'complete'     // 完了
  | 'generator'    // ジェネレーター

// メッセージの型定義
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  options?: string[]
  recipe?: FragranceRecipe
  emotion_scores?: Record<string, number>
}

// レシピの型定義
export interface FragranceRecipe {
  top_notes: string[]
  middle_notes: string[]
  base_notes: string[]
  name: string
  description: string
}

// エッセンシャルオイルの型定義
export interface EssentialOil {
  name: string
  english: string
  description: string
  emotion: string
  category: 'top' | 'middle' | 'base'
  source: string
  info: string
}

// チャットの状態管理用の型定義
export interface ChatState {
  messages: Message[]
  currentStep: Step
  selectedScents: {
    top: string | null
    middle: string | null
    base: string | null
  }
  isLoading: boolean
  sessionId: string
  error?: string
}

// APIレスポンスの型定義
export interface ChatResponse {
  message: Message
  error?: string
} 