"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChoiceButtons } from './components/ChoiceButtons'
import { useChatFlow, Message } from './hooks/useChatFlow'
import { ChatProgressSteps } from "./components/ChatProgressSteps"
import { useChatPhase } from "./hooks/useChatPhase"
import { cn } from "@/lib/utils"
import { TypewriterText } from "./components/TypewriterText"
import { ChatMessage } from "./components/ChatMessage"
import { motion } from "framer-motion"
import { ChatPhase as StepPhase } from "./components/ChatProgressSteps"
import { sendChatMessage, ChatAPIError } from '@/lib/api/chat'
import { FragranceRecipe } from './types'
import { getDefaultChoices, getChoiceDescription } from './utils/essential-oils'

// シングルトンパターンでSupabaseクライアントを管理
let supabaseInstance: any = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") ?? ""
  const pathname = usePathname()
  const isChatPage = pathname?.startsWith("/fragrance-lab/chat")

  const [input, setInput] = useState("")
  const [recipe, setRecipe] = useState<FragranceRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const { phase, nextPhase } = useChatPhase()
  const {
    messages,
    addMessage,
    addSplitMessages
  } = useChatFlow({
    onPhaseAdvance: nextPhase
  })

  // 初期メッセージの追加を制御するための状態を追加
  const [hasInitialized, setHasInitialized] = useState(false)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // デバッグ用：メッセージの状態変更を監視（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && messages.length > 0) {
      console.log("Messages updated:", messages.length)
    }
  }, [messages])

  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "こんにちは！香りのカスタムを始めましょう。どんなイメージがありますか？🌸"
      }
      addMessage(welcomeMessage)
      setHasInitialized(true)
    }
  }, [hasInitialized, messages.length, addMessage])

  useEffect(() => {
    if (initialQuery && messages.length === 0 && hasInitialized) {
      handleSend(initialQuery)
    }
  }, [initialQuery, messages.length, hasInitialized])

  const handleChoiceSelect = useCallback((choice: string) => {
    handleSend(choice)
  }, [])

  const createAssistantMessage = (content: string, data: any): Message => {
    return {
      id: uuidv4(),
      role: "assistant",
      content: content,
      ...(data.recipe && { recipe: data.recipe }),
      ...(data.choices?.length && { 
        choices: data.choices.filter(Boolean),
        emotionScores: data.emotionScores
      }),
      ...(!data.recipe && !data.choices?.length && { 
        emotionScores: data.emotionScores 
      })
    }
  }

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    try {
      setIsLoading(true)
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: message
      }
      addMessage(userMessage)

      const response = await sendChatMessage([...messages, userMessage], phase)

      const defaultChoices = getDefaultChoices(phase)
      const choicesDescriptions = defaultChoices.reduce((acc, choice) => {
        acc[choice] = getChoiceDescription(choice)
        return acc
      }, {} as { [key: string]: string })

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message.content,
        choices: defaultChoices,
        choices_descriptions: choicesDescriptions,
        recipe: response.message.recipe,
        emotionScores: response.message.emotionScores
      }
      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error in handleSend:', error)
      const defaultChoices = getDefaultChoices(phase)
      const choicesDescriptions = defaultChoices.reduce((acc, choice) => {
        acc[choice] = getChoiceDescription(choice)
        return acc
      }, {} as { [key: string]: string })

      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: error instanceof ChatAPIError ? error.message : 'エラーが発生しました。もう一度お試しください。',
        choices: defaultChoices,
        choices_descriptions: choicesDescriptions
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!recipe) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          name: recipe.title,
          description: recipe.description,
          top_notes: recipe.notes.top,
          middle_notes: recipe.notes.middle,
          base_notes: recipe.notes.base,
          mode: 'chat'
        })
        .select()

      if (error) throw error

      localStorage.setItem('selected_recipe', JSON.stringify({
        name: recipe.title,
        description: recipe.description,
        top_notes: recipe.notes.top,
        middle_notes: recipe.notes.middle,
        base_notes: recipe.notes.base
      }))

      router.push('/custom-order?mode=lab')
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('レシピの保存に失敗しました。')
    }
  }

  const handleConfirmClick = () => {
    setInput("はい")
    handleSend("はい")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {pathname !== "/fragrance-lab/chat" && <SiteHeader />}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <ChatProgressSteps currentStep={phase as unknown as StepPhase} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="container max-w-2xl mx-auto px-4 py-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.role}-${index}`}
              message={message}
              onSelect={message.role === "assistant" ? handleChoiceSelect : undefined}
            />
          ))}
          {isLoading && (
            <ChatMessage
              key="loading"
              message={{
                id: "loading",
                role: "assistant",
                content: "考え中...✨"
              }}
            />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-t border-muted z-10">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="container max-w-2xl mx-auto px-4 flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="香りのイメージを入力...🌸"
            className="flex-1 bg-background"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="relative min-w-[4rem] px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "送信"}
          </Button>
        </motion.form>
      </div>
      {pathname !== "/fragrance-lab/chat" && <SiteFooter />}
    </div>
  )
}
