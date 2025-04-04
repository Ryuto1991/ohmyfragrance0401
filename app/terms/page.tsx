"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

export default function TermsPage() {
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
            <h1 className="text-3xl font-medium mb-4 text-secondary-foreground font-zen">利用規約</h1>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* 利用規約内容 */}
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-8">
              <div>
                <p className="text-secondary-foreground/70 font-zen">
                  この利用規約（以下「本規約」）は、株式会社PxCell（以下「当社」）が提供する「Oh my
                  fragrance」（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">第1条（適用）</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  本規約は、ユーザーと当社との間の本サービスの利用に関する一切の関係に適用されます。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  ユーザーは、本規約に同意した上で本サービスを利用するものとします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">第2条（利用登録）</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  本サービスの利用を希望する者は、当社の定める方法により利用登録を申請し、当社がこれを承認した時点で利用登録が完了するものとします。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  当社は、以下のいずれかに該当する場合、利用登録の申請を承認しないことがあります。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>虚偽の内容を申請した場合</li>
                  <li>過去に本規約違反があった者からの申請である場合</li>
                  <li>その他、当社が登録を不適当と判断した場合</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第3条（ユーザーIDおよびパスワードの管理）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、自己の責任において、ユーザーIDおよびパスワードを適切に管理するものとします。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  ユーザーは、ユーザーIDおよびパスワードを第三者に譲渡・貸与・共用することはできません。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  登録情報と一致してログインされた場合、当社は当該ユーザー自身による利用とみなします。
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                ※現在、本サービスはMVP（最小限の実用バージョン）として提供されており、一部機能は今後順次追加予定です。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第4条（料金および支払方法）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、本サービスの有料部分について、当社が定める利用料金を、当社の指定する方法で支払うものとします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">第5条（禁止事項）</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>法令または公序良俗に反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>他ユーザーまたは第三者のサーバー・ネットワークへの妨害行為</li>
                  <li>サービス運営の妨害行為</li>
                  <li>他のユーザーに関する個人情報の収集</li>
                  <li>不正アクセスおよびこれを試みる行為</li>
                  <li>他のユーザーになりすます行為</li>
                  <li>反社会的勢力への利益供与</li>
                  <li>その他、当社が不適切と判断する行為</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第5条の2（製品の性質および使用上の注意）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社が提供する製品は雑貨としてのルームフレグランスであり、化粧品（香水）としての直接的な肌への使用を前提としておりません。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  香料成分に対し過敏な体質の方は、ご使用前に必ずパッチテストを行い、異常が現れた場合は使用を中止の上、速やかに医師にご相談ください。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  当社は、ユーザーが本サービスで作成したオーダーメイドの香り（Fragrance
                  Lab）について、ユーザー固有の入力に基づいて生成しておりますが、他のユーザーと香りが完全に異なることを保証するものではありません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第5条の3（アップロード画像の著作権等）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、本サービスを通じてアップロードする画像について、以下を遵守するものとします。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>第三者の著作権、商標権、肖像権、パブリシティ権その他一切の権利を侵害しないこと。</li>
                  <li>法令または公序良俗に反する内容、または第三者に不快感を与えるおそれのある画像を使用しないこと。</li>
                </ul>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  ユーザーがアップロードした画像に関する権利問題について、当社は一切の責任を負いません。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  ユーザーが本項に違反したことにより、当社または第三者に損害が発生した場合、ユーザーはその一切の責任を負うものとします。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
  当社は、ユーザーが本項に違反している、またはそのおそれがあると判断した場合、該当する画像の削除、注文のキャンセル・停止、アカウントの利用制限等の措置を講じることができるものとします。
  これによりユーザーに損害が生じた場合でも、当社は一切の責任を負いません。
</p>


              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第6条（本サービスの提供の停止等）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は以下の場合、事前通知なくサービスの提供を停止または中断することがあります。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>システムの保守点検</li>
                  <li>地震・火災・停電などの不可抗力</li>
                  <li>通信回線やサーバートラブル</li>
                  <li>その他、当社が必要と判断した場合</li>
                </ul>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  停止や中断により生じた損害について、当社は責任を負いません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第7条（利用制限および登録抹消）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、以下の場合に、ユーザーの利用を制限し、または登録を抹消できるものとします。
                </p>
                <ul className="list-disc pl-6 mt-2 text-secondary-foreground/70 font-zen">
                  <li>規約違反があった場合</li>
                  <li>登録情報に虚偽があった場合</li>
                  <li>利用料金の支払遅延があった場合</li>
                  <li>当社からの連絡に一定期間応答がない場合</li>
                  <li>一定期間利用がない場合</li>
                  <li>その他、当社が不適当と判断した場合</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">第8条（退会）</h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、当社の定める手続により、いつでも本サービスから退会することができます。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  退会を希望する場合は、お問い合わせフォームより退会申請を行ってください。当社は、申請内容を確認の上、速やかに対応いたします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第9条（保証の否認および免責事項）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、本サービスに事実上または法律上の瑕疵がないことを保証しません。
                </p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  本サービスの利用によってユーザーに生じた損害について、当社に故意または重大な過失がない限り、一切の責任を負いません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第10条（サービス内容の変更等）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、ユーザーへの事前通知なく、本サービスの内容を変更・停止することがあります。これにより生じた損害について、当社は責任を負いません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第11条（利用規約の変更）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、必要に応じて本規約を変更できるものとします。変更後にユーザーがサービスを継続利用した場合、変更に同意したものとみなされます。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第12条（個人情報の取扱い）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、ユーザーの個人情報を当社の定めるプライバシーポリシーに基づき適切に取り扱います。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第13条（通知または連絡）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  当社は、ユーザーとの連絡を原則として電子メールで行います。お電話での対応は行っておりません。連絡はユーザーが登録した有効なメールアドレス宛に行い、送信時に到達したものとみなします。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第13条の2（領収書の発行）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーが領収書の発行を希望する場合は、注文時または別途お問い合わせください。電子領収書（PDF形式）の発行にて対応いたします。紙媒体での郵送対応は行っておりません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第14条（権利義務の譲渡の禁止）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">
                  ユーザーは、当社の書面による事前承諾なく、契約上の地位または本規約上の権利義務を第三者に譲渡・担保提供することはできません。
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                  第15条（準拠法および管轄裁判所）
                </h2>
                <p className="text-secondary-foreground/70 font-zen">本規約の解釈には日本法を準拠法とします。</p>
                <p className="text-secondary-foreground/70 font-zen mt-2">
                  本サービスに関する紛争については、当社の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
              </div>

              <div className="text-right">
                <p className="text-secondary-foreground/70 font-zen">制定日：2025年3月24日</p>
                <p className="text-secondary-foreground/70 font-zen">最終更新日：2025年4月4日</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

