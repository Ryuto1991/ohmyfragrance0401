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
  STORAGE_KEYS,
  FragranceRecipe
} from '../types'
import { useRouter } from 'next/navigation'
import { 
  PHASE_TRANSITIONS, 
  PHASE_ORDER, 
  canTransition,
  getNextPhase
} from '../utils'

// 選択肢の型定義
export type ChoiceOption = string | { name: string; description?: string };

// メッセージ分割のための型定義
type MessagePart = {
  content: string;
  choices?: ChoiceOption[];
  shouldSplit?: boolean;
};

// メッセージの初期状態
const initialMessageState = (initialMessages: Message[]): Message[] => 
  initialMessages.length > 0 ? initialMessages : [{
    id: uuid(),
    role: 'assistant' as const,
    content: '今日はどんな香りつくる？',
    timestamp: Date.now()
  }];

// 選択された香りの初期状態
const initialSelectedScents = {
  top: [] as string[],
  middle: [] as string[],
  base: [] as string[]
};

export function useChatState(options: Partial<ChatFlowOptions> = {}) {
  const { 
    messages: initialMessages = [],
    currentPhase: initialPhase = 'welcome',
    initialDelay = 1000, 
    messageDelay = 1000,
    typingDelay = 50,
    onPhaseAdvance 
  } = options

  const router = useRouter();

  // メッセージ関連の状態
  const [messages, setMessages] = useState<Message[]>(() => initialMessageState(initialMessages));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [followUpSent, setFollowUpSent] = useState(false);

  // フェーズ関連の状態
  const [currentPhase, setCurrentPhase] = useState<ChatPhase>(initialPhase);
  const [lastPhaseChangeTime, setLastPhaseChangeTime] = useState(Date.now());

  // 香り選択関連の状態
  const [selectedScents, setSelectedScents] = useState(initialSelectedScents);
  const [recipe, setRecipe] = useState<FragranceRecipe | null>(null);

  // セッション関連の状態
  const [sessionId, setSessionId] = useState(uuid());

  // 注文ボタンの有効状態
  const isOrderButtonEnabled = useMemo(() => {
    return (
      (currentPhase === 'finalized' || currentPhase === 'complete') && 
      selectedScents.top.length > 0 && 
      selectedScents.middle.length > 0 && 
      selectedScents.base.length > 0
    );
  }, [currentPhase, selectedScents]);

  // メッセージを分割する関数
  const splitMessage = useCallback((content: string): MessagePart[] => {
    try {
      // JSONレスポンスの処理
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const jsonContent = jsonMatch[1];
          const parsed = JSON.parse(jsonContent);
          return [{
            content: parsed.content,
            choices: parsed.choices,
            shouldSplit: parsed.shouldSplit
          }];
        }
      }

      // 通常のテキストレスポンスの処理
      const parts = content.split('\n\n').map(part => ({
        content: part.trim(),
        shouldSplit: part.length > 100
      }));

      return parts;
    } catch (error) {
      console.error('メッセージ分割エラー:', error);
      return [{
        content: 'メッセージの処理中にエラーが発生しました。',
        shouldSplit: false
      }];
    }
  }, []);

  // フェーズ遷移の処理
  const updatePhase = useCallback((newPhase: ChatPhase) => {
    if (!canTransition(currentPhase, newPhase)) {
      console.warn(`無効なフェーズ遷移: ${currentPhase} -> ${newPhase}`);
      return;
    }

    setCurrentPhase(newPhase);
    setLastPhaseChangeTime(Date.now());

    // レシピが完成したらfinalizedフェーズで保存
    if (newPhase === 'finalized') {
      const isRecipeComplete = 
        selectedScents.top.length > 0 && 
        selectedScents.middle.length > 0 && 
        selectedScents.base.length > 0;

      if (isRecipeComplete) {
        const newRecipe: FragranceRecipe = {
          topNotes: selectedScents.top,
          middleNotes: selectedScents.middle,
          baseNotes: selectedScents.base
        };
        setRecipe(newRecipe);
        localStorage.setItem('selected_recipe', JSON.stringify(newRecipe));
        sessionStorage.setItem('recipe_saved', 'true');
      }
    }
  }, [currentPhase, selectedScents]);

  // 選択された香りを更新する関数
  const updateSelectedScents = useCallback((selectedChoice: string) => {
    console.log(`香りを選択: ${selectedChoice}, 現在のフェーズ: ${currentPhase}`);
    
    const phaseToNoteMap: Record<ChatPhase, keyof typeof selectedScents | null> = {
      welcome: null,
      intro: null,
      themeSelected: null,
      top: 'top',
      middle: 'middle',
      base: 'base',
      finalized: null,
      complete: null
    };

    const noteType = phaseToNoteMap[currentPhase];
    if (!noteType) {
      console.warn(`無効なフェーズでの香り選択: ${currentPhase}`);
      return;
    }

    setSelectedScents(prev => ({
      ...prev,
      [noteType]: [selectedChoice]
    }));

    // レシピが完成したら次のフェーズに進む
    if (selectedScents.top.length > 0 &&
        selectedScents.middle.length > 0 && 
        selectedScents.base.length > 0) {
      setTimeout(() => {
        updatePhase('finalized');
      }, 1000);
    }
  }, [currentPhase, selectedScents, updatePhase]);

  // メッセージを送信する関数
  const sendMessage = useCallback(async (content: string, isUserSelection: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setFollowUpSent(false);

    try {
      // ユーザーメッセージの追加
      const userMessage: Message = {
        id: uuid(),
        role: 'user' as const,
        content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      // APIリクエストの準備
      const requestBody = {
        messages: [...messages, userMessage],
        currentPhase,
        selectedScents,
        isUserSelection
      };

      // APIリクエストの送信
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }

      const data = await response.json();
      const parts = splitMessage(data.content);

      // メッセージの分割処理
      for (const part of parts) {
        const aiMessage: Message = {
          id: uuid(),
          role: 'assistant' as const,
          content: part.content,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);

        // 選択肢がある場合はフェーズを更新
        if (part.choices && part.choices.length > 0) {
          const nextPhase = getNextPhase(currentPhase);
          if (nextPhase) {
            updatePhase(nextPhase);
          }
        }

        // 分割が必要な場合は遅延を入れる
        if (part.shouldSplit) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // フォローアップメッセージの処理
      if (data.followUp && !followUpSent) {
        setFollowUpSent(true);
        await sendMessage(data.followUp, false);
      }

    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setError(error instanceof Error ? error : new Error('予期せぬエラーが発生しました'));

      const errorMessage: Message = {
        id: uuid(),
        role: 'assistant' as const,
        content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, currentPhase, selectedScents, updatePhase, splitMessage, followUpSent]);

  // メッセージを追加する関数
  const addMessage = useCallback(async (content: string) => {
    // ユーザーメッセージを追加してから送信
    const userMessage: Message = {
      id: uuid(),
      role: 'user' as const,
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // APIにメッセージを送信
    return sendMessage(content);
  }, [sendMessage]);

  // エラーハンドリング関数
  const handleError = useCallback((error: Error | null) => {
    setError(error);
  }, []);

  // 注文ページへ移動する関数
  const handleGoToOrder = useCallback(() => {
    if (!isOrderButtonEnabled) return;
    
    // レシピ情報を保存
    if (recipe) {
      localStorage.setItem('selected_recipe', JSON.stringify(recipe));
      sessionStorage.setItem('recipe_saved', 'true');
    }
    
    // 注文ページへリダイレクト
    window.location.href = '/order';
  }, [isOrderButtonEnabled, recipe]);

  // おまかせでレシピを作成する関数
  const handleAutoCreateRecipe = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // 自動レシピ作成メッセージを送信
      await sendMessage('おまかせでレシピを作成してください', true);
      
      // フェーズを完了に設定
      setTimeout(() => {
        updatePhase('complete');
      }, 2000);
    } catch (error) {
      console.error('自動レシピ作成エラー:', error);
      setError(error instanceof Error ? error : new Error('自動レシピ作成中にエラーが発生しました'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sendMessage, updatePhase]);

  // 選択肢クリックハンドラー（統一された型で受け取る）
  const handleChoiceClick = useCallback((choice: ChoiceOption) => {
    if (isLoading) return;

    // 選択肢のテキストを取得
    const choiceText = typeof choice === 'string' ? choice : choice.name;
    console.log(`選択肢クリック: ${choiceText}, 現在のフェーズ: ${currentPhase}`);

    // 1. まずフェーズを更新
    const nextPhase = getNextPhase(currentPhase);
    if (nextPhase) {
      updatePhase(nextPhase);
    }

    // 2. 選択された香りを更新
    updateSelectedScents(choiceText);

    // 3. メッセージを送信
    sendMessage(choiceText, true);
  }, [currentPhase, isLoading, sendMessage, updatePhase, updateSelectedScents]);

  // チャットをリセットする関数
  const resetChat = useCallback(() => {
    const newSessionId = uuid();
    setSessionId(newSessionId);
    setMessages(initialMessageState([]));
    setCurrentPhase('welcome');
    setSelectedScents(initialSelectedScents);
    setIsLoading(false);
    setError(null);
    setFollowUpSent(false);
    setLastPhaseChangeTime(Date.now());
    setRecipe(null);

    // セッション情報を更新
    localStorage.setItem('chat_session_id', newSessionId);
    localStorage.removeItem('chat_history');
    localStorage.removeItem('selected_recipe');
    sessionStorage.removeItem('recipe_saved');

    // 少し待ってから初期メッセージを表示
    setTimeout(() => {
      sendMessage('こんにちは！');
    }, 1000);
  }, [sendMessage]);

  return {
    messages,
    currentPhaseId: currentPhase,
    selectedScents,
    isLoading,
    isSubmitting: isLoading, // 互換性のために追加
    sessionId,
    error,
    followUpSent,
    lastPhaseChangeTime,
    recipe,
    isOrderButtonEnabled,
    updatePhase,
    updateSelectedScents,
    sendMessage,
    addMessage,
    handleChoiceClick,
    handleError,
    handleGoToOrder,
    handleAutoCreateRecipe,
    resetChat
  };
} 