"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { usePathname } from "next/navigation"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"

// サンプルの制作事例データ
const showcaseItems = [
  {
    id: 4,
    title: "Erina Grace",
    description: "凛とした佇まいと、どこか儚げな微笑み。触れれば消えてしまいそうな透明感と、心に残る芯の強さ。",
    image: "/images/erina-grace.png",
    category: "コンテンツコラボ",
    slug: "erina-grace",
  },
  {
    id: 5,
    title: "Silent Pulse",
    description: "都会の夜に浮かぶ、孤独と希望のグラデーション。Re:Noirが紡ぐ繊細な旋律と感情を香りで再構成。",
    image: "/images/silent-pulse.png",
    category: "コンテンツコラボ",
    slug: "silent-pulse",
  },
  {
    id: 2,
    title: "Soap Bubble Daydream",
    description: "朝露のように繊細で、どこか懐かしい。ふとした瞬間に浮かぶ、シャボンのような夢の記憶。",
    image: "/images/soap-bubble-daydream-new.png",
    category: "アーティストコラボ",
    slug: "soap-bubble-daydream",
  },
  {
    id: 3,
    title: "Eternal Smoke",
    description: "ネオンの残光、路地裏の静寂、その空気ごとまとうような、深く長いスモーキーな香り。",
    image: "/images/eternal-smoke.png",
    category: "アーティストコラボ",
    slug: "eternal-smoke",
  },
  {
    id: 6,
    title: "Bloom Whisper",
    description: "ほんのり甘くて、透明感のある香り。春の朝、そっと風に揺れる花のような、やさしく可憐なフレグランス。",
    image: "/images/bloom-whisper.png",
    category: "コンテンツコラボ",
    slug: "bloom-whisper",
  },
]

// カテゴリーのリスト
const categories = ["すべて", "アーティストコラボ", "コンテンツコラボ"]

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [isFirstRender, setIsFirstRender] = useState(true)
  const pathname = usePathname()

  // ページトップへのスクロール処理を確実に実行するように修正
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

  // カテゴリーでフィルタリングした制作事例
  const filteredItems =
    selectedCategory === "すべて" ? showcaseItems : showcaseItems.filter((item) => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヘッダーセクション */}
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1
                className="text-3xl md:text-4xl font-medium mb-4 text-secondary-foreground font-zen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                制作事例
              </motion.h1>
              <motion.p
                className="text-secondary-foreground/70 mb-8 font-zen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Oh my fragranceでは、香りを通して"その人らしさ"を表現することを大切にしています。
                <br />
                ここでは、私たちがこれまでにかたちにしてきた香りの一部をご紹介します。
              </motion.p>
            </div>
          </div>
        </section>

        {/* カテゴリーフィルター */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-montserrat transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-white text-secondary-foreground hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 制作事例グリッド */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Link href={`/showcase/${item.slug}`}>
                    <div className="relative aspect-[3/4] bg-white flex items-center justify-center">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={85}
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">{item.title}</h3>
                      <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">{item.description}</p>
                      <div className="flex justify-end">
                        <span className="text-primary text-sm flex items-center font-montserrat">
                          詳細を見る
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">
                あなただけの香りを見つけませんか？
              </h2>
              <p className="text-secondary-foreground/70 mb-8 font-zen">
                AIとの対話を通じて、あなたの個性や好みを反映したオリジナルフレグランスを作成できます。
                今すぐ体験して、世界にひとつだけの香りを見つけましょう。
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  className="mt-12 bg-accent-light hover:bg-accent-light/90 text-white rounded-full px-8 py-3 font-montserrat text-lg relative overflow-hidden group"
                  asChild
                >
                  <Link href="/Fragrance-Lab">
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <span className="relative">Fragrance Labを体験する</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

