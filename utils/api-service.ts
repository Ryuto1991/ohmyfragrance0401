import type { Message, ChatPhase } from '@/app/fragrance-lab/chat/types'

// Define ChatResponse type that was missing from the original types
export interface ChatResponse {
  content: string;
  error?: string;
  followUp?: string;
}

/**
 * API通信を担当するサービス
 * バックエンドとの通信を一元管理するためのユーティリティ
 */
export const ApiService = {
  /**
   * チャットメッセージを送信してレスポンスを取得する
   * @param messages 送信するメッセージの配列
   * @param currentPhase 現在のチャットフェーズ
   * @param selectedScents 選択された香り
   * @param isUserSelection ユーザーが選択肢を選んだかどうか
   * @returns APIレスポンス
   */
  async sendChatMessage(
    messages: Message[],
    currentPhase: ChatPhase,
    selectedScents: any,
    isUserSelection: boolean = false
  ): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, 
          currentPhase, 
          selectedScents, 
          isUserSelection 
        }),
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('チャットメッセージ送信エラー:', error)
      
      // エラーハンドリング - アプリケーションが理解できる形に変換
      const errorMessage = error instanceof Error
        ? error.message
        : '不明なエラーが発生しました'
        
      return {
        content: `申し訳ありません。エラーが発生しました: ${errorMessage}`,
        error: errorMessage
      }
    }
  },

  /**
   * クエリパラメータによるチャットレスポンスを取得する
   * @param query クエリテキスト
   * @param format レスポンス形式
   * @returns APIレスポンス
   */
  async sendQueryRequest(
    query: string,
    format: 'json' | 'text' | 'html' = 'json'
  ): Promise<ChatResponse> {
    try {
      // URLパラメータの構築
      const params = new URLSearchParams({ 
        query,
        format
      })
      
      const response = await fetch(`/api/chat-query?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`クエリAPIエラー: ${response.status}`)
      }

      // JSONリクエストの場合
      if (format === 'json') {
        const data = await response.json()
        return data
      } 
      // テキスト形式の場合
      else {
        const text = await response.text()
        return { content: text }
      }
    } catch (error) {
      console.error('クエリリクエストエラー:', error)
      
      const errorMessage = error instanceof Error
        ? error.message
        : '不明なエラーが発生しました'
        
      return {
        content: `申し訳ありません。クエリ処理中にエラーが発生しました: ${errorMessage}`,
        error: errorMessage
      }
    }
  },

  /**
   * チャットセッションを保存する
   * @param sessionId セッションID
   * @param data 保存するデータ
   */
  async saveSession(sessionId: string, data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          data
        })
      })

      if (!response.ok) {
        throw new Error(`セッション保存エラー: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('セッション保存エラー:', error)
      return false
    }
  }
}
