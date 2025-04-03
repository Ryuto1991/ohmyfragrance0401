"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { ScrollArea } from "@/components/ui/scroll-area"
import essentialOilsData from './essential-oils.json'

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
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isScrollAreaMounted, setIsScrollAreaMounted] = useState(false)

  useEffect(() => setSessionId(uuidv4()), [])

  // ScrollAreaの初期化を検知
  useEffect(() => {
    if (scrollAreaRef.current) {
      setIsScrollAreaMounted(true)
    }
  }, [])

  // ScrollAreaが初期化された後、保存されたメッセージがある場合にスクロール
  useEffect(() => {
    if (isScrollAreaMounted && messages.length > 0) {
      const timer = setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isScrollAreaMounted]);

  // メッセージ更新時のスクロール
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
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
        
        // 保存されたメッセージがある場合、少し遅延させてスクロール
        setTimeout(() => {
          if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
              viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: 'smooth'
              });
            }
          }
        }, 100);
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
      const notes = essentialOilsData.perfumeNotes[`${category}Notes` as keyof typeof essentialOilsData.perfumeNotes]
      return notes
        .slice(0, 3) // 上位3件だけに絞る（任意）
        .map((oil) => `${oil.name}（${oil.description}）`)
    }

    switch (step) {
      case 'intro': return ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"]
      case 'top': return getOptionsFromOilData('top')
      case 'middle': return getOptionsFromOilData('middle')
      case 'base': return getOptionsFromOilData('base')
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

    if (currentStep === "intro") setCurrentStep("themeSelected")
    else {
      switch (currentStep) {
        case 'top': setSelectedScents(prev => ({ ...prev, top: selected })); break
        case 'middle': setSelectedScents(prev => ({ ...prev, middle: selected })); break
        case 'base': setSelectedScents(prev => ({ ...prev, base: selected })); break
      }
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
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">Fragrance Lab</span>
          <span className="text-lg">🧪</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:bg-gray-100" 
          onClick={resetChat} 
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          リセット
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-6">
          {messages.filter(m => m.role !== 'system').map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`
                  relative max-w-[80%] px-5 py-3.5 
                  ${m.role === 'user' 
                    ? 'bg-[#ffdce0] text-gray-800 rounded-2xl rounded-br-sm mr-2' 
                    : 'bg-[#f5f5f5] text-gray-800 rounded-2xl rounded-bl-sm ml-2'
                  }
                  shadow-sm
                `}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
                    <span>Fragrance Lab</span>
                    <span className="text-base">🧪</span>
                  </div>
                )}
                <p className="text-[15px] leading-relaxed">{m.content}</p>

                {m.options && (
                  <div className="mt-4 space-y-2.5">
                    {m.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className={`
                          w-full justify-start text-left px-4 py-3 h-auto
                          rounded-xl border border-gray-200
                          bg-white hover:bg-gray-50 
                          shadow-sm transition-all duration-200
                          text-[14px] font-normal
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
                        `}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isLoading}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="relative bg-[#f5f5f5] rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm ml-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
                  <span>Fragrance Lab</span>
                  <span className="text-base">🧪</span>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-3 mt-6 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="メッセージを入力..."
          disabled={isLoading || currentStep === 'complete'}
          className="flex-1 rounded-xl border-gray-200 focus:border-gray-300 focus:ring-gray-200 text-[15px]"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || currentStep === 'complete'}
          className={`
            rounded-xl px-6 bg-gray-900 hover:bg-gray-800
            ${isLoading || currentStep === 'complete' ? 'opacity-50' : ''}
          `}
        >
          送信
        </Button>
      </div>
    </div>
  )
}
