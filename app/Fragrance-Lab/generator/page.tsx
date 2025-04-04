"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { FragranceRadarChart } from "../../components/FragranceRadarChart"
import { calculateFragranceScore } from "../../lib/fragrance-score"

interface FragranceRecipe {
  title: string
  description: string
  notes: {
    top: Array<{ name: string; amount: number }>
    middle: Array<{ name: string; amount: number }>
    base: Array<{ name: string; amount: number }>
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FragranceGeneratorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultQuery = searchParams.get("query") ?? ""

  const [query, setQuery] = useState(defaultQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<FragranceRecipe | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false)

  const handleGenerate = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)
    setRecipe(null)

    try {
      const res = await fetch("/api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "香りの生成に失敗しました。もう一度お試しください。")
      }

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }
      console.log("API Response:", data)
      setRecipe(data)
    } catch (error) {
      console.error("Error generating fragrance:", error)
      setError(error instanceof Error ? error.message : "香りの生成に失敗しました。もう一度お試しください。")
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (defaultQuery && !hasProcessedInitialQuery) {
      setHasProcessedInitialQuery(true)
      handleGenerate()
    }
  }, [defaultQuery, hasProcessedInitialQuery])

  const handleRetry = () => {
    if (retryCount < 2) {
      setRetryCount((prev) => prev + 1)
      handleGenerate()
    }
  }

  const handlePurchase = async () => {
    if (!recipe) return

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          name: recipe.title,
          description: recipe.description,
          top_notes: recipe.notes.top.map(oil => oil.name),
          middle_notes: recipe.notes.middle.map(oil => oil.name),
          base_notes: recipe.notes.base.map(oil => oil.name),
          mode: 'generator'
        })
        .select()

      if (error) throw error

      // AIが生成した香りのデータを作成
      const fragranceData = {
        id: 'lab-generated',
        name: recipe.title,
        category: 'AIブレンド系',
        emoji: '✨',
        description: recipe.description,
        notes: {
          top: recipe.notes.top.map(oil => ({
            name: oil.name,
            amount: oil.amount
          })),
          middle: recipe.notes.middle.map(oil => ({
            name: oil.name,
            amount: oil.amount
          })),
          last: recipe.notes.base.map(oil => ({
            name: oil.name,
            amount: oil.amount
          }))
        }
      }

      // ローカルストレージに保存
      localStorage.setItem('selected_recipe', JSON.stringify({
        name: recipe.title,
        description: recipe.description,
        top_notes: recipe.notes.top.map(oil => oil.name),
        middle_notes: recipe.notes.middle.map(oil => oil.name),
        base_notes: recipe.notes.base.map(oil => oil.name)
      }))

      // 選択された香りのデータも保存
      localStorage.setItem('selected_fragrance', JSON.stringify(fragranceData))
      localStorage.setItem('selected_fragrance_id', 'lab-generated')

      router.push('/custom-order?mode=lab')
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('レシピの保存に失敗しました。')
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">⚡ サクッとつくる</h1>
              <p className="text-muted-foreground">
                気になる香りのキーワードを入力してください
              </p>
            </div>

            <div className="flex gap-2 max-w-xl mx-auto">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例：寝る前のリラックス、マツコの香り"
                className="flex-1"
              />
              <Button onClick={handleGenerate} disabled={isLoading || !query.trim()}>
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "生成する"}
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-xl mx-auto">
                {error}
              </div>
            )}

            {recipe && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                  <h2 className="text-xl font-bold text-center">🎉 香りが完成しました！</h2>
                  <div className="space-y-4">
                    <p className="text-lg">
                      <span className="text-primary">🌸</span>{" "}
                      <strong>香水名：</strong>
                      {recipe.title}
                    </p>
                    <ul className="pl-4 list-disc space-y-2">
                      <li>
                        <strong>トップノート：</strong>
                        {recipe.notes?.top?.length > 0 ? recipe.notes.top.map(oil => oil.name).join(", ") : "未設定"}
                      </li>
                      <li>
                        <strong>ミドルノート：</strong>
                        {recipe.notes?.middle?.length > 0 ? recipe.notes.middle.map(oil => oil.name).join(", ") : "未設定"}
                      </li>
                      <li>
                        <strong>ベースノート：</strong>
                        {recipe.notes?.base?.length > 0 ? recipe.notes.base.map(oil => oil.name).join(", ") : "未設定"}
                      </li>
                    </ul>
                    <p className="text-muted-foreground">💬 {recipe.description}</p>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      disabled={retryCount >= 2}
                      className="w-full"
                    >
                      🔁 別パターンで再生成（あと {2 - retryCount} 回）
                    </Button>
                    <Button 
                      onClick={handlePurchase} 
                      className="w-full py-6 text-lg"
                    >
                      🛒 この香りにする
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold mb-6">生成されたレシピ</h2>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">香りの特徴</h3>
                    <FragranceRadarChart 
                      scores={calculateFragranceScore([
                        ...recipe.notes.top,
                        ...recipe.notes.middle,
                        ...recipe.notes.base
                      ])} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
} 