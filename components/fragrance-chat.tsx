'use client';

import { FragranceChat as RefactoredFragranceChat } from '@/components/chat/FragranceChat';
import { ChatProvider } from '@/components/chat/ChatProvider';

interface FragranceChatProps {
  initialQuery?: string;
}

/**
 * 従来のFragranceChatコンポーネント
 * リファクタリング後のコンポーネント構造との互換性を維持するためのラッパー
 * 既存の参照箇所からシームレスに新しいコンポーネントを使用できるようにする
 */
export function FragranceChat({ initialQuery }: FragranceChatProps) {
  return (
    <ChatProvider>
      <RefactoredFragranceChat initialQuery={initialQuery} />
    </ChatProvider>
  );
}
