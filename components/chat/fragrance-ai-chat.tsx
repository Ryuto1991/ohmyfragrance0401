"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Loader2, RefreshCw, Info, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useChatState } from "@/app/fragrance-lab/chat/hooks/useChatState";
// Remove unused types: ChatPhase, ChoiceOption, NoteSelectionPhase
import { Message, FragranceRecipe } from "@/app/fragrance-lab/chat/types";
// Remove unused utils: getPhaseDisplayName, getNoteSelectionDisplayName
import Image from "next/image";
// import { TipsSidebar } from "./tips-sidebar"; // Comment out for now
import { v4 as uuid } from 'uuid';
// Remove unused component: ChoiceButton
import { Separator } from "@/components/ui/separator"; // Keep Separator
import { MessageItem } from "./components/MessageItem"; // Import MessageItem
import { STORAGE_KEYS } from "@/app/fragrance-lab/chat/types"; // Import storage keys
import essentialOilsData from "@/components/chat/essential-oils.json"; // Import scent data

/**
 * フレグランスAIチャットコンポーネント
 * ユーザーとAIの対話によるフレグランス作成インターフェース
 */
export function FragranceAIChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Update destructuring from useChatState
  const {
    messages,
    isLoading,
    isSubmitting,
    error,
    addMessage,
    sendMessage, // Keep sendMessage for user input
    handleError,
    isOrderButtonEnabled,
    resetChat,
    generateRecipe, // Renamed function from useChatState
    // Removed: generatedRecipe, handleGenerateRecipeAndOrder
    // Removed: currentPhaseId, selectedScents, updatePhase, updateSelectedScents, handleGoToOrder, handleConfirmSelection, currentNoteSelection
  } = useChatState();

  const [input, setInput] = useState("");
  // State to control recipe display modal/section (optional)
  const [showRecipe, setShowRecipe] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  // Remove unused state: lastPhaseChangeTime

  // Scroll to bottom function (no change needed)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  // Scroll on new messages/loading (no change needed)
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Check router initialization (no change needed)
  useEffect(() => {
    if (!router) {
      console.error('Router is not initialized');
      return;
    }
  }, [router]);

  // Focus on input on initial load (no change needed)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cache for processed query IDs (no change needed)
  const [processedQueryIds] = useState(() => new Set<string>());

  // Initial query processing (no change needed, relies on addMessage)
  useEffect(() => {
    const handleInitialInteraction = async () => {
      if (initialMessageSent || isLoading || messages.length > 1) return;
      try {
        const urlQuery = searchParams.get('query') || searchParams.get('q');
        if (urlQuery) {
          const newPath = window.location.pathname;
          router.replace(newPath, { scroll: false });
        }
        const queryToProcess = initialQuery || urlQuery;
        if (queryToProcess) {
          const queryId = encodeURIComponent(queryToProcess).substring(0, 100);
          if (!processedQueryIds.has(queryId)) {
            console.log("初期クエリを処理します:", queryToProcess);
            processedQueryIds.add(queryId);
            await addMessage(queryToProcess); // Use the simplified addMessage
          } else {
            console.log("このクエリは既に処理済みです:", queryToProcess);
          }
        }
        setInitialMessageSent(true);
        setTimeout(scrollToBottom, 500);
      } catch (error) {
        console.error('初期クエリ処理エラー:', error);
        setInitialMessageSent(true);
      }
    };
    handleInitialInteraction();
  }, [
    searchParams,
    router,
    initialQuery,
    addMessage, // Depends on the simplified addMessage
    initialMessageSent,
    isLoading,
    messages.length,
    scrollToBottom,
    processedQueryIds,
  ]);

  // Message submission handler (uses simplified sendMessage)
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting || !input.trim()) return;
      const content = input.trim();
      setInput('');
      try {
        await sendMessage(content); // Use the simplified sendMessage
      } catch (error) {
        console.error('メッセージ送信中にエラーが発生しました:', error);
        handleError(
          error instanceof Error ? error : new Error('メッセージの送信に失敗しました')
        );
      }
    },
    [input, isSubmitting, sendMessage, handleError] // Depends on simplified sendMessage
  );

  // Remove parseMessageContent and related logic for choices

  // Remove handleChoiceClick and handleConfirmSelection

  // Remove the internal memoized MessageItem component definition
  // const MessageItem = useMemo(() => { ... }, []);

  // Loading message component (no change needed)
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

  // Error display (no change needed)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md text-center">
          <p className="font-semibold mb-2">エラーが発生しました</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <Button
          onClick={() => handleError(null)} // Clear error on retry
          variant="default"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    );
  }

  // Define wrapper function for reset button
  const handleResetClick = () => resetChat();

  // Extract all scent names from the JSON data
  const allScentNames = useMemo(() => {
    const names = new Set<string>();
    essentialOilsData.perfumeNotes.topNotes.forEach(note => names.add(note.name));
    essentialOilsData.perfumeNotes.middleNotes.forEach(note => names.add(note.name));
    essentialOilsData.perfumeNotes.baseNotes.forEach(note => names.add(note.name));
    return Array.from(names);
  }, []);

  // Handler for scent name button clicks in MessageItem
  const handleScentClick = useCallback(async (scentName: string) => {
    // Send the clicked scent name as a new user message
    try {
      await sendMessage(`「${scentName}」について教えて`); // Or just send the name
    } catch (error) {
      console.error('香料名クリックでのメッセージ送信エラー:', error);
      handleError(
        error instanceof Error ? error : new Error('香料名でのメッセージ送信に失敗しました')
      );
    }
  }, [sendMessage, handleError]);

  // Handler for the "Re-generate" button in MessageItem
  const handleRegenerateRecipe = useCallback(() => {
    generateRecipe(); // Call the function from useChatState
  }, [generateRecipe]);

  // Handler for the "Order" button in MessageItem
  const handleOrderRecipe = useCallback((recipe: FragranceRecipe) => {
    console.log('注文するレシピ:', recipe);
    try {
      // Map FragranceRecipe to the structure expected by localStorage/order page
      const recipeToStore = {
        name: recipe.name || "AI提案レシピ",
        description: recipe.description || "会話に基づいてAIが提案したカスタムブレンド",
        top_notes: recipe.topNotes.map(note => note.name), // Extract names
        middle_notes: recipe.middleNotes.map(note => note.name), // Extract names
        base_notes: recipe.baseNotes.map(note => note.name), // Extract names
      };
      localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify(recipeToStore));
      console.log('選択レシピをローカルストレージに保存しました:', recipeToStore);

      // Redirect to the order page
      router.push('/custom-order?mode=lab');

    } catch (error) {
      console.error('レシピの保存または注文ページへのリダイレクトに失敗:', error);
      handleError(
        error instanceof Error ? error : new Error('注文処理中にエラーが発生しました')
      );
    }
  }, [router, handleError]); // Add dependencies

  // Main component render
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">

      {/* Remove selection status display */}
      {/* Remove Separator if not needed */}
      {/* <Separator /> */}

      {/* Remove debug info related to phases/notes */}

      {/* Remove phase display */}
      {/* <div className="flex justify-center mb-2 text-base text-muted-foreground">...</div> */}

      {/* Chat message display area */}
      <div ref={scrollAreaRef} className="flex-1 p-3 md:p-5 overflow-y-auto mb-16">
        <div className="space-y-4 max-w-4xl lg:max-w-6xl mx-auto">
          {/* Map messages and pass handlers to MessageItem */}
          {messages.map((message) => (
            <MessageItem
              key={message.id || uuid()}
              message={message}
              isLoading={isLoading} // Pass loading state for button disabling
              onRegenerateClick={handleRegenerateRecipe} // Pass regenerate handler
              onOrderClick={handleOrderRecipe} // Pass order handler
              scentNames={allScentNames} // Pass all scent names
              onScentClick={handleScentClick} // Pass scent click handler
            />
          ))}
          {/* Render loading message based on overall isLoading, not message specific */}
          {/* {isLoading && <LoadingMessage />} */}
          {/* Render loading message only if the last message has isLoading=true */}
          {messages[messages.length - 1]?.isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>
      </div>

      {/* Input form */}
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
          {/* Generate Recipe Button (at the bottom) */}
          <Button
            type="button"
            variant="default"
            className={`w-full h-9 md:h-10 text-sm md:text-base ${
              isOrderButtonEnabled
                ? 'bg-primary hover:bg-primary/90 text-white shadow-sm animate-pulse'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
            }`}
            onClick={generateRecipe} // Directly call generateRecipe from useChatState
            disabled={!isOrderButtonEnabled || isLoading} // Disable while loading too
            title="会話からレシピを生成"
          >
            レシピを生成する
            <span className="ml-2 flex items-center">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Button>

          {/* Remove Generator Link Button */}
          {/* <Button type="button" variant="outline" ... /> */}

          {/* Reset Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 md:h-10 text-sm md:text-base border-red-300 hover:bg-red-50"
            onClick={handleResetClick}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            チャットをリセット
          </Button>
        </div>
      </form>

      {/* Optional: Modal or section to display generatedRecipe when available */}
      {/* {generatedRecipe && showRecipe && ( ... display recipe ... )} */}

      {/* Comment out TipsSidebar */}
      {/* <TipsSidebar ... /> */}
    </div>
  );
}
