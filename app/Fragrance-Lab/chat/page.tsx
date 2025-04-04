"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSearchParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { createClient } from '@supabase/supabase-js'
import { ChoiceButtons } from './components/ChoiceButtons'
import Image from "next/image"
import { useChatFlow } from './hooks/useChatFlow'

interface Choice {
  name: string;
  description?: string;
}

// 型定義を更新
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

const STEPS = ["テーマ設定", "トップノート", "ミドルノート", "ベースノート", "確認"]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface FragranceRecipe {
  title: string
  description: string
  notes: {
    top: string[]
    middle: string[]
    base: string[]
  }
}

export default function FragranceLabChat() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") ?? ""

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    addMessage,
    addSplitMessages
  } = useChatFlow()

  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [recipe, setRecipe] = useState<FragranceRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        })
      }, 100)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { id: uuidv4(), role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          }))
        })
      })
      const data = await res.json()
      
      // レシピ確認のメッセージかどうかを判定
      const isRecipeConfirmation = data.recipe !== undefined

      // メッセージを分割して表示
      if (data.content) {
        const splitContents = data.content
          .split('\n\n')
          .filter(Boolean)
          .map((content: string) => {
            if (content.includes('"json') || content.includes('```json')) {
              return '選択肢から香りをお選びください：'
            }
            return content
          })
        
        // 選択肢がある場合は、説明文を解析
        const choices: string[] = []
        if (data.choices && Array.isArray(data.choices)) {
          data.choices.forEach((choice: string) => {
            choices.push(choice)
          })
        }

        await addSplitMessages(
          splitContents,
          choices,
          {
            showConfirmButton: isRecipeConfirmation
          }
        )
      }

      if (data.recipe) {
        setRecipe(data.recipe)
      }

      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
      scrollToBottom()
    } catch (error) {
      console.error("Error:", error)
      addMessage("assistant", "申し訳ありません。エラーが発生しました。もう一度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!recipe) return

    try {
      // Supabaseにレシピを保存
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

      // ローカルストレージに保存
      localStorage.setItem('selected_recipe', JSON.stringify({
        name: recipe.title,
        description: recipe.description,
        top_notes: recipe.notes.top,
        middle_notes: recipe.notes.middle,
        base_notes: recipe.notes.base
      }))

      // カスタムオーダーページに遷移（modeパラメータをlabに統一）
      router.push('/custom-order?mode=lab')
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('レシピの保存に失敗しました。')
    }
  }

  const handleConfirmClick = () => {
    setInput("はい")
    handleSend()
  }

  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery) {
      setHasProcessedInitialQuery(true)
      setInput(initialQuery)
      
      // 初期メッセージとユーザーメッセージを一度に設定
      setMessages([
        { 
          id: uuidv4(), 
          role: "assistant", 
          content: "こんにちは！香りのカスタムを始めましょう。どんなイメージがありますか？" 
        },
        {
          id: uuidv4(),
          role: "user",
          content: initialQuery
        }
      ])
      
      // APIリクエストを実行
      const sendMessage = async () => {
        setIsLoading(true)
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              messages: [
                { 
                  role: "assistant", 
                  content: "こんにちは！香りのカスタムを始めましょう。どんなイメージがありますか？" 
                },
                {
                  role: "user",
                  content: initialQuery
                }
              ]
            })
          })
          const data = await res.json()
          
          // レシピ確認のメッセージかどうかを判定
          const isRecipeConfirmation = data.recipe !== undefined

          // 新しいメッセージを追加
          addMessage(
            "assistant",
            data.content || "申し訳ありません。エラーが発生しました。",
            {
              showConfirmButton: isRecipeConfirmation
            },
            data.choices || []
          )

          if (data.recipe) {
            setRecipe(data.recipe)
          }

          setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
        } catch (error) {
          console.error("Error:", error)
          addMessage("assistant", "申し訳ありません。エラーが発生しました。もう一度お試しください。")
        } finally {
          setIsLoading(false)
        }
      }

      sendMessage()
    } else if (!hasProcessedInitialQuery) {
      setHasProcessedInitialQuery(true)
      setMessages([{ 
        id: uuidv4(), 
        role: "assistant", 
        content: "こんにちは！香りのカスタムを始めましょう。どんなイメージがありますか？" 
      }])
    }
  }, [initialQuery, hasProcessedInitialQuery])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center space-x-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`px-3 py-1 rounded-full text-sm ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <ScrollArea className="h-[60vh] rounded-md border p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "assistant" ? "flex-row" : "flex-row-reverse"
                } items-start gap-3 text-sm`}
              >
                {m.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/images/Fragrance Lab.png"
                      alt="Fragrance Lab"
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/images/User.png"
                      alt="User"
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`flex flex-col space-y-2 ${
                    m.role === "assistant"
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      m.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.choices && m.choices.length > 0 && (
                    <div className="w-full max-w-sm">
                      <ChoiceButtons
                        choices={m.choices.map(choice => ({
                          name: choice,
                          description: ''
                        }))}
                        onSelect={(choice) => {
                          setInput(choice)
                          handleSend()
                        }}
                      />
                    </div>
                  )}
                  {m.options?.showConfirmButton && (
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={handleConfirmClick}
                    >
                      次に進む
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/Fragrance Lab.png"
                    alt="Fragrance Lab"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>考え中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="香りのイメージを入力..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              送信
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
} 