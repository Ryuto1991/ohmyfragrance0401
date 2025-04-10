"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChatProvider } from '@/components/chat/ChatProvider'
import { FragranceChat } from '@/components/chat/FragranceChat'
import SiteHeader from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Analytics } from '@vercel/analytics/react'
import { StorageService } from '@/utils/storage-service'
import { FragranceRecipe } from '@/app/fragrance-lab/chat/types'

// カスタム型定義
interface RecipeData {
  title: string
  description: string
  notes: {
    top: string[]
    middle: string[]
    base: string[]
  }
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
  const query = searchParams.get('q') || searchParams.get('query')
  const autoCreateParam = searchParams.get('auto')
  const pathname = usePathname()

  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [queryProcessed, setQueryProcessed] = useState(false)

  // クエリパラメータのクリーンアップ（URL履歴を汚さないため）
  useEffect(() => {
    if (query || autoCreateParam) {
      const newPath = pathname
      router.replace(newPath, { scroll: false })
    }
  }, [query, autoCreateParam, pathname, router])

  // レシピの監視 - StorageServiceからレシピが更新されたら取得
  useEffect(() => {
    const storedRecipe = StorageService.getRecipe()

    if (storedRecipe) {
      setRecipe({
        title: storedRecipe.name || "オリジナルルームフレグランス",
        description: storedRecipe.description || "あなただけのカスタムルームフレグランス",
        notes: {
          top: storedRecipe.topNotes,
          middle: storedRecipe.middleNotes,
          base: storedRecipe.baseNotes
        }
      })
    }

    // ローカルストレージの変更を監視するイベントリスナー
    const handleStorageChange = () => {
      const updatedRecipe = StorageService.getRecipe()
      if (updatedRecipe) {
        setRecipe({
          title: updatedRecipe.name || "オリジナルルームフレグランス",
          description: updatedRecipe.description || "あなただけのカスタムルームフレグランス",
          notes: {
            top: updatedRecipe.topNotes,
            middle: updatedRecipe.middleNotes,
            base: updatedRecipe.baseNotes
          }
        })
      }
    }

    // localStorageの変更イベントをリッスン
    window.addEventListener('storage', handleStorageChange)

    // クリーンアップ
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // レシピをSupabaseに保存してから注文ページへ移動
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

      // レシピをストレージに保存（カスタムオーダーページで使用）
      StorageService.saveRecipe({
        name: recipe.title,
        description: recipe.description,
        topNotes: recipe.notes.top,
        middleNotes: recipe.notes.middle,
        baseNotes: recipe.notes.base
      })

      router.push('/custom-order?mode=lab')
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('レシピの保存に失敗しました。')
    }
  }

  // レシピを保存してホームに戻る
  const handleSaveAndExit = async () => {
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

      // レシピをストレージに保存
      StorageService.saveRecipe({
        name: recipe.title,
        description: recipe.description,
        topNotes: recipe.notes.top,
        middleNotes: recipe.notes.middle,
        baseNotes: recipe.notes.base
      })

      router.push('/')
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
          <div className="w-[70px]"></div> {/* 右側のスペーサー */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto p-4 md:p-6">
          {/* ChatProviderでラップして状態管理を提供 */}
          <ChatProvider>
            <FragranceChat initialQuery={query || undefined} />
          </ChatProvider>
        </div>
      </div>

      {/* レシピ完成時の表示 - FragranceChatの表示と重複しないようにUIの調整が必要 */}
      {recipe && (
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
                type="button"
                onClick={() => handlePurchase()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-lg hover:opacity-90"
              >
                このルームフレグランスを注文する
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveAndExit()}
                className="px-6 py-2 bg-muted text-muted-foreground border border-input hover:bg-muted/80"
              >
                レシピを保存して終了
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
