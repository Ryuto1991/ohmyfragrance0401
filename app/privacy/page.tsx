"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function PrivacyPolicyPage() {
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
      <SiteHeader />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          {/* 戻るボタン */}
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                トップに戻る
              </Button>
            </Link>
          </div>

          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-medium mb-4 text-secondary-foreground font-zen">プライバシーポリシー</h1>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* プライバシーポリシー内容 */}
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-8">
              <p className="text-secondary-foreground/70 font-zen">
                株式会社PxCell（以下「当社」）は、個人情報の重要性を認識し、個人情報の保護に関する法律、その他の関係法令を遵守するとともに、本プライバシーポリシーに従い、適切な取扱いと保護に努めます。
              </p>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">1. 基本方針</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、ユーザーの個人情報を適切に取り扱うために、社内体制の整備、安全管理措置の実施、従業者の教育などを通じて、継続的な改善を行います。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">2. 個人情報の定義</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  本プライバシーポリシーにおいて、個人情報とは、生存する個人に関する情報であり、氏名、生年月日、住所、電話番号、メールアドレス、その他の記述等により、特定の個人を識別できる情報を指します（他の情報と照合することで特定個人を識別できるものも含みます）。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">3. 個人情報の収集方法</h2>
                <p className="text-secondary-foreground/70 font-zen">当社は、以下の方法により個人情報を取得します。</p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>ウェブサイトの各種フォームからの情報入力</li>
                  <li>メール、電話、FAXなどによるお問い合わせ</li>
                  <li>商品・サービスの取引過程において書面・口頭でいただく情報</li>
                  <li>クッキー（Cookie）などの技術による情報収集</li>
                </ul>
                <p className="mt-4 text-secondary-foreground/70 font-zen">
                  ※当ウェブサイトでは、ユーザー体験の向上およびサービス改善のためにCookie等の技術を使用しています。Cookieの使用はブラウザ設定で無効化できますが、その場合は一部機能がご利用いただけない可能性があります。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">4. 個人情報の利用目的</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、取得した個人情報を以下の目的で利用します。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>商品・サービスの提供および発送</li>
                  <li>お問い合わせへの対応</li>
                  <li>新商品・サービスのご案内</li>
                  <li>サービス改善のための分析</li>
                  <li>アンケート調査の実施</li>
                  <li>法令に基づく対応または公的機関からの要請への協力</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">5. 個人情報の第三者提供</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、以下の場合を除き、事前にご本人の同意を得ることなく、個人情報を第三者に提供することはありません。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>公衆衛生の向上または児童の健全育成の推進のために必要がある場合</li>
                  <li>
                    国の機関、地方公共団体、または委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">6. 個人情報の安全管理</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、個人情報の漏洩、滅失、改ざんなどを防止するために、以下の安全管理措置を講じています。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>SSL（Secure Socket Layer）による通信の暗号化</li>
                  <li>アクセス権限の制限</li>
                  <li>外部からの不正侵入防止対策</li>
                  <li>社内従業者への教育と監督体制の整備</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  7. 個人情報の開示・訂正・削除・利用停止等
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、ご本人から個人情報の開示、訂正、削除、利用停止等のご請求があった場合には、本人確認を行ったうえで、法令に従い速やかに対応いたします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  8. プライバシーポリシーの変更
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更内容は当ウェブサイトに掲載することにより公表します。重要な変更がある場合には、個別に通知またはウェブサイト上で目立つ形で告知します。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">9. お問い合わせ窓口</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  個人情報の取扱いに関するご質問、ご要望、苦情等は、以下の窓口までご連絡ください。
                </p>
                <div className="mt-4 bg-secondary p-4">
                  <p className="text-secondary-foreground/70 font-zen">
                    株式会社PxCell Oh my fragrance担当窓口
                    <br />
                    住所：〒150-0002 東京都渋谷区渋谷３丁目２７−１−２階
                    <br />
                    メール：info@ohmyfragrance.com
                    <br />
                    受付時間：平日10:00-18:00（土日祝は休業）
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-secondary-foreground/70 font-zen">制定日：2025年3月24日</p>
                <p className="text-secondary-foreground/70 font-zen">最終更新日：2025年3月24日</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

