import { useState, useCallback } from "react"
import { ChatPhase } from "../components/ChatProgressSteps"

export function useChatPhase() {
  const [phase, setPhase] = useState<ChatPhase>(1)

  const nextPhase = useCallback(() => {
    setPhase((current) => {
      if (current < 5) {
        return ((current + 1) as ChatPhase)
      }
      return current
    })
  }, [])

  const previousPhase = useCallback(() => {
    setPhase((current) => {
      if (current > 1) {
        return ((current - 1) as ChatPhase)
      }
      return current
    })
  }, [])

  const resetPhase = useCallback(() => {
    setPhase(1)
  }, [])

  const setSpecificPhase = useCallback((newPhase: ChatPhase) => {
    if (newPhase >= 1 && newPhase <= 5) {
      setPhase(newPhase)
    }
  }, [])

  const getPhaseLabel = useCallback(() => {
    switch (phase) {
      case 1:
        return "イメージ入力"
      case 2:
        return "トップノート選択"
      case 3:
        return "ミドルノート選択"
      case 4:
        return "ベースノート選択"
      case 5:
        return "レシピ確認"
      default:
        return ""
    }
  }, [phase])

  return {
    phase,
    setPhase,
    nextPhase,
    previousPhase,
    resetPhase,
    setSpecificPhase,
    getPhaseLabel,
    isFirstPhase: phase === 1,
    isLastPhase: phase === 5,
  }
} 