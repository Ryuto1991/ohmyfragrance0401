"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useStripeCart } from "@/contexts/stripe-cart-context"

export default function BloomWhisperPage() {
  const { addToCart } = useStripeCart()

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
    id: 6,
    title: "Bloom Whisper",
    subtitle: "― 咲きかけの想いを、そっとあなたに ―",
    description: "ほんのり甘くて、透明感のある香り。春の朝、そっと風に揺れる花のような、やさしく可憐なフレグランス。",
    fullDescription: `四季と感情をテーマにしたガールズアイドルグループ
Bloom（ブルーム）の"春霞"担当、朝凪りりあ。
そのイメージを香りで表現した、やさしく可憐なフレグランスです。

ほんのり甘くて、透明感のある香りは 
春の朝、そっと風に揺れる花のよう。
心にそっと寄り添い、今日をちょっとだけやさしくしてくれる―― 
そんな"春のしずく"のような香水です。`,
    image: "/images/bloom-whisper.webp",
    category: "コンテンツコラボ",
    slug: "bloom-whisper",
    price: "5,980",
    priceId: "price_1R8WSDE0t3PGpOQ5Yuu4Es4q",
    priceNumber: 5980,
    notes: {
      top: ["ホワイトピーチ", "グリーンアップル"],
      middle: ["ミュゲ（すずらん）", "ピオニー"],
      base: ["シアームスク", "ホワイトウッド"],
    },
    duration: "4〜6時間",
    intensity: "軽め",
    season: "春・夏",
    details: {
      title: "朝凪 りりあ イメージフレグランス",
      subtitle: "Bloom（ブルーム）「朝凪りりあ」の香り",
      noteDescriptions: {
        top: "― ときめきを誘う、みずみずしく明るい香り",
        middle: "― 花咲くような素直な心、優しくひらく気持ち",
        base: "― あたたかく包み込む、やわらかい余韻",
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
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヒーローセクション */}
        <section className="relative bg-gradient-to-r from-cyan-300 to-sky-200 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="mb-6">
              <Link href="/showcase">
                <Button
                  variant="outline"
                  className="rounded-full border-sky-900 text-sky-900 hover:bg-sky-900 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  制作事例に戻る
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="w-full md:w-1/2">
                <motion.h1
                  className="text-3xl md:text-4xl font-medium mb-4 text-sky-900 font-zen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {product.details.title}
                </motion.h1>
                <motion.p
                  className="text-sky-800 mb-6 font-zen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {product.details.subtitle}
                </motion.p>
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-medium mb-4 text-sky-900 font-zen">{product.title}</h2>
                  <p className="text-sky-800 italic mb-4 font-zen">{product.subtitle}</p>
                  <p className="text-sky-800 mb-4 font-zen whitespace-pre-line">{product.fullDescription}</p>
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  <div className="bg-cyan-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-cyan-800 font-zen">トップノート</h3>
                    <p className="text-secondary-foreground mb-2 font-zen">{product.notes.top.join("・")}</p>
                    <p className="text-secondary-foreground/70 text-sm font-zen">
                      {product.details.noteDescriptions.top}
                    </p>
                  </div>
                  <div className="bg-sky-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-sky-800 font-zen">ミドルノート</h3>
                    <p className="text-secondary-foreground mb-2 font-zen">{product.notes.middle.join("・")}</p>
                    <p className="text-secondary-foreground/70 text-sm font-zen">
                      {product.details.noteDescriptions.middle}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-blue-800 font-zen">ラストノート</h3>
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
                  <p className="font-medium text-gray-800 font-zen mt-3">5,980円（税込）〜</p>
                  <div className="text-center mt-6">
                    <Link href="/Fragrance-Lab">
                      <Button className="rounded-full bg-cyan-400 text-white px-6 py-2 text-sm hover:bg-cyan-500 transition w-full md:w-auto">
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
                    この香水は、アイドルグループ「Bloom」の世界観を香りで表現するプロジェクトの一環として制作されたケーススタディ作品です。
                  </p>
                  <p className="text-gray-700 font-zen mt-3">
                    当ブランドでは、10本からの小ロット生産にも対応しております。
                    アイドル・クリエイター・ブランド様の「空気感や魅力」を香りという形にしてお届けいたします。
                  </p>
                  <p className="text-gray-700 font-zen mt-3">
                    ご興味のある方は、お気軽にお問い合わせフォームよりご相談ください。
                  </p>
                  <div className="text-center mt-6">
                    <Link href="/contact">
                      <Button className="rounded-full bg-cyan-400 text-white px-6 py-2 text-sm hover:bg-cyan-500 transition w-full md:w-auto">
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
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-white rounded-full py-3 font-montserrat relative overflow-hidden group"
                  >
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span className="relative">カートに追加</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 関連商品セクション */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-medium mb-8 text-center text-secondary-foreground font-zen">
              その他のコラボレーション香水
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Link href="/showcase/silent-pulse">
                  <div className="relative aspect-[3/4] bg-white flex items-center justify-center">
                    <Image src="/images/silent-pulse.png" alt="Silent Pulse" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-4" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">Silent Pulse</h3>
                    <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">
                      都会の夜に浮かぶ、孤独と希望のグラデーション。Re:Noirが紡ぐ繊細な旋律と感情を香りで再構成。
                    </p>
                    <div className="flex justify-end">
                      <span className="text-primary text-sm flex items-center font-montserrat">
                        詳細を見る
                        <ArrowLeft className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Link href="/showcase/eternal-smoke">
                  <div className="relative aspect-[3/4] bg-white flex items-center justify-center">
                    <Image src="/images/eternal-smoke.png" alt="Eternal Smoke" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-4" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">Eternal Smoke</h3>
                    <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">
                      ネオンの残光、路地裏の静寂、その空気ごとまとうような、深く長いスモーキーな香り。
                    </p>
                    <div className="flex justify-end">
                      <span className="text-primary text-sm flex items-center font-montserrat">
                        詳細を見る
                        <ArrowLeft className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Link href="/showcase/erina-grace">
                  <div className="relative aspect-[3/4] bg-white flex items-center justify-center">
                    <Image src="/images/erina-grace.png" alt="Erina Grace" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-4" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">Erina Grace</h3>
                    <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">
                      凛とした佇まいと、どこか儚げな微笑み。触れれば消えてしまいそうな透明感と、心に残る芯の強さ。
                    </p>
                    <div className="flex justify-end">
                      <span className="text-primary text-sm flex items-center font-montserrat">
                        詳細を見る
                        <ArrowLeft className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

