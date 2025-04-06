"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FragranceAIChat } from '@/components/chat/fragrance-ai-chat'
import { useChatState } from './hooks/useChatState'
import SiteHeader from "@/components/site-header"
import { ChatProgressSteps } from "./components/ChatProgressSteps"
import { ChatPhaseId } from "./types"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

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
let supabaseInstance: any = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const pathname = usePathname()
  
  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    messages, 
    selectedScents,
    currentPhaseId
  } = useChatState()

  // selectedScentsからレシピ情報を更新
  useEffect(() => {
    // 全てのフェーズが完了し、選択された香料がある場合にレシピを生成
    if (currentPhaseId === 'complete' || currentPhaseId === 'finalized') {
      if (
        selectedScents.top.length > 0 && 
        selectedScents.middle.length > 0 && 
        selectedScents.base.length > 0
      ) {
        // レシピ名を生成（最新のメッセージから取得できるかチェック）
        let recipeName = "オリジナル香水";
        let recipeDescription = "あなただけのカスタム香水";

        // 最新のアシスタントメッセージからレシピ情報を探す
        const recentMessages = [...messages].reverse();
        for (const msg of recentMessages) {
          if (msg.role === 'assistant' && msg.recipe) {
            recipeName = msg.recipe.name || recipeName;
            recipeDescription = msg.recipe.description || recipeDescription;
            break;
          }
        }

        setRecipe({
          title: recipeName,
          description: recipeDescription,
          notes: {
            top: selectedScents.top,
            middle: selectedScents.middle,
            base: selectedScents.base
          }
        });
      }
    }
  }, [currentPhaseId, selectedScents, messages]);

  const handlePurchase = async () => {
    if (!recipe) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          name: recipe.title,
          description: recipe.description,
          top_notes: recipe.notes.top,
          middle_notes: recipe.notes.middle,
          base_notes: recipe.notes.base,
          mode: 'chat'
        })
        .select()

      if (error) throw error

      localStorage.setItem('selected_recipe', JSON.stringify({
        name: recipe.title,
        description: recipe.description,
        top_notes: recipe.notes.top,
        middle_notes: recipe.notes.middle,
        base_notes: recipe.notes.base
      }))

      router.push('/custom-order?mode=lab')
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('レシピの保存に失敗しました。')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#fef6f3] overflow-hidden">
      {pathname !== "/fragrance-lab/chat" && <SiteHeader />}
      
      {/* 上部ナビゲーション */}
      <div className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>戻る</span>
            </Button>
          </Link>
          <div className="flex-1 flex justify-center">
            <ChatProgressSteps currentPhaseId={currentPhaseId} />
          </div>
          <div className="w-[70px]"></div> {/* 右側のスペーサー */}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto p-4 md:p-6">
          <FragranceAIChat initialQuery={query || undefined} />
        </div>
      </div>

      {recipe && (currentPhaseId === 'complete' || currentPhaseId === 'finalized') && (
        <div className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur py-3 border-t border-muted z-10">
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
              <button 
                onClick={handlePurchase}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                この香水を注文する
              </button>
              <button 
                onClick={async () => {
                  try {
                    const supabase = getSupabaseClient()
                    const { data, error } = await supabase
                      .from('recipes')
                      .insert({
                        name: recipe.title,
                        description: recipe.description,
                        top_notes: recipe.notes.top,
                        middle_notes: recipe.notes.middle,
                        base_notes: recipe.notes.base,
                        mode: 'chat'
                      })
                      .select()

                    if (error) throw error

                    localStorage.setItem('last_saved_recipe', JSON.stringify({
                      name: recipe.title,
                      description: recipe.description,
                      top_notes: recipe.notes.top,
                      middle_notes: recipe.notes.middle,
                      base_notes: recipe.notes.base
                    }))

                    router.push('/')
                  } catch (error) {
                    console.error('Error saving recipe:', error)
                    setError('レシピの保存に失敗しました。')
                  }
                }}
                className="px-6 py-2 bg-muted text-muted-foreground border border-input rounded-md hover:bg-muted/80"
              >
                レシピを保存して終了
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
