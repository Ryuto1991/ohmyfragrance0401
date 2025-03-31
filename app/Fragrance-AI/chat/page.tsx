import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FragranceAIChatPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">AIと一緒に、香りをつくろう</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          好きな香りを伝えるだけで、AIがあなただけの香水を提案します。
        </p>
      </div>

      {/* Chat container for Mastra chat integration */}
      <div
        id="chat-container"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 min-h-[400px] border border-gray-200 dark:border-gray-700"
      >
        {/* Mastra chat will be embedded here via JavaScript */}
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>チャットインターフェースがここに表示されます...</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/Fragrance-AI/customize">
            <Button size="lg" className="px-8 py-6 text-lg">
              この香りでつくる
            </Button>
          </Link>
        </Button>
      </div>
    </main>
  )
}

