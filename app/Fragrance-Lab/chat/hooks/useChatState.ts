"use client"

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid'
import { 
  Message, 
  ChatPhaseId, 
  CHAT_PHASES,
  ChatFlowOptions,
  ChatState,
  ChatPhase,
  ChatResponse,
  STORAGE_KEYS
} from '../types'

const PHASE_ORDER: ChatPhase[] = [
  'welcome',
  'intro',
  'themeSelected',
  'top',
  'middle',
  'base',
  'finalized',
  'complete'
]

export function useChatState(options: Partial<ChatFlowOptions> = {}) {
  const { 
    messages: initialMessages = [],
    currentPhase: initialPhase = 'welcome',
    initialDelay = 1000, 
    messageDelay = 1000,
    typingDelay = 50,
    onPhaseAdvance 
  } = options

  // 状態管理
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    currentPhaseId: initialPhase,
    selectedScents: {
      top: [],
      middle: [],
      base: []
    },
    isLoading: false,
    sessionId: uuid(),
    error: null
  })

  // 分割された状態を利用しやすくするために展開
  const { messages, currentPhaseId, selectedScents, isLoading, error } = state

  // 状態更新関数
  const setMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    setState(prev => ({
      ...prev,
      messages: typeof updater === 'function' ? updater(prev.messages) : updater
    }))
  }, [])

  const setCurrentPhaseId = useCallback((newPhaseId: ChatPhase) => {
    setState(prev => ({
      ...prev,
      currentPhaseId: newPhaseId
    }))
  }, [])

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading
    }))
  }, [])

  const setError = useCallback((error: Error | string | null) => {
    setState(prev => ({
      ...prev,
      error: error instanceof Error ? error : error ? new Error(error) : null
    }))
  }, [])

  // メモリリークを防ぐためにuseRefを使用して最新の値を追跡
  const messagesRef = useRef<Message[]>(messages)
  const currentPhaseIdRef = useRef<ChatPhase>(currentPhaseId)
  const isLoadingRef = useRef<boolean>(isLoading)
  const phaseHistoryRef = useRef<ChatPhase[]>([])

  // refの値を最新に保つ
  useEffect(() => {
    messagesRef.current = messages
    currentPhaseIdRef.current = currentPhaseId
    isLoadingRef.current = isLoading
  }, [messages, currentPhaseId, isLoading])

  // フェーズ管理関数の宣言（最初に基本関数を宣言）
  const setFinalPhase = useCallback((phase: ChatPhase) => {
    setCurrentPhaseId(phase);
  }, [setCurrentPhaseId]);

  // 次のフェーズを取得する関数
  const getNextPhase = useCallback((currentPhase: ChatPhase): ChatPhase => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      return PHASE_ORDER[currentIndex + 1];
    }
    return currentPhase; // 既に最終フェーズの場合は同じフェーズを返す
  }, []);

  // フェーズの最終変更時間を記録する状態
  const [lastPhaseChangeTime, setLastPhaseChangeTime] = useState<number>(Date.now());

  // 自動進行用のタイマー参照
  const autoProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 選択された香りを更新する関数
  const updateSelectedScents = useCallback((selectedChoice: string) => {
    setState(prev => {
      const currentPhase = prev.currentPhaseId;
      const newSelectedScents = { ...prev.selectedScents };

      // ユーザーが入力した選択肢を対応するフェーズのノートとして記録
      if (currentPhase === 'top') {
        newSelectedScents.top = [selectedChoice]; // 配列に選択肢をセット (単一選択)
        console.log(`トップノートを選択: ${selectedChoice}`);
      } else if (currentPhase === 'middle') {
        newSelectedScents.middle = [selectedChoice];
        console.log(`ミドルノートを選択: ${selectedChoice}`);
      } else if (currentPhase === 'base') {
        newSelectedScents.base = [selectedChoice];
        console.log(`ベースノートを選択: ${selectedChoice}`);
      } else {
        // 対象フェーズ以外では何もしない
        return prev;
      }

      // 新しい selectedScents を含む状態を返す
      return {
        ...prev,
        selectedScents: newSelectedScents
      };
    });
  }, [setState]); // 依存配列を setState のみに変更

  // レシピが完成したときにローカルストレージに保存する関数
  const saveRecipeWhenComplete = useCallback(() => {
    // すべてのノートが選択されているか確認
    if (selectedScents.top.length > 0 && 
        selectedScents.middle.length > 0 && 
        selectedScents.base.length > 0) {
      
      // レシピ情報を作成
      const recipeInfo = {
        top_notes: selectedScents.top,
        middle_notes: selectedScents.middle,
        base_notes: selectedScents.base
      };
      
      // レシピ情報をローカルストレージに保存
      localStorage.setItem('selected_recipe', JSON.stringify(recipeInfo));
      sessionStorage.setItem('recipe_saved', 'true');
      
      console.log('レシピ情報を保存しました:', recipeInfo);
    } else {
      console.warn('レシピが不完全なため保存できませんでした', selectedScents);
    }
  }, [selectedScents]);

  // 次のフェーズに進む関数の宣言（初期バージョン）
  const nextPhase = useCallback(() => {
    // 現在のフェーズに基づいて次のフェーズに進む
    const nextPhaseId = getNextPhase(currentPhaseId);
    console.log(`フェーズ変更: ${currentPhaseId} -> ${nextPhaseId}`);
    
    // フェーズ更新
    setCurrentPhaseId(nextPhaseId);
    setLastPhaseChangeTime(Date.now());
  }, [currentPhaseId, setCurrentPhaseId, getNextPhase, setLastPhaseChangeTime]);

  // フェーズ管理の高度な関数
  const handlePhaseChange = useCallback((newPhase: ChatPhase) => {
    console.log(`フェーズを更新: ${currentPhaseId} -> ${newPhase}`);
    
    // 現在のフェーズと同じ場合は何もしない
    if (currentPhaseId === newPhase) return;

    // フェーズを更新
    setCurrentPhaseId(newPhase);
    setLastPhaseChangeTime(Date.now());

    // FinalizesフェーズからCompleteフェーズへの移行時にレシピ情報を保存
    if (currentPhaseId === 'finalized' && newPhase === 'complete') {
      saveRecipeWhenComplete();

      // 自動的にボタンに関する通知メッセージを追加
      const buttonNotificationMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: 'このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！リビングやベッドルーム、玄関などお好きな場所に置いて空間を彩るといいよ〜 ✨',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, buttonNotificationMessage]);
    }

    // フェーズに特化した自動処理
    if (newPhase === 'middle') {
      // ミドルノートフェーズに入った場合、ユーザーがミドルノートを選択した後にベースノートフェーズに自動的に移行
      setTimeout(() => {
        if (messagesRef.current.some(msg => 
          msg.content?.includes('ミドルノート') && msg.role === 'user'
        )) {
          // 最新のミドルノートの選択メッセージを検索
          const middleNoteSelection = [...messagesRef.current]
            .reverse()
            .find(msg => msg.role === 'user' && msg.content?.includes('ミドルノート'));
          
          if (middleNoteSelection && currentPhaseIdRef.current === 'middle') {
            console.log('ミドルノートが選択されました。ベースノートフェーズに自動的に移行します');
            nextPhase();
          }
        }
      }, 1000); // 1秒後に確認
    }
    
    // フェーズがbaseになったら自動的にfinalized, completeに移行するためのロジック追加
    if (newPhase === 'base') {
      setTimeout(() => {
        // ユーザーがベースノートを選択した後、finalizedフェーズに自動的に移行
        if (messagesRef.current.some(msg => 
          msg.content?.includes('ベースノート') && msg.role === 'user'
        )) {
          nextPhase();
        }
      }, 5000); // 5秒後
    }
  }, [currentPhaseId, setCurrentPhaseId, saveRecipeWhenComplete, setMessages, nextPhase, setLastPhaseChangeTime]);

  // nextPhase関数を拡張版に上書き
  const enhancedNextPhase = useCallback(() => {
    // 現在のフェーズに基づいて次のフェーズに進む
    const nextPhaseId = getNextPhase(currentPhaseId);
    
    // フェーズ変更のログ
    console.log(`フェーズ変更: ${currentPhaseId} -> ${nextPhaseId}`);
    
    // レシピが完成していて、finalizedからcompleteに移行する場合はレシピを保存
    if (currentPhaseId === 'finalized' && nextPhaseId === 'complete') {
      saveRecipeWhenComplete();
    }
    
    // 次のフェーズをセット
    setCurrentPhaseId(nextPhaseId);
    setLastPhaseChangeTime(Date.now());
    // 次のフェーズがcompleteならUI更新用タイマーをクリア
    if (nextPhaseId === 'complete') {
      if (autoProgressTimeoutRef.current) {
        clearTimeout(autoProgressTimeoutRef.current);
        autoProgressTimeoutRef.current = null;
      }
    }
  }, [currentPhaseId, setCurrentPhaseId, getNextPhase, saveRecipeWhenComplete, setLastPhaseChangeTime]);
  
  // 拡張版に参照を上書き
  Object.assign(nextPhase, enhancedNextPhase);
  
  // 特定のフェーズに直接設定する関数
  const setPhase = useCallback((phaseId: ChatPhase) => {
    // 前のフェーズからの移行をログに記録
    console.log(`フェーズを直接設定: ${currentPhaseId} -> ${phaseId}`);
    
    // finalized -> completeの移行時にはレシピ情報を保存
    if (currentPhaseId === 'finalized' && phaseId === 'complete') {
      saveRecipeWhenComplete();
    }
    
    // フェーズを設定
    setCurrentPhaseId(phaseId);
    setLastPhaseChangeTime(Date.now());
    
    // completeフェーズに設定する場合はUI更新用タイマーをクリア
    if (phaseId === 'complete') {
      if (autoProgressTimeoutRef.current) {
        clearTimeout(autoProgressTimeoutRef.current);
        autoProgressTimeoutRef.current = null;
      }
    }
  }, [currentPhaseId, setCurrentPhaseId, saveRecipeWhenComplete, setLastPhaseChangeTime]);

  const previousPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhaseId)
    if (currentIndex > 0) {
      setFinalPhase(PHASE_ORDER[currentIndex - 1])
    }
  }, [currentPhaseId, setFinalPhase])

  const resetPhase = useCallback(() => {
    setFinalPhase("welcome")
    phaseHistoryRef.current = []
  }, [setFinalPhase])

  // メッセージキューとプロセス中フラグ
  const messageQueueRef = useRef<Message[]>([])
  const isProcessingRef = useRef(false)

  // メッセージを追加する関数
  const addMessage = useCallback(async (content: string) => {
    if (isLoadingRef.current) return
    
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)
    
    const userMessage: Message = {
      id: uuid(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // ★追加: ユーザーの選択を selectedScents に反映
    updateSelectedScents(content);
    
    // ユーザーがミドルノートを選択した場合を検出（例：「カモミール」というメッセージ）
    if (currentPhaseIdRef.current === 'middle') {
      const lastAssistantMessage = [...messagesRef.current].reverse().find(m => m.role === 'assistant');
      
      // 最後のAIメッセージにミドルノートの候補が含まれている場合
      if (lastAssistantMessage && lastAssistantMessage.content && 
          lastAssistantMessage.content.includes('ミドルノート')) {
        // ユーザーが選択したノート名を含む短いメッセージ（例：「カモミール」）を検出
        const userSelection = content.trim();
        if (userSelection.length < 30 && lastAssistantMessage.content.includes(userSelection)) {
          console.log(`ユーザーがミドルノート「${userSelection}」を選択しました`);
          
          // ミドルノートの選択を記録し、次のメッセージ応答後にベースノートフェーズに移行するためのフラグ
          localStorage.setItem('middle_note_selected', 'true');
          
          // 1.5秒後にベースノートフェーズに自動的に移行
          setTimeout(() => {
            if (currentPhaseIdRef.current === 'middle') {
              console.log('ミドルノートの選択を検出、ベースノートフェーズに移行します');
              nextPhase();
            }
          }, 1500);
        }
      }
    }
    
    // ユーザーがベースノートを選択した場合を検出
    if (currentPhaseIdRef.current === 'base') {
      const lastAssistantMessage = [...messagesRef.current].reverse().find(m => m.role === 'assistant');
      
      // 最後のAIメッセージにベースノートの候補が含まれている場合
      if (lastAssistantMessage && lastAssistantMessage.content && 
          lastAssistantMessage.content.includes('ベースノート')) {
        // ユーザーが選択したノート名を含む短いメッセージ（例：「ムスク」）を検出
        const userSelection = content.trim();
        if (userSelection.length < 30 && lastAssistantMessage.content.includes(userSelection)) {
          console.log(`ユーザーがベースノート「${userSelection}」を選択しました`);
          
          // ベースノートの選択を記録
          localStorage.setItem('base_note_selected', 'true');
          
          // 4秒後にfinalizedフェーズに自動的に移行
          setTimeout(() => {
            if (currentPhaseIdRef.current === 'base') {
              console.log('ベースノートの選択を検出、finalizedフェーズに移行します');
              nextPhase();
              
              // さらに4秒後にcompleteフェーズに移行
              setTimeout(() => {
                if (currentPhaseIdRef.current === 'finalized') {
                  console.log('finalizedフェーズから自動的にcompleteフェーズに移行します');
                  nextPhase();
                }
              }, 4000);
            }
          }, 4000);
        }
      }
    }
    
    // APIリクエストを送信する関数（リトライロジック付き）
    const sendRequest = async (retryCount = 0, maxRetries = 2) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [...messagesRef.current, userMessage],
            currentPhase: currentPhaseIdRef.current
          })
        })
        
        if (!response.ok) {
          throw new Error(`APIレスポンスが不正です（ステータスコード: ${response.status}）`)
        }
        
        const data = await response.json()
        
        // AIの返答を追加
        const aiMessage: Message = {
          id: uuid(),
          role: 'assistant',
          content: data.content,
          choices: data.choices,
          choices_descriptions: data.choices_descriptions,
          recipe: data.recipe,
          emotionScores: data.emotionScores,
          should_split: data.should_split,
          timestamp: Date.now()
        }
        
        // フェーズの更新
        if (data.nextPhase && data.nextPhase !== currentPhaseIdRef.current) {
          console.log(`フェーズを更新します: ${currentPhaseIdRef.current} -> ${data.nextPhase}`);
          
          // 直接フェーズを更新する
          const newPhase = data.nextPhase;
          
          // フェーズが完了（complete）に変わった場合、自動的に現在のレシピ情報をローカルストレージに保存
          if (newPhase === 'complete') {
            // レシピ情報を保存
            saveRecipeWhenComplete();
            
            // 注文ボタンの通知メッセージを追加
            const buttonNotificationMessage: Message = {
              id: nanoid(),
              role: 'assistant',
              content: 'このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！リビングやベッドルーム、玄関などお好きな場所に置いて空間を彩るといいよ〜 ✨',
              timestamp: Date.now()
            };
            setMessages(prev => [...prev, buttonNotificationMessage]);
          }
          
          // フェーズを設定
          setCurrentPhaseId(newPhase);
          setLastPhaseChangeTime(Date.now());
          
          // baseフェーズの場合、自動的に次のフェーズに進むタイマーを設定
          if (newPhase === 'base') {
            setTimeout(() => {
              // ユーザーがベースノートを選択した後、finalizedフェーズに自動的に移行
              if (messagesRef.current.some(msg => 
                msg.content?.includes('ベースノート') && msg.role === 'user'
              )) {
                nextPhase();
              }
            }, 5000); // 5秒後
          }
        }
        
        addSplitMessages(aiMessage)
        
        isLoadingRef.current = false
        setIsLoading(false)
      } catch (error) {
        console.error('Message sending error:', error)
        
        // リトライ処理
        if (retryCount < maxRetries) {
          console.log(`リトライを試みます (${retryCount + 1}/${maxRetries})...`);
          // 指数バックオフでリトライ (500ms, 1000ms, ...)
          const delay = 500 * Math.pow(2, retryCount);
          
          // リトライ中であることをユーザーに通知
          setError(`通信エラーが発生しました。再試行しています (${retryCount + 1}/${maxRetries})...`);
          
          setTimeout(() => {
            sendRequest(retryCount + 1, maxRetries);
          }, delay);
        } else {
          isLoadingRef.current = false
          setIsLoading(false)
          setError(error instanceof Error ? error.message : '不明なエラーが発生しました')
        }
      }
    }
    
    // リクエスト送信開始
    sendRequest();
  }, [setIsLoading, setError, setMessages, updateSelectedScents])
  
  // メッセージを再送信する関数
  const retryLastMessage = useCallback(() => {
    // 最後のユーザーメッセージを取得
    const lastUserMessageIndex = [...messagesRef.current].reverse().findIndex(m => m.role === 'user');
    
    if (lastUserMessageIndex >= 0) {
      const lastUserMessage = [...messagesRef.current].reverse()[lastUserMessageIndex];
      
      // エラー表示をクリア
      setError(null);
      
      // 最後のユーザーメッセージを再送信
      addMessage(lastUserMessage.content);
    }
  }, [addMessage, setError]);

  const clearMessages = useCallback(() => {
    setMessages([])
    messageQueueRef.current = []
    setError(null)
  }, [])

  // メッセージ分割処理
  const splitContent = useCallback((content: string): string[] => {
    // JSONの場合は分割しない
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        JSON.parse(content);
        return [content];
      } catch (e) {
        // JSONではないので通常の分割を続行
      }
    }
    
    // 改行で分割
    const lines = content.split('\n').filter(line => line.trim() !== '')
    
    // 各ラインをさらに細かく分割
    const result: string[] = []
    
    lines.forEach(line => {
      // JSONオブジェクトの場合は分割しない
      if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
        try {
          JSON.parse(line);
          result.push(line);
          return;
        } catch (e) {
          // JSONではないので通常の分割を続行
        }
      }
      
      // 文末記号（。！？）で分割
      const sentences = line.split(/([。！？])/g).filter(Boolean)
      
      let current = ""
      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i] + (sentences[i + 1] || "")
        
        // 絵文字だけの文は単独で送信しない - 前の文章と結合する
        if (sentence.trim().match(/^[✨🌟💫🎉💖😊🤔♡]+$/)) {
          if (current) {
            current += sentence
          } else if (result.length > 0) {
            // 前のメッセージがあれば、それに追加する
            result[result.length - 1] += sentence
          } else {
            // どうしても絵文字だけになる場合は、一つの簡単な言葉を追加する
            result.push("やっほー！" + sentence)
          }
          continue
        }
        
        // 絵文字や記号が含まれている場合は別のメッセージとして扱う（絵文字だけでなければ）
        if (sentence.match(/[✨🌟💫🎉💖😊]/) && !sentence.trim().match(/^[✨🌟💫🎉💖😊]+$/)) {
          if (current) {
            result.push(current)
            current = ""
          }
          result.push(sentence)
          continue
        }
        
        // 短い文（15文字以下）はそのまま追加
        if (sentence.length <= 15) {
          if (current) {
            result.push(current)
            current = ""
          }
          result.push(sentence)
          continue
        }
        
        // 長い文は40文字ごとに分割
        if (current.length + sentence.length > 40) {
          if (current) {
            result.push(current)
            current = sentence
          } else {
            result.push(sentence)
          }
        } else {
          current += sentence
        }
      }
      
      if (current) {
        result.push(current)
      }
    })
    
    // 絵文字だけのメッセージがないか最終確認
    return result.filter(msg => !msg.trim().match(/^[✨🌟💫🎉💖😊🤔♡]+$/));
  }, [])

  const addSplitMessages = useCallback((message: Message) => {
    if (isProcessingRef.current) {
      messageQueueRef.current.push(message)
      return
    }

    isProcessingRef.current = true
    
    // JSONオブジェクトの場合、かつshould_splitが設定されていない場合は分割しない
    if (typeof message.content === 'string' && 
      message.content.trim().startsWith('{') && 
      message.content.trim().endsWith('}') &&
      !message.should_split) {
      try {
        const jsonContent = JSON.parse(message.content);
        const newMessage = {
          ...message,
          id: uuid(),
          content: jsonContent.content || '',
          choices: jsonContent.choices || [],
          choices_descriptions: jsonContent.choices_descriptions || [],
          should_split: jsonContent.should_split || false
        };
        
        // ★追加: content が空でないかチェック
        if (newMessage.content && newMessage.content.trim() !== '') {
          setMessages(prev => [...prev, newMessage])
        } else {
          console.warn("空のメッセージコンテンツ（分割）を検出したため、追加をスキップしました:", newMessage);
        }
        
        if (message.recipe && 
            message.recipe.topNotes && 
            message.recipe.middleNotes && 
            message.recipe.baseNotes) {
          nextPhase();
        }
        
        isProcessingRef.current = false;
        if (messageQueueRef.current.length > 0) {
          const nextMessage = messageQueueRef.current.shift();
          if (nextMessage) {
            addSplitMessages(nextMessage);
          }
        }
        return;
      } catch (e) {
        // JSONではないので通常の分割を続行
      }
    }
    
    // メッセージの分割処理
    // should_splitフラグが設定されているか、長さが40文字を超える場合のみ分割する
    if (message.should_split || (typeof message.content === 'string' && message.content.length > 40)) {
      const parts = splitContent(message.content);
      
      // 分割されたメッセージが多すぎる場合は調整する（初動メッセージを減らす）
      const MAX_INITIAL_MESSAGES = 3;
      const adjustedParts = parts.length > MAX_INITIAL_MESSAGES ? parts.slice(0, MAX_INITIAL_MESSAGES) : parts;
      
      adjustedParts.forEach((content, index) => {
        const isLast = index === adjustedParts.length - 1;
        // メッセージ間隔を長くする: 1500ms → 3000ms
        const delay = index === 0 ? 0 : 3000; 

        setTimeout(() => {
          const newMessage = {
            ...message,
            id: uuid(),
            content,
            choices: isLast ? message.choices : undefined,
            choices_descriptions: isLast ? message.choices_descriptions : undefined,
            emotionScores: isLast ? message.emotionScores : undefined,
            recipe: isLast ? message.recipe : undefined
          }

          // ★追加: content が空でないかチェック
          if (newMessage.content && newMessage.content.trim() !== '') {
            setMessages(prev => [...prev, newMessage])
          } else {
            console.warn("空のメッセージコンテンツ（分割）を検出したため、追加をスキップしました:", newMessage);
          }

          if (isLast) {
            if (message.recipe && 
                message.recipe.topNotes && 
                message.recipe.middleNotes && 
                message.recipe.baseNotes) {
              nextPhase()
            }
            isProcessingRef.current = false
            if (messageQueueRef.current.length > 0) {
              const nextMessage = messageQueueRef.current.shift()
              if (nextMessage) {
                addSplitMessages(nextMessage)
              }
            }
          }
        }, delay)
      })
    } else {
      // 分割しない場合はそのまま追加
      const newMessage = {
        ...message,
        id: uuid()
      }
      
      // ★追加: content が空でないかチェック
      if (newMessage.content && newMessage.content.trim() !== '') {
        setMessages(prev => [...prev, newMessage])
      } else {
        console.warn("空のメッセージコンテンツ（分割）を検出したため、追加をスキップしました:", newMessage);
      }
      
      if (message.recipe && 
          message.recipe.topNotes && 
          message.recipe.middleNotes && 
          message.recipe.baseNotes) {
        nextPhase()
      }
      
      isProcessingRef.current = false
      if (messageQueueRef.current.length > 0) {
        const nextMessage = messageQueueRef.current.shift()
        if (nextMessage) {
          addSplitMessages(nextMessage)
        }
      }
    }
  }, [nextPhase, splitContent, setMessages])

  // 状態情報
  const isLastPhase = currentPhaseId === "complete"
  const isFirstPhase = currentPhaseId === "welcome"
  const messageCount = messages.length

  // 初期メッセージを追加（チャットが空の場合）
  useEffect(() => {
    const addInitialMessage = () => {
      // 既にメッセージがある場合は何もしない
      if (messages.length > 0) return;
      
      // セッションストレージをチェックして、初期メッセージが既に追加されているか確認
      const initialMessageAdded = sessionStorage.getItem('initialMessageAdded');
      if (initialMessageAdded === 'true') return;
      
      // ローディング中で、かつURLパラメータからの初期クエリがある場合は初期メッセージを追加しない
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('query') || params.get('q');
      if (isLoading && urlQuery) return;

      // 初期メッセージを作成
      const initialMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: '今日はどんな香りつくる？',
        timestamp: Date.now()
      };
      
      console.log("初期メッセージを追加:", initialMessage.content);
      
      // 状態を更新
      setMessages([initialMessage]);
      
      // セッションストレージに記録
      sessionStorage.setItem('initialMessageAdded', 'true');
    };
    
    // コンポーネントマウント時に一度だけ実行
    addInitialMessage();
  }, [messages.length, isLoading, setMessages]);

  useEffect(() => {
    // セッション情報の復元
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (savedSession) {
      const { sessionId, lastVisit } = JSON.parse(savedSession)
      const hoursSinceLastVisit = (Date.now() - lastVisit) / (1000 * 60 * 60)
      
      if (hoursSinceLastVisit >= 24) {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY)
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
          sessionId: state.sessionId,
          lastVisit: Date.now()
        }))
      } else {
        setState(prev => ({ ...prev, sessionId }))
        const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
        if (savedHistory) {
          const history = JSON.parse(savedHistory)
          setState(prev => ({ 
            ...prev, 
            messages: history.messages,
            currentPhaseId: history.currentPhase,
            selectedScents: history.selectedScents
          }))
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
        sessionId: state.sessionId,
        lastVisit: Date.now()
      }))
    }
  }, [])

  useEffect(() => {
    // チャット履歴の保存
    if (state.messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify({
        messages: state.messages,
        currentPhase: state.currentPhaseId,
        selectedScents: state.selectedScents
      }))
    }
  }, [state.messages, state.currentPhaseId, state.selectedScents])

  const resetChat = useCallback(() => {
    // 新しいセッションIDを生成
    const newSessionId = uuid();
    
    // チャットの状態をリセット
    setState({
      messages: [],
      currentPhaseId: 'welcome', // 明示的にwelcomeフェーズに設定
      selectedScents: {
        top: [],
        middle: [],
        base: []
      },
      isLoading: false,
      sessionId: newSessionId,
      error: null
    });

    // セッション情報の更新
    const sessionInfo = {
      sessionId: newSessionId,
      currentPhase: 'welcome',
      lastVisit: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionInfo));
    
    // ローカルストレージからレシピ情報もクリア
    localStorage.removeItem('selected_recipe');
    
    // 初期メッセージフラグをリセット
    sessionStorage.removeItem('initialMessageAdded');
    
    // 初期メッセージの表示を0.5秒後に行う
    setTimeout(() => {
      const initialMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: '今日はどんな香りつくる？',
        timestamp: Date.now()
      };
      
      console.log("リセット後に初期メッセージを追加:", initialMessage.content);
      setMessages([initialMessage]);
    }, 500);
    
  }, [setState, setMessages]);

  // ユーザーメッセージを監視して選択された香りを更新
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // ユーザーからのメッセージの場合
      if (lastMessage.role === 'user') {
        // 現在のフェーズに応じて選択された香りを更新
        updateSelectedScents(lastMessage.content);
        
        // レシピが完成していてcompleteフェーズなら保存
        if (currentPhaseId === 'complete') {
          saveRecipeWhenComplete();
        }
      }
    }
  }, [messages, currentPhaseId, updateSelectedScents, saveRecipeWhenComplete]);

  return {
    // フェーズ関連
    currentPhaseId,
    isLastPhase,
    isFirstPhase,
    nextPhase,
    setPhase,
    previousPhase,
    resetPhase,

    // メッセージ関連
    messages,
    messageCount,
    setIsLoading,
    setError,
    addMessage,
    retryLastMessage,
    addSplitMessages,
    clearMessages,
    setMessages,

    // 状態
    selectedScents,
    isLoading,
    error,
    sessionId: state.sessionId,
    resetChat,
    setState
  };
} 