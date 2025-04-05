"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { ChoiceButtons } from "./ChoiceButtons"
import { EmotionScoreCard } from "./EmotionScoreCard"
import { Message } from "../types"

interface ChatMessageProps {
  message: Message
  onSelect?: (choice: string) => void
}

const AssistantAvatar = memo(function AssistantAvatar() {
  return (
    <div className="w-10 h-10 mt-1 rounded-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm">
      <Image
        src="/images/Fragrance Lab.png"
        alt="Fragrance Lab"
        width={32}
        height={32}
        className="object-cover opacity-90 hover:opacity-100 transition-opacity"
        priority
      />
    </div>
  )
})

const UserAvatar = memo(function UserAvatar() {
  return (
    <div className="w-10 h-10 mt-1 rounded-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-xs font-medium text-primary">You</span>
      </div>
    </div>
  )
})

const MessageContent = memo(function MessageContent({ 
  content,
  error 
}: { 
  content: string
  error?: string 
}) {
  return (
    <div className={cn(
      "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
      error 
        ? "bg-destructive/5 border border-destructive/10" 
        : "bg-primary/5 border border-primary/10"
    )}>
      <p className={cn(
        "text-sm leading-relaxed whitespace-pre-wrap",
        error && "text-destructive"
      )}>
        {content}
      </p>
    </div>
  )
})

export const ChatMessage = memo(function ChatMessage({ 
  message,
  onSelect 
}: ChatMessageProps) {
  const { role, content, choices, choices_descriptions, emotionScores, error } = message
  const isAssistant = role === "assistant"

  if (!content?.trim()) {
    return null
  }

  return (
    <div className={cn(
      "flex gap-3 px-4 py-1",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant ? <AssistantAvatar /> : <UserAvatar />}
      <div className="flex flex-col gap-2">
        <MessageContent content={content} error={error} />
        {choices && choices.length > 0 && (
          <ChoiceButtons 
            choices={choices} 
            choices_descriptions={choices_descriptions}
            onSelect={onSelect} 
          />
        )}
        {emotionScores && (
          <EmotionScoreCard scores={emotionScores} />
        )}
      </div>
    </div>
  )
}) 