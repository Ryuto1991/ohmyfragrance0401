"use client"

import { useState, useCallback, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { ApiService } from '@/utils/api-service'
import { StorageService } from '@/utils/storage-service'
import { createMessage, addErrorInfo, splitMessageIntoParts } from '@/utils/message-utils'
import { Message, ChatPhase } from '@/app/fragrance-lab/chat/types'
import { ChatResponse } from '@/utils/api-service'

/**
 * チャットの核となる状態と機能を管理するフック
 * メッセージの送受信、履歴管理、エラー処理など基本的なチャット機能を提供
 */
export function useChatCore(initialMessages: Message[] = []) {
  // メッセージ状態
  const [messages, setMessages] = useState<Message[]>(() => {
    return initialMessages.length > 0 
      ? initialMessages 
      : [createMessage('assistant', '今日はどんな香りつくる？')]
  })
  
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false)
  
  // エラー状態
  const [error, setError] = useState<Error | null>(null)
  
  // フォローアップメッセージの状態
  const [followUpSent, setFollowUpSent] = useState(false)
  
  // セッションID (一意のセッションを識別)
  const [sessionId] = useState(() => {
    const storedId = StorageService.getSessionId()
    return storedId || uuid()
  })

  // セッションIDの保存
  useEffect(() => {
    StorageService.saveSessionId(sessionId)
  }, [sessionId])

  // メッセージの保存（永続化）
  useEffect(() => {
    if (messages.length > 1) {
      StorageService.saveChatHistory(messages)
    }
  }, [messages])

  // フォローアップフラグのリセット
  const resetFollowUp = useCallback(() => {
    setFollowUpSent(false)
  }, [])

  // メッセージの送信
  const sendMessage = useCallback(async (
    content: string,
    isUserSelection: boolean = false,
    currentPhase: ChatPhase = 'welcome',
    selectedScents: any = { top: [], middle: [], base: [] }
  ) => {
    if (isLoading || !content.trim()) return null

    setIsLoading(true)
    setError(null)

    try {
      // ユーザーメッセージをメッセージリストに追加
      const userMessage = createMessage('user', content)
      
      // 状態更新
      setMessages(prev => [...prev, userMessage])

      // APIにメッセージを送信
      const response = await ApiService.sendChatMessage(
        [...messages, userMessage],
        currentPhase,
        selectedScents,
        isUserSelection
      )

      // エラーチェック
      if (response.error) {
        throw new Error(response.error)
      }

      // メッセージの分割処理
      const parts = splitMessageIntoParts(response.content, { currentPhase })

      // 各パートを順番に処理
      for (const part of parts) {
        const aiMessage: Message = createMessage('assistant', part.content, {
          choices: part.choices,
          recipe: part.recipe,
          should_split: part.shouldSplit
        })

        setMessages(prev => [...prev, aiMessage])

        // 分割が必要な場合は遅延を入れる
        if (part.shouldSplit) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // フォローアップメッセージの処理
      if (response.followUp && !followUpSent) {
        setFollowUpSent(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        await sendMessage(response.followUp, false, currentPhase, selectedScents)
      }

      return response

    } catch (error) {
      console.error('メッセージ送信エラー:', error)

      // エラーメッセージの強化
      const errorMessage = createMessage(
        'assistant',
        addErrorInfo('申し訳ありません。エラーが発生しました。もう一度お試しください。', 
                    error instanceof Error ? error : new Error('不明なエラー'))
      )

      setMessages(prev => [...prev, errorMessage])
      setError(error instanceof Error ? error : new Error('予期せぬエラーが発生しました'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, followUpSent])

  // メッセージの追加 (ユーザーメッセージを追加してから送信)
  const addMessage = useCallback(async (content: string) => {
    if (!content.trim()) return null

    // ユーザーメッセージを追加してから送信
    const userMessage = createMessage('user', content)
    
    setMessages(prev => [...prev, userMessage])

    // APIにメッセージを送信 (デフォルト値を使用)
    return sendMessage(content)
  }, [sendMessage])

  // エラーハンドリング
  const handleError = useCallback((error: Error | null) => {
    setError(error)
  }, [])

  // チャットのリセット
  const resetChat = useCallback(() => {
    // 初期メッセージのみの状態にリセット
    setMessages([createMessage('assistant', '今日はどんな香りつくる？')])
    setIsLoading(false)
    setError(null)
    setFollowUpSent(false)
    
    // ストレージをクリア
    StorageService.clear('CHAT_HISTORY')
  }, [])

  return {
    // 状態
    messages,
    isLoading,
    error,
    sessionId,
    followUpSent,
    
    // アクション
    sendMessage,
    addMessage,
    handleError,
    resetChat,
    resetFollowUp
  }
}
