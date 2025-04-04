"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { MessageSquare, Package, Gift } from "lucide-react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import FragranceSearch from "@/components/fragrance-search"

export default function ConceptPage() {
  const pathname = usePathname()

  // 料金プランセクションの参照を作成
  const pricingRef = useRef(null)
  const isPricingInView = useInView(pricingRef, { once: true, amount: 0.2, margin: "-100px 0px" })

  // ページトップへのスクロール処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヘッダーセクション */}
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-medium mb-4 text-secondary-foreground font-zen">コンセプト</h1>
                <h2 className="text-xl font-medium mb-3 text-secondary-foreground/70 font-zen">
                  香りで、自分らしさをもっと自由に
                </h2>
                <p className="text-secondary-foreground/70 mb-8 font-zen">
                  Oh my
                  fragranceは、AIの分析力と人の感性をかけあわせて、これまでにない香りの体験を届けます。誰もが自分らしい香りで毎日を彩れる世界を、私たちは目指しています。
                </p>
              </motion.div>
              <motion.div
                className="relative h-[300px] md:h-[400px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image
                  src="/images/concept_main.webp"
                  alt="Oh My Fragranceのコンセプト"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  quality={100}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 香水つくりのプロセス */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-medium mb-8 text-secondary-foreground font-zen">
                香水作りのプロセス
              </h2>
              <p className="text-xl text-secondary-foreground/70 mb-12 font-zen">
                あなたの好みに合わせて、AIが最適な香りを提案します
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-primary text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">AIとの対話</h3>
                  <p className="text-secondary-foreground/70 font-zen">
                    好みやイメージをAIと対話しながら、あなただけの香りをデザインします
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-primary text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">香りの提案</h3>
                  <p className="text-secondary-foreground/70 font-zen">
                    AIが最適な香りの組み合わせを提案し、あなたの好みに合わせて調整します
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-primary text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">完成</h3>
                  <p className="text-secondary-foreground/70 font-zen">
                    世界にひとつだけの、あなただけの香りが完成します
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ブランドストーリーセクション - 更新 */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-medium mb-8 text-secondary-foreground font-zen text-center">
                Oh my fragranceについて
              </h2>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div className="relative h-[300px]">
                  <Image
                    src="/images/concept_ai.webp"
                    alt="AIとつくる、あなただけの香り"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                    AIとつくる、あなただけの香り
                  </h3>
                  <p className="text-secondary-foreground/70 font-zen mb-4">
                    Oh my
                    fragranceは、AIと対話しながら自分だけのフレグランスをつくれる世界初のサービスとして誕生しました。香りはもっと自由で、もっとパーソナルなものであるべき。そんな思いから、テクノロジーと香りの融合によって、誰もが簡単に「自分らしい香り」と出会える仕組みを実現しました。
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">
                    クリーンラボから届く、こだわりの一本
                  </h3>
                  <p className="text-secondary-foreground/70 font-zen">
                    私たちのすべてのフレグランスは、衛生的なラボで一つひとつ丁寧に手作りされています。ルームフレグランスとして安心して使える品質にも徹底的にこだわっています。
                  </p>
                </div>
                <div className="relative h-[300px] order-1 md:order-2">
                  <Image
                    src="/images/concept_lab.webp"
                    alt="クリーンラボから届く、こだわりの一本"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 料金プランセクション */}
        <section className="py-16" ref={pricingRef}>
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-medium mb-2 text-secondary-foreground font-zen">料金プラン</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-secondary-foreground/70 font-zen">お好みに合わせて3つのプランからお選びいただけます。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Custom Plan */}
              <motion.div
                className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              >
                <div className="bg-primary text-white p-4 -mt-8 -mx-8 mb-6 relative">
                  <span className="absolute -top-3 right-4 bg-yellow-400 text-xs text-black px-2 py-1 rounded-full font-bold shadow-sm">
                    人気の香りを選ぶ
                  </span>
                  <h3 className="text-xl font-medium text-center font-zen">Oh my custom</h3>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-sm font-zen">価格：</span>
                    <span className="text-2xl font-bold ml-2 font-zen">4,980円</span>
                    <span className="text-sm ml-1 font-zen">（税込・送料無料）</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">内容量：30ml</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">人気の香り10種から1つを選択</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">お好きな画像をラベルに印刷（写真・イラスト・ロゴなどOK）</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">納期目安：ご注文から約2週間前後</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">配送方法：ゆうパケット（追跡可能）</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-accent-light/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-accent-light text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">
                      決済方法：クレジットカード / Apple Pay / Google Pay / コンビニ支払い
                    </span>
                  </li>
                </ul>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-500 font-zen">※＋550円でギフト包装（ギフトボックス＋宅急便コンパクト配送）をご利用いただけます。</p>
                </div>
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href="/oh-my-custom" replace>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 font-montserrat relative overflow-hidden group">
                        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                        <span className="relative">好きな香りを見つける</span>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Fragrance Lab */}
              <motion.div
                className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 border-2 border-accent-light relative z-10 transform scale-[1.02]"
                initial={{ opacity: 0, y: 30 }}
                animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              >
                <div className="bg-accent-light text-white p-4 -mt-8 -mx-8 mb-6 relative">
                  <span className="absolute -top-3 right-4 bg-yellow-400 text-xs text-black px-2 py-1 rounded-full font-bold shadow-sm">
                    AIと香りをつくる
                  </span>
                  <h3 className="text-xl font-medium text-center font-zen">Fragrance Lab</h3>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-sm font-zen">価格：</span>
                    <span className="text-2xl font-bold ml-2 font-zen">5,980円</span>
                    <span className="text-sm ml-1 font-zen">（税込・送料無料）</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">内容量：30ml</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">AIがあなたのイメージに合わせて香りをブレンド</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">香水の名前もAIがご提案</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">お好きな画像をラベルに印刷（写真・イラスト・ロゴなどOK）</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">納期目安：ご注文から約2週間前後</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">配送方法：ゆうパケット（追跡可能）</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">
                      決済方法：クレジットカード / Apple Pay / Google Pay / コンビニ支払い
                    </span>
                  </li>
                </ul>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-500 font-zen">※＋550円でギフト包装（ギフトボックス＋宅急便コンパクト配送）をご利用いただけます。</p>
                </div>
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href="/fragrance-lab" replace>
                      <Button className="bg-accent-light hover:bg-accent-light/90 text-white rounded-full px-6 py-2 font-montserrat relative overflow-hidden group">
                        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                        <span className="relative">AIと一緒に香りをつくる</span>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Fragrance Pro */}
              <motion.div
                className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              >
                <div className="bg-gray-800 text-white p-4 -mt-8 -mx-8 mb-6 relative">
                  <span className="absolute -top-3 right-4 bg-yellow-400 text-xs text-black px-2 py-1 rounded-full font-bold shadow-sm">
                    企業・ブランド向け
                  </span>
                  <h3 className="text-xl font-medium text-center font-zen">Fragrance Pro</h3>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-sm font-zen">価格：</span>
                    <span className="text-xl font-bold ml-2 font-zen">応相談</span>
                    <span className="text-sm ml-1 font-zen">（内容によりお見積もり）</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">同レシピ・複数ラベルで10本以上の注文に対応</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">ギフト・ノベルティ・法人利用にもおすすめ</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">本数により単価調整・納期のご相談可能</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">配送方法・納品形態など柔軟に対応いたします</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">画像ラベル対応（テンプレ・カスタムいずれも可）</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      <span className="text-gray-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm font-zen">決済方法：ご相談に応じます</span>
                  </li>
                </ul>
                <div className="space-y-2 mb-6">
                </div>
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href="/contact" replace>
                      <Button className="bg-gray-800 hover:bg-gray-700 text-white rounded-full px-6 py-2 font-montserrat relative overflow-hidden group">
                        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                        <span className="relative">プロに相談する</span>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
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
              <p className="text-secondary-foreground/70 mb-6 font-zen">
                AIとの対話を通じて、あなたの個性や好みを反映したオリジナルフレグランスを作成できます。
                今すぐ体験して、世界にひとつだけの香りを見つけましょう。
              </p>
              <p className="text-lg font-medium text-primary mb-6 font-zen">Fragrance Lab　5,980円（税込）〜</p>

              <div className="max-w-xl mx-auto">
                <FragranceSearch />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

