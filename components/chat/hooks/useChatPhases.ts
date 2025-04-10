"use client"

import { useState, useCallback, useMemo } from 'react'
import { ChatPhase } from '@/app/fragrance-lab/chat/types'

interface ChatPhaseOptions {
  initialPhase?: ChatPhase
  onPhaseChange?: () => void
}

// フェーズの順序を定義
const PHASE_ORDER: ChatPhase[] = [
  'welcome',
  'intro',
  'themeSelected',
  'top',
  'middle',
  'base',
  'finalized',
  'complete'
]

// フェーズ遷移を定義
const PHASE_TRANSITIONS: Record<ChatPhase, ChatPhase[]> = {
  welcome: ['intro'],
  intro: ['themeSelected'],
  themeSelected: ['top'],
  top: ['middle'],
  middle: ['base'],
  base: ['finalized'],
  finalized: ['complete'],
  complete: []
}

/**
 * チャットフェーズの管理を行うフック
 * フェーズの遷移とバリデーションを担当
 */
export function useChatPhases(options: ChatPhaseOptions = {}) {
  const { initialPhase = 'welcome', onPhaseChange } = options

  // 現在のフェーズ状態
  const [currentPhaseId, setCurrentPhaseId] = useState<ChatPhase>(initialPhase)
  
  // 最後のフェーズ変更時刻
  const [lastPhaseChangeTime, setLastPhaseChangeTime] = useState<number>(Date.now())

  // フェーズ遷移が有効かどうかを検証する関数
  const canTransition = useCallback((from: ChatPhase, to: ChatPhase): boolean => {
    return PHASE_TRANSITIONS[from]?.includes(to) ?? false
  }, [])

  // 次のフェーズを取得する関数
  const getNextPhase = useCallback((currentPhase: ChatPhase): ChatPhase | null => {
    const nextPhases = PHASE_TRANSITIONS[currentPhase]
    return nextPhases && nextPhases.length > 0 ? nextPhases[0] : null
  }, [])

  // 条件付きフェーズ遷移を処理する関数
  const getNextPhaseWithCondition = useCallback((
    currentPhase: ChatPhase,
    selectedScents: { top: string[], middle: string[], base: string[] },
    userInput?: string
  ): ChatPhase | null => {
    // 基本的な次のフェーズを取得
    const nextPhase = getNextPhase(currentPhase)

    // ユーザー入力に基づく条件付き遷移
    if (userInput) {
      const lowerInput = userInput.toLowerCase()
      
      // 「おまかせ」などのキーワードがある場合は一気に進める
      if (currentPhase === 'intro' || currentPhase === 'themeSelected') {
        if (lowerInput.includes('おまかせ') || lowerInput.includes('一気に') || lowerInput.includes('全部')) {
          return 'base' // 一気にベースノートまで進む
        }
      }
      
      // 完了を示すキーワードがある場合
      if (currentPhase === 'finalized' && 
          (lowerInput === 'おわり' || lowerInput === '完了' || lowerInput === 'はい')) {
        return 'complete'
      }
    }

    // 香り選択の状態に基づく遷移
    if (currentPhase === 'base' && 
        selectedScents.top.length > 0 &&
        selectedScents.middle.length > 0 && 
        selectedScents.base.length > 0) {
      return 'finalized' // すべての香りが選択されたら確認フェーズへ
    }

    return nextPhase
  }, [getNextPhase])

  // フェーズの更新
  const updatePhase = useCallback((newPhase: ChatPhase) => {
    // フェーズ遷移のバリデーション
    if (!canTransition(currentPhaseId, newPhase)) {
      console.warn(`無効なフェーズ遷移: ${currentPhaseId} -> ${newPhase}`)
      return false
    }

    console.log(`フェーズを更新: ${currentPhaseId} -> ${newPhase}`)
    
    // フェーズを更新
    setCurrentPhaseId(newPhase)
    setLastPhaseChangeTime(Date.now())

    // カスタムイベントハンドラがあれば呼び出す
    if (onPhaseChange) {
      onPhaseChange()
    }

    return true
  }, [currentPhaseId, canTransition, onPhaseChange])

  // フェーズのリセット
  const resetPhase = useCallback(() => {
    setCurrentPhaseId('welcome')
    setLastPhaseChangeTime(Date.now())
  }, [])

  // フェーズに対応する表示名を取得
  const phaseDisplayName = useMemo(() => {
    const displayNames: Record<ChatPhase, string> = {
      welcome: 'ようこそ',
      intro: 'イメージ入力',
      themeSelected: 'テーマ選択',
      top: 'ステップ2: トップノート',
      middle: 'ステップ3: ミドルノート',
      base: 'ステップ4: ベースノート',
      finalized: 'ステップ5: レシピ確認',
      complete: 'ステップ6: 完了'
    }
    
    return displayNames[currentPhaseId] || currentPhaseId
  }, [currentPhaseId])

  // 現在のフェーズの進捗状況を取得
  const currentProgress = useMemo(() => {
    const totalSteps = PHASE_ORDER.length - 1 // welcome は0とする
    const currentStep = PHASE_ORDER.indexOf(currentPhaseId)
    return {
      step: currentStep,
      totalSteps,
      percentage: Math.round((currentStep / totalSteps) * 100)
    }
  }, [currentPhaseId])

  return {
    // 状態
    currentPhaseId,
    lastPhaseChangeTime,
    phaseDisplayName,
    currentProgress,
    
    // アクション
    updatePhase,
    resetPhase,
    
    // ヘルパー関数
    canTransition,
    getNextPhase,
    getNextPhaseWithCondition
  }
}
