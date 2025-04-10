"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useChatCore } from '@/components/chat/hooks/useChatCore'
import { useChatPhases } from '@/components/chat/hooks/useChatPhases'
import { useScentsSelection } from '@/components/chat/hooks/useScentsSelection'
import { useRecipeManagement } from '@/components/chat/hooks/useRecipeManagement'
import { Message, ChatPhase, FragranceRecipe } from '@/app/fragrance-lab/chat/types'

// チャット機能全体の状態と操作を管理するコンテキストの型定義
export interface ChatContextType {
  // コアメッセージ状態
  messages: Message[]
  isLoading: boolean
  isSubmitting: boolean
  error: Error | null
  
  // メッセージ操作関数
  sendMessage: (content: string, isUserSelection?: boolean) => Promise<any>
  addMessage: (content: string) => Promise<any>
  handleError: (error: Error | null) => void
  resetChat: () => void
  
  // フェーズ状態
  currentPhaseId: ChatPhase
  lastPhaseChangeTime: number
  
  // フェーズ操作関数
  updatePhase: (newPhase: ChatPhase) => void
  
  // 香り選択状態
  selectedScents: {
    top: string[]
    middle: string[]
    base: string[]
  }
  
  // 香り選択操作関数
  updateSelectedScents: (selectedChoice: string) => void
  
  // レシピ状態
  recipe: FragranceRecipe | null
  isOrderButtonEnabled: boolean
  
  // レシピ操作関数
  handleGoToOrder: () => void
  handleAutoCreateRecipe: () => Promise<any>
  handleChoiceClick: (choice: { name: string, description?: string } | string) => Promise<void>
}

// チャットコンテキストの作成
export const ChatContext = createContext<ChatContextType | null>(null)

// チャットコンテキストを使用するためのカスタムフック
export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

// プロバイダーのプロパティ型
interface ChatProviderProps {
  children: ReactNode
  initialMessages?: Message[]
  initialPhase?: ChatPhase
}

/**
 * チャット機能全体を管理するプロバイダーコンポーネント
 * 各サブシステム（コア状態、フェーズ、香り選択、レシピ）の状態と操作を集約して提供する
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  initialMessages = [],
  initialPhase = 'welcome'
}) => {
  // コア状態管理（メッセージ、ローディング状態など）
  const chatCore = useChatCore(initialMessages)
  
  // フェーズ管理
  const phaseState = useChatPhases({
    initialPhase,
    onPhaseChange: chatCore.resetFollowUp
  })
  
  // 香り選択の状態管理
  const scentsState = useScentsSelection({
    currentPhase: phaseState.currentPhaseId,
    updatePhase: phaseState.updatePhase
  })
  
  // レシピ管理
  const recipeState = useRecipeManagement({
    messages: chatCore.messages,
    selectedScents: scentsState.selectedScents,
    currentPhase: phaseState.currentPhaseId
  })

  // チャットコンテキストの値
  const value: ChatContextType = {
    // コア状態
    messages: chatCore.messages,
    isLoading: chatCore.isLoading,
    isSubmitting: chatCore.isLoading, // 互換性のために両方提供
    error: chatCore.error,
    
    // メッセージ操作
    sendMessage: async (content, isUserSelection) => {
      return chatCore.sendMessage(
        content, 
        isUserSelection, 
        phaseState.currentPhaseId, 
        scentsState.selectedScents
      )
    },
    addMessage: chatCore.addMessage,
    handleError: chatCore.handleError,
    resetChat: () => {
      chatCore.resetChat()
      phaseState.resetPhase()
      scentsState.resetScents()
      recipeState.resetRecipe()
    },
    
    // フェーズ状態
    currentPhaseId: phaseState.currentPhaseId,
    lastPhaseChangeTime: phaseState.lastPhaseChangeTime,
    
    // フェーズ操作
    updatePhase: phaseState.updatePhase,
    
    // 香り選択状態
    selectedScents: scentsState.selectedScents,
    
    // 香り選択操作
    updateSelectedScents: scentsState.updateSelectedScents,
    
    // レシピ状態
    recipe: recipeState.recipe,
    isOrderButtonEnabled: recipeState.isOrderButtonEnabled,
    
    // レシピ操作
    handleGoToOrder: recipeState.handleGoToOrder,
    handleAutoCreateRecipe: async () => {
      try {
        // 自動レシピ作成の前処理
        phaseState.updatePhase('top')
        scentsState.resetScents()
        
        // デフォルトの香り設定
        scentsState.updateSelectedScents('レモン')
        phaseState.updatePhase('middle')
        scentsState.updateSelectedScents('ラベンダー')
        phaseState.updatePhase('base')
        scentsState.updateSelectedScents('サンダルウッド')
        
        // 自動レシピ作成メッセージを送信
        const result = await chatCore.sendMessage(
          'おまかせでレシピを作成してください', 
          true, 
          phaseState.currentPhaseId, 
          scentsState.selectedScents
        )
        
        // フェーズを完了に設定
        setTimeout(() => {
          phaseState.updatePhase('finalized')
          setTimeout(() => {
            phaseState.updatePhase('complete')
          }, 1000)
        }, 1000)
        
        return result
      } catch (error) {
        console.error('自動レシピ作成エラー:', error)
        chatCore.handleError(error instanceof Error ? error : new Error('自動レシピ作成中にエラーが発生しました'))
        return null
      }
    },
    handleChoiceClick: async (choice) => {
      if (chatCore.isLoading) return
      
      // 選択肢のテキストを取得
      const choiceText = typeof choice === 'string' ? choice : choice.name
      
      try {
        // 香りの選択を更新
        if (['top', 'middle', 'base'].includes(phaseState.currentPhaseId)) {
          scentsState.updateSelectedScents(choiceText)
        }
        
        // メッセージを送信
        await chatCore.sendMessage(
          choiceText, 
          true, 
          phaseState.currentPhaseId, 
          scentsState.selectedScents
        )
      } catch (error) {
        console.error('選択肢クリック時のエラー:', error)
        chatCore.handleError(error instanceof Error ? error : new Error('選択肢の処理中にエラーが発生しました'))
      }
    }
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
