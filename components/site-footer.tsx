"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Instagram, Twitter } from "lucide-react"

export default function SiteFooter() {
  const router = useRouter()

  // トップページに移動してスクロールトップする関数
  const goToHomePage = () => {
    router.push("/")
    // 少し遅延させてからスクロールトップを実行
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      })
    }, 100)
  }

  return (
    <footer className="bg-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            {/* クリックでトップページに移動してスクロールトップ */}
            <h3
              className="text-lg font-medium mb-4 text-secondary-foreground font-zen hover:text-primary transition-colors cursor-pointer"
              onClick={goToHomePage}
            >
              Oh my fragrance
            </h3>
            <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">
              AIを活用したオリジナルフレグランス作成サービス
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-secondary-foreground hover:opacity-70 transition-opacity">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-secondary-foreground hover:opacity-70 transition-opacity">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-secondary-foreground font-zen">MENU</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/Fragrance-Lab"
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                >
                  Fragrance Lab
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-montserrat"
                >
                  Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/oh-my-custom"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-montserrat"
                >
                  Oh my custom
                </Link>
              </li>
              <li>
                <Link
                  href="/concept"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-montserrat"
                >
                  Concept
                </Link>
              </li>
              {/* ブログリンクを削除 */}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-secondary-foreground font-zen">INFORMATION</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/company"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-zen"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-zen"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-zen"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  replace
                  className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground font-zen"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/70 font-zen">© 2025 Oh my fragrance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

