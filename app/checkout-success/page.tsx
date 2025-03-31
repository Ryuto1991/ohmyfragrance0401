import Link from "next/link"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        <section className="bg-white rounded-lg shadow-sm mb-6">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>

              <h1 className="text-3xl font-medium text-secondary-foreground font-zen mb-4">
                ご注文ありがとうございます
              </h1>

              <p className="text-secondary-foreground/70 font-zen mb-8">
                ご注文を受け付けました。ご入力いただいたメールアドレスに確認メールをお送りしましたので、ご確認ください。
              </p>

              <div className="bg-secondary rounded-lg p-6 mb-8 text-left">
                <h2 className="text-xl font-medium text-secondary-foreground font-zen mb-4">注文詳細</h2>
                <div className="space-y-2 text-secondary-foreground/70 font-zen">
                  <p>
                    注文番号:{" "}
                    <span className="font-medium text-secondary-foreground">
                      OMF-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </p>
                  <p>
                    注文日時:{" "}
                    <span className="font-medium text-secondary-foreground">{new Date().toLocaleString("ja-JP")}</span>
                  </p>
                  <p>
                    お支払い方法: <span className="font-medium text-secondary-foreground">クレジットカード</span>
                  </p>
                  <p>
                    配送予定日: <span className="font-medium text-secondary-foreground">3〜5営業日以内</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home className="mr-2 h-4 w-4" />
                    トップページへ
                  </Button>
                </Link>
                <Link href="/select-fragrance">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    他の商品を見る
                  </Button>
                </Link>
              </div>

              <div className="mt-8 border-t pt-6">
                <p className="text-sm text-secondary-foreground/70 font-zen">
                  会員登録すると、注文履歴の確認や再注文が簡単に行えます。
                  <Link href="/signup" className="text-primary hover:underline ml-1">
                    会員登録はこちら
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

