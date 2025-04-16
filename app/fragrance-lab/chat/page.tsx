"use client"

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { ChatProvider } from '@/components/chat/ChatProvider'; // 削除
// import { FragranceChat } from '@/components/chat/FragranceChat'; // 削除
import { FragranceAIChat } from '@/components/chat/fragrance-ai-chat'; // 新しいコンポーネントをインポート
import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Analytics } from '@vercel/analytics/react';
import { StorageService } from '@/utils/storage-service';
// import { ChatProgressSteps } from "./components/ChatProgressSteps"; // 削除

// カスタム型定義
interface RecipeData {
  title: string;
  description: string;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
}

// シングルトンパターンでSupabaseクライアントを管理
let supabaseInstance: any = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
};

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || searchParams.get('query');
  const autoCreateParam = searchParams.get('auto'); // これはもう使わないが一応残す
  const pathname = usePathname();

  // このページレベルでの recipe, error 状態は不要になる可能性が高い
  // const [recipe, setRecipe] = useState<RecipeData | null>(null);
  // const [error, setError] = useState<string | null>(null);
  // const [queryProcessed, setQueryProcessed] = useState(false); // これも不要になる可能性

  // クエリパラメータのクリーンアップ（URL履歴を汚さないため）
  useEffect(() => {
    if (query || autoCreateParam) {
      const newPath = pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [query, autoCreateParam, pathname, router]);

  // レシピの監視ロジックも useChatState に統合されているため、ここでは不要になる可能性
  // useEffect(() => { ... }, [])

  // handlePurchase, handleSaveAndExit も useChatState (または useRecipeManagement) に統合されているはず
  // const handlePurchase = async () => { ... }
  // const handleSaveAndExit = async () => { ... }

  return (
    <div className="h-screen flex flex-col bg-[#fef6f3] overflow-hidden">
      {pathname !== "/fragrance-lab/chat" && <SiteHeader />}

      {/* 上部ナビゲーション */}
      <div className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 戻るボタンを目立たせる (variant="outline" に変更) */}
          <Link href="/" className="flex items-center">
            <Button variant="outline" size="sm" className="gap-1 border-primary/50 text-primary hover:bg-primary/5">
              <ChevronLeft className="h-4 w-4" />
              <span>戻る</span>
            </Button>
          </Link>

          {/* クイックモードボタンを追加 */}
          <Link href={`/fragrance-lab/generator${query ? `?query=${encodeURIComponent(query)}` : ''}`}>
            <Button variant="outline" size="sm" className="gap-1 border-accent-light/50 text-accent-light hover:bg-accent-light/5">
              <span>クイックモード⚡はこちら</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto p-4 md:p-6">
          {/* ChatProvider を削除し、FragranceAIChat を直接レンダリング */}
          {/* ChatProvider が状態を持っていた場合、FragranceAIChat に直接渡すか、
              FragranceAIChat 内部の useChatState で初期化する必要がある */}
          <FragranceAIChat initialQuery={query || undefined} />
        </div>
      </div>

      {/* レシピ完成時の表示 (一旦コメントアウト) */}
      {/* {recipe && (
        <div className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur py-3 border-t border-muted z-20">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="mb-2 text-center">
              <h3 className="font-semibold text-lg">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded-md">
                <div>
                  <div className="font-medium">トップノート</div>
                  <div>{recipe.notes.top.join(', ')}</div>
                </div>
                <div>
                  <div className="font-medium">ミドルノート</div>
                  <div>{recipe.notes.middle.join(', ')}</div>
                </div>
                <div>
                  <div className="font-medium">ベースノート</div>
                  <div>{recipe.notes.base.join(', ')}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handlePurchase}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-lg rounded-md"
              >
                このルームフレグランスを注文する
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndExit}
                className="px-6 py-2 bg-muted border border-input"
              >
                レシピを保存して終了
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {/* エラー表示 (これも useChatState 側で管理されるはず) */}
      {/* {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
          {error}
        </div>
      )} */}

      {/* Analytics */}
      <Analytics />
    </div>
  );
}
