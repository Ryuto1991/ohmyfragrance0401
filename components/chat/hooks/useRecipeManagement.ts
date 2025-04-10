"use client"

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { StorageService } from '@/utils/storage-service'
import { Message, ChatPhase, FragranceRecipe } from '@/app/fragrance-lab/chat/types'

interface RecipeManagementOptions {
  messages: Message[]
  selectedScents: {
    top: string[]
    middle: string[]
    base: string[]
  }
  currentPhase: ChatPhase
}

/**
 * レシピ管理のためのフック
 * レシピの生成、保存、注文処理を担当
 */
export function useRecipeManagement(options: RecipeManagementOptions) {
  const { messages, selectedScents, currentPhase } = options
  const router = useRouter()

  // レシピ状態
  const [recipe, setRecipe] = useState<FragranceRecipe | null>(null)
  
  // クライアントサイドでのみレシピを読み込む
  useEffect(() => {
    const storedRecipe = StorageService.getRecipe()
    if (storedRecipe) {
      setRecipe(storedRecipe)
    }
  }, [])

  // 注文ボタンの有効状態
  const isOrderButtonEnabled = useMemo(() => {
    return (
      (currentPhase === 'finalized' || currentPhase === 'complete') &&
      selectedScents.top.length > 0 &&
      selectedScents.middle.length > 0 &&
      selectedScents.base.length > 0
    )
  }, [currentPhase, selectedScents])

  // メッセージからレシピ名を探す
  const findRecipeName = useCallback(() => {
    // 最新のアシスタントメッセージからレシピ情報を探す
    const recentMessages = [...messages].reverse()
    for (const msg of recentMessages) {
      if (msg.role === 'assistant' && msg.recipe) {
        return msg.recipe.name
      }
    }
    return null
  }, [messages])

  // メッセージからレシピ説明を探す
  const findRecipeDescription = useCallback(() => {
    // 最新のアシスタントメッセージからレシピ情報を探す
    const recentMessages = [...messages].reverse()
    for (const msg of recentMessages) {
      if (msg.role === 'assistant' && msg.recipe) {
        return msg.recipe.description
      }
    }
    return null
  }, [messages])

  // 選択された香りからレシピを更新
  useEffect(() => {
    // レシピが完成したらfinalizedフェーズで保存
    if (currentPhase === 'finalized' || currentPhase === 'complete') {
      const isRecipeComplete =
        selectedScents.top.length > 0 &&
        selectedScents.middle.length > 0 &&
        selectedScents.base.length > 0

      if (isRecipeComplete) {
        // レシピ情報をまとめて保存
        const recipeName = findRecipeName() || "オリジナルルームフレグランス"
        const recipeDescription = findRecipeDescription() || "あなただけのカスタムルームフレグランス"

        const newRecipe: FragranceRecipe = {
          name: recipeName,
          description: recipeDescription,
          topNotes: selectedScents.top,
          middleNotes: selectedScents.middle,
          baseNotes: selectedScents.base
        }

        setRecipe(newRecipe)
        StorageService.saveRecipe(newRecipe)
      }
    }
  }, [currentPhase, selectedScents, findRecipeName, findRecipeDescription])

  // 注文ページへ移動する関数
  const handleGoToOrder = useCallback(() => {
    // completeフェーズなら常に有効、それ以外は従来の条件で判断
    if (!isOrderButtonEnabled && currentPhase !== 'complete') {
      console.log('注文ボタンが無効です:', { isOrderButtonEnabled, currentPhase })
      return
    }

    console.log('注文ページに移動します')

    try {
      // もしレシピが未定義の場合、デフォルトのレシピを作成
      const recipeToSave = recipe || {
        name: "オリジナルルームフレグランス",
        description: "あなただけのカスタムブレンド",
        topNotes: selectedScents.top.length > 0 ? selectedScents.top : ["レモン"],
        middleNotes: selectedScents.middle.length > 0 ? selectedScents.middle : ["ラベンダー"],
        baseNotes: selectedScents.base.length > 0 ? selectedScents.base : ["サンダルウッド"]
      }
      
      // レシピを保存
      StorageService.saveRecipe(recipeToSave)
      console.log('レシピを保存しました:', recipeToSave)
      
      // 注文ページへリダイレクト
      window.location.href = '/custom-order?mode=lab'
    } catch (error) {
      console.error('注文処理エラー:', error)
    }
  }, [isOrderButtonEnabled, recipe, router, currentPhase, selectedScents])

  // レシピのリセット
  const resetRecipe = useCallback(() => {
    setRecipe(null)
    StorageService.clear('SELECTED_RECIPE')
  }, [])

  return {
    // 状態
    recipe,
    isOrderButtonEnabled,
    
    // アクション
    handleGoToOrder,
    resetRecipe
  }
}
