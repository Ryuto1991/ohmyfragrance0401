"use client"

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  choices?: string[]
  options?: {
    showConfirmButton?: boolean
    isJson?: boolean
  }
}

interface ChatFlowOptions {
  initialDelay?: number
  messageDelay?: number
}

export function useChatFlow(options: ChatFlowOptions = {}) {
  const { initialDelay = 500, messageDelay = 800 } = options
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((
    role: "user" | "assistant",
    content: string = "",
    options?: Message["options"],
    choices?: string[]
  ) => {
    const isJson = content ? content.trim().startsWith('{') && content.trim().endsWith('}') : false
    
    setMessages((prev) => [
      ...prev,
      { 
        id: uuidv4(), 
        role, 
        content: content || "",
        choices,
        options: {
          ...options,
          isJson: isJson
        }
      }
    ])
  }, [])

  const addSplitMessages = useCallback(async (
    contents: string[],
    choices?: string[],
    options?: Message["options"]
  ) => {
    // 最初のメッセージを即時表示
    addMessage("assistant", contents[0])

    // 残りのメッセージを遅延表示
    for (let i = 1; i < contents.length; i++) {
      await new Promise(resolve => setTimeout(resolve, messageDelay))
      if (i === contents.length - 1) {
        // 最後のメッセージには選択肢とオプションを付加
        addMessage("assistant", contents[i], options, choices)
      } else {
        addMessage("assistant", contents[i])
      }
    }
  }, [addMessage, messageDelay])

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    addMessage,
    addSplitMessages
  }
} 