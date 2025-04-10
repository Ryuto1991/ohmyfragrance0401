"use client"

import React, { useMemo } from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatPhase } from "@/types/chat-types"

interface ChatProgressStepsProps {
  currentPhaseId: ChatPhase
}

// フェーズの順序と情報を定義
const CHAT_PHASES = {
  welcome: { id: 'welcome', step: 0, label: 'ようこそ' },
  intro: { id: 'intro', step: 1, label: 'イメージ入力' },
  themeSelected: { id: 'themeSelected', step: 2, label: 'テーマ選択' },
  top: { id: 'top', step: 3, label: 'トップノート' },
  middle: { id: 'middle', step: 4, label: 'ミドルノート' },
  base: { id: 'base', step: 5, label: 'ベースノート' },
  finalized: { id: 'finalized', step: 6, label: 'レシピ確認' },
  complete: { id: 'complete', step: 7, label: '完了' }
} as const

/**
 * チャット進行ステップを表示するコンポーネント
 * 現在のフェーズに基づいて進行状況を視覚的に表示する
 */
export function ChatProgressSteps({ currentPhaseId }: ChatProgressStepsProps) {
  // 表示するステップの決定
  const visibleSteps = useMemo(() => {
    return [
      CHAT_PHASES.intro,
      CHAT_PHASES.top,
      CHAT_PHASES.middle,
      CHAT_PHASES.base,
      CHAT_PHASES.finalized,
      CHAT_PHASES.complete
    ]
  }, [])

  // 現在のステップ番号
  const currentStep = CHAT_PHASES[currentPhaseId]?.step || 0
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {visibleSteps.map((phase, index) => {
          const isCompleted = currentStep > phase.step
          const isCurrent = currentStep === phase.step

          return (
            <React.Fragment key={phase.id}>
              {/* ステップアイコン */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-white text-primary"
                        : "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 md:h-5 md:w-5" data-testid="check-icon" />
                  ) : (
                    <span className="text-xs md:text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 hidden md:block text-xs",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {phase.label}
                </span>
              </div>

              {/* 接続線（最後のアイテムでない場合のみ） */}
              {index < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors",
                    currentStep > phase.step ? "bg-primary" : "bg-gray-300"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* モバイル用ラベル (現在のフェーズのみ表示) */}
      <div className="flex md:hidden justify-center mt-2">
        <span className="text-xs text-foreground">
          {CHAT_PHASES[currentPhaseId]?.label || ''}
        </span>
      </div>
    </div>
  )
}
