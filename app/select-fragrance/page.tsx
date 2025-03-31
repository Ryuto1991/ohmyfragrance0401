"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function SelectFragrancePage() {
  // ページトップへのスクロール処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }
  }, [])

  // 香りのデータ
  const fragrances = [
    {
      id: "rose-blossom",
      name: "ローズブロッサム",
      category: "フローラル系",
      description: "華やかで濃厚なフローラルに、甘さと温もりを添えて。ギフトにおすすめ。",
      emoji: "🌹",
    },
    {
      id: "citrus-shower",
      name: "シトラスシャワー",
      category: "シトラス系",
      description: "朝のシャワーのように清涼感あふれるフレッシュな香り。",
      emoji: "🍋",
    },
    {
      id: "sweet-dream",
      name: "スウィートドリーム",
      category: "スイート系",
      description: "甘く優しい眠りを誘う、穏やかで包容力のある香り。",
      emoji: "🍯",
    },
    {
      id: "myrrh-night",
      name: "ミルラナイト",
      category: "オリエンタル系",
      description: "神秘的な香煙のように、奥深く官能的な香り。",
      emoji: "🌙",
    },
    {
      id: "deep-forest",
      name: "ディープフォレスト",
      category: "ウッディ系",
      description: "静かな森の奥で深呼吸するような、心落ち着く香り。",
      emoji: "🌲",
    },
    {
      id: "blue-wave",
      name: "ブルーウェイブ",
      category: "マリン系",
      description: "海辺の風とハーブの清涼感が広がる、爽快マリン系。",
      emoji: "🌊",
    },
    {
      id: "hot-spice",
      name: "ホットスパイス",
      category: "スパイシー系",
      description: "心と身体を温める、エネルギッシュなスパイシー系。",
      emoji: "🔥",
    },
    {
      id: "herbal-green",
      name: "ハーバルグリーン",
      category: "ハーバル系",
      description: "ハーブと木の力強さが調和した、爽やかで芯のある香り。",
      emoji: "🌿",
    },
    {
      id: "vanilla-comfort",
      name: "バニラコンフォート",
      category: "バニラ系",
      description: "優しく包み込むような、心地よいバニラの甘い香り。",
      emoji: "🍦",
    },
    {
      id: "musk-elegance",
      name: "ムスクエレガンス",
      category: "ムスク系",
      description: "洗練された大人の魅力を引き立てる、上品で官能的な香り。",
      emoji: "✨",
    },
  ]

  // 制作事例データ
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
      id: 3,
      title: "Eternal Smoke",
      description: "ネオンの残光、路地裏の静寂、その空気ごとまとうような、深く長いスモーキーな香り。",
      image: "/images/eternal-smoke.png",
      category: "アーティストコラボ",
      slug: "eternal-smoke",
    },
    {
      id: 5,
      title: "Bloom Whisper",
      description: "花々の囁きに耳を傾ける。春の訪れを告げる、優しく華やかな香り。",
      image: "/images/bloom-whisper.png",
      category: "アーティストコラボ",
      slug: "bloom-whisper",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヒーローセクション */}
        <section className="relative py-20 overflow-hidden">
          {/* 背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>

          {/* 装飾要素 - 浮遊する香りの粒子 */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full bg-gradient-to-r ${
                  i % 3 === 0
                    ? "from-pink-200 to-pink-100"
                    : i % 3 === 1
                      ? "from-purple-200 to-purple-100"
                      : "from-blue-200 to-blue-100"
                } opacity-${20 + (i % 4) * 10}`}
                style={{
                  width: `${20 + Math.random() * 40}px`,
                  height: `${20 + Math.random() * 40}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  transform: `scale(${0.5 + Math.random() * 0.5})`,
                }}
              ></div>
            ))}
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              {/* 左側：テキストとCTA */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl md:text-5xl font-medium mb-4 text-gray-800 font-zen leading-tight">
                    <span className="block mb-2">"好き"を詰め込んだ、</span>
                    <span className="block">わたしだけの香り。</span>
                  </h1>
                  <p className="text-gray-700 font-zen text-lg md:text-xl leading-relaxed mt-4">
                    香りも、ボトルも、ラベルも選ぶだけ！
                  </p>
                  <div className="mt-3">
                    <p className="text-gray-600 font-zen text-sm">人気の香り10種類 × 2種のボトル × 好きなラベル画像</p>
                    <p className="text-gray-600 font-zen text-sm mt-1">
                      2週間でお手元に。<span className="font-bold text-base text-gray-800">1本 4,400円（税込）〜</span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-6"
                >
                  <Link href="/oh-my-custom">
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 font-zen text-lg shadow-md hover:shadow-lg transition-all">
                      セレクト香水を注文する
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* 右側：イメージ */}
              <div className="w-full md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/scent-picks-hero.png"
                      alt="セレクト香水プラン"
                      width={600}
                      height={600}
                      className="w-full rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent mix-blend-overlay rounded-2xl"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* アニメーション用のスタイル */}
          <style jsx global>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0) rotate(0deg);
              }
              50% {
                transform: translateY(-20px) rotate(5deg);
              }
            }
          `}</style>
        </section>

        {/* 注文の流れセクション */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium mb-4 text-gray-800 font-zen">セレクト香水の注文の流れ</h2>
              <p className="text-gray-600 font-zen max-w-2xl mx-auto">
                簡単4ステップで、あなただけのオリジナル香水が完成します。
                お好みの香りとボトルを選び、オリジナル画像をアップロードしましょう！
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-full max-w-4xl">
                <Image
                  src="/images/fragrance-order-flow.png"
                  alt="セレクト香水の注文の流れ"
                  width={1000}
                  height={600}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 香り紹介セクション */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium mb-4 text-gray-800 font-zen">10種類の香りから選べる</h2>
              <p className="text-gray-600 font-zen max-w-2xl mx-auto">
                あなたの好みや気分に合わせて、10種類の厳選された香りからお選びいただけます。
                それぞれの香りには個性があり、あなたらしさを表現します。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fragrances.map((fragrance, index) => (
                <motion.div
                  key={fragrance.id}
                  className="bg-white rounded-lg p-6 hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{fragrance.emoji}</span>
                    <h3 className="text-xl font-medium text-gray-800 font-zen">{fragrance.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-zen mb-2">{fragrance.category}</p>
                  <p className="text-gray-700 font-zen">{fragrance.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ギフトセクション */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium mb-4 text-gray-800 font-zen">ギフトにもおすすめ</h2>
              <p className="text-gray-600 font-zen max-w-2xl mx-auto">
                大切な人への贈り物に、セレクト香水はいかがですか？<br />
                ギフトボックスやメッセージカードもご用意しています。
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-800 font-zen">ギフトボックス</h3>
                  <p className="text-gray-600 font-zen mb-6">
                    高級感のあるギフトボックスと4色から選べるリボンで、特別な贈り物に。 メッセージカードも追加できます。
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-zen">ギフトボックス（+500円）</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-zen">4色から選べるリボン</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-zen">メッセージカード（+200円）</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="relative h-[300px]">
                    <Image src="/images/gift-box.png" alt="ギフトボックス" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-16 bg-gradient-to-r from-blue-100 to-pink-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-medium mb-6 text-gray-800 font-zen">セレクト香水を作りませんか？</h2>
              <p className="text-gray-700 font-zen mb-8 text-lg">
                10種類の香りから選んで、ボトルとラベルを簡単カスタマイズ。
                <br />
                4,400円～ギフトや推し香水がつくれます！
              </p>
              <div className="flex justify-center">
                <Link href="/select-fragrance-order">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-4 text-lg font-zen">
                    セレクト香水をつくる
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 制作事例紹介セクション */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium mb-4 text-gray-800 font-zen">制作事例紹介</h2>
              <p className="text-gray-600 font-zen max-w-2xl mx-auto">
                アーティストやブランドとのコラボレーションで生まれた、個性豊かな香りの数々をご紹介します。
                あなただけの香りづくりの参考にしてください。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {showcaseItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Link href={`/showcase/${item.slug}`}>
                    <div className="relative aspect-[3/4]">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">{item.title}</h3>
                      <p className="text-sm text-secondary-foreground/70 mb-4 font-zen line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex justify-end">
                        <span className="text-primary text-sm flex items-center font-montserrat">詳細を見る</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/showcase">
                <Button
                  variant="outline"
                  className="rounded-full border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 font-zen"
                >
                  すべての制作事例を見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

