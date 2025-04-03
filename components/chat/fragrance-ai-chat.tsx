"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { ScrollArea } from "@/components/ui/scroll-area"

// 型定義

type MessageRole = 'user' | 'assistant' | 'system'

type Message = {
  id: string
  role: MessageRole
  content: string
  options?: string[]
}

type Step = "intro" | "top" | "middle" | "base" | "finalized" | "complete"

interface FragranceRecipe {
  top_notes: string[]
  middle_notes: string[]
  base_notes: string[]
  name: string
  description: string
}

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

  useEffect(() => {
    const processInitialQuery = async () => {
      if (initialQuery && !hasProcessedInitialQuery && isInitialized) {
        setHasProcessedInitialQuery(true)
        setIsLoading(true)
        const newMessages = messages.length > 1 
          ? [...messages, createMessage('assistant', 'なるほど、新しいアイデアをいただきましたね。それでは、その観点からも考えてみましょう。'), createMessage('user', initialQuery)]
          : [createMessage('user', initialQuery)]
        setMessages(newMessages)
        await processMessage(newMessages)
        setIsLoading(false)
      }
    }
    processInitialQuery()
  }, [initialQuery, messages, isInitialized, hasProcessedInitialQuery])

  const createMessage = (role: MessageRole, content: string, options?: string[]): Message => ({
    id: uuidv4(),
    role,
    content,
    ...(options ? { options } : {})
  })

  const initializeChat = () => {
    const systemMessage = createMessage('system', `あなたは香水を一緒に考える調香師『Fragrance Lab』です。\n- 文体は敬語とカジュアル語を混ぜて、親しみやすく。\n- ユーザーのテンションや文章量に応じて返答の長さやトーンを調整してください。\n- 基本的に1～2文で返答してください。\n- レシピはトップ・ミドル・ベースノートの順で構成してください。`)

    const welcomeMessage = createMessage('assistant', 'こんにちは！あなただけのオリジナル香水を一緒に作りましょう✨\nどんな香りをイメージしていますか？', ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"])

    setMessages([systemMessage, welcomeMessage])
    setCurrentStep("intro")
  }

  const determineCurrentStep = (message: Message) => {
    if (message.options?.some(o => o.includes("レモン") || o.includes("ベルガモット"))) setCurrentStep("top")
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
    switch (step) {
      case 'intro': return ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"]
      case 'top': return ["レモン（シャープで爽やか）", "ベルガモット（フルーティーでフローラル）", "グレープフルーツ（少し苦味のあるフレッシュな香り）"]
      case 'middle': return ["ジャスミン（甘く華やかな香り）", "ローズ（エレガントで優雅な香り）", "ラベンダー（穏やかで落ち着く花の香り）"]
      case 'base': return ["サンダルウッド（温かくウッディな香り）", "バニラ（甘く優しい香り）", "オークモス（しっかりとした木の香り）"]
      default: return undefined
    }
  }

  const handleError = () => {
    setMessages(prev => [...prev, createMessage('assistant', '申し訳ありません。エラーが発生しました。もう一度お試しください。')])
  }

  const processMessage = async (newMessages: Message[]) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(({ role, content }) => ({ role, content })) })
      })
      if (!res.ok) throw new Error('Failed to send message')
      const data = await res.json()
      const recipe = extractRecipeFromText(data.result)

      if (recipe) {
        localStorage.setItem('fragrance_recipe', JSON.stringify(recipe))
        setCurrentStep('finalized')
        const confirmMessage = createMessage('assistant', `レシピが完成したよ！\n\n${data.result}\n\nこの香りで本当にいいかな？🧪\n気になるところがあれば今のうちに教えてね。OKだったら「はい」って送ってくれたら次に進むよ！`)
        setMessages(prev => [...prev, confirmMessage])
        return
      }

      const aiMessage = createMessage('assistant', data.result, getOptionsForStep(currentStep))
      setMessages(prev => [...prev, aiMessage])
    } catch (e) {
      handleError()
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || currentStep === 'complete') return

    if (currentStep === 'finalized' && input.trim().toLowerCase() === 'はい') {
      setCurrentStep('complete')
      setMessages(prev => [...prev,
        createMessage('user', input),
        createMessage('assistant', 'ありがとう！それじゃあ、ラベルデザインを選びに行きましょう！✨')
      ])
      setTimeout(() => router.push('/custom-order'), 1500)
      return
    }

    const userMessage = createMessage('user', input)
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    await processMessage([...messages, userMessage])
    setIsLoading(false)
  }

  const handleOptionSelect = async (option: string) => {
    if (isLoading || currentStep === 'complete') return
    const selected = option.split("（")[0]
    const userMessage = createMessage('user', selected)
    setMessages(prev => [...prev, userMessage])

    switch (currentStep) {
      case 'top': setSelectedScents(prev => ({ ...prev, top: selected })); break
      case 'middle': setSelectedScents(prev => ({ ...prev, middle: selected })); break
      case 'base': setSelectedScents(prev => ({ ...prev, base: selected })); break
    }

    setIsLoading(true)
    await processMessage([...messages, userMessage])
    setIsLoading(false)
  }

  const resetChat = () => {
    localStorage.removeItem('fragrance_chat_history')
    localStorage.removeItem('last_fragrance_chat_visit')
    setSelectedScents({ top: null, middle: null, base: null })
    setCurrentStep("intro")
    initializeChat()
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={resetChat} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          リセット
        </Button>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.filter(m => m.role !== 'system').map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.options && (
                  <div className="mt-4 space-y-2">
                    {m.options.map((option) => (
                      <Button key={option} variant="secondary" className="w-full justify-start" onClick={() => handleOptionSelect(option)} disabled={isLoading}>
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="メッセージを入力..."
          disabled={isLoading || currentStep === 'complete'}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={isLoading || currentStep === 'complete'}>
          送信
        </Button>
      </div>
    </div>
  )
}
