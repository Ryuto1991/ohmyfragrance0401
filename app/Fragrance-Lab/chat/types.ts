// チャットフェーズ関連
export type ChatPhase = 
  | "welcome"     // 初期フェーズ：イメージ入力
  | "purpose"     // トップノート選択
  | "personality" // ミドルノート選択
  | "preferences" // ベースノート選択
  | "emotions"    // 感情分析
  | "result"      // レシピ確認

// エッセンシャルオイル関連
export interface EssentialOil {
  name: string
  english: string
  description: string
  emotion: string
  category: "top" | "middle" | "base"
  source: string
  info: string
}

export interface EssentialOils {
  topNotes: EssentialOil[]
  middleNotes: EssentialOil[]
  baseNotes: EssentialOil[]
}

// レシピ関連
export interface FragranceRecipe {
  title: string
  description: string
  notes: {
    top: string[]    // トップノート
    middle: string[] // ミドルノート
    base: string[]   // ベースノート
  }
}

// 感情スコア関連
export interface EmotionScore {
  calm: number      // 落ち着き (0-100)
  refresh: number   // リフレッシュ (0-100)
  romantic: number  // ロマンティック (0-100)
  spiritual: number // スピリチュアル (0-100)
  energy: number    // エネルギー (0-100)
}

export interface EmotionScores {
  calm: number      // 落ち着き
  refresh: number   // リフレッシュ
  romantic: number  // ロマンチック
  spiritual: number // スピリチュアル
  energy: number    // エネルギー
}

// メッセージ関連
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  choices?: string[]  // 選択肢
  choices_descriptions?: { [key: string]: string } // 選択肢の説明
  recipe?: FragranceRecipe // レシピ情報
  emotionScores?: EmotionScores // 感情スコア
  error?: string // エラーメッセージ
}

// チャットフロー設定関連
export interface ChatFlowOptions {
  initialDelay?: number    // 初期遅延時間（ms）
  messageDelay?: number    // メッセージ間の遅延時間（ms）
  typingDelay?: number     // タイピング遅延時間（ms）
  onPhaseAdvance?: () => void // フェーズ進行時のコールバック
}

// APIレスポンス関連
export interface ChatAPIResponse {
  message: Message
  phase: ChatPhase
  error?: string
}

// エラー関連
export interface ChatError {
  code: string
  message: string
  details?: any
} 