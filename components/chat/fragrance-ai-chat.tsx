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

export function FragranceAIChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    messages,
    currentPhaseId,
    isLoading,
    error,
    addMessage,
    resetChat,
    nextPhase,
    setPhase,
    selectedScents,
    setIsLoading,
    setError,
    setMessages,
    setState
  } = useChatState()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [initialMessageSent, setInitialMessageSent] = useState(false)
  const [lastPhaseChangeTime, setLastPhaseChangeTime] = useState(Date.now())

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
    // チャットをリセット（useChatState内のresetChat関数を呼び出す）
    resetChat()
    
    // リセット後は再度inputにフォーカス
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // 初期メッセージフラグをリセット
    setInitialMessageSent(false);
    
    // 処理済みクエリをクリア
    localStorage.removeItem('processedQueries');
    
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

  // 「おまかせでレシピ作成」ボタンのハンドラー関数
  const handleAutoCreateRecipe = async () => {
    // 既にローディング中なら何もしない
    if (isLoading) return;
    
    // ローディング状態を設定
    setIsLoading(true);
    
    try {
      // デバッグ用にステータスを表示
      console.log('現在のフェーズ:', currentPhaseId);
      console.log('選択された香り:', selectedScents);
      
      // フラグメント生成APIを呼び出す
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: "柔軟剤のような爽やかなルームフレグランス"
        })
      });
      
      if (!response.ok) {
        throw new Error('レシピの生成に失敗しました');
      }
      
      const recipe = await response.json();
      console.log('生成されたレシピ:', recipe);
      
      if (!recipe || !recipe.notes) {
        throw new Error('無効なレシピデータです');
      }
      
      // トップ、ミドル、ベースノートを抽出
      const topNotes = recipe.notes.top.map((item: any) => item.name);
      const middleNotes = recipe.notes.middle.map((item: any) => item.name);
      const baseNotes = recipe.notes.base.map((item: any) => item.name);
      
      // ノート選択を状態に反映
      setState((prev: any) => ({
        ...prev,
        selectedScents: {
          top: topNotes,
          middle: middleNotes,
          base: baseNotes
        }
      }));
      
      // メッセージを表示
      setMessages((prev: any) => [
        ...prev,
        {
          id: nanoid(),
          role: 'assistant',
          content: `おまかせレシピの準備ができたよ！✨ トップノート: ${topNotes[0]}`,
          timestamp: Date.now()
        },
        {
          id: nanoid(),
          role: 'assistant',
          content: `ミドルノート: ${middleNotes[0]}`,
          timestamp: Date.now() + 100
        },
        {
          id: nanoid(),
          role: 'assistant',
          content: `ベースノート: ${baseNotes[0]}`,
          timestamp: Date.now() + 200
        },
        {
          id: nanoid(),
          role: 'assistant',
          content: `よっしゃ完成！この組み合わせめっちゃいい感じ！✨「${recipe.title}」のレシピが完成したよ！${recipe.description}`,
          timestamp: Date.now() + 300,
          recipe: {
            name: recipe.title,
            description: recipe.description,
            notes: {
              top: topNotes,
              middle: middleNotes,
              base: baseNotes
            }
          }
        }
      ]);
      
      // レシピ情報をローカルストレージに保存
      const recipeInfo = {
        top_notes: topNotes,
        middle_notes: middleNotes,
        base_notes: baseNotes
      };
      localStorage.setItem('selected_recipe', JSON.stringify(recipeInfo));
      sessionStorage.setItem('recipe_saved', 'true');
      console.log('おまかせ機能でレシピ情報を保存:', recipeInfo);
      
      // completeフェーズに設定
      setPhase('complete');
      
      // 注文ボタンの通知メッセージを追加
      const buttonNotificationMessage = {
        id: nanoid(),
        role: 'assistant',
        content: 'このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！リビングやベッドルーム、玄関などお好きな場所に置いて空間を彩るといいよ〜 ✨',
        timestamp: Date.now() + 400
      };
      setMessages((prev: any) => [...prev, buttonNotificationMessage]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('おまかせレシピ作成中にエラーが発生しました:', error);
      setError('レシピの作成に失敗しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  // 注文ページに進む関数
  const handleGoToOrder = () => {
    // デバッグ: 現在の状態を確認
    console.log('注文ボタンクリック時の状態:', {
      currentPhaseId,
      selectedScents,
      isTopSelected: selectedScents.top.length > 0,
      isMiddleSelected: selectedScents.middle.length > 0, 
      isBaseSelected: selectedScents.base.length > 0
    });
    
    // 現在のレシピ情報をローカルストレージに保存
    const recipeInfo = {
      top_notes: selectedScents.top,
      middle_notes: selectedScents.middle,
      base_notes: selectedScents.base
    };
    
    // すべてのノートが選択されているか確認
    if (recipeInfo.top_notes.length > 0 && recipeInfo.middle_notes.length > 0 && recipeInfo.base_notes.length > 0) {
      try {
        // レシピ情報をローカルストレージに保存
        localStorage.setItem('selected_recipe', JSON.stringify(recipeInfo));
        console.log('注文ボタンクリック時にレシピ情報を保存:', recipeInfo);
        
        // 注文ページへリダイレクト
        console.log('注文ページに遷移します: /custom-order?mode=lab');
        setTimeout(() => {
          window.location.href = '/custom-order?mode=lab';
        }, 100);
      } catch (error) {
        console.error('注文ページへの遷移エラー:', error);
        alert('注文ページへの遷移中にエラーが発生しました。もう一度お試しください。');
      }
    } else {
      console.warn('レシピが不完全なため注文ページに進めません');
      alert('レシピが完成していないため、注文ページに進めません。トップ、ミドル、ベースノートがすべて選択されているか確認してください。');
    }
  };

  // 注文ボタンの有効状態を計算
  const isOrderButtonEnabled = 
    (currentPhaseId === 'finalized' || currentPhaseId === 'complete') && 
    selectedScents.top.length > 0 && 
    selectedScents.middle.length > 0 && 
    selectedScents.base.length > 0;

  // 選択肢をクリックしたときの処理
  const handleChoiceClick = async (choice: string) => {
    // 現在のフェーズに基づいて次のフェーズを決定
    const nextPhaseId = getNextPhase(currentPhaseId as ChatPhase);
    
    console.log(`選択肢クリック: ${choice}`);
    console.log(`現在のフェーズ: ${currentPhaseId}, 次のフェーズ: ${nextPhaseId}`);
    
    // メッセージ送信
    await addMessage(choice, true);
    
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

  // 「おわり？」などのユーザー入力に反応して自動的に完了段階に進む処理
  useEffect(() => {
    if (messages.length > 0 && (currentPhaseId === 'finalized' || currentPhaseId === 'base')) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const lowerContent = lastMessage.content.toLowerCase();
        // 「おわり」「完了」「終わり」などのキーワードを検出
        if (lowerContent.includes('おわり') || 
            lowerContent.includes('終わり') || 
            lowerContent.includes('完了') || 
            lowerContent.includes('終了') ||
            lowerContent.includes('次') || 
            lowerContent.match(/^(ok|オッケー|はい|うん|そう|せや)$/)) {
          
          // finalizedフェーズならcompleteに進む
          if (currentPhaseId === 'finalized') {
            setTimeout(() => {
              console.log("ユーザーの完了確認を検出しました。completeフェーズに進みます");
              nextPhase();
            }, 1500);
          }
          // baseフェーズならfinalizedに進む
          else if (currentPhaseId === 'base') {
            setTimeout(() => {
              console.log("ユーザーの完了確認を検出しました。finalizedフェーズに進みます");
              nextPhase();
            }, 1500);
          }
        }
      }
    }
  }, [messages, currentPhaseId, nextPhase]);

  // フェーズが変わったら時間をリセット
  useEffect(() => {
    setLastPhaseChangeTime(Date.now());
  }, [currentPhaseId]);

  // 一定時間後に自動的に次のフェーズに進める (修正)
  useEffect(() => {
    // finalized フェーズで、全てのノートが選択済みの場合に10秒以上停滞したら complete へ
    if (currentPhaseId === 'finalized' &&
        selectedScents.top.length > 0 &&
        selectedScents.middle.length > 0 &&
        selectedScents.base.length > 0) { // baseノートの選択も確認
      const timeoutId = setTimeout(() => {
        const timeSinceLastChange = Date.now() - lastPhaseChangeTime;
        if (timeSinceLastChange > 10000) { // 10秒
          console.log(`finalizedフェーズで${timeSinceLastChange}ms経過、全ノート選択済みのため、自動的にcompleteに進みます`);
          nextPhase(); // finalized -> complete
        }
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
    // base フェーズでの自動進行は削除
  }, [currentPhaseId, lastPhaseChangeTime, nextPhase, selectedScents]);

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
                    : <p>{hasExistingChoices ? message.content : parsedContent.text}</p>
                  }
                  
                  {/* 既存の選択肢があればそれを表示 */}
                  {hasExistingChoices && message.choices && (
                    <div className="mt-3 space-y-2 grid md:grid-cols-1 lg:grid-cols-3 lg:gap-2 lg:space-y-0">
                      {message.choices.map((choice, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full text-sm md:text-base py-2 whitespace-normal text-left h-auto justify-start border-primary/30 hover:bg-primary/10 hover:text-primary-foreground/90"
                          onClick={() => handleChoiceClick(choice)}
                        >
                          <div className="flex flex-col w-full">
                            <div className="font-medium">{choice}</div>
                            {message.choices_descriptions && message.choices_descriptions[index] && (
                              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                                {message.choices_descriptions[index]}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* パースした選択肢があれば表示 */}
                  {!hasExistingChoices && parsedContent.choices.length > 0 && (
                    <div className="mt-3 space-y-2 grid md:grid-cols-1 lg:grid-cols-3 lg:gap-2 lg:space-y-0">
                      {Array.isArray(parsedContent.choices) 
                        ? parsedContent.choices.map((choice, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full text-sm md:text-base py-2 whitespace-normal text-left h-auto justify-start border-primary/30 hover:bg-primary/10 hover:text-primary-foreground/90"
                              onClick={() => handleChoiceClick(typeof choice === 'string' ? choice : choice.name)}
                            >
                              <div className="flex flex-col w-full">
                                <div className="font-medium">{typeof choice === 'string' ? choice : choice.name}</div>
                                {typeof choice !== 'string' && choice.description && (
                                  <div className="text-xs md:text-sm text-muted-foreground mt-1">
                                    {choice.description}
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))
                        : null
                      }
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
          {error && (
            <div className="flex items-start">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-2 md:mr-3 flex-shrink-0">
                <Image 
                  src="/images/Fragrance Lab.png" 
                  alt="AI" 
                  width={40} 
                  height={40}
                />
              </div>
              <div className="md:max-w-[80%] lg:max-w-[70%] px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base leading-relaxed break-words rounded-2xl bg-destructive/10 text-destructive rounded-tl-none shadow-sm">
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
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="focus:ring-2 focus:ring-primary text-sm md:text-base h-10 md:h-11 border-primary/20"
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-shrink-0 h-10 md:h-11 px-3 md:px-5 text-sm md:text-base"
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
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
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 md:h-10 text-sm md:text-base border-primary/20 hover:bg-primary/5"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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
