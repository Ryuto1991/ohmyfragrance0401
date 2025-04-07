"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function FragranceLabPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") ?? ""
  const qParam = query ? `?query=${encodeURIComponent(query)}` : ""

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">香りをつくる</h1>
          {query && (
            <p className="text-muted-foreground mb-8">
              検索キーワード: 「{query}」
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* チャットでつくる */}
            <div className="flex-1 bg-white shadow-md rounded-xl p-6 text-left border">
              <div className="text-2xl font-semibold mb-2">💬 チャットでつくる</div>
              <p className="text-muted-foreground mb-4">
                チャット形式で会話しながら、あなたの好みやイメージに合わせて
                香りをカスタマイズしていきます。
              </p>
              <Button
                className="w-full"
                onClick={() => router.push(`/fragrance-lab/chat${qParam}`)}
              >
                対話モードで作る
              </Button>
            </div>

            {/* サクッとつくる */}
            <div className="flex-1 bg-white shadow-md rounded-xl p-6 text-left border">
              <div className="text-2xl font-semibold mb-2">⚡ サクッとつくる</div>
              <p className="text-muted-foreground mb-4">
                キーワードを入力するだけで、AIがあなたにぴったりの香りを提案します。
                簡単・手軽にオリジナルフレグランスを作成できます。
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push(`/fragrance-lab/generator${qParam}`)}
              >
                クイックモードで作る
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
} 