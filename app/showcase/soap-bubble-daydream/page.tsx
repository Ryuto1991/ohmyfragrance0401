"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useStripeCart } from "@/contexts/stripe-cart-context"
import { useCartDrawer } from "@/contexts/cart-drawer-context"

export default function SoapBubbleDaydreamPage() {
  const { addToCart } = useStripeCart()
  const { openCart } = useCartDrawer()

  // ページトップへのスクロール処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)

      // 少し遅延させて再度スクロール（より確実にするため）
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }
  }, [])

  const product = {
    id: 2,
    title: "Soap Bubble Daydream",
    subtitle: "― アーティスト「Risa」とつくる香りの記憶 ―",
    description: "朝露のように繊細で、どこか懐かしい。ふとした瞬間に浮かぶ、シャボンのような夢の記憶。",
    fullDescription: `朝露のように繊細で、どこか懐かしい。
ふとした瞬間に浮かぶ、シャボンのような夢の記憶。
アーティスト「Risa」の世界観をイメージし、香りで表現したケーススタディ作品です。

小ロットでの香水制作も承ります
この香水はケーススタディ作品として開発されました。
当ブランドでは、10本からの小ロット生産にも対応しております。
アーティスト・クリエイター・ブランド様向けに、世界観を香りで表現するお手伝いをしています。`,
    image: "/images/soap-bubble-daydream-new.webp",
    category: "アーティストコラボ",
    slug: "soap-bubble-daydream",
    price: "5,980",
    // 環境変数から価格IDを読み込む。テストIDはフォールバックとして残す
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOAP_BUBBLE || "price_1R8VwGE0t3PGpOQ5T1qpwmpF",
    priceNumber: 5980,
    notes: {
      top: ["ベルガモット", "ジャスミン"],
      middle: ["バニラ", "イランイラン"],
      base: ["サンダルウッド", "パチュリ"],
    },
    duration: "4〜6時間",
    intensity: "軽め",
    season: "オールシーズン",
    details: {
      title: "Soap Bubble Daydream",
      subtitle: "アーティスト「Risa」とつくる香りの記憶",
      noteDescriptions: {
        top: "― 繊細な始まり、夢のような導入",
        middle: "― ふんわりと広がる、甘く優しい中間",
        base: "― 柔らかく続く、心地よい余韻",
      },
    },
  }

  const handleAddToCart = () => {
    addToCart({
      priceId: product.priceId,
      name: product.title,
      price: product.priceNumber,
      image: product.image,
    })
    // カートに追加後、カートドロワーを開く
    openCart()
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヒーローセクション */}
        <section className="relative bg-gradient-to-r from-pink-900 to-purple-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="mb-6">
              <Link href="/showcase">
                <Button
                  variant="outline"
                  className="rounded-full border-white text-white bg-black/30 hover:bg-white hover:text-black"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  制作事例に戻る
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="w-full md:w-1/2">
                <motion.h1
                  className="text-3xl md:text-4xl font-medium mb-4 text-white font-zen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {product.details.title}
                </motion.h1>
                <motion.p
                  className="text-pink-100 mb-6 font-zen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {product.details.subtitle}
                </motion.p>
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-medium mb-4 text-white font-zen">{product.title}</h2>
                  <p className="text-pink-100 italic mb-4 font-zen">{product.subtitle}</p>
                  <p className="text-pink-100 mb-4 font-zen whitespace-pre-line">{product.fullDescription}</p>
                </motion.div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <motion.div
                  className="relative w-full max-w-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    width={600}
                    height={600}
                    className="rounded-lg shadow-2xl"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 詳細情報セクション */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl font-medium mb-6 text-secondary-foreground font-zen">香りの構成</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-pink-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-pink-800 font-zen">トップノート</h3>
                    <p className="text-secondary-foreground mb-2 font-zen">{product.notes.top.join("・")}</p>
                    <p className="text-secondary-foreground/70 text-sm font-zen">
                      {product.details.noteDescriptions.top}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-purple-800 font-zen">ミドルノート</h3>
                    <p className="text-secondary-foreground mb-2 font-zen">{product.notes.middle.join("・")}</p>
                    <p className="text-secondary-foreground/70 text-sm font-zen">
                      {product.details.noteDescriptions.middle}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-indigo-800 font-zen">ラストノート</h3>
                    <p className="text-secondary-foreground mb-2 font-zen">{product.notes.base.join("・")}</p>
                    <p className="text-secondary-foreground/70 text-sm font-zen">
                      {product.details.noteDescriptions.base}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-12 max-w-xl mx-auto space-y-8">
                <div className="rounded-2xl bg-[#f9f9f9] p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 font-zen">Fragrance Lab</h2>
                  <p className="text-gray-700 font-zen">
                    AIとの会話で、自分だけの"推し香水"や"マイボトル"がつくれます。
                    好みや気分に合わせて、世界にひとつだけの香りを一緒にデザインしてみませんか？
                  </p>
                  <p className="font-medium text-gray-800 font-zen mt-3">5,980円（税込・送料無料）〜</p>
                  <div className="text-center mt-6">
                    <Link href="/fragrance-lab">
                      <Button className="rounded-full bg-pink-600 text-white px-6 py-2 text-sm hover:bg-pink-700 transition w-full md:w-auto">
                        AIと香りをつくる
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f9f9f9] p-6 shadow-sm mb-10">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 font-zen">
                    小ロットでの香水制作も承ります
                  </h2>
                  <p className="text-gray-700 font-zen">
                    この香水はケーススタディ作品として開発されました。
                  </p>
                  <p className="text-gray-700 font-zen mt-3">
                    当ブランドでは、10本からの小ロット生産にも対応しております。
                    アーティスト・クリエイター・ブランド様向けに、世界観を香りで表現するお手伝いをしています。
                  </p>
                  <p className="text-gray-700 font-zen mt-3">
                    ご希望の方は、お問い合わせフォームよりお気軽にご連絡ください。
                  </p>
                  <div className="text-center mt-6">
                    <Link href="/contact">
                      <Button className="rounded-full bg-pink-600 text-white px-6 py-2 text-sm hover:bg-pink-700 transition w-full md:w-auto">
                        お問い合わせはこちら
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-medium mb-6 text-secondary-foreground font-zen">製品情報</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-secondary-foreground/70 mb-1 font-zen">価格</h3>
                      <p className="text-lg text-secondary-foreground font-zen">¥{product.price}（税込）</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-secondary-foreground/70 mb-1 font-zen">持続時間</h3>
                      <p className="text-lg text-secondary-foreground font-zen">{product.duration}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-secondary-foreground/70 mb-1 font-zen">香りの強さ</h3>
                      <p className="text-lg text-secondary-foreground font-zen">{product.intensity}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-secondary-foreground/70 mb-1 font-zen">シーズン</h3>
                      <p className="text-lg text-secondary-foreground font-zen">{product.season}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.priceId}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-full py-3 font-montserrat relative overflow-hidden group"
                  >
                    <>
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span className="relative">カートに追加</span>
                    </>
                  </Button>
                  {!product.priceId && (
                    <p className="mt-2 text-sm text-red-600">現在、この商品は購入できません。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
