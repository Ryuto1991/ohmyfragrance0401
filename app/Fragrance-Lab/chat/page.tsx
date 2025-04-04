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

// 型定義
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
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

  const addMessage = (role: "user" | "assistant", content: string, options?: Message["options"]) => {
    // JSONかどうかを判定
    const isJson = content.trim().startsWith('{') && content.trim().endsWith('}')
    
    setMessages((prev) => [
      ...prev,
      { 
        id: uuidv4(), 
        role, 
        content,
        options: {
          ...options,
          isJson: isJson
        }
      }
    ])
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage: Message = { id: uuidv4(), role: "user", content: input }
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
      const isRecipeConfirmation = data.result.includes("この香りで本当にいいかな？") ||
                                 data.result.includes("OKだったら『はい』って送ってくれたら")
      
      addMessage("assistant", data.result, {
        showConfirmButton: isRecipeConfirmation
      })
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
          addMessage("assistant", data.result)
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
  }, [initialQuery, hasProcessedInitialQuery, addMessage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-bold mb-2">💬 チャットでつくる</h1>
              <p className="text-sm text-muted-foreground">
                ステップ：{STEPS[currentStep]}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <ScrollArea ref={scrollRef} className="h-[60vh] space-y-4 pr-4">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 ${
                        m.role === "user" 
                          ? "bg-primary text-white" 
                          : "bg-muted text-black"
                      }`}
                    >
                      {m.options?.isJson ? (
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-black/5 p-2 rounded">
                          {JSON.stringify(JSON.parse(m.content), null, 2)}
                        </pre>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                      {m.options?.showConfirmButton && (
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={handleConfirmClick}
                          >
                            はい
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="香りのイメージを入力..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading}>
                  送信
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
} 