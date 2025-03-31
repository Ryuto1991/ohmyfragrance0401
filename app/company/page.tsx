"use client"

import Link from "next/link"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function CompanyPage() {
  const pathname = usePathname()

  // ページトップへのスクロール処理 - 依存配列を簡略化し、状態管理を削除
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 即時スクロール
      window.scrollTo({
        top: 0,
        behavior: "auto",
      })

      // 少し遅延させて再度スクロール（より確実にするため）
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        })
      }, 100)

      // クリーンアップ関数を追加
      return () => clearTimeout(timeoutId)
    }
  }, []) // 空の依存配列に変更

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
            <h1 className="text-3xl font-medium mb-4 text-secondary-foreground font-zen">特定商取引法に基づく表記</h1>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* 特定商取引法に基づく表記セクション */}
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">販売業者</h3>
                <p className="text-secondary-foreground/70 font-zen">株式会社PxCell（PxCell Co.,Ltd.）</p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">サービス名</h3>
                <p className="text-secondary-foreground/70 font-zen">Oh my fragrance</p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">代表者</h3>
                <p className="text-secondary-foreground/70 font-zen">川又 龍人</p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">所在地</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  〒150-0002
                  <br />
                  東京都渋谷区渋谷３丁目２７−１−２階
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">連絡先</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  メールアドレス：info@ohmyfragrance.com
                  <br />
                  受付時間：平日10:00-18:00（土日祝は休業）
                  <br />
                  ※お問い合わせはメールでの対応を優先させていただきます。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">商品の価格</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  各商品ページに表示された価格に準じます。
                  <br />
                  表示価格は全て税込み価格です。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">送料</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  全国一律 550円（税込）
                  <br />
                  ※5,500円（税込）以上のご購入で送料無料
                  <br />
                  ※一部地域（沖縄、離島など）は別途送料がかかる場合があります。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">支払方法</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  ・クレジットカード決済（VISA、Mastercard、JCB、American Express、Diners Club）
                  <br />
                  ・コンビニ決済
                  <br />
                  ・銀行振込
                  <br />
                  ・PayPay
                  <br />
                  ・Amazon Pay
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">商品の引渡し時期</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  ・クレジットカード決済、PayPay、Amazon Pay：ご注文確認後、2週間以内に発送
                  <br />
                  ・コンビニ決済、銀行振込：ご入金確認後、2週間以内に発送
                  <br />
                  ※在庫状況や繁忙期により、発送が遅れる場合があります。その場合は別途ご連絡いたします。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">
                  返品・交換・キャンセル
                </h3>
                <p className="text-secondary-foreground/70 font-zen">
                  ・商品到着後8日以内に限り、未開封・未使用の商品に限り返品・交換を承ります。
                  <br />
                  ・お客様都合による返品の場合、送料はお客様負担となります。
                  <br />
                  ・不良品・誤配送の場合は、当社負担で返品・交換いたします。
                  <br />
                  ・注文確定後のキャンセルは、商品発送前に限り承ります。
                  <br />
                  ・カスタマイズ商品（Fragrance
                  AIで作成したオリジナルフレグランス）については、商品の性質上、返品・交換・キャンセルをお受けできません。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">販売数量</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  各商品ページに表示された在庫数に準じます。
                  <br />
                  在庫切れの場合は、商品ページにてお知らせいたします。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">販売期間</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  各商品ページに特別な表記がない限り、期間の定めはありません。
                  <br />
                  期間限定商品については、商品ページにて販売期間を表示いたします。
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2 text-secondary-foreground font-zen">ページの表示</h3>
                <p className="text-secondary-foreground/70 font-zen">
                  商品の色味や質感は、お客様のモニター設定やご利用環境により実際の商品と異なって見える場合があります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

