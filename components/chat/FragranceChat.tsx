"use client"

import React, { useRef, useEffect } from "react"
import { Loader2, RefreshCw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { v4 as uuid } from 'uuid'
import { useChatContext } from "./ChatProvider"
import { MessageItem } from "./components/MessageItem"
import { ChatProgressSteps } from "@/app/fragrance-lab/chat/components/ChatProgressSteps"
import { ChoiceOption } from "@/app/fragrance-lab/chat/types"
import { normalizeChoice } from "@/utils/message-utils"

interface FragranceChatProps {
  initialQuery?: string
}

/**
 * フレグランスチャットコンポーネント
 * ユーザーとAIの対話によるフレグランス作成インターフェース
 */
export function FragranceChat({ initialQuery }: FragranceChatProps) {
  const {
    messages,
    currentPhaseId,
    selectedScents,
    isLoading,
    isSubmitting,
    error,
    addMessage,
    sendMessage,
    handleError,
    isOrderButtonEnabled,
    updatePhase,
    resetChat,
    handleGoToOrder,
    handleAutoCreateRecipe,
    handleChoiceClick
  } = useChatContext()

  const [input, setInput] = React.useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 確実に最下部までスクロールする関数
  const scrollToBottom = React.useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  // メッセージが追加されたときに最下部にスクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // 初期表示時にフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 初期クエリの処理
  useEffect(() => {
    const handleInitialQuery = async () => {
      if (initialQuery && messages.length <= 1) {
        console.log("初期クエリを処理します:", initialQuery)
        await addMessage(initialQuery)
        
        // 自動的におまかせレシピを作成（クエリが「おまかせ」を含む場合）
        if (
          initialQuery.includes('おまかせ') || 
          initialQuery.includes('自動') || 
          initialQuery.includes('適当')
        ) {
          setTimeout(() => {
            handleAutoCreateRecipe()
          }, 2000)
        }
      }
    }
    
    handleInitialQuery()
  }, [initialQuery, addMessage, messages.length, handleAutoCreateRecipe])

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || !input.trim()) return
    
    const content = input.trim()
    setInput('')
    
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('メッセージ送信中にエラーが発生しました:', error)
      handleError(error instanceof Error ? error : new Error('メッセージの送信に失敗しました'))
    }
  }

  // 選択肢クリックハンドラー
  const onChoiceClick = async (choice: ChoiceOption) => {
    try {
      await handleChoiceClick(choice)
    } catch (error) {
      console.error('選択肢処理エラー:', error)
    }
  }

  // エラー表示の場合
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md text-center">
          <p className="font-semibold mb-2">エラーが発生しました</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <Button
          onClick={() => handleError(null)}
          variant="default"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      {/* フェーズ進行状況 */}
      <div className="px-4 pt-4">
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>

      {/* デバッグ情報（開発環境のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-black/5 p-2 text-xs">
          <div>フェーズ: {currentPhaseId}</div>
          <div>トップ: {selectedScents.top.join(', ') || 'なし'}</div>
          <div>ミドル: {selectedScents.middle.join(', ') || 'なし'}</div>
          <div>ベース: {selectedScents.base.join(', ') || 'なし'}</div>
          <div>注文ボタン: {isOrderButtonEnabled ? '有効' : '無効'}</div>
        </div>
      )}

      {/* チャットメッセージ表示エリア */}
      <div ref={scrollAreaRef} className="flex-1 p-3 md:p-5 overflow-y-auto mb-16">
        <div className="space-y-4 max-w-4xl lg:max-w-6xl mx-auto">
          {messages.map((message) => (
            <MessageItem 
              key={message.id || uuid()} 
              message={message} 
              onChoiceClick={onChoiceClick}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          {/* 自動スクロール用の空の要素 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white/95 backdrop-blur-sm shadow-md px-4 md:px-5 py-3 md:py-4 flex flex-col gap-2 md:gap-3 z-10 border-t"
      >
        <div className="flex gap-2 md:gap-3 items-center max-w-4xl lg:max-w-6xl mx-auto w-full">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={isLoading || isSubmitting}
            className="focus:ring-2 focus:ring-primary text-sm md:text-base h-10 md:h-11 border-primary/20"
          />
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-shrink-0 h-10 md:h-11 px-3 md:px-5 text-sm md:text-base"
          >
            {isLoading ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : '送信'}
          </Button>
        </div>
        <div className="max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col gap-2">
          {/* 注文ボタン */}
          <Button
            type="button"
            variant="default"
            className={`w-full h-9 md:h-10 text-sm md:text-base ${
              isOrderButtonEnabled || currentPhaseId === 'complete'
                ? 'bg-primary hover:bg-primary/90 text-white shadow-sm animate-pulse'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
            }`}
            onClick={handleGoToOrder}
            // 完了フェーズでは常に有効
            disabled={!(isOrderButtonEnabled || currentPhaseId === 'complete')}
            title="注文ページに進む"
          >
            ルームフレグランスを注文する
            <span className="ml-2 flex items-center">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Button>

          {/* おまかせレシピ作成ボタン */}
          {currentPhaseId !== 'complete' && currentPhaseId !== 'finalized' && (
            <Button
              type="button"
              variant="secondary"
              className="w-full h-9 md:h-10 text-sm md:text-base bg-secondary/90 hover:bg-secondary/80"
              onClick={async () => {
                console.log("おまかせレシピ作成ボタンがクリックされました")
                await handleAutoCreateRecipe()
              }}
              disabled={isLoading}
            >
              <span className="mr-2">✨</span>
              おまかせでレシピ作成
            </Button>
          )}

          {/* リセットボタン */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 md:h-10 text-sm md:text-base border-red-300 hover:bg-red-50"
            onClick={() => resetChat()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            チャットをリセット
          </Button>
        </div>
      </form>
    </div>
  )
}
