"use client"

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  choices?: string[];
  recipe?: any;
  emotionScores?: {
    calm: number;
    refresh: number;
    romantic: number;
    spiritual: number;
    energy: number;
  };
}

interface ChatFlowOptions {
  initialDelay?: number
  messageDelay?: number
  typingDelay?: number
  onPhaseAdvance?: () => void
}

export function useChatFlow(options: ChatFlowOptions = {}) {
  const { 
    initialDelay = 500, 
    messageDelay = 800,
    typingDelay = 30,
    onPhaseAdvance 
  } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const splitContent = (content: string): string[] => {
    // 句点で分割
    const sentences = content.split(/([。！？])/g).filter(Boolean)
    const result: string[] = []
    let current = ""

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || "")
      
      if (current.length + sentence.length > 100) {
        if (current) {
          result.push(current)
          current = sentence
        } else {
          result.push(sentence)
        }
      } else {
        current += sentence
      }
    }

    if (current) {
      result.push(current)
    }

    return result
  }

  const addSplitMessages = useCallback((message: Message) => {
    const parts = splitContent(message.content)
    
    parts.forEach((content, index) => {
      const isLast = index === parts.length - 1
      addMessage({
        ...message,
        id: uuidv4(),
        content,
        choices: isLast ? message.choices : undefined,
        emotionScores: isLast ? message.emotionScores : undefined
      })
    })

    // レシピが完成した場合のみフェーズを進める
    if (message.recipe && 
        message.recipe.top_notes && 
        message.recipe.middle_notes && 
        message.recipe.base_notes) {
      onPhaseAdvance?.()
    }
  }, [addMessage, onPhaseAdvance])

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    addMessage,
    addSplitMessages
  }
} 