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
    sessionId: crypto.randomUUID(),
    error: null
  })

  // フェーズの状態管理
  const [currentPhaseId, setCurrentPhaseId] = useState<ChatPhaseId>(initialPhase)
  const phaseHistoryRef = useRef<ChatPhaseId[]>([])

  // メッセージの状態管理
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageQueueRef = useRef<Message[]>([])
  const isProcessingRef = useRef(false)

  // 現在のフェーズ情報
  const currentPhase = useMemo(() => CHAT_PHASES[currentPhaseId], [currentPhaseId])

  // フェーズ管理関数
  const nextPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhaseId)
    if (currentIndex < PHASE_ORDER.length - 1) {
      setCurrentPhaseId(PHASE_ORDER[currentIndex + 1])
      onPhaseAdvance?.()
    }
  }, [onPhaseAdvance])

  const previousPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(currentPhaseId)
    if (currentIndex > 0) {
      setCurrentPhaseId(PHASE_ORDER[currentIndex - 1])
    }
  }, [currentPhaseId])

  const resetPhase = useCallback(() => {
    setCurrentPhaseId("welcome")
    phaseHistoryRef.current = []
  }, [])

  const addMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))

      // route.tsのAPIエンドポイントを直接呼び出す
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...state.messages, userMessage],
          currentPhase: state.currentPhaseId
        })
      });

      if (!apiResponse.ok) {
        throw new Error('チャットAPIの呼び出しに失敗しました');
      }

      const response = await apiResponse.json();

      if (response.content && typeof response.content === 'string') {
        // JSONフォーマットの場合、表示を調整
        try {
          const jsonContent = JSON.parse(response.content);
          response.content = jsonContent.content || '';
          response.choices = jsonContent.choices || [];
          response.choices_descriptions = jsonContent.choices_descriptions || [];
        } catch (e) {
          // 通常のテキストなので何もしない
        }
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, response]
      }))

      if (response.recipe) {
        setState(prev => ({
          ...prev,
          selectedScents: {
            top: response.recipe?.topNotes || [],
            middle: response.recipe?.middleNotes || [],
            base: response.recipe?.baseNotes || []
          }
        }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました'
      
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            error: errorMessage
          }
        ]
      }))
      
      setError(errorMessage)
      options.onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [state.messages, state.currentPhaseId, options])

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
        
        // 絵文字や記号が含まれている場合は別のメッセージとして扱う
        if (sentence.match(/[✨🌟💫🎉💖😊]/)) {
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
    
    return result
  }, [])

  const addSplitMessages = useCallback((message: Message) => {
    if (isProcessingRef.current) {
      messageQueueRef.current.push(message)
      return
    }

    isProcessingRef.current = true
    
    // JSONオブジェクトの場合は分割しない
    if (typeof message.content === 'string' && 
      message.content.trim().startsWith('{') && 
      message.content.trim().endsWith('}')) {
      try {
        const jsonContent = JSON.parse(message.content);
        const newMessage = {
          ...message,
          id: uuid(),
          content: jsonContent.content || '',
          choices: jsonContent.choices || [],
          choices_descriptions: jsonContent.choices_descriptions || []
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
    
    const parts = splitContent(message.content);
    
    parts.forEach((content, index) => {
      const isLast = index === parts.length - 1;
      const delay = index === 0 ? 0 : 1500; // 最初のメッセージは即時、それ以降は1.5秒ずつ遅延（遅延を増やした）

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
  }, [nextPhase, splitContent])

  // 状態情報
  const isLastPhase = currentPhaseId === "complete"
  const isFirstPhase = currentPhaseId === "welcome"
  const messageCount = messages.length

  // 初期メッセージを追加（チャットが空の場合）
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '今日はどんな香りつくる？',
        timestamp: Date.now()
      };
      
      setMessages([initialMessage]);
    }
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

  const resetChat = () => {
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
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    setState(prev => ({ ...prev, sessionId: newSessionId }));

    // セッション情報の更新
    const sessionInfo = {
      sessionId: newSessionId,
      currentPhase: 'welcome',
      lastVisit: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionInfo));
  };

  const returnState = {
    // フェーズ関連
    isLastPhase,
    isFirstPhase,
    nextPhase,
    previousPhase,
    resetPhase,

    // メッセージ関連
    messageCount,
    setIsLoading,
    setError,
    addMessage,
    addSplitMessages,
    clearMessages,

    // 状態
    ...state,
    resetChat
  }

  return returnState
} 