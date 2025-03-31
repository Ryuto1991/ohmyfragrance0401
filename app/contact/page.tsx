"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function Contact() {
  // スクロール制御のための状態
  const [isFirstRender, setIsFirstRender] = useState(true)
  const pathname = usePathname()

  // ページトップへのスクロール処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 即時スクロール
      window.scrollTo({
        top: 0,
        behavior: "auto",
      })

      // 少し遅延させて再度スクロール（より確実にするため）
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        })
      }, 100)
    }
  }, [pathname, isFirstRender])

  // 初回レンダリングフラグを更新
  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <div className="min-h-screen bg-secondary">
      {/* 共通ヘッダーを使用 */}
      <SiteHeader />

      {/* Contact Header - パディングを増やし、マージンを追加 */}
      <section className="bg-pink-50 pt-32 pb-16 mt-16">
        <div className="container text-center px-4">
          <h1 className="text-3xl font-bold mb-6 font-zen text-secondary-foreground">お問い合わせはこちら</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-zen text-base leading-relaxed">
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <form className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-zen text-secondary-foreground">お問い合わせ種別</h3>
                <RadioGroup defaultValue="general">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="font-zen">
                        一般的なお問い合わせ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="product" id="product" />
                      <Label htmlFor="product" className="font-zen">
                        商品について
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-zen">
                        その他（量産・コラボはこちら）
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium font-zen text-secondary-foreground">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    className="w-full px-3 py-2 border border-muted rounded-md font-zen"
                    placeholder="山田 フレグランス"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium font-zen text-secondary-foreground">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-muted rounded-md font-zen"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium font-zen text-secondary-foreground">
                  電話番号
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-3 py-2 border border-muted rounded-md font-zen"
                  placeholder="090-1234-5678"
                />
                <p className="text-xs text-muted-foreground font-zen">※任意</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium font-zen text-secondary-foreground">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  className="w-full px-3 py-2 border border-muted rounded-md font-zen"
                  placeholder="お問い合わせ内容の件名"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium font-zen text-secondary-foreground">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-3 py-2 border border-muted rounded-md font-zen"
                  placeholder="お問い合わせ内容をご記入ください"
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="privacy" className="mt-1" required />
                <label htmlFor="privacy" className="text-sm font-zen text-secondary-foreground">
                  <span className="text-red-500">*</span> プライバシーポリシーに同意します。
                  <Link href="/privacy" className="text-primary hover:underline ml-1">
                    プライバシーポリシーを読む
                  </Link>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-primary-light text-primary-foreground"
                >
                  送信する
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 共通フッターを使用 */}
      <SiteFooter />
    </div>
  )
}

