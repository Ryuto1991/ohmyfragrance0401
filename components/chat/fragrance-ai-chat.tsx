"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useChatState } from "@/app/fragrance-lab/chat/hooks/useChatState"
import { ChatPhase } from "@/app/fragrance-lab/chat/types"
import { ChatProgressSteps } from "@/app/fragrance-lab/chat/components/ChatProgressSteps"

export function FragranceAIChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter()
  const {
    messages,
    currentPhaseId,
    isLoading,
    error,
    addMessage,
    resetChat
  } = useChatState()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // メッセージが追加されたときに最下部にスクロールする
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 確実に最下部までスクロールする関数
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    await addMessage(input)
    setInput('')
    // メッセージ送信後も明示的にスクロール
    setTimeout(scrollToBottom, 100);
  }

  const handleReset = () => {
    resetChat()
  }

  const getStepName = (phase: ChatPhase) => {
    switch (phase) {
      case 'welcome': return 'ようこそ'
      case 'intro': return 'テーマ選択'
      case 'themeSelected': return '香料提案中'
      case 'top': return 'トップノート選択中'
      case 'middle': return 'ミドルノート選択中'
      case 'base': return 'ベースノート選択中'
      case 'finalized': return 'レシピ確認中'
      case 'complete': return '完了！'
      default: return phase
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex justify-center mb-2">
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>
      <div className="flex justify-center mb-2 text-sm text-muted-foreground">
        <span>ステップ: {getStepName(currentPhaseId)}</span>
      </div>
      <div ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-4 max-w-[80%]",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content && message.content.trim().startsWith('{') && message.content.trim().endsWith('}')
                  ? (() => {
                      try {
                        const parsed = JSON.parse(message.content);
                        return <p>{parsed.content || message.content}</p>;
                      } catch (e) {
                        return <p>{message.content}</p>;
                      }
                    })()
                  : <p>{message.content}</p>
                }
                {message.choices && message.choices.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.choices.map((choice, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full"
                        onClick={() => addMessage(choice)}
                      >
                        {choice}
                        {message.choices_descriptions && message.choices_descriptions[index] && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {message.choices_descriptions[index]}
                          </span>
                        )}
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
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>考え中...</span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="bg-destructive/10 text-destructive rounded-lg p-4">
                {typeof error === 'string' ? error : error.message}
              </div>
            </div>
          )}
          {/* 自動スクロール用の空のdiv */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="メッセージを入力..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '送信'}
          </Button>
        </div>
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          チャットをリセット
        </Button>
      </div>
    </div>
  )
}
