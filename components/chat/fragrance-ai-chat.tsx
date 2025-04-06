"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useChatState } from "@/app/fragrance-lab/chat/hooks/useChatState"
import { ChatPhase } from "@/app/fragrance-lab/chat/types"
import { ChatProgressSteps } from "@/app/fragrance-lab/chat/components/ChatProgressSteps"
import Image from "next/image"

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
  const inputRef = useRef<HTMLInputElement>(null)

  // メッセージが追加されたときに最下部にスクロールする
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 初期表示時にinputにフォーカスする
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 確実に最下部までスクロールする関数
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return
    console.log("送信中:", input); // デバッグ用
    await addMessage(input)
    setInput('')
    // メッセージ送信後も明示的にスクロール
    setTimeout(scrollToBottom, 100);
    // 送信後は再度inputにフォーカス
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log("Enterキーが押されました"); // デバッグ用
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetChat()
    // リセット後は再度inputにフォーカス
    if (inputRef.current) {
      inputRef.current.focus();
    }
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

  // メッセージからテキスト部分と選択肢部分を分離する関数
  const parseMessageContent = (content: string) => {
    if (!content) return { text: '', choices: [] };

    // 数字付きリストを検出する正規表現
    const listPattern = /(\d+\.\s*\*\*([^*]+)\*\*\s*-\s*([^\n]+))/g;
    const matches = [...content.matchAll(listPattern)];
    
    if (matches.length === 0) {
      // 別の形式の選択肢も検出
      const simplifiedPattern = /(\d+\.\s*([^\n\d\.]+))/g;
      const simpleMatches = [...content.matchAll(simplifiedPattern)];
      
      if (simpleMatches.length > 0) {
        const choices = simpleMatches.map(match => match[2].trim());
        // テキスト部分（選択肢の前まで）
        const lastChoiceIndex = content.lastIndexOf(simpleMatches[0][0]);
        const textContent = lastChoiceIndex > 0 
          ? content.substring(0, lastChoiceIndex) 
          : content;
          
        return {
          text: textContent,
          choices: choices
        };
      }
      
      return { text: content, choices: [] };
    }
    
    // 選択肢を抽出
    const choices = matches.map(match => {
      const name = match[2].trim();
      const description = match[3].trim();
      return { name, description };
    });
    
    // テキスト部分（選択肢の前まで）
    const firstChoiceIndex = content.indexOf(matches[0][0]);
    const textContent = firstChoiceIndex > 0 
      ? content.substring(0, firstChoiceIndex) 
      : content;
    
    return {
      text: textContent,
      choices: choices
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full">
      <div className="flex justify-center mb-3">
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>
      <div className="flex justify-center mb-3 text-base text-muted-foreground">
        <span>ステップ: {getStepName(currentPhaseId)}</span>
      </div>
      <div ref={scrollAreaRef} className="flex-1 p-5 overflow-y-auto mb-20">
        <div className="space-y-5 max-w-4xl mx-auto">
          {messages.map((message) => {
            // 既存の選択肢がある場合はそのまま使用
            const hasExistingChoices = message.choices && message.choices.length > 0;
            // それ以外の場合は、コンテンツからパースして選択肢を抽出
            const parsedContent = !hasExistingChoices && message.role === 'assistant' 
              ? parseMessageContent(message.content)
              : { text: message.content, choices: [] };
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role !== 'user' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image 
                      src="/images/Fragrance Lab.png" 
                      alt="AI" 
                      width={40} 
                      height={40}
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] px-5 py-3 text-base leading-relaxed break-words rounded-lg",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
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
                    : <p>{hasExistingChoices ? message.content : parsedContent.text}</p>
                  }
                  
                  {/* 既存の選択肢があればそれを表示 */}
                  {hasExistingChoices && message.choices && (
                    <div className="mt-4 space-y-3">
                      {message.choices.map((choice, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full text-base py-2"
                          onClick={() => addMessage(choice)}
                        >
                          {choice}
                          {message.choices_descriptions && message.choices_descriptions[index] && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {message.choices_descriptions[index]}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* パースした選択肢があれば表示 */}
                  {!hasExistingChoices && parsedContent.choices.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {Array.isArray(parsedContent.choices) 
                        ? parsedContent.choices.map((choice, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full text-base py-2"
                              onClick={() => addMessage(typeof choice === 'string' ? choice : choice.name)}
                            >
                              {typeof choice === 'string' ? choice : choice.name}
                              {typeof choice !== 'string' && choice.description && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {choice.description}
                                </span>
                              )}
                            </Button>
                          ))
                        : null
                      }
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden ml-3 flex-shrink-0">
                    <Image 
                      src="/images/User.png" 
                      alt="User" 
                      width={40} 
                      height={40}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <Image 
                  src="/images/Fragrance Lab.png" 
                  alt="AI" 
                  width={40} 
                  height={40}
                />
              </div>
              <div className="max-w-[70%] px-5 py-3 text-base leading-relaxed break-words rounded-lg bg-muted rounded-tl-none">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>考え中...</span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <Image 
                  src="/images/Fragrance Lab.png" 
                  alt="AI" 
                  width={40} 
                  height={40}
                />
              </div>
              <div className="max-w-[70%] px-5 py-3 text-base leading-relaxed break-words rounded-lg bg-destructive/10 text-destructive rounded-tl-none">
                {typeof error === 'string' ? error : error.message}
              </div>
            </div>
          )}
          {/* 自動スクロール用の空のdiv */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form 
        onSubmit={handleSend}
        className="sticky bottom-0 bg-white shadow-md px-5 py-4 flex flex-col gap-3 z-10 border-t"
      >
        <div className="flex gap-3 items-center max-w-4xl mx-auto w-full">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="focus:ring-2 focus:ring-primary text-base h-11"
          />
          <Button type="submit" disabled={isLoading} className="flex-shrink-0 h-11 px-5 text-base">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '送信'}
          </Button>
        </div>
        <div className="max-w-4xl mx-auto w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 text-base"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            チャットをリセット
          </Button>
        </div>
      </form>
    </div>
  )
}
