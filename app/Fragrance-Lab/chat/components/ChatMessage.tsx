"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { ChoiceButtons } from "./ChoiceButtons"
import { EmotionScoreCard } from "./EmotionScoreCard"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  choices?: string[]
  emotionScores?: {
    calm: number
    refresh: number
    romantic: number
    spiritual: number
    energy: number
  }
  onSelect?: (choice: string) => void
}

export const ChatMessage = memo(function ChatMessage({ 
  role, 
  content, 
  choices, 
  emotionScores,
  onSelect 
}: ChatMessageProps) {
  const isAssistant = role === "assistant"

  if (!content?.trim()) {
    return null
  }

  return (
    <div className={cn(
      "flex gap-3 px-4 py-1",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant && (
        <div className="w-10 h-10 mt-1 rounded-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm">
          <Image
            src="/images/Fragrance Lab.png"
            alt="Fragrance Lab"
            width={32}
            height={32}
            className="object-cover opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      <div className={cn(
        "px-4 py-2 rounded-2xl shadow-sm max-w-[80%]",
        isAssistant 
          ? "bg-white border border-gray-200 text-gray-800" 
          : "bg-primary text-white"
      )}>
        <p className="whitespace-pre-wrap break-words">
          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
        </p>
        {isAssistant && choices && choices.length > 0 && (
          <div className="mt-2">
            <ChoiceButtons choices={choices} onSelect={onSelect || (() => {})} />
          </div>
        )}
        {isAssistant && emotionScores && (
          <div className="mt-2">
            <EmotionScoreCard scores={emotionScores} />
          </div>
        )}
      </div>
      {!isAssistant && (
        <div className="w-10 h-10 mt-1 rounded-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm">
          <Image
            src="/images/User.png"
            alt="User"
            width={32}
            height={32}
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      )}
    </div>
  )
}) 