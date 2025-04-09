import { ChatPhase } from './types'

export const PHASE_ORDER: ChatPhase[] = [
  'welcome',
  'intro',
  'themeSelected',
  'top',
  'middle',
  'base',
  'finalized',
  'complete'
]

export const STORAGE_KEYS = {
  SESSION: 'fragrance_lab_session',
  CHAT_HISTORY: 'fragrance_lab_chat_history'
}

export const MESSAGE_DELAY = 1000 // メッセージ表示の遅延時間（ミリ秒）
export const TYPING_DELAY = 50 // タイピングアニメーションの遅延時間（ミリ秒）
export const INITIAL_DELAY = 1000 // 初期メッセージの遅延時間（ミリ秒） 