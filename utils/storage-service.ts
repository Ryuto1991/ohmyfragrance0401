import { STORAGE_KEYS } from '@/app/fragrance-lab/chat/types'
import type { Message, FragranceRecipe } from '@/app/fragrance-lab/chat/types'

/**
 * ストレージサービス
 * ローカルストレージへのアクセスを一元管理するユーティリティ
 */

// サーバーサイドレンダリング時にlocalStorageが利用可能かチェックする関数
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false
  try {
    return typeof localStorage !== 'undefined'
  } catch (e) {
    return false
  }
}

export const StorageService = {
  // チャット履歴の保存
  saveChatHistory(messages: Message[]): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages))
    } catch (error) {
      console.error('チャット履歴の保存に失敗:', error)
    }
  },

  // チャット履歴の取得
  getChatHistory(): Message[] | null {
    if (!isLocalStorageAvailable()) return null
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('チャット履歴の取得に失敗:', error)
      return null
    }
  },

  // レシピの保存
  saveRecipe(recipe: FragranceRecipe): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      // レシピの形式を標準化（APIと永続化の形式の違いを吸収）
      const formattedRecipe = {
        name: recipe.name || 'オリジナルルームフレグランス',
        description: recipe.description || 'あなただけのカスタムルームフレグランス',
        top_notes: recipe.topNotes,
        middle_notes: recipe.middleNotes,
        base_notes: recipe.baseNotes
      }
      
      localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify(formattedRecipe))
    } catch (error) {
      console.error('レシピの保存に失敗:', error)
    }
  },

  // レシピの取得
  getRecipe(): FragranceRecipe | null {
    if (!isLocalStorageAvailable()) return null
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SELECTED_RECIPE)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      
      // 保存形式から内部形式への変換（API形式との違いを吸収）
      return {
        name: parsed.name,
        description: parsed.description,
        topNotes: parsed.top_notes || [],
        middleNotes: parsed.middle_notes || [],
        baseNotes: parsed.base_notes || []
      }
    } catch (error) {
      console.error('レシピの取得に失敗:', error)
      return null
    }
  },

  // セッションIDの保存
  saveSessionId(sessionId: string): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
    } catch (error) {
      console.error('セッションIDの保存に失敗:', error)
    }
  },

  // セッションIDの取得
  getSessionId(): string | null {
    if (!isLocalStorageAvailable()) return null
    
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_ID)
    } catch (error) {
      console.error('セッションIDの取得に失敗:', error)
      return null
    }
  },

  // 最終訪問時間の保存
  saveLastVisit(timestamp = Date.now()): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_VISIT, timestamp.toString())
    } catch (error) {
      console.error('最終訪問時間の保存に失敗:', error)
    }
  },

  // 最終訪問時間の取得
  getLastVisit(): number | null {
    if (!isLocalStorageAvailable()) return null
    
    try {
      const time = localStorage.getItem(STORAGE_KEYS.LAST_VISIT)
      return time ? parseInt(time, 10) : null
    } catch (error) {
      console.error('最終訪問時間の取得に失敗:', error)
      return null
    }
  },

  // 処理済みクエリの保存
  saveProcessedQueries(queries: string[]): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      localStorage.setItem('processedQueries', JSON.stringify(queries))
    } catch (error) {
      console.error('処理済みクエリの保存に失敗:', error)
    }
  },

  // 処理済みクエリの取得
  getProcessedQueries(): string[] {
    if (!isLocalStorageAvailable()) return []
    
    try {
      const data = localStorage.getItem('processedQueries')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('処理済みクエリの取得に失敗:', error)
      return []
    }
  },

  // 特定のキーのデータをクリア
  clear(key: keyof typeof STORAGE_KEYS): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      localStorage.removeItem(STORAGE_KEYS[key])
    } catch (error) {
      console.error(`${key}のクリアに失敗:`, error)
    }
  },

  // チャット関連のすべてのデータをクリア
  clearAll(): void {
    if (!isLocalStorageAvailable()) return
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      localStorage.removeItem('processedQueries')
    } catch (error) {
      console.error('すべてのデータのクリアに失敗:', error)
    }
  }
}
