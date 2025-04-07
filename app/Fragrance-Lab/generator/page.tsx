"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Info } from "lucide-react"
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

// 例のリスト
const EXAMPLE_PHRASES = [
  "初恋の香り",
  "放課後の図書室",
  "雨上がりの空気",
  "寂しさを癒すバニラ",
  "旅に出たくなる香り",
  "目覚めるような柑橘系",
  "幸せになれるベリー",
  "推しとすれ違った時",
  "花火大会の帰り道",
  "静かな夜のジャスミン",
  "失恋したあとの香り",
  "新しい街の風",
  "寝る前の香り",
  "淡い桜の記憶",
  "抱きしめられたい香り",
  "海沿いドライブ",
  "映画のラストシーン",
  "サプライズの香り",
  "冬の夜のカフェラテ",
  "夏祭りの金木犀",
  "髪を乾かす柔軟剤",
  "好きな人の香り",
  "胸が高鳴る香り",
  "自分らしさの香り",
  "背伸びしたい夜",
  "おしゃれなカフェ",
  "憧れの人の香り",
  "麦わら帽子の記憶",
  "甘いチョコの誘惑",
  "大切な人との休日",
  "二度と戻れない夏",
]

// 不適切ワードエラーかどうかを判断する関数
const isInappropriateWordError = (error: string | null) => {
  return error?.includes("不適切なワード") || false;
}

// エラーメッセージのコンポーネント
const ErrorMessage = ({ error }: { error: string | null }) => {
  if (!error) return null;
  
  const isInappropriate = isInappropriateWordError(error);
  
  return (
    <div className={`${isInappropriate ? "bg-amber-50" : "bg-destructive/10"} 
                    ${isInappropriate ? "text-amber-700" : "text-destructive"} 
                    p-4 rounded-lg max-w-xl mx-auto flex items-start gap-3`}>
      {isInappropriate ? (
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      )}
      <div>
        <p className="font-medium">{error}</p>
        {isInappropriate && (
          <p className="text-sm mt-1">
            香りの生成には適切な表現をお使いください。別のキーワードをお試しください。
          </p>
        )}
      </div>
    </div>
  );
};

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
  const [retryMode, setRetryMode] = useState(false)

  const handleGenerate = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)
    setRecipe(null)
    setRetryMode(false)

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
      setRetryMode(true)
      setQuery("")
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && query.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  }

  // ランダムなプレースホルダーを選択
  const randomPlaceholder = EXAMPLE_PHRASES[Math.floor(Math.random() * EXAMPLE_PHRASES.length)]

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {!recipe ? (
            // レシピがない場合は中央に検索バーを表示
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="max-w-2xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">⚡ クイックモード</h1>
                <p className="text-xl text-muted-foreground mb-2">
                  イメージや気分をキーワードで入力するだけ
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  AIがあなただけのルームフレグランスレシピを自動で作成します
                </p>
                
                <div className="relative max-w-xl mx-auto">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={query ? "" : `例：${randomPlaceholder}`}
                    className="h-14 pl-4 pr-32 text-lg rounded-full shadow-lg"
                  />
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !query.trim()}
                    className="absolute right-1 top-1 h-12 rounded-full px-6"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "生成する"}
                  </Button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {EXAMPLE_PHRASES.slice(0, 4).map((phrase, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-sm"
                      onClick={() => {
                        setQuery(phrase);
                        handleGenerate();
                      }}
                    >
                      {phrase}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // レシピがある場合は既存のレイアウト
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">⚡ サクッとつくる</h1>
                <p className="text-muted-foreground">
                  気になる香りのキーワードを入力してください
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex gap-2 max-w-xl mx-auto">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={query ? "" : `例：${randomPlaceholder}`}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "生成する"}
                </Button>
              </form>

              {/* エラーメッセージの表示を改善したコンポーネントに置き換え */}
              {error && <ErrorMessage error={error} />}

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
                    {retryMode ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-center">別のキーワードを入力して再生成してください</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex gap-2">
                          <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="新しいキーワードを入力"
                            className="flex-1"
                            autoFocus
                          />
                          <Button 
                            type="submit"
                            disabled={!query.trim()}
                          >
                            再生成
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleRetry}
                        disabled={retryCount >= 2}
                        className="w-full"
                      >
                        🔁 別パターンで再生成（あと {2 - retryCount} 回）
                      </Button>
                    )}
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
            </div>
          )}
          
          {/* エラーメッセージの表示を改善したコンポーネントに置き換え */}
          {error && !recipe && <ErrorMessage error={error} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
} 