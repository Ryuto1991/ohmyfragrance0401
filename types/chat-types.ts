/**
 * チャットシステムの型定義
 */

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

// 選択肢の型定義
export interface ChoiceOption {
  name: string;
  description?: string;
}

// 文字列も ChoiceOption に変換可能に
export type Choice = string | ChoiceOption;

// 変換ヘルパー
export const normalizeChoice = (choice: Choice): ChoiceOption => {
  if (typeof choice === 'string') {
    return { name: choice };
  }
  return choice;
};

// メッセージの役割定義
export type MessageRole = 'user' | 'assistant' | 'system';

// メッセージの型定義
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  choices?: ChoiceOption[];
  choices_descriptions?: string[];
  recipe?: FragranceRecipe;
  emotionScores?: EmotionScores;
  error?: string;
  should_split?: boolean;
}

// フレグランスレシピの型定義
export interface FragranceRecipe {
  name?: string;
  description?: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
}

// エッセンシャルオイルの型定義
export interface EssentialOil {
  name: string;
  category: 'top' | 'middle' | 'base';
  description: string;
}

// 感情スコアの型定義
export interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
}

// チャット状態の型定義
export interface ChatState {
  messages: Message[];
  currentPhaseId: ChatPhase;
  selectedScents: {
    top: string[];
    middle: string[];
    base: string[];
  };
  isLoading: boolean;
  sessionId: string;
  error: Error | null;
  followUpSent: boolean;
  lastPhaseChangeTime: number;
}

// APIレスポンスの型定義
export interface ChatResponse {
  id?: string;
  role?: MessageRole;
  content: string;
  timestamp?: number;
  choices?: string[] | ChoiceOption[];
  choices_descriptions?: string[];
  recipe?: FragranceRecipe;
  emotionScores?: EmotionScores;
  should_split?: boolean;
  followUp?: string;
  error?: string;
}

// チャットフローのオプション
export interface ChatFlowOptions {
  messages?: Message[];
  currentPhase?: ChatPhase;
  systemPrompt?: string;
  initialDelay?: number;
  messageDelay?: number;
  typingDelay?: number;
  onPhaseAdvance?: () => void;
  onError?: (error: Error) => void;
}

// メッセージパートの型定義
export interface MessagePart {
  content: string;
  choices?: ChoiceOption[];
  shouldSplit?: boolean;
  recipe?: FragranceRecipe;
}

// ローカルストレージのキー
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'chat_history',
  SESSION_ID: 'chat_session_id',
  LAST_VISIT: 'last_visit',
  SESSION: 'chat_session',
  SELECTED_RECIPE: 'selected_recipe',
  USER_PREFERENCES: 'user_preferences'
} as const;
