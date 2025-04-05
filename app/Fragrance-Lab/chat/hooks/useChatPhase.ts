import { useState, useCallback, useRef, useMemo } from "react"
import { ChatPhase } from "../types"

const PHASE_ORDER: ChatPhase[] = [
  "welcome",
  "purpose",
  "personality",
  "preferences",
  "emotions",
  "result"
]

const PHASE_LABELS: Record<ChatPhase, string> = {
  "welcome": "イメージ入力",
  "purpose": "トップノート選択",
  "personality": "ミドルノート選択",
  "preferences": "ベースノート選択",
  "emotions": "感情分析",
  "result": "レシピ確認"
}

export function useChatPhase() {
  const [phase, setPhase] = useState<ChatPhase>("welcome")
  const phaseHistoryRef = useRef<ChatPhase[]>([])

  const nextPhase = useCallback(() => {
    setPhase((current) => {
      const currentIndex = PHASE_ORDER.indexOf(current)
      if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
        return current
      }
      const next = PHASE_ORDER[currentIndex + 1]
      phaseHistoryRef.current.push(current)
      return next
    })
  }, [])

  const previousPhase = useCallback(() => {
    setPhase((current) => {
      const previous = phaseHistoryRef.current.pop()
      return previous || current
    })
  }, [])

  const resetPhase = useCallback(() => {
    setPhase("welcome")
    phaseHistoryRef.current = []
  }, [])

  const setSpecificPhase = useCallback((newPhase: ChatPhase) => {
    if (PHASE_ORDER.includes(newPhase)) {
      setPhase(newPhase)
      phaseHistoryRef.current.push(newPhase)
    }
  }, [])

  const getPhaseLabel = useCallback(() => {
    return PHASE_LABELS[phase] || ""
  }, [phase])

  const isLastPhase = useMemo(() => phase === "result", [phase])
  const isFirstPhase = useMemo(() => phase === "welcome", [phase])
  const currentPhaseIndex = useMemo(() => PHASE_ORDER.indexOf(phase), [phase])
  const totalPhases = useMemo(() => PHASE_ORDER.length, [])

  return {
    phase,
    nextPhase,
    previousPhase,
    resetPhase,
    setSpecificPhase,
    getPhaseLabel,
    isLastPhase,
    isFirstPhase,
    currentPhaseIndex,
    totalPhases
  }
} 