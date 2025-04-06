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
    resetChat,
    nextPhase
  } = useChatState()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [initialMessageSent, setInitialMessageSent] = useState(false)

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

  // 初期クエリまたは初期メッセージを処理
  useEffect(() => {
    const handleInitialInteraction = async () => {
      // すでに初期メッセージが送信済みか、または処理中の場合は何もしない
      if (initialMessageSent || isLoading || messages.length > 0) return;
      
      // 初期クエリがある場合はそれを使用
      if (initialQuery) {
        console.log("初期クエリを送信します:", initialQuery);
        await addMessage(initialQuery);
        setInitialMessageSent(true);
      } else {
        // URLからクエリパラメータも確認（直接URLアクセスの場合）
        const params = new URLSearchParams(window.location.search);
        const urlQuery = params.get('query') || params.get('q');
        
        if (urlQuery) {
          console.log("URLから初期クエリを送信します:", urlQuery);
          await addMessage(urlQuery);
          setInitialMessageSent(true);
        } else {
          // 初期クエリがない場合は、何もしない（AIからのメッセージはAPIの初期メッセージに依存）
          console.log("初期メッセージを待機中...");
          setInitialMessageSent(true);
        }
      }
      
      // スクロールを更新
      setTimeout(scrollToBottom, 500);
    };
    
    handleInitialInteraction();
  }, [initialQuery, addMessage, initialMessageSent, isLoading, messages.length]);

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
    
    // 入力が空なら何もしない
    const message = input.trim();
    if (!message) return;
    
    // まず入力をクリアし、フォーカスを設定する
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    console.log("送信中:", message); // デバッグ用
    
    // 保存した入力値を使ってメッセージを送信
    await addMessage(message);
    
    // メッセージ送信後も明示的にスクロール
    setTimeout(scrollToBottom, 100);
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
    
    // 初期メッセージフラグをリセットし、次のレンダリングで初期メッセージが再表示されるようにする
    setInitialMessageSent(false);
    
    // スクロールリセット
    setTimeout(scrollToBottom, 300);
    
    console.log("チャットをリセットしました。初期メッセージが再表示されます。");
  }

  const getStepName = (phase: ChatPhase) => {
    switch (phase) {
      case 'welcome': return 'ようこそ'
      case 'intro': return 'テーマ選択'
      case 'themeSelected': return 'ステップ1: テーマ決定'
      case 'top': return 'ステップ2: トップノート'
      case 'middle': return 'ステップ3: ミドルノート'
      case 'base': return 'ステップ4: ベースノート'
      case 'finalized': return 'ステップ5: レシピ確認'
      case 'complete': return 'ステップ6: 完了'
      default: return phase
    }
  }

  // メッセージからテキスト部分と選択肢部分を分離する関数
  const parseMessageContent = (content: string) => {
    if (!content) return { text: '', choices: [] };

    // 複数の選択肢パターンに対応
    const patterns = [
      // 1. **シダーウッド** - 乾いた樹木の落ち着いた香り (古い形式)
      /(\d+\.\s*\*\*([^*]+)\*\*\s*-\s*([^\n]+))/g,
      
      // 1. シダーウッド - 乾いた樹木の落ち着いた香り (新しい形式)
      /(\d+\.\s*([^-]+)\s*-\s*([^\n]+))/g,
      
      // シンプルな番号付きリスト
      /(\d+\.\s*([^\n\d\.]+))/g
    ];
    
    // 各パターンを試す
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      
      if (matches.length > 0) {
        // 選択肢を抽出
        const choices = matches.map(match => {
          // 選択肢テキストを掘り下げる (** マークダウンも除去)
          const name = match[2].replace(/\*\*/g, '').trim();
          const description = match[3] ? match[3].replace(/\*\*/g, '').trim() : '';
          return { name, description };
        });
        
        // テキスト部分（選択肢の前まで）
        const firstChoiceIndex = content.indexOf(matches[0][0]);
        const textContent = firstChoiceIndex > 0 
          ? content.substring(0, firstChoiceIndex) 
          : content;
        
        return {
          text: textContent.trim(),
          choices: choices
        };
      }
    }
    
    // 選択肢が見つからなかった場合
    return { text: content, choices: [] };
  };

  // フェーズごとの次のフェーズを定義
  const getNextPhase = (currentPhase: ChatPhase): ChatPhase | null => {
    const phaseOrder: ChatPhase[] = [
      'welcome',
      'intro',
      'themeSelected',
      'top',
      'middle',
      'base',
      'finalized',
      'complete'
    ];
    
    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      return phaseOrder[currentIndex + 1];
    }
    
    return null;
  };

  // 選択肢をクリックしたときの処理
  const handleChoiceClick = async (choice: string) => {
    // 現在のフェーズに基づいて次のフェーズを決定
    const nextPhaseId = getNextPhase(currentPhaseId as ChatPhase);
    
    console.log(`選択肢クリック: ${choice}`);
    console.log(`現在のフェーズ: ${currentPhaseId}, 次のフェーズ: ${nextPhaseId}`);
    
    // メッセージ送信
    await addMessage(choice);
    
    // フェーズを自動的に進める
    if (nextPhaseId) {
      if (['themeSelected', 'top', 'middle', 'base'].includes(currentPhaseId as string)) {
        // 選択肢を選んだ場合は次のフェーズに自動的に進む
        console.log(`フェーズを自動更新: ${currentPhaseId} → ${nextPhaseId}`);
        
        // nextPhase関数を使用してフェーズを進める
        setTimeout(() => {
          nextPhase();
          console.log("フェーズ更新完了:", nextPhaseId);
        }, 1000); // メッセージ表示後に少し遅延させてフェーズを更新
      }
      
      // baseフェーズで選択後、finalizedへの移行が確実に行われるようにする
      if (currentPhaseId === 'base') {
        setTimeout(() => {
          // 現在のフェーズを確認し、まだbaseの場合は強制的に次へ進める
          if (currentPhaseId === 'base') {
            console.log("baseフェーズから強制的に次のフェーズへ移行");
            nextPhase();
          }
        }, 3000); // より長い遅延を設定
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full">
      <div className="flex justify-center mb-3">
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>
      <div className="flex justify-center mb-3 text-base text-muted-foreground">
        <span>{getStepName(currentPhaseId)}</span>
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
                          className="w-full text-base py-2 whitespace-normal text-left h-auto"
                          onClick={() => handleChoiceClick(choice)}
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
                              className="w-full text-base py-2 whitespace-normal text-left h-auto"
                              onClick={() => handleChoiceClick(typeof choice === 'string' ? choice : choice.name)}
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
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="focus:ring-2 focus:ring-primary text-base h-11"
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-shrink-0 h-11 px-5 text-base"
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
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
