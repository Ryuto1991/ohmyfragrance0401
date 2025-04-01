"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import NewsletterSubscription from "@/components/newsletter-subscription"

// サンプルのブログ記事データ
const blogPosts = [
  {
    id: 1,
    title: "香水の基本：香りの種類と選び方",
    excerpt:
      "香水選びに迷ったことはありませんか？こ���記事では、香りの種類や自分に合った香水の選び方について解説します。",
    image: "/placeholder.svg?height=400&width=600&text=香水の基本",
    category: "基礎知識",
    date: "2025-01-15",
    readTime: "5分",
    slug: "perfume-basics",
  },
  {
    id: 2,
    title: "AIが変える香水業界の未来",
    excerpt:
      "テクノロジーの進化により、香水業界にも大きな変革が起きています。AIを活用した新しい調香技術とその可能性について探ります。",
    image: "/placeholder.svg?height=400&width=600&text=AI×香水",
    category: "トレンド",
    date: "2025-01-10",
    readTime: "7分",
    slug: "ai-future-perfume",
  },
  {
    id: 3,
    title: "季節に合わせた香りの楽しみ方",
    excerpt: "春夏秋冬、それぞれの季節に合った香りの選び方と楽しみ方をご紹介します。季節感のある香りで日常に彩りを。",
    image: "/placeholder.svg?height=400&width=600&text=季節の香り",
    category: "ライフスタイル",
    date: "2025-01-05",
    readTime: "4分",
    slug: "seasonal-fragrances",
  },
  {
    id: 4,
    title: "香水の正しいつけ方とマナー",
    excerpt:
      "香水は適切な量と場所につけることで、より魅力的に香ります。TPOに合わせた香水の使い方とマナーについて解説します。",
    image: "/placeholder.svg?height=400&width=600&text=香水のマナー",
    category: "基礎知識",
    date: "2024-12-28",
    readTime: "6分",
    slug: "perfume-etiquette",
  },
  {
    id: 5,
    title: "世界の有名調香師とその作品",
    excerpt:
      "香水業界を牽引する世界的な調香師たちとその代表作について紹介します。彼らの創造性と情熱から生まれた名作の数々。",
    image: "/placeholder.svg?height=400&width=600&text=調香師",
    category: "歴史・文化",
    date: "2024-12-20",
    readTime: "8分",
    slug: "famous-perfumers",
  },
  {
    id: 6,
    title: "香りと記憶の不思議な関係",
    excerpt:
      "香りには記憶を呼び起こす強い力があります。香りと脳の関係性や、香りが私たちの感情や記憶に与える影響について探ります。",
    image: "/placeholder.svg?height=400&width=600&text=香りと記憶",
    category: "科学",
    date: "2024-12-15",
    readTime: "6分",
    slug: "scent-memory",
  },
]

// カテゴリーのリスト
const categories = ["すべて", "基礎知識", "トレンド", "ライフスタイル", "歴史・文化", "科学"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [searchQuery, setSearchQuery] = useState("")

  // カテゴリーとキーワードでフィルタリングした記事
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "すべて" || post.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

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
                ブログ
              </motion.h1>
              <motion.p
                className="text-secondary-foreground/70 mb-8 font-zen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                香水の基礎知識やトレンド、AIと香りの関係など、 フレグランスに関する様々な情報をお届けします。
              </motion.p>

              {/* 検索フォーム */}
              <motion.div
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="記事を検索..."
                    className="pl-10 pr-4 py-2 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground/50" />
                </div>
              </motion.div>
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

        {/* ブログ記事一覧 */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-8">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <motion.article
                    key={post.id}
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
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative aspect-[16/9]">
                        <Image 
                          src={post.image || "/placeholder.svg"} 
                          alt={post.title} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={85}
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
                          {post.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-xs text-secondary-foreground/60 mb-2 font-montserrat">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(post.date)}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>読了時間: {post.readTime}</span>
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">{post.title}</h3>
                        <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">{post.excerpt}</p>
                        <div className="flex justify-end">
                          <span className="text-primary text-sm flex items-center font-montserrat">
                            続きを読む
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-foreground/70 font-zen">検索条件に一致する記事が見つかりませんでした。</p>
              </div>
            )}
          </div>
        </section>

        {/* ニュースレター登録セクション */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">ニュースレターを購読する</h2>
              <p className="text-secondary-foreground/70 mb-8 font-zen">
                最新の記事やフレグランスに関する情報を定期的にお届けします。
                メールアドレスをご登録いただくだけで簡単に購読できます。
              </p>
              <NewsletterSubscription />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

