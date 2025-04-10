"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Loader2, RefreshCw, Info, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useChatState } from "@/app/fragrance-lab/chat/hooks/useChatState"
import { ChatPhase, Message } from "@/app/fragrance-lab/chat/types"
import { ChatProgressSteps } from "@/app/fragrance-lab/chat/components/ChatProgressSteps"
import { getPhaseDisplayName, getNextPhase } from "@/app/fragrance-lab/chat/utils"
import Image from "next/image"
import { TipsSidebar } from "./tips-sidebar"
import { v4 as uuid } from 'uuid'
import { ChoiceButton } from "./choice-button"

/**
 * フレグランスAIチャットコンポーネント
 * ユーザーとAIの対話によるフレグランス作成インターフェース
 */
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

  // 確実に最下部までスクロールする関数 (useCallbackで最適化)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [])

  // メッセージが追加されたときに最下部にスクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // ルーターが初期化されていることを確認
  useEffect(() => {
    if (!router) {
      console.error('Router is not initialized');
      return;
    }
  }, [router]);

  // 初期表示時にフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // クエリパラメータのキャッシュ（重複処理を回避）
  const [processedQueryIds] = useState(() => new Set<string>());

  // 初期クエリの処理 (パフォーマンス・エラーハンドリング改善)
  useEffect(() => {
    const handleInitialInteraction = async () => {
      // すでに初期メッセージが送信済みか処理中の場合は何もしない
      if (initialMessageSent || isLoading || messages.length > 1) return;

      try {
        // URLからクエリパラメータを取得
        const urlQuery = searchParams.get('query') || searchParams.get('q');

        // クエリパラメータを削除（履歴を汚さないため）
        if (urlQuery) {
          const newPath = window.location.pathname;
          router.replace(newPath, { scroll: false });
        }

        // 処理するクエリを決定（propsのinitialQueryが優先）
        const queryToProcess = initialQuery || urlQuery;

        if (queryToProcess) {
          // クエリの一意のIDを生成（URLエンコードされた値とタイムスタンプ）
          const queryId = encodeURIComponent(queryToProcess).substring(0, 100);
          
          // 未処理のクエリのみ処理
          if (!processedQueryIds.has(queryId)) {
            console.log("初期クエリを処理します:", queryToProcess);
            
            // キャッシュに追加
            processedQueryIds.add(queryId);
            
            // ユーザーメッセージとして送信
            await addMessage(queryToProcess);
            
            // 自動的におまかせレシピを作成（クエリが「おまかせ」を含む場合）
            if (
              queryToProcess.includes('おまかせ') || 
              queryToProcess.includes('自動') || 
              queryToProcess.includes('適当')
            ) {
              setTimeout(() => {
                handleAutoCreateRecipe();
              }, 2000);
            }
          } else {
            console.log("このクエリは既に処理済みです:", queryToProcess);
          }
        }

        // 初期処理完了をマーク
        setInitialMessageSent(true);

        // スクロールを更新
        setTimeout(scrollToBottom, 500);
      } catch (error) {
        console.error('初期クエリ処理エラー:', error);
        // エラーがあっても初期化完了をマーク（無限ループ防止）
        setInitialMessageSent(true);
      }
    };

    handleInitialInteraction();
  }, [
    searchParams, 
    router, 
    initialQuery, 
    addMessage, 
    initialMessageSent, 
    isLoading, 
    messages.length, 
    scrollToBottom, 
    processedQueryIds,
    handleAutoCreateRecipe
  ]);

  // メッセージ送信処理 (useCallbackで最適化)
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !input.trim()) return;

    const content = input.trim();
    setInput('');
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('メッセージ送信中にエラーが発生しました:', error);
      handleError(error instanceof Error ? error : new Error('メッセージの送信に失敗しました'));
    }
  }, [input, isSubmitting, sendMessage, handleError]);

  // メッセージコンテンツを解析して選択肢と本文を分離（パフォーマンス向上のためuseCallbackで最適化）
  const parseMessageContent = useCallback((content: string | { name: string, description?: string }[]) => {
    // オブジェクトの配列の場合は、そのまま返す
    if (Array.isArray(content)) {
      return {
        text: '',
        choices: content
      };
    }

    // 文字列でない場合は空のオブジェクトを返す
    if (!content) return { text: '', choices: [] };

    // JSONレスポンスの処理（APIが直接JSONオブジェクトを返すケース）
    if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        // choices属性がある場合はそれを使用
          if (parsed.choices && Array.isArray(parsed.choices)) {
          const choices = parsed.choices.map((choice: unknown, index: number) => {
            // choices_descriptionsがある場合、対応する説明を追加
            const description = parsed.choices_descriptions && Array.isArray(parsed.choices_descriptions) && parsed.choices_descriptions[index]
              ? parsed.choices_descriptions[index]
              : undefined;
            return { 
              name: typeof choice === 'string' ? choice : 
                   (typeof choice === 'object' && choice !== null && 'name' in choice ? 
                     String(choice.name) : ''),
              description 
            };
          });
          
          return {
            text: parsed.content || '',
            choices: choices
          };
        }
        
        // 通常のJSONコンテンツ
        return { 
          text: parsed.content || content,
          choices: []
        };
      } catch (e) {
        console.error('JSONの解析に失敗:', e);
      }
    }

    // 複数の選択肢パターンに対応
    const patterns = [
      // 1. **シダーウッド** - 乾いた樹木の落ち着いた香り (マークダウン形式)
      /(\d+\.\s*\*\*([^*]+)\*\*\s*[-–—]\s*([^\n]+))/g,

      // 2. シダーウッド - 乾いた樹木の落ち着いた香り (マークダウンなし)
      /(\d+\.\s*([^-–—]+)\s*[-–—]\s*([^\n]+))/g,

      // 3. シンプルな番号付きリスト
      /(\d+\.\s*([^\n\d\.]+))/g,
      
      // 4. 番号なしの箇条書き
      /(・\s*([^\n]+))/g
    ];

    // 各パターンを試す
    for (const pattern of patterns) {
      const matches = Array.from(content.matchAll(pattern));

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
  }, []);

  // フェーズ遷移を自動化 (useCallbackで最適化)
  const updatePhaseWithAutoProgress = useCallback((nextPhase: ChatPhase, isAutoMode: boolean = false) => {
    updatePhase(nextPhase, isAutoMode);
    setLastPhaseChangeTime(Date.now());
  }, [updatePhase]);

  // 選択肢クリック処理 (useCallbackで最適化)
  const handleChoiceClick = useCallback(async (choice: { name: string, description?: string } | string) => {
    // 選択肢のテキストを取得
    const choiceText = typeof choice === 'string' ? choice : choice.name;
    
    // 読み込み中は無効化
    if (isLoading || isSubmitting) {
      console.log('処理中は選択できません');
      return;
    }

    // フェーズに対応する次のフェーズを取得
    const nextPhaseId = getNextPhase(currentPhaseId as ChatPhase);

    try {
      // welcomeフェーズでは香りの選択は無効
      if (currentPhaseId === 'welcome') {
        console.log('welcomeフェーズでは香りの選択は無効です');
        return;
      }

      // 香りの選択を更新（香り選択フェーズのみ）
      if (['top', 'middle', 'base'].includes(currentPhaseId)) {
        updateSelectedScents(choiceText);
      }

      // メッセージを送信（ユーザー選択フラグをtrueに）
      await sendMessage(choiceText, true);

      // フェーズの自動進行（特定のフェーズのみ）
      if (nextPhaseId && ['themeSelected', 'top', 'middle', 'base'].includes(currentPhaseId as string)) {
        updatePhaseWithAutoProgress(nextPhaseId as ChatPhase);
      }
    } catch (error) {
      console.error('選択肢クリック時のエラー:', error);
      handleError(error instanceof Error ? error : new Error('選択肢の処理中にエラーが発生しました'));
    }
  }, [
    currentPhaseId, 
    isLoading, 
    isSubmitting, 
    sendMessage, 
    updateSelectedScents, 
    updatePhaseWithAutoProgress, 
    handleError
  ]);

  // 自動フェーズ進行（finalized → complete）
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
  }, [currentPhaseId, lastPhaseChangeTime, selectedScents, updatePhaseWithAutoProgress]);

  // ユーザー入力による自動進行
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') return;

    const lowerContent = lastMessage.content.toLowerCase();
    const isCompletionKeyword = lowerContent.match(/^(おわり|終わり|完了|終了|次|ok|オッケー|はい|うん|そう|せや)$/);

    if (isCompletionKeyword) {
      if (currentPhaseId === 'finalized') {
        setTimeout(() => updatePhaseWithAutoProgress('complete', true), 1500);
      } else if (currentPhaseId === 'base') {
        setTimeout(() => updatePhaseWithAutoProgress('finalized', true), 1500);
      }
    }
  }, [messages, currentPhaseId, updatePhaseWithAutoProgress]);

  // メッセージアイテムコンポーネント（メモ化）
  const MessageItem = useMemo(() => {
    return React.memo(({ message }: { message: Message }) => {
      const parsedContent = parseMessageContent(message.content);
      
      return (
        <div
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
            {parsedContent.choices && parsedContent.choices.length > 0 && (
              <div className="mt-3 space-y-2 grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 lg:gap-2 lg:space-y-0">
                {parsedContent.choices.map((choice: { name: string; description?: string }, index: number) => (
                  <ChoiceButton
                    key={index}
                    choice={choice}
                    onClick={handleChoiceClick}
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
    });
  }, [parseMessageContent, handleChoiceClick]);

  // Loading状態のメッセージコンポーネント
  const LoadingMessage = useMemo(() => {
    return () => (
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
    );
  }, []);

  // エラー表示の場合
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md text-center">
          <p className="font-semibold mb-2">エラーが発生しました</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <Button
          onClick={() => handleError(null)}
          variant="default"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      {/* フェーズ進行状況 */}
      <div className="px-4 pt-4">
        <ChatProgressSteps currentPhaseId={currentPhaseId} />
      </div>

      {/* デバッグ情報（開発環境のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-black/5 p-2 text-xs">
          <div>フェーズ: {currentPhaseId}</div>
          <div>トップ: {selectedScents.top.join(', ') || 'なし'}</div>
          <div>ミドル: {selectedScents.middle.join(', ') || 'なし'}</div>
          <div>ベース: {selectedScents.base.join(', ') || 'なし'}</div>
          <div>注文ボタン: {isOrderButtonEnabled ? '有効' : '無効'}</div>
        </div>
      )}

      {/* チャットメッセージ表示エリア */}
      <div className="flex justify-center mb-2 text-base text-muted-foreground">
        <span>{getPhaseDisplayName(currentPhaseId as ChatPhase)}</span>
      </div>
      <div ref={scrollAreaRef} className="flex-1 p-3 md:p-5 overflow-y-auto mb-16">
        <div className="space-y-4 max-w-4xl lg:max-w-6xl mx-auto">
          {messages.map((message) => (
            <MessageItem key={message.id || uuid()} message={message} />
          ))}
          {isLoading && <LoadingMessage />}
          {/* 自動スクロール用の空の要素 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white/95 backdrop-blur-sm shadow-md px-4 md:px-5 py-3 md:py-4 flex flex-col gap-2 md:gap-3 z-10 border-t"
      >
        <div className="flex gap-2 md:gap-3 items-center max-w-4xl lg:max-w-6xl mx-auto w-full">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
          {/* 注文ボタン */}
          <Button
            type="button"
            variant="default"
            className={`w-full h-9 md:h-10 text-sm md:text-base ${
              isOrderButtonEnabled || currentPhaseId === 'complete'
                ? 'bg-primary hover:bg-primary/90 text-white shadow-sm animate-pulse'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
            }`}
            onClick={() => {
              console.log('注文ボタンがクリックされました');
              // スクロールして注文ボタンが見える状態にする
              window.scrollTo(0, 0);
              // custom-orderへリダイレクト
              handleGoToOrder();
              // リダイレクト結果をコンソールに出力
              console.log('注文ページへリダイレクトします');
            }}
            // 完了フェーズでは常に有効
            disabled={!(isOrderButtonEnabled || currentPhaseId === 'complete')}
            title="注文ページに進む"
          >
            ルームフレグランスを注文する
            <span className="ml-2 flex items-center">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Button>

          {/* おまかせレシピ作成ボタン */}
          {currentPhaseId !== 'complete' && currentPhaseId !== 'finalized' && (
            <Button
              type="button"
              variant="secondary"
              className="w-full h-9 md:h-10 text-sm md:text-base bg-secondary/90 hover:bg-secondary/80"
              onClick={() => {
                console.log("おまかせレシピ作成ボタンがクリックされました");
                // おまかせレシピ作成を直接呼び出す（現在のフェーズの保存は関数内で行われる）
                try {
                  handleAutoCreateRecipe();
                } catch (error) {
                  console.error("おまかせレシピ作成エラー:", error);
                }
              }}
              disabled={isLoading}
            >
              <span className="mr-2">✨</span>
              おまかせでレシピ作成
            </Button>
          )}

          {/* リセットボタン */}
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

      {/* ヒントサイドバー */}
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
