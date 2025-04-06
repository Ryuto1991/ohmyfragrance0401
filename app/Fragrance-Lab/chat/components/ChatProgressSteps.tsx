'use client'

import { ChatPhase, CHAT_PHASES } from '../types'

interface ChatProgressStepsProps {
  currentPhaseId: ChatPhase
}

export function ChatProgressSteps({ currentPhaseId }: ChatProgressStepsProps) {
  // welcomeとintroを除外し、themeSelectedからcompleteまでのステップだけを表示
  const steps = Object.values(CHAT_PHASES)
    .filter(step => ['themeSelected', 'top', 'middle', 'base', 'finalized', 'complete'].includes(step.id))
    .sort((a, b) => a.step - b.step)

  // ステップ名を取得する関数
  const getStepLabel = (id: ChatPhase) => {
    switch (id) {
      case 'themeSelected': return 'テーマ'
      case 'top': return 'トップ'
      case 'middle': return 'ミドル'
      case 'base': return 'ベース'
      case 'finalized': return '確認'
      case 'complete': return '完了'
      default: return ''
    }
  }

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentPhaseId
          const isCompleted = CHAT_PHASES[currentPhaseId].step > step.step
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                {!isLast && (
                  <div
                    className={`h-1 w-14 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-500 font-medium' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                {getStepLabel(step.id)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 