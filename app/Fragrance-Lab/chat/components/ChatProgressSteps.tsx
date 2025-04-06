'use client'

import { ChatPhase, CHAT_PHASES } from '../types'

interface ChatProgressStepsProps {
  currentPhaseId: ChatPhase
}

export function ChatProgressSteps({ currentPhaseId }: ChatProgressStepsProps) {
  const steps = Object.values(CHAT_PHASES).sort((a, b) => a.step - b.step)

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentPhaseId
          const isCompleted = CHAT_PHASES[currentPhaseId].step > step.step
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : step.step + 1}
              </div>
              {!isLast && (
                <div
                  className={`h-1 w-16 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 