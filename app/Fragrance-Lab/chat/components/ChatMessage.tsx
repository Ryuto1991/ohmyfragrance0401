"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { ChoiceButtons } from "./ChoiceButtons"
import { EmotionScoreCard } from "./EmotionScoreCard"
import { Message } from "../types"
import { TypewriterText } from './TypewriterText'

interface ChatMessageProps {
  message: Message
  onChoiceSelect?: (choice: string) => void
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

export function ChatMessage({ message, onChoiceSelect }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.error !== undefined

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isError
            ? 'bg-red-100 text-red-800'
            : isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isError ? (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message.error}</span>
          </div>
        ) : (
          <>
            <TypewriterText content={message.content} />
            {message.choices && message.choices.length > 0 && (
              <div className="mt-4 space-y-2">
                {message.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => onChoiceSelect?.(choice)}
                    className="block w-full p-2 text-left rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {choice}
                    {message.choices_descriptions?.[index] && (
                      <span className="block text-sm text-gray-600">
                        {message.choices_descriptions[index]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 