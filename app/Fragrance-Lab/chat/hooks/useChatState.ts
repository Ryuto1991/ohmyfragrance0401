"use client"

import { useState, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/navigation'
import {
  Message,
  ChatPhaseId,
  ChatFlowOptions,
  ChatPhase,
  FragranceRecipe,
  STORAGE_KEYS,
  ChoiceOption
} from '../types'
import {
  canTransition,
  canTransitionWithAutoMode,
  getNextPhase,
  getNextPhaseWithCondition,
  getPhaseNoteType
} from '../utils'
import { splitMessageIntoParts, addErrorInfo } from '@/lib/chat-utils'

// 選択された香りの初期状態
const initialSelectedScents = {
  top: [] as string[],
  middle: [] as string[],
  base: [] as string[]
};

// メッセージの初期状態
const initialMessageState = (initialMessages: Message[]): Message[] =>
  initialMessages.length > 0 ? initialMessages : [{
    id: uuid(),
    role: 'assistant' as const,
    content: '今日はどんな香りつくる？',
    timestamp: Date.now()
  }];

/**
 * チャット状態管理の主要なフック
 */
export function useChatState(options: Partial<ChatFlowOptions> = {}) {
  const {
    messages: initialMessages = [],
    currentPhase: initialPhase = 'welcome',
    onPhaseAdvance
  } = options;

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
  const [sessionId] = useState(uuid());

  // 注文ボタンの有効状態
  const isOrderButtonEnabled = useMemo(() => {
    return (
      (currentPhase === 'finalized' || currentPhase === 'complete') &&
      selectedScents.top.length > 0 &&
      selectedScents.middle.length > 0 &&
      selectedScents.base.length > 0
    );
  }, [currentPhase, selectedScents]);

  // 選択された香りからレシピを更新
  const updateRecipeFromSelectedScents = useCallback((newPhase: ChatPhase) => {
    // レシピが完成したらfinalizedフェーズで保存
    if (newPhase === 'finalized' || newPhase === 'complete') {
      const isRecipeComplete =
        selectedScents.top.length > 0 &&
        selectedScents.middle.length > 0 &&
        selectedScents.base.length > 0;

      if (isRecipeComplete) {
        // レシピ情報をまとめて保存
        const recipeName = findRecipeName() || "オリジナルルームフレグランス";
        const recipeDescription = findRecipeDescription() || "あなただけのカスタムルームフレグランス";

        const newRecipe: FragranceRecipe = {
          name: recipeName,
          description: recipeDescription,
          topNotes: selectedScents.top,
          middleNotes: selectedScents.middle,
          baseNotes: selectedScents.base
        };

        setRecipe(newRecipe);

        // ローカルストレージに保存
        localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify({
          name: recipeName,
          description: recipeDescription,
          top_notes: selectedScents.top,
          middle_notes: selectedScents.middle,
          base_notes: selectedScents.base
        }));
      }
    }
  }, [selectedScents]);

// updatePhase 関数の修正版 - おまかせモードをサポート
const updatePhase = useCallback((newPhase: ChatPhase, isAutoMode: boolean = false) => {
  // おまかせモードの場合、遷移バリデーションをスキップ
  if (isAutoMode) {
    console.log(`自動モードによるフェーズ更新: ${currentPhase} -> ${newPhase}`);
    setCurrentPhase(newPhase);
    setLastPhaseChangeTime(Date.now());
    
    // カスタムイベントハンドラがあれば呼び出す
    if (onPhaseAdvance) {
      onPhaseAdvance();
    }
    
    // レシピ情報の更新
    updateRecipeFromSelectedScents(newPhase);
    return;
  }
  
  // 通常の遷移バリデーション
  if (!canTransition(currentPhase, newPhase)) {
    console.warn(`無効なフェーズ遷移: ${currentPhase} -> ${newPhase}`);
    return;
  }

  console.log(`フェーズを更新: ${currentPhase} -> ${newPhase}`);
  setCurrentPhase(newPhase);
  setLastPhaseChangeTime(Date.now());

  // カスタムイベントハンドラがあれば呼び出す
  if (onPhaseAdvance) {
    onPhaseAdvance();
  }

  // レシピ情報の更新
  updateRecipeFromSelectedScents(newPhase);
}, [currentPhase, onPhaseAdvance, updateRecipeFromSelectedScents]);

  // メッセージからレシピ名を探す
  const findRecipeName = useCallback(() => {
    // 最新のアシスタントメッセージからレシピ情報を探す
    const recentMessages = [...messages].reverse();
    for (const msg of recentMessages) {
      if (msg.role === 'assistant' && msg.recipe) {
        return msg.recipe.name;
      }
    }
    return null;
  }, [messages]);

  // メッセージからレシピ説明を探す
  const findRecipeDescription = useCallback(() => {
    // 最新のアシスタントメッセージからレシピ情報を探す
    const recentMessages = [...messages].reverse();
    for (const msg of recentMessages) {
      if (msg.role === 'assistant' && msg.recipe) {
        return msg.recipe.description;
      }
    }
    return null;
  }, [messages]);

  // 選択された香りを更新する関数
  const updateSelectedScents = useCallback((selectedChoice: string, isAutoMode: boolean = false) => {
    console.log(`香りを選択: ${selectedChoice}, 現在のフェーズ: ${currentPhase}, 自動モード: ${isAutoMode}`);

    const noteType = getPhaseNoteType(currentPhase);
    if (!noteType && !isAutoMode) {
      console.warn(`無効なフェーズでの香り選択: ${currentPhase}`);
      return;
    }
    
    // 自動モードの場合は、フェーズに合わせてnoteTypeを強制設定
    const effectiveNoteType = noteType || (isAutoMode ? 
      (currentPhase === 'top' ? 'topNotes' : 
       currentPhase === 'middle' ? 'middleNotes' : 
       currentPhase === 'base' ? 'baseNotes' : null) : null);
       
    if (!effectiveNoteType) {
      console.warn(`有効なノートタイプを決定できません: ${currentPhase}`);
      return;
    }

    // 選択された香りを更新
    setSelectedScents(prev => {
      const updatedScents = {
        ...prev,
        [effectiveNoteType === 'topNotes' ? 'top' : 
         effectiveNoteType === 'middleNotes' ? 'middle' : 
         effectiveNoteType === 'baseNotes' ? 'base' : '']: [selectedChoice]
      };

      // すべての香りが選択された場合の自動遷移処理
      if (updatedScents.top.length > 0 &&
          updatedScents.middle.length > 0 &&
          updatedScents.base.length > 0 &&
          currentPhase === 'base') {
        // 次のフェーズへの自動遷移を遅延実行
        setTimeout(() => {
          updatePhase('finalized');
        }, 1000);
      }

      return updatedScents;
    });
  }, [currentPhase, updatePhase]);

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
        role: 'user',
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

      // メッセージの分割処理
      const parts = splitMessageIntoParts(data.content, { currentPhase });

      // 各パートを順番に処理
      for (const part of parts) {
        const aiMessage: Message = {
          id: uuid(),
          role: 'assistant',
          content: part.content,
          timestamp: Date.now(),
          choices: part.choices,
          recipe: part.recipe
        };

        setMessages(prev => [...prev, aiMessage]);

        // レシピが返された場合は状態を更新
        if (part.recipe) {
          setRecipe(part.recipe);
        }

        // 分割が必要な場合は遅延を入れる
        if (part.shouldSplit) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // ユーザー入力に基づくフェーズ遷移判定
      if (!isUserSelection && content) {
        const nextPhaseId = getNextPhaseWithCondition(currentPhase, selectedScents, content);
        if (nextPhaseId && nextPhaseId !== currentPhase) {
          updatePhase(nextPhaseId);
        }
      }

      // フォローアップメッセージの処理
      if (data.followUp && !followUpSent) {
        setFollowUpSent(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await sendMessage(data.followUp, false);
      }

      return data;

    } catch (error) {
      console.error('メッセージ送信エラー:', error);

      // エラーメッセージの強化
      const errorMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: addErrorInfo('申し訳ありません。エラーが発生しました。もう一度お試しください。', error instanceof Error ? error : new Error('不明なエラー')),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error : new Error('予期せぬエラーが発生しました'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, currentPhase, selectedScents, followUpSent]);

  // メッセージを追加する関数
  const addMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // ユーザーメッセージを追加してから送信
    const userMessage: Message = {
      id: uuid(),
      role: 'user',
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
    // completeフェーズなら常に有効、それ以外は従来の条件で判断
    if (!isOrderButtonEnabled && currentPhase !== 'complete') {
      console.log('注文ボタンが無効です:', { isOrderButtonEnabled, currentPhase });
      return;
    }

    console.log('注文ページに移動します');

    // レシピ情報を保存
    try {
      // もしレシピが未定義の場合、デフォルトのレシピを作成
      const recipeToSave = recipe || {
        name: "オリジナルルームフレグランス",
        description: "あなただけのカスタムブレンド",
        topNotes: selectedScents.top.length > 0 ? selectedScents.top : ["レモン"],
        middleNotes: selectedScents.middle.length > 0 ? selectedScents.middle : ["ラベンダー"],
        baseNotes: selectedScents.base.length > 0 ? selectedScents.base : ["サンダルウッド"]
      };
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify({
        name: recipeToSave.name,
        description: recipeToSave.description,
        top_notes: recipeToSave.topNotes,
        middle_notes: recipeToSave.middleNotes,
        base_notes: recipeToSave.baseNotes
      }));
      
      console.log('レシピを保存しました:', recipeToSave);
    } catch (error) {
      console.error('レシピの保存に失敗しました:', error);
    }

    // 注文ページへリダイレクト - カスタムオーダーページに遷移
    try {
      window.location.href = '/custom-order?mode=lab';
    } catch (error) {
      console.error('リダイレクトに失敗しました:', error);
      // フォールバックとしてrouterを使用
      router.push('/custom-order?mode=lab');
    }
  }, [isOrderButtonEnabled, recipe, router, currentPhase, selectedScents]);

// handleAutoCreateRecipe 関数の修正版
const handleAutoCreateRecipe = useCallback(async () => {
  if (isLoading) return;

  try {
    setIsLoading(true);
    console.log('おまかせレシピ作成を開始します');

    // 現在のフェーズを保存
    const originalPhase = currentPhase;
    console.log('元のフェーズ:', originalPhase);

    // おまかせモードフラグの設定
    const isAutoMode = true;

    // デフォルトの香り選択
    const defaultScents = {
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    };

    // ユーザーに通知メッセージを表示
    const autoMessage: Message = {
      id: uuid(),
      role: 'user',
      content: 'おまかせでレシピを作成してください',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, autoMessage]);

    // 段階的な遷移と香り選択の適用
    // まずトップノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('トップノートフェーズに移動');
    setCurrentPhase('top');
    
    // トップノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('トップノート選択:', defaultScents.top[0]);
    setSelectedScents(prev => ({ ...prev, top: defaultScents.top }));
    
    // 自動選択メッセージの表示 (トップノート)
    const topSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `トップノートとして「${defaultScents.top[0]}」を選択しました。爽やかな柑橘系の香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, topSelectMessage]);

    // ミドルノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('ミドルノートフェーズに移動');
    setCurrentPhase('middle');
    
    // ミドルノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('ミドルノート選択:', defaultScents.middle[0]);
    setSelectedScents(prev => ({ ...prev, middle: defaultScents.middle }));
    
    // 自動選択メッセージの表示 (ミドルノート)
    const middleSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `ミドルノートとして「${defaultScents.middle[0]}」を選択しました。穏やかでリラックス効果のあるハーブの香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, middleSelectMessage]);

    // ベースノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('ベースノートフェーズに移動');
    setCurrentPhase('base');
    
    // ベースノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('ベースノート選択:', defaultScents.base[0]);
    setSelectedScents(prev => ({ ...prev, base: defaultScents.base }));
    
    // 自動選択メッセージの表示 (ベースノート)
    const baseSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `ベースノートとして「${defaultScents.base[0]}」を選択しました。深みのある温かみのあるウッディな香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, baseSelectMessage]);

    // レシピ情報を作成
    const defaultRecipe: FragranceRecipe = {
      name: "リラックスブレンド",
      description: "穏やかな気分になれるリラックス効果のあるブレンド",
      topNotes: defaultScents.top,
      middleNotes: defaultScents.middle,
      baseNotes: defaultScents.base
    };

    // レシピを設定
    setRecipe(defaultRecipe);

    // レシピをローカルストレージに保存
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify({
          name: defaultRecipe.name,
          description: defaultRecipe.description,
          top_notes: defaultRecipe.topNotes,
          middle_notes: defaultRecipe.middleNotes,
          base_notes: defaultRecipe.baseNotes
        }));
        console.log('レシピをローカルストレージに保存しました:', defaultRecipe);
      }
    } catch (storageError) {
      console.error('ローカルストレージへの保存に失敗しました:', storageError);
    }

    // 最終確認フェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('最終確認フェーズに移動');
    setCurrentPhase('finalized');
    
    // レシピ完成メッセージの表示
    const finalizedMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `
レシピが完成しました！

トップノート: ${defaultScents.top[0]}
ミドルノート: ${defaultScents.middle[0]} 
ベースノート: ${defaultScents.base[0]}

この組み合わせで、爽やかさから始まり、落ち着きのある優しい香りへと変化していきます。リラックスしたい時間にぴったりのブレンドです✨

このレシピでよろしければ、下の注文ボタンから進めることができます。`,
      timestamp: Date.now(),
      recipe: defaultRecipe
    };
    setMessages(prev => [...prev, finalizedMessage]);

    // 完了フェーズに遅延遷移
    setTimeout(() => {
      console.log('完了フェーズに移動');
      setCurrentPhase('complete');
      
      // 完了メッセージの表示
      const completeMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: `おまかせレシピが完成しました！こちらのレシピで注文を進められます。または、もう一度最初からレシピを作り直すこともできます。`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, completeMessage]);
    }, 2500);

    return defaultRecipe;
  } catch (error) {
    console.error('自動レシピ作成エラー:', error);
    setError(error instanceof Error ? error : new Error('自動レシピ作成中にエラーが発生しました'));
    
    // エラーメッセージの表示
    const errorMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: '申し訳ありません、レシピの自動作成中にエラーが発生しました。もう一度お試しください。',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}, [isLoading, currentPhase, setMessages, setSelectedScents, setCurrentPhase, setRecipe, setError]);

  // 選択肢クリックハンドラー
  const handleChoiceClick = useCallback(async (choice: { name: string, description?: string } | string) => {
    if (isLoading) return;

    // 選択肢のテキストを取得
    const choiceText = typeof choice === 'string' ? choice : choice.name;
    console.log(`選択肢クリック: ${choiceText}`);

    try {
      // 香りの選択を更新
      if (['top', 'middle', 'base'].includes(currentPhase)) {
        updateSelectedScents(choiceText);
      }

      // メッセージを送信
      await sendMessage(choiceText, true);

      // 次のフェーズへの遷移判定
      const nextPhaseId = getNextPhase(currentPhase);
      if (nextPhaseId && ['themeSelected', 'top', 'middle', 'base'].includes(currentPhase)) {
        updatePhase(nextPhaseId);
      }
    } catch (error) {
      console.error('選択肢クリック時のエラー:', error);
      handleError(error instanceof Error ? error : new Error('選択肢の処理中にエラーが発生しました'));
    }
  }, [currentPhase, isLoading, sendMessage, updatePhase, updateSelectedScents, handleError]);

  // チャットをリセットする関数
  const resetChat = useCallback(() => {
    // 状態をリセット
    setMessages(initialMessageState([]));
    setCurrentPhase('welcome');
    setSelectedScents(initialSelectedScents);
    setIsLoading(false);
    setError(null);
    setFollowUpSent(false);
    setLastPhaseChangeTime(Date.now());
    setRecipe(null);

    // ストレージをクリア
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_RECIPE);
    sessionStorage.removeItem('recipe_saved');

    // 少し待ってから初期メッセージを表示
    setTimeout(() => {
      sendMessage('こんにちは！');
    }, 1000);
  }, [sendMessage]);

  return {
    // 状態
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

    // アクション
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
