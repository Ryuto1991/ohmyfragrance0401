"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { toast } from "sonner"

export default function ContactConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    // URLパラメータからフォームデータを取得
    const data = {
      type: searchParams.get("type") || "",
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      phone: searchParams.get("phone") || "",
      subject: searchParams.get("subject") || "",
      message: searchParams.get("message") || "",
    }
    setFormData(data)
  }, [searchParams])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('送信に失敗しました')
      }

      toast.success(
        "お問い合わせありがとうございました。改めてご連絡いたします。\ninfo@ohmyfragrance.com",
        {
          duration: 5000,
        }
      )
      router.push('/contact/complete')
    } catch (error) {
      console.error('Error:', error)
      toast.error("送信に失敗しました。時間をおいて再度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <section className="bg-pink-50 pt-32 pb-16 mt-16">
        <div className="container text-center px-4">
          <h1 className="text-3xl font-bold mb-6 font-zen text-secondary-foreground">入力内容の確認</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-zen text-base leading-relaxed">
            入力内容をご確認ください。
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">お問い合わせ種別</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground">
                  {formData.type === "general" && "一般的なお問い合わせ"}
                  {formData.type === "product" && "商品について"}
                  {formData.type === "other" && "その他（量産・コラボはこちら）"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">お名前</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground">{formData.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">メールアドレス</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground">{formData.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">電話番号</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground">{formData.phone || "未入力"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">件名</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground">{formData.subject}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium font-zen text-muted-foreground">メッセージ</h3>
                <p className="mt-1 text-base font-zen text-secondary-foreground whitespace-pre-wrap">{formData.message}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                修正する
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary-light text-primary-foreground"
              >
                {isSubmitting ? "送信中..." : "送信する"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 