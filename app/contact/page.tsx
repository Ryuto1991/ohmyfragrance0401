"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { toast } from "sonner"

export default function Contact() {
  // スクロール制御のための状態
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newErrors: { [key: string]: string } = {}

    // 必須項目のバリデーション
    if (!formData.get('name')) {
      newErrors.name = 'お名前を入力してください'
    }
    if (!formData.get('email')) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email') as string)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }
    if (!formData.get('subject')) {
      newErrors.subject = '件名を入力してください'
    }
    if (!formData.get('message')) {
      newErrors.message = 'メッセージを入力してください'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    // 確認ページに遷移
    const params = new URLSearchParams()
    params.append('type', formData.get('type') as string)
    params.append('name', formData.get('name') as string)
    params.append('email', formData.get('email') as string)
    params.append('phone', formData.get('phone') as string)
    params.append('subject', formData.get('subject') as string)
    params.append('message', formData.get('message') as string)

    router.push(`/contact/confirm?${params.toString()}`)
    setIsSubmitting(false)
  }

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
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-zen text-secondary-foreground">お問い合わせ種別</h3>
                <RadioGroup defaultValue="general" name="type">
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
                    name="name"
                    className={`w-full px-3 py-2 border rounded-md font-zen ${
                      errors.name ? 'border-red-500' : 'border-muted'
                    }`}
                    placeholder="山田 フレグランス"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 font-zen">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium font-zen text-secondary-foreground">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full px-3 py-2 border rounded-md font-zen ${
                      errors.email ? 'border-red-500' : 'border-muted'
                    }`}
                    placeholder="example@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 font-zen">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium font-zen text-secondary-foreground">
                  電話番号
                </label>
                <input
                  id="phone"
                  name="phone"
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
                  name="subject"
                  className={`w-full px-3 py-2 border rounded-md font-zen ${
                    errors.subject ? 'border-red-500' : 'border-muted'
                  }`}
                  placeholder="お問い合わせ内容の件名"
                  required
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 font-zen">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium font-zen text-secondary-foreground">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md font-zen ${
                    errors.message ? 'border-red-500' : 'border-muted'
                  }`}
                  placeholder="お問い合わせ内容をご記入ください"
                  required
                />
                {errors.message && (
                  <p className="text-sm text-red-500 font-zen">{errors.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="privacy" name="privacy" className="mt-1" required />
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
                  className={`w-full md:w-auto transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-primary/70 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-light hover:scale-105'
                  } text-primary-foreground font-medium py-6 px-8 text-base rounded-full shadow-lg hover:shadow-xl`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>送信中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>送信する</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-bounce"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </Button>
                {isSubmitting && (
                  <p className="mt-2 text-sm text-muted-foreground font-zen">
                    送信処理中です。しばらくお待ちください...
                  </p>
                )}
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

