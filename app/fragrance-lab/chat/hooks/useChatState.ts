"use client"

import { useState, useCallback, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/navigation';
import {
  Message,
  ChatFlowOptions, // Keep ChatFlowOptions if needed for initialMessages
  FragranceRecipe, // Keep for storing generated recipe
  STORAGE_KEYS,
  // Remove phase/note types: ChatPhaseId, ChatPhase, NoteSelectionPhase, ChoiceOption
} from '../types';
// Remove utils import: getNextPhase etc. are no longer needed
import { addErrorInfo } from '@/lib/chat-utils'; // Keep error utility

// Remove initialSelectedScents

// メッセージの初期状態 (分割)
const initialMessageState = (initialMessages: Message[]): Message[] =>
  initialMessages.length > 0
    ? initialMessages
    : [
        {
          id: uuid(),
          role: 'assistant' as const,
          content: '今日はどんな香りつくる？💖✨',
          timestamp: Date.now(),
        },
        {
          id: uuid(),
          role: 'assistant' as const,
          content: '私と会話して作りたい内容決まったと思ったら、レシピを生成するボタン押してね',
          timestamp: Date.now() + 1, // Ensure unique timestamp/order
        },
      ];

/**
 * チャット状態管理の主要なフック (2AI方式に適合)
 */
export function useChatState(options: Partial<ChatFlowOptions> = {}) {
  const { messages: initialMessages = [] } = options; // Only need initialMessages

  const router = useRouter();

  // メッセージ関連の状態
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessageState(initialMessages)
  );
  const [isLoading, setIsLoading] = useState(false); // Loading state for both APIs
  const [error, setError] = useState<Error | null>(null);
  // Remove generatedRecipe state - recipe will be stored in the message itself
  // const [generatedRecipe, setGeneratedRecipe] = useState<FragranceRecipe | null>(null);

  // セッション関連の状態 (Keep session ID if needed for logging/tracking)
  const [sessionId] = useState(uuid());

  // Remove state and functions related to phases, note selection, scent selection
  // - currentPhase, currentNoteSelection, lastPhaseChangeTime
  // - selectedScents, recipe (replaced by generatedRecipe)
  // - findRecipeName, findRecipeDescription, updateRecipeFromSelectedScents
  // - updatePhase, updateSelectedScents, handleChoiceClick, handleConfirmSelection

  // 注文ボタンの有効状態 (会話が少し進んだら有効にする)
  const isOrderButtonEnabled = useMemo(() => {
    // Enable after the initial AI message and at least one user message + AI response
    return messages.length >= 3 && !isLoading;
  }, [messages, isLoading]);

  // メッセージを会話API(/api/chat)に送信する関数
  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);
      // No need to clear generatedRecipe state anymore

      try {
        // Add user message
        const userMessage: Message = {
          id: uuid(),
          role: 'user',
          content: content,
          timestamp: Date.now(),
        };
        // Use functional update to ensure we have the latest messages
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Prepare request body (only messages)
        const requestBody = {
          messages: updatedMessages, // Send the complete, updated history
        };

        // Send to conversation API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          // Try to parse error response from API
          let errorDetails = `APIエラー: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorDetails;
          } catch (e) { /* Ignore parsing error */ }
          throw new Error(errorDetails);
        }

        const data = await response.json();

        // Add AI response message
        const aiMessage: Message = {
          id: uuid(),
          role: 'assistant',
          content: data.content,
          timestamp: Date.now(),
          // Choices/recipe are not expected from this API anymore
        };
        setMessages((prev) => [...prev, aiMessage]);

        return data; // Return the AI response data if needed
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
        const errorMessageText = addErrorInfo(
          '申し訳ありません。エラーが発生しました。もう一度お試しください。',
          error instanceof Error ? error : new Error('不明なエラー')
        );
        const errorMessage: Message = {
          id: uuid(),
          role: 'assistant',
          content: errorMessageText,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setError(
          error instanceof Error ? error : new Error('予期せぬエラーが発生しました')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages] // Dependency on messages is important
  );

  // メッセージを追加する関数 (sendMessageを呼び出すだけ)
  const addMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      return sendMessage(content);
    },
    [sendMessage]
  );

  // エラーハンドリング関数
  const handleError = useCallback((error: Error | null) => {
    setError(error);
  }, []);

  // レシピ生成APIを呼び出す関数 (注文ページへの移動は削除)
  const generateRecipe = useCallback(async () => {
    if (isLoading) return; // Prevent multiple calls

    setIsLoading(true);
    setError(null);
    // No need to clear generatedRecipe state anymore

    console.log('レシピ生成API呼び出し開始...');

    // Add a temporary loading message for recipe generation
    const loadingRecipeMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: 'レシピを生成中です...',
      timestamp: Date.now(),
      isLoading: true, // Indicate loading specifically for this message
    };
    setMessages((prev) => [...prev, loadingRecipeMessage]);


    try {
      // Call the generate-recipe API
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }), // Send current conversation history
      });

      if (!response.ok) {
         let errorDetails = `レシピ生成APIエラー: ${response.status}`;
         try {
           const errorData = await response.json();
           errorDetails = errorData.error || errorDetails;
         } catch (e) { /* Ignore parsing error */ }
         throw new Error(errorDetails);
      }

      const data = await response.json();

      // Validate the received recipe structure (using the structure from API route)
      if (
        !data.recipe ||
        typeof data.recipe.title !== 'string' ||
        typeof data.recipe.description !== 'string' ||
        !Array.isArray(data.recipe.top) ||
        !Array.isArray(data.recipe.middle) ||
        !Array.isArray(data.recipe.base)
      ) {
        console.error('受信したレシピデータが無効:', data);
        throw new Error('AIから無効な形式のレシピが返されました。');
      }

      console.log('生成されたレシピ:', data.recipe);

      // Create the assistant message containing the recipe
      // Map the API response structure (top, middle, base)
      // to the FragranceRecipe type (topNotes, middleNotes, baseNotes) used in messages
      const recipeForMessage: FragranceRecipe = {
          name: data.recipe.title,
          description: data.recipe.description,
          // Ensure each note object has name and amount
          topNotes: data.recipe.top.map((note: { name: string; amount: number }) => ({ name: note.name, amount: note.amount })),
          middleNotes: data.recipe.middle.map((note: { name: string; amount: number }) => ({ name: note.name, amount: note.amount })),
          baseNotes: data.recipe.base.map((note: { name: string; amount: number }) => ({ name: note.name, amount: note.amount })),
      };

      const assistantRecipeMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: `「${recipeForMessage.name}」のレシピが完成しました！`, // Use title in content
        timestamp: Date.now(),
        recipe: recipeForMessage, // Attach the full recipe object
      };

      // Replace the loading message with the actual recipe message
      setMessages((prev) => [
          ...prev.filter(msg => msg.id !== loadingRecipeMessage.id), // Remove loading message
          assistantRecipeMessage // Add recipe message
      ]);


    } catch (error) {
       console.error('レシピ生成エラー:', error);
       const errorMessageText = addErrorInfo(
         'レシピの生成に失敗しました。',
         error instanceof Error ? error : new Error('不明なエラー')
       );
       const errorMessage: Message = {
         id: uuid(),
         role: 'assistant',
         content: errorMessageText,
         timestamp: Date.now(),
         error: errorMessageText, // Use the existing error string property
       };
       // Replace the loading message with the error message
       setMessages((prev) => [
           ...prev.filter(msg => msg.id !== loadingRecipeMessage.id), // Remove loading message
           errorMessage // Add error message
       ]);
       setError(
         error instanceof Error ? error : new Error('レシピ生成エラー')
       );
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  }, [isLoading, messages]); // Removed router dependency

  // チャットをリセットする関数 (シンプル化)
  const resetChat = useCallback(() => {
    setMessages(initialMessageState([]));
    setIsLoading(false);
    setError(null);
    // No need to clear generatedRecipe state anymore

    // Clear relevant storage if needed
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY); // Keep if history persistence is desired
    localStorage.removeItem(STORAGE_KEYS.SELECTED_RECIPE);
    // sessionStorage.removeItem('recipe_saved'); // Remove if used

    console.log('チャットがリセットされました。');
  }, []); // No dependencies needed

  return {
    // State
    messages,
    isLoading,
    isSubmitting: isLoading, // Alias for consistency if needed
    sessionId,
    error,
    // Removed generatedRecipe from return
    isOrderButtonEnabled,

    // Actions
    sendMessage,
    addMessage,
    handleError,
    generateRecipe, // Renamed function
    resetChat,
    // Removed: updatePhase, updateSelectedScents, handleChoiceClick, handleConfirmSelection, handleGoToOrder
    setMessages, // Expose setMessages for direct manipulation (e.g., follow-up)
  };
}
