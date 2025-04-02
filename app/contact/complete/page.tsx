"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function ContactComplete() {
  const router = useRouter()

  useEffect(() => {
    // 5秒後にトップページにリダイレクト
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <section className="bg-pink-50 pt-32 pb-16 mt-16">
        <div className="container text-center px-4">
          <h1 className="text-3xl font-bold mb-6 font-zen text-secondary-foreground">送信完了</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-zen text-base leading-relaxed">
            お問い合わせありがとうございました。
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-base font-zen text-secondary-foreground mb-8">
              お問い合わせを受け付けました。<br />
              確認メールをお送りしましたのでご確認ください。<br />
              5秒後にトップページに移動します。
            </p>
            <Button
              type="button"
              onClick={() => router.push('/')}
              className="bg-primary hover:bg-primary-light text-primary-foreground"
            >
              トップページへ戻る
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 