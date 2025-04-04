"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { ScrollArea } from "@/components/ui/scroll-area"
import essentialOilsDataRaw from './essential-oils.json'
import { cn } from "@/lib/utils"

// 型定義

type MessageRole = 'user' | 'assistant' | 'system'

type Message = {
  id: string
  role: MessageRole
  content: string
  options?: string[]
}

type Step = "intro" | "themeSelected" | "top" | "middle" | "base" | "finalized" | "complete"

interface FragranceRecipe {
  top_notes: string[]
  middle_notes: string[]
  base_notes: string[]
  name: string
  description: string
}

interface EssentialOil {
  name: string
  english: string
  description: string
  emotion: string
  category: 'top' | 'middle' | 'base'
  source: string
  info: string
}

const essentialOilsData: EssentialOil[] = [
  ...essentialOilsDataRaw.perfumeNotes.topNotes.map(oil => ({
    ...oil,
    category: 'top' as const
  })),
  ...essentialOilsDataRaw.perfumeNotes.middleNotes.map(oil => ({
    ...oil,
    category: 'middle' as const
  })),
  ...essentialOilsDataRaw.perfumeNotes.baseNotes.map(oil => ({
    ...oil,
    category: 'base' as const
  }))
]

export function FragranceAIChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState<Step>("intro")
  const [selectedScents, setSelectedScents] = useState({
    top: null as string | null,
    middle: null as string | null,
    base: null as string | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = createMessage('user', input)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const options = getOptionsForStep(currentStep)
      const assistantMessage = createMessage('assistant', '考え中...', options)
      setMessages(prev => [...prev, assistantMessage])
      determineCurrentStep(assistantMessage)
    } catch (error) {
      console.error('Error in handleSend:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => setSessionId(uuidv4()), [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const saved = localStorage.getItem('fragrance_chat_history')
      const lastVisit = localStorage.getItem('last_fragrance_chat_visit')
      const now = new Date().getTime()

      if (lastVisit && now - parseInt(lastVisit) > 30 * 60 * 1000) {
        localStorage.removeItem('fragrance_chat_history')
        initializeChat()
      } else if (saved) {
        const parsedMessages = JSON.parse(saved)
        setMessages(parsedMessages)
        const lastMessage = parsedMessages[parsedMessages.length - 1]
        if (lastMessage.role === 'assistant' && lastMessage.options) determineCurrentStep(lastMessage)
      } else {
        initializeChat()
      }

      localStorage.setItem('last_fragrance_chat_visit', now.toString())
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && messages.length > 0) {
      localStorage.setItem('fragrance_chat_history', JSON.stringify(messages))
    }
  }, [messages, isInitialized])

  const createMessage = (role: MessageRole, content: string, options?: string[]): Message => ({
    id: uuidv4(),
    role,
    content,
    ...(options ? { options } : {})
  })

  const initializeChat = () => {
    const systemMessage = createMessage('system', `あなたは香水を一緒に考える調香師『Fragrance Lab』です。\n- 文体は敬語とカジュアル語を混ぜて、親しみやすく。\n- ユーザーのテンションや文章量に応じて返答の長さやトーンを調整してください。\n- 基本的に1～2文で返答してください。\n- レシピはトップ・ミドル・ベースノートの順で構成してください。`)

    const welcomeMessage = createMessage('assistant', 'こんにちは！あなただけのオリジナル香水を一緒に作りましょう✨\nまずは、どんなイメージの香りが好き？気分やシーンでもOKだよ〜', ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"])

    setMessages([systemMessage, welcomeMessage])
    setCurrentStep("intro")
  }

  const determineCurrentStep = (message: Message) => {
    if (currentStep === "intro") setCurrentStep("themeSelected")
    else if (message.options?.some(o => o.includes("レモン") || o.includes("ベルガモット"))) setCurrentStep("top")
    else if (message.options?.some(o => o.includes("ジャスミン") || o.includes("ローズ"))) setCurrentStep("middle")
    else if (message.options?.some(o => o.includes("サンダルウッド") || o.includes("バニラ"))) setCurrentStep("base")
  }

  const extractRecipeFromText = (text: string): FragranceRecipe | null => {
    const match = text.match(/```json\n([\s\S]*?)\n```/)
    if (!match) return null
    try {
      const parsed = JSON.parse(match[1])
      return parsed.recipe
    } catch {
      return null
    }
  }

  const getOptionsForStep = (step: Step): string[] | undefined => {
    const getOptionsFromOilData = (category: 'top' | 'middle' | 'base') => {
      return essentialOilsData
        .filter((oil: EssentialOil) => oil.category === category)
        .slice(0, 3)
        .map((oil: EssentialOil) => `${oil.name}（${oil.description}）`)
    }

    switch (step) {
      case 'intro': return ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"]
      case 'top': return getOptionsFromOilData('top')
      case 'middle': return getOptionsFromOilData('middle')
      case 'base': return getOptionsFromOilData('base')
      default: return undefined
    }
  }

  // TODO: チャットUIにステップインジケーター追加予定
  // TODO: チャット体験をライトにし、初期提案ベース型に切り替え検討

  return (
    <div className="flex flex-col h-[600px]">
      {/* ステップインジケーター（仮） */}
      <div className="flex justify-center mb-2 text-sm text-muted-foreground">
        <span>
          ステップ: {currentStep === "intro" ? "テーマ選択" : currentStep === "themeSelected" ? "香料提案中" :
          currentStep === "top" ? "トップノート選択中" :
          currentStep === "middle" ? "ミドルノート選択中" :
          currentStep === "base" ? "ベースノート選択中" :
          currentStep === "finalized" ? "レシピ確認中" : "完了！"}
        </span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.options && (
                  <div className="mt-2 space-y-2">
                    {message.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setInput(option)
                          handleSend()
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "送信"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
