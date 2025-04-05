"use client"

import { useState, useCallback, useRef, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Message as MessageType, ChatFlowOptions } from '../types'
import { ChatAPIError } from '@/lib/api/chat'

export type Message = MessageType

export function useChatFlow(options: ChatFlowOptions = {}) {
  const { 
    initialDelay = 1000, 
    messageDelay = 1000,
    typingDelay = 50,
    onPhaseAdvance 
  } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageQueueRef = useRef<Message[]>([])
  const isProcessingRef = useRef(false)

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
    setError(null)
  }, [])

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages(prev => [...prev, ...newMessages])
    setError(null)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    messageQueueRef.current = []
    setError(null)
  }, [])

  const splitContent = useCallback((content: string): string[] => {
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
  }, [])

  const addSplitMessages = useCallback((message: Message) => {
    if (isProcessingRef.current) {
      messageQueueRef.current.push(message)
      return
    }

    isProcessingRef.current = true
    const parts = splitContent(message.content)
    const newMessages: Message[] = []
    
    parts.forEach((content, index) => {
      const isLast = index === parts.length - 1
      newMessages.push({
        ...message,
        id: uuidv4(),
        content,
        choices: isLast ? message.choices : undefined,
        choices_descriptions: isLast ? message.choices_descriptions : undefined,
        emotionScores: isLast ? message.emotionScores : undefined,
        recipe: isLast ? message.recipe : undefined
      })
    })

    addMessages(newMessages)

    if (message.recipe && 
        message.recipe.notes.top && 
        message.recipe.notes.middle && 
        message.recipe.notes.base) {
      onPhaseAdvance?.()
    }

    isProcessingRef.current = false
    if (messageQueueRef.current.length > 0) {
      const nextMessage = messageQueueRef.current.shift()
      if (nextMessage) {
        addSplitMessages(nextMessage)
      }
    }
  }, [addMessages, onPhaseAdvance, splitContent])

  const messageCount = useMemo(() => messages.length, [messages])

  return {
    messages,
    messageCount,
    setMessages,
    isLoading,
    setIsLoading,
    error,
    setError,
    addMessage,
    addMessages,
    addSplitMessages,
    clearMessages
  }
} 