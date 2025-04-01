import { ShoppingCart } from "lucide-react"

export default function Header() {
  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-red-600 text-white p-3 mr-3">
            <span className="font-bold text-xl">OH MY</span>
          </div>
          <h1 className="text-red-600 text-2xl font-bold tracking-wide">FRAGRANCE CUSTOMIZE</h1>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-sm hover:underline">
              はじめての方へ
            </a>
            <a href="#" className="text-sm hover:underline">
              お会員
            </a>
            <a href="#" className="text-sm hover:underline">
              新規会員登録
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="#" className="flex items-center text-sm">
              <ShoppingCart className="h-5 w-5 mr-1" />
              <span>ショッピングカート</span>
            </a>

            <div className="hidden md:block bg-gray-800 text-white">
              <div className="px-4 py-3 text-center">
                <div className="text-xs">MY PAGE</div>
                <div className="text-xs">マイページ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 flex border-b">
        <a href="#" className="px-4 py-2 font-medium">
          DESIGN デザイン作成
        </a>
        <span className="px-2 py-2">|</span>
        <a href="#" className="px-4 py-2 font-medium">
          SPECIAL 特集
        </a>
      </div>
    </header>
  )
}

