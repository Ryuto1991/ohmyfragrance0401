"use client"

import { useState, useCallback, useEffect } from 'react'
import { StorageService } from '@/utils/storage-service'
import { ChatPhase } from '@/app/fragrance-lab/chat/types'

interface ScentsSelectionOptions {
  currentPhase: ChatPhase
  updatePhase?: (newPhase: ChatPhase) => boolean
}

/**
 * 香り選択の状態を管理するフック
 * トップ、ミドル、ベースノートの香り選択を管理する
 */
export function useScentsSelection(options: ScentsSelectionOptions) {
  const { currentPhase, updatePhase } = options

  // 選択された香りの状態
  const [selectedScents, setSelectedScents] = useState<{
    top: string[]
    middle: string[]
    base: string[]
  }>({
    top: [],
    middle: [],
    base: []
  })

  // クライアントサイドでのみローカルストレージからレシピを読み込む
  useEffect(() => {
    const savedRecipe = StorageService.getRecipe()
    if (savedRecipe) {
      setSelectedScents({
        top: savedRecipe.topNotes,
        middle: savedRecipe.middleNotes,
        base: savedRecipe.baseNotes
      })
    }
  }, [])

  // フェーズに対応するノートタイプを取得する関数
  const getPhaseNoteType = useCallback((phase: ChatPhase): keyof typeof selectedScents | null => {
    switch (phase) {
      case 'top': return 'top'
      case 'middle': return 'middle'
      case 'base': return 'base'
      default: return null
    }
  }, [])

  // 選択された香りを更新する関数
  const updateSelectedScents = useCallback((selectedChoice: string) => {
    console.log(`香りを選択: ${selectedChoice}, 現在のフェーズ: ${currentPhase}`)

    // フェーズに対応するノートタイプを取得
    const noteType = getPhaseNoteType(currentPhase)
    if (!noteType) {
      console.warn(`無効なフェーズでの香り選択: ${currentPhase}`)
      return
    }

    // 選択された香りを更新
    setSelectedScents(prev => {
      const updatedScents = {
        ...prev,
        [noteType]: [selectedChoice]
      }

      // すべての香りが選択された場合の自動遷移処理
      if (updatedScents.top.length > 0 &&
          updatedScents.middle.length > 0 &&
          updatedScents.base.length > 0 &&
          currentPhase === 'base' &&
          updatePhase) {
        // 次のフェーズへの自動遷移を遅延実行
        setTimeout(() => {
          updatePhase('finalized')
        }, 1000)
      }

      return updatedScents
    })
  }, [currentPhase, getPhaseNoteType, updatePhase])

  // 選択された香りをすべてクリアする
  const resetScents = useCallback(() => {
    setSelectedScents({
      top: [],
      middle: [],
      base: []
    })
  }, [])

  // 現在のフェーズに対応する香り
  const currentPhaseScents = useCallback(() => {
    const noteType = getPhaseNoteType(currentPhase)
    if (!noteType) return []
    return selectedScents[noteType]
  }, [currentPhase, selectedScents, getPhaseNoteType])

  // すべての香りが選択されているかチェック
  const isAllScentsSelected = useCallback(() => {
    return (
      selectedScents.top.length > 0 &&
      selectedScents.middle.length > 0 &&
      selectedScents.base.length > 0
    )
  }, [selectedScents])

  // レシピが変更されたらストレージに保存
  useEffect(() => {
    if (isAllScentsSelected()) {
      StorageService.saveRecipe({
        topNotes: selectedScents.top,
        middleNotes: selectedScents.middle,
        baseNotes: selectedScents.base
      })
    }
  }, [selectedScents, isAllScentsSelected])

  return {
    // 状態
    selectedScents,
    currentPhaseScents: currentPhaseScents(),
    isAllScentsSelected: isAllScentsSelected(),

    // アクション
    updateSelectedScents,
    resetScents,

    // ヘルパー
    getPhaseNoteType
  }
}
