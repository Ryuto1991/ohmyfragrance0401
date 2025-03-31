"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

type Message = {
  id: string
  isAi: boolean
  content: string
  options?: string[]
}

type Step = "intro" | "top" | "middle" | "base" | "finalized" | "complete"

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
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false)
  const [finalizationError, setFinalizationError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(uuidv4())
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const initialMessages: Message[] = []
    if (sessionId) {
      if (initialQuery && initialQuery.trim() !== "") {
        initialMessages.push({
          id: `user-initial-${sessionId}`,
          isAi: false,
          content: initialQuery,
        })
        initialMessages.push({
          id: `ai-initial-response-${sessionId}`,
          isAi: true,
          content: `「${initialQuery}」ですね💖\nどんな感じを思い出させますか？\n例えば、甘酸っぱい記憶やドキドキ感、それとも特別な香りを感じたことがあるかもしれませんね。\nもう少し教えてくれると、よりぴったりな香りを提案できますよ！`,
          options: ["朝の爽やかな空気のような香り", "少し甘くてフローラルな香り", "ほんのりと暖かみのある香り"],
        })
      } else {
        initialMessages.push({
          id: `ai-welcome-${sessionId}`,
          isAi: true,
          content: "こんにちは！あなただけのオリジナル香水を一緒に作りましょう✨\nどんな香りをイメージしていますか？",
          options: ["爽やかな朝の香り", "リラックスできる香り", "特別な日に身につけたい香り"],
        })
      }
      setMessages(initialMessages)
    }
  }, [initialQuery, sessionId])

  const handleSendMessage = () => {
    if (!input.trim() || isTyping || currentStep === 'finalized') return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      isAi: false,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      let aiResponse: Message
      let nextStep: Step = currentStep

      if (currentStep === "intro") {
        aiResponse = {
          id: `ai-top-${Date.now()}`,
          isAi: true,
          content: "なるほど！素敵な香りのイメージですね✨\nそれでは、まずはトップノートに合う香りを選んでいきましょう！",
          options: ["レモン", "ベルガモット", "グレープフルーツ"],
        }
        nextStep = "top"
      } else if (currentStep === "top") {
        aiResponse = {
          id: `ai-middle-${Date.now()}`,
          isAi: true,
          content: "トップノート、いいですね！次はミドルノートです。",
          options: ["ジャスミン", "ローズ", "ラベンダー"],
        }
        nextStep = "middle"
      } else if (currentStep === "middle") {
        aiResponse = {
          id: `ai-base-${Date.now()}`,
          isAi: true,
          content: "ミドルノートも決まりましたね。最後にベースノートを選びましょう！",
          options: ["サンダルウッド", "バニラ", "オークモス"],
        }
        nextStep = "base"
      } else {
        aiResponse = {
          id: `ai-fallback-${Date.now()}`,
          isAi: true,
          content: "うーん、どうしましょうか？もう一度選んでみてください。",
        }
      }

      setMessages((prev) => [...prev, aiResponse])
      setCurrentStep(nextStep)
      setIsTyping(false)
    }, 1500)
  }

  const handleOptionSelect = useCallback((option: string) => {
    if (isTyping || currentStep === 'finalized') return

    const userMessage: Message = {
      id: `user-option-${Date.now()}`,
      isAi: false,
      content: option.split("（")[0],
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    setFinalizationError(null)

    setTimeout(() => {
      let aiResponse: Message | null = null
      let nextStep: Step = currentStep

      const selectedValue = option.split("（")[0]

      switch (currentStep) {
        case "intro":
          aiResponse = {
            id: `ai-top-${Date.now()}`,
            isAi: true,
            content: "なるほど！素敵な香りのイメージですね✨\nそれでは、まずはトップノートに合う香りを選んでいきましょう！",
            options: ["レモン（シャープで爽やか）", "ベルガモット（フルーティーでフローラル）", "グレープフルーツ（少し苦味のあるフレッシュな香り）"],
          }
          nextStep = "top"
          break

        case "top":
          setSelectedScents((prev) => ({ ...prev, top: selectedValue }))
          aiResponse = {
            id: `ai-middle-${Date.now()}`,
            isAi: true,
            content: `${selectedValue}ですね！🌟 素敵な選択です💖\n次は、ミドルノートの香りを決めていきましょう。\n甘く華やかな花の香りを加えると、さらに魅力的に仕上がります。`,
            options: ["ジャスミン（甘く華やかな香り）", "ローズ（エレガントで優雅な香り）", "ラベンダー（穏やかで落ち着く花の香り）"],
          }
          nextStep = "middle"
          break

        case "middle":
          setSelectedScents((prev) => ({ ...prev, middle: selectedValue }))
          aiResponse = {
            id: `ai-base-${Date.now()}`,
            isAi: true,
            content: `${selectedValue}ですね！💐 素敵な選択です✨\n最後に、香りの余韻を作るラストノートを選びましょう！`,
            options: ["サンダルウッド（温かくウッディな香り）", "バニラ（甘く優しい香り）", "オークモス（しっかりとした木の香り）"],
          }
          nextStep = "base"
          break

        case "base":
          setSelectedScents((prev) => ({ ...prev, base: selectedValue }))
          aiResponse = {
            id: `ai-complete-${Date.now()}`,
            isAi: true,
            content: `${selectedValue}ですね！温かみと深みのある香りが、素敵な余韻を長く残してくれます💖\nこれで、あなたのオリジナル香水のレシピが完成しました！✨\n下のボタンからカスタマイズに進んで、ボトルやラベルを選びましょう！`,
          }
          nextStep = "finalized"
          break

        default:
          aiResponse = {
            id: `ai-fallback-${Date.now()}`,
            isAi: true,
            content: "ありがとうございます！",
          }
          break
      }

      if (aiResponse) {
        setMessages((prev) => [...prev, aiResponse])
        setCurrentStep(nextStep)
      }
      setIsTyping(false)
    }, 1500)
  }, [currentStep, isTyping])

  const handleFinalizeFragrance = async () => {
    if (isFinalizing) return
    setIsFinalizing(true)
    setFinalizationError(null)

    try {
      const response = await fetch('/api/save-session/fragrances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          top_note: selectedScents.top,
          middle_note: selectedScents.middle,
          base_note: selectedScents.base,
          name: `${selectedScents.top}と${selectedScents.middle}の香り`, // Default name
          concept: messages[1]?.content || "", // Use the first AI response as concept
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save fragrance data')
      }

      const data = await response.json()
      router.push(`/Fragrance-AI/customize?id=${data.id}`)
    } catch (error) {
      console.error('Error saving fragrance:', error)
      setFinalizationError('香りの保存中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isAi ? "justify-start" : "justify-end"} mb-4`}
          >
            <div
              className={`flex ${
                message.isAi ? "flex-row" : "flex-row-reverse"
              } items-start max-w-[80%]`}
            >
              {message.isAi && (
                <Avatar className="w-8 h-8 mr-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Info className="w-6 h-6" />
                  </div>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-4 ${
                  message.isAi
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.options && (
                  <div className="mt-4 space-y-2">
                    {message.options.map((option) => (
                      <Button
                        key={option}
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-2 bg-muted rounded-lg p-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>入力中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-background pt-4">
        {currentStep === "finalized" ? (
          <div className="space-y-4">
            {finalizationError && (
              <div className="text-red-500 text-sm">{finalizationError}</div>
            )}
            <Button
              className="w-full"
              onClick={handleFinalizeFragrance}
              disabled={isFinalizing}
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "カスタマイズに進む"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input
              placeholder="メッセージを入力..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

