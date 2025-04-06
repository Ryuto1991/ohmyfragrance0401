"use client"

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
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
import { sendChatMessage } from '@/lib/api/chat'

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

  // フェーズ管理関数
  const nextPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhaseId)
    if (currentIndex < PHASE_ORDER.length - 1) {
      setCurrentPhaseId(PHASE_ORDER[currentIndex + 1])
      onPhaseAdvance?.()
    }
  }, [currentPhaseId, onPhaseAdvance, setCurrentPhaseId])

  const previousPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhaseId)
    if (currentIndex > 0) {
      setCurrentPhaseId(PHASE_ORDER[currentIndex - 1])
    }
  }, [currentPhaseId, setCurrentPhaseId])

  const resetPhase = useCallback(() => {
    setCurrentPhaseId("welcome")
    phaseHistoryRef.current = []
  }, [setCurrentPhaseId])

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
          setCurrentPhaseId(data.nextPhase);
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
  }, [setIsLoading, setError, setMessages, setCurrentPhaseId])
  
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
        
        setMessages(prev => [...prev, newMessage]);
        
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

          setMessages(prev => [...prev, newMessage])

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
      
      setMessages(prev => [...prev, newMessage])
      
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
      // 既にメッセージがある場合、処理中の場合は何もしない
      if (messages.length > 0 || isLoading) return;

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
    };
    
    // コンポーネントマウント時に一度だけ実行
    addInitialMessage();
  }, []);

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
    // 状態のリセット
    setState({
      messages: [],
      currentPhaseId: 'welcome',
      selectedScents: {
        top: [],
        middle: [],
        base: []
      },
      isLoading: false,
      sessionId: state.sessionId, // セッションIDは維持
      error: null
    });

    // ローカルストレージのクリア
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_VISIT);
    localStorage.removeItem(STORAGE_KEYS.SESSION);

    // 新しいセッションIDの生成
    const newSessionId = uuid();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    setState(prev => ({ ...prev, sessionId: newSessionId }));

    // セッション情報の更新
    const sessionInfo = {
      sessionId: newSessionId,
      currentPhase: 'welcome',
      lastVisit: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionInfo));
    
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
    
  }, [setState, state.sessionId, setMessages]);

  return {
    // フェーズ関連
    currentPhaseId,
    isLastPhase,
    isFirstPhase,
    nextPhase,
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

    // 状態
    selectedScents,
    isLoading,
    error,
    sessionId: state.sessionId,
    resetChat
  };
} 