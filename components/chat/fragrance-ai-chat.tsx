"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, RefreshCw, Info, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useChatState } from "@/app/fragrance-lab/chat/hooks/useChatState"
import { ChatPhase } from "@/app/fragrance-lab/chat/types"
import { ChatProgressSteps } from "@/app/fragrance-lab/chat/components/ChatProgressSteps"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TipsSidebar } from "./tips-sidebar"
import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid'

// クライアントコンポーネントとして明示的に宣言
const ChoiceButton = ({ choice, onClick }: { 
  choice: { name: string, description?: string } | string, 
  onClick: () => void 
}) => {
  const choiceText = typeof choice === 'string' ? choice : choice.name;
  const description = typeof choice === 'string' ? undefined : choice.description;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full text-sm md:text-base py-2 whitespace-normal text-left h-auto justify-start border-primary/30 hover:bg-primary/10 hover:text-primary-foreground/90"
    >
      <div className="flex flex-col w-full">
        <div className="font-medium">{choiceText}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
    </Button>
  );
};

export function FragranceAIChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    messages,
    currentPhaseId,
    selectedScents,
    isLoading,
    isSubmitting,
    error,
    addMessage,
    sendMessage,
    handleError,
    isOrderButtonEnabled,
    updatePhase,
    updateSelectedScents,
    resetChat,
    handleGoToOrder,
    handleAutoCreateRecipe
  } = useChatState()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [initialMessageSent, setInitialMessageSent] = useState(false)
  const [lastPhaseChangeTime, setLastPhaseChangeTime] = useState(Date.now())

  useEffect(() => {
    if (!router) {
      console.error('Router is not initialized');
      return;
    }
  }, [router]);

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
      // URLからクエリパラメータを確認 (useSearchParams を使用)
      const urlQuery = searchParams.get('query') || searchParams.get('q');
      
      // クエリパラメータがあれば、URLから削除する (router.replace を使用)
      if (urlQuery) {
        const newPath = window.location.pathname; // 現在のパス名を取得
        router.replace(newPath, { scroll: false }); // パス名だけで replace (クエリ削除)
        console.log("URLからクエリパラメータを削除しました (useRouter)");
      }
      
      // すでに初期メッセージが送信済みか、または処理中の場合は何もしない
      // messages.length > 1 のチェックを messages.length > 0 に変更 (初期メッセージがない場合も考慮)
      if (initialMessageSent || isLoading || messages.length > 0) return;
      
      // 初期クエリがある場合はそれを使用
      if (initialQuery) {
        console.log("初期クエリを送信します:", initialQuery);
        await addMessage(initialQuery);
        setInitialMessageSent(true);
      } else if (urlQuery) {
        // ローカルストレージで初期クエリが処理済みかチェック
        const processedQueries = JSON.parse(localStorage.getItem('processedQueries') || '[]');
        
        // このクエリが処理済みでない場合のみ処理する
        if (!processedQueries.includes(urlQuery)) {
          console.log("URLから初期クエリを送信します:", urlQuery);
          await addMessage(urlQuery);
          
          // 処理済みクエリとして記録
          processedQueries.push(urlQuery);
          localStorage.setItem('processedQueries', JSON.stringify(processedQueries));
        } else {
          console.log("このクエリは既に処理済みです:", urlQuery);
        }
        
        setInitialMessageSent(true);
      } else {
        // 初期クエリがない場合は、何もしない（AIからのメッセージはAPIの初期メッセージに依存）
        console.log("初期メッセージを待機中...");
        setInitialMessageSent(true);
      }
      
      // スクロールを更新
      setTimeout(scrollToBottom, 500);
    };
    
    handleInitialInteraction();
  }, [searchParams, router, initialQuery, addMessage, initialMessageSent, isLoading, messages.length]);

  // 確実に最下部までスクロールする関数
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }

  // メッセージ送信の処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || !input.trim()) return

    const content = input.trim()
    setInput('')
    await sendMessage(content)
  }

  // エラー表示の改善
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-4">{error.message}</div>
        <Button onClick={() => handleError(null)}>再試行</Button>
      </div>
    )
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
  const parseMessageContent = (content: string | { name: string, description?: string }[]) => {
    // オブジェクトの配列の場合は、そのまま返す
    if (Array.isArray(content)) {
      return {
        text: '',
        choices: content
      };
    }

    // 文字列の場合は従来の処理を行う
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

  // フェーズ更新を統合した関数
  const updatePhaseWithAutoProgress = (nextPhase: ChatPhase) => {
    console.log(`フェーズを更新: ${currentPhaseId} → ${nextPhase}`);
    updatePhase(nextPhase);
    setLastPhaseChangeTime(Date.now());
  };

  // 選択肢をクリックしたときの処理
  const handleChoiceClick = async (choice: { name: string, description?: string } | string) => {
    const nextPhaseId = getNextPhase(currentPhaseId as ChatPhase);
    
    // 選択肢のテキストを取得
    const choiceText = typeof choice === 'string' ? choice : choice.name;
    
    console.log(`選択肢クリック: ${choiceText}`);
    
    try {
      if (currentPhaseId === 'welcome') {
        console.log('welcomeフェーズでは香りの選択は無効です');
        return;
      }

      if (['top', 'middle', 'base'].includes(currentPhaseId)) {
        updateSelectedScents(choiceText);
      }

      await sendMessage(choiceText, true);
      
      if (nextPhaseId && ['themeSelected', 'top', 'middle', 'base'].includes(currentPhaseId as string)) {
        updatePhaseWithAutoProgress(nextPhaseId);
      }
    } catch (error) {
      console.error('選択肢クリック時のエラー:', error);
      handleError(error instanceof Error ? error : new Error('選択肢の処理中にエラーが発生しました'));
    }
  };

  // フェーズの自動進行を統合したuseEffect
  useEffect(() => {
    const handleAutoProgress = () => {
      if (currentPhaseId === 'finalized' && 
          selectedScents.top.length > 0 && 
          selectedScents.middle.length > 0 && 
          selectedScents.base.length > 0) {
        const timeSinceLastChange = Date.now() - lastPhaseChangeTime;
        if (timeSinceLastChange > 10000) {
          updatePhaseWithAutoProgress('complete');
        }
      }
    };

    const timeoutId = setTimeout(handleAutoProgress, 10000);
    return () => clearTimeout(timeoutId);
  }, [currentPhaseId, lastPhaseChangeTime, selectedScents]);

  // ユーザー入力による自動進行
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') return;

    const lowerContent = lastMessage.content.toLowerCase();
    const isCompletionKeyword = lowerContent.match(/^(おわり|終わり|完了|終了|次|ok|オッケー|はい|うん|そう|せや)$/);

    if (isCompletionKeyword) {
      if (currentPhaseId === 'finalized') {
        setTimeout(() => updatePhaseWithAutoProgress('complete'), 1500);
      } else if (currentPhaseId === 'base') {
        setTimeout(() => updatePhaseWithAutoProgress('finalized'), 1500);
      }
    }
  }, [messages, currentPhaseId]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      {/* ★ここに ChatProgressSteps を追加 */}
      <div className="px-4 pt-4"> {/* 上下のパディング調整用 */}
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>

      {/* ステータス表示（開発時のデバッグ用、本番では非表示にする） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-black/5 p-2 text-xs">
          <div>フェーズ: {currentPhaseId}</div>
          <div>トップ: {selectedScents.top.join(', ') || 'なし'}</div>
          <div>ミドル: {selectedScents.middle.join(', ') || 'なし'}</div>
          <div>ベース: {selectedScents.base.join(', ') || 'なし'}</div>
          <div>注文ボタン: {isOrderButtonEnabled ? '有効' : '無効'}</div>
        </div>
      )}
      <div className="flex justify-center mb-2 text-base text-muted-foreground">
        <span>{getStepName(currentPhaseId)}</span>
      </div>
      <div ref={scrollAreaRef} className="flex-1 p-3 md:p-5 overflow-y-auto mb-16">
        <div className="space-y-4 max-w-4xl lg:max-w-6xl mx-auto">
          {messages.map((message) => {
            const parsedContent = parseMessageContent(message.content);
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role !== 'user' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-2 md:mr-3 flex-shrink-0">
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
                    "md:max-w-[80%] lg:max-w-[70%] px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base leading-relaxed break-words rounded-2xl",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none shadow-sm'
                      : 'bg-white rounded-tl-none shadow-sm'
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
                    : <p>{parsedContent.text}</p>
                  }
                  
                  {parsedContent.choices.length > 0 && (
                    <div className="mt-3 space-y-2 grid md:grid-cols-1 lg:grid-cols-3 lg:gap-2 lg:space-y-0">
                      {parsedContent.choices.map((choice, index) => (
                        <ChoiceButton
                          key={index}
                          choice={choice}
                          onClick={() => handleChoiceClick(choice)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ml-2 md:ml-3 flex-shrink-0">
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
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-2 md:mr-3 flex-shrink-0">
                <Image 
                  src="/images/Fragrance Lab.png" 
                  alt="AI" 
                  width={40} 
                  height={40}
                />
              </div>
              <div className="md:max-w-[80%] lg:max-w-[70%] px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base leading-relaxed break-words rounded-2xl bg-white rounded-tl-none shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  <span>考え中...</span>
                </div>
              </div>
            </div>
          )}
          {/* 自動スクロール用の空のdiv */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white/95 backdrop-blur-sm shadow-md px-4 md:px-5 py-3 md:py-4 flex flex-col gap-2 md:gap-3 z-10 border-t"
      >
        <div className="flex gap-2 md:gap-3 items-center max-w-4xl lg:max-w-6xl mx-auto w-full">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
            }}
            placeholder="メッセージを入力..."
            disabled={isLoading || isSubmitting}
            className="focus:ring-2 focus:ring-primary text-sm md:text-base h-10 md:h-11 border-primary/20"
          />
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting} 
            className="flex-shrink-0 h-10 md:h-11 px-3 md:px-5 text-sm md:text-base"
          >
            {isLoading ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : '送信'}
          </Button>
        </div>
        <div className="max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col gap-2">
          {/* 注文ボタンは常に表示し、条件を満たさない場合は無効化 */}
          <Button
            type="button"
            variant="default"
            className={`w-full h-9 md:h-10 text-sm md:text-base ${
              isOrderButtonEnabled
                ? 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
            }`}
            onClick={handleGoToOrder}
            disabled={!isOrderButtonEnabled}
            title={isOrderButtonEnabled 
              ? "注文ページに進む" 
              : "レシピが完成したら注文できるようになります"}
          >
            ルームフレグランスを注文する
            {!isOrderButtonEnabled && (
              <span className="ml-2 text-xs">（レシピ完成後に有効化）</span>
            )}
            {(currentPhaseId === 'complete') && isOrderButtonEnabled && (
              <span className="ml-2 flex items-center animate-pulse">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
          {/* おまかせでレシピ作成ボタン */}
          {currentPhaseId !== 'complete' && currentPhaseId !== 'finalized' && (
            <Button
              type="button"
              variant="secondary"
              className="w-full h-9 md:h-10 text-sm md:text-base bg-secondary/90 hover:bg-secondary/80"
              onClick={handleAutoCreateRecipe}
              disabled={isLoading}
            >
              <span className="mr-2">✨</span>
              おまかせでレシピ作成
            </Button>
          )}
          {/* リセットボタンを追加 */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 md:h-10 text-sm md:text-base border-red-300 hover:bg-red-50"
            onClick={() => resetChat()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            チャットをリセット
          </Button>
        </div>
      </form>
      
      {/* TipsSidebarコンポーネントを使用 */}
      <TipsSidebar 
        currentStep={currentPhaseId as any} 
        selectedScents={{
          top: selectedScents.top.length > 0 ? selectedScents.top[0] : null,
          middle: selectedScents.middle.length > 0 ? selectedScents.middle[0] : null,
          base: selectedScents.base.length > 0 ? selectedScents.base[0] : null
        }} 
      />
    </div>
  )
}
