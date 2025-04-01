"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageSquare, Package, Gift, ChevronDown, ChevronUp } from "lucide-react"
import { motion, useInView, LazyMotion, domAnimation } from "framer-motion"
import dynamic from 'next/dynamic'

import { Button } from "@/components/ui/button"
import FloatingElements from "@/components/floating-elements"
import InfoBox from "@/components/info-box"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"

// 遅延読み込みするコンポーネント
const AutoScrollShowcase = dynamic(() => import('@/components/auto-scroll-showcase'), {
  loading: () => <div className="h-96 bg-white/50 animate-pulse" />,
  ssr: false
})

const FragranceSearch = dynamic(() => import('@/components/fragrance-search'), {
  loading: () => <div className="h-12 bg-white/50 animate-pulse rounded-lg" />,
  ssr: false
})

// アニメーションの設定を定数化
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1],
    delay: 0.1
  }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { 
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1]
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1]
  }
}

// アニメーションの遅延を最適化
const processSteps = [
  {
    icon: <MessageSquare className="h-8 w-8 text-secondary-foreground" />,
    title: "ステップ 1",
    subtitle: "AIと香りを決める",
    description: "AIがあなたとの会話を通じて香りの好みや気分を読み取り、あなただけの香りのレシピを一緒に作ります。",
    delay: 0.1
  },
  {
    icon: <Package className="h-8 w-8 text-secondary-foreground" />,
    title: "ステップ 2",
    subtitle: "パッケージの選択",
    description: "お好みのボトルデザインとパッケージを選択いただけます。あなただけの特別な一本をつくりましょう。",
    delay: 0.3
  },
  {
    icon: <Gift className="h-8 w-8 text-secondary-foreground" />,
    title: "ステップ 3",
    subtitle: "お手元にお届け",
    description: "丁寧に調合されたフレグランスを美しいパッケージに入れて、大切にお届けいたします。",
    delay: 0.5
  }
]

// アニメーションの最適化
const motionConfig = {
  viewport: { once: true, margin: "-100px", amount: 0.2 },
  transition: { 
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1]
  },
  style: { willChange: "transform, opacity" }
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // 料金プランセクションの参照を作成
  const pricingRef = useRef(null)
  const isPricingInView = useInView(pricingRef, { once: true, amount: 0.2, margin: "-100px 0px" })

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "AIはどのように香りを選んでくれますか？",
      answer:
        "AIは、お客様との対話を通じて好みや気分、使用シーンなどを分析し、最適な香りの組み合わせを提案します。過去の調香データや香りの相性なども考慮して、お客様だけのオリジナルレシピを作成します.",
    },
    {
      question: "肌につけても大丈夫ですか？",
      answer:
        "肌に直接つけずに、フレグランススプレーとして、空間または布製品や衣類にご使用ください。ただし、白い生地や床素材によっては変色や変質などの恐れがあるので、取り扱う前には軽く目立たない場所でテストしてから使用することをおすすめします。万が一、目や肌について異常を感じた場合は、流水で流し、すぐに医師の診断を受けて下さい.",
    },
    {
      question: "香りの持続時間はどのくらいですか？",
      answer:
        "香りの持続時間は、使用環境や香りの種類によって異なりますが、一般的に4〜6時間程度持続します。ただし、シトラス系の香りは比較的短く、ウッディやオリエンタル系の香りは長く持続する傾向があります.",
    },
    {
      question: "注文から届くまでどのくらいかかりますか？",
      answer:
        "ご注文確定後、調合や品質チェックを経て、約2週間前後でお届けいたします。繁忙期や特殊なご要望がある場合は、さらにお時間をいただく場合がございます.",
    },
    {
      question: "返品・返金は可能ですか？",
      answer: "注文完了し、製造開始に進みますとキャンセル不可となります。ご了承お願い致します.",
    },
  ]

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-secondary overflow-x-hidden font-zen">
        <SiteHeader />

        <main className="pt-28 pb-20 relative">
          <FloatingElements />

          {/* Hero Section */}
          <section className="relative bg-secondary mb-4">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-medium mb-6 leading-tight text-secondary-foreground font-zen">
                    <motion.span
                      className="tracking-in-expand block"
                      {...fadeInUp}
                      transition={{ 
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.2
                      }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      あなたの言葉が、
                    </motion.span>
                    <motion.span
                      className="tracking-in-expand block"
                      {...fadeInUp}
                      transition={{ 
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.4
                      }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      香りになる。
                    </motion.span>
                  </h1>

                  <motion.p
                    className="text-lg md:text-xl text-secondary-foreground mb-4 font-zen"
                    {...fadeInUp}
                    transition={{ delay: 0.7 }}
                    style={{ willChange: "transform, opacity" }}
                  >
                    AIとつくる、あなただけのフレグランス。
                  </motion.p>

                  <motion.p
                    className="text-sm text-secondary-foreground/70 mb-8 max-w-md font-zen"
                    {...fadeInUp}
                    transition={{ delay: 0.8 }}
                    style={{ willChange: "transform, opacity" }}
                  >
                    Oh my fragranceは、AIと会話しながら"あなただけの香り"を
                    <br />
                    一緒につくるカスタムフレグランスサービスです。
                  </motion.p>

                  <motion.div
                    {...fadeInUp}
                    transition={{ delay: 1.0 }}
                    className="w-full max-w-xl"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <FragranceSearch />
                  </motion.div>

                  {/* Info Boxes - スマホ版では上部に表示 */}
                  <div className="flex flex-row space-x-2 mt-8 md:hidden justify-center">
                    <motion.div
                      {...fadeInUp}
                      transition={{ delay: 1.2 }}
                      className="w-32"
                      style={{ willChange: "transform, opacity" }}
                    >
                      <InfoBox
                        title="価格"
                        description={
                          <>
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-xs">税込・送料無料</span>
                              <span className="text-base font-bold text-secondary-foreground">4,980円～</span>
                            </div>
                          </>
                        }
                      />
                    </motion.div>
                    <motion.div
                      {...fadeInUp}
                      transition={{ delay: 1.4 }}
                      className="w-32"
                      style={{ willChange: "transform, opacity" }}
                    >
                      <InfoBox
                        title="全国発送"
                        description={
                          <>
                            <span className="text-xs">ご注文から</span>
                            <br />
                            <span className="font-bold text-secondary-foreground text-base">3週間以内</span>
                          </>
                        }
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="relative hidden md:block">
                  {/* Info Boxes - PC版では画像の上に表示 */}
                  <div className="absolute top-0 right-0 flex flex-row space-x-2 z-10">
                    <motion.div
                      {...fadeInUp}
                      transition={{ delay: 1.2 }}
                      className="w-32"
                      style={{ willChange: "transform, opacity" }}
                    >
                      <InfoBox
                        title="価格"
                        description={
                          <>
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-xs">税込・送料無料</span>
                              <span className="text-base font-bold text-secondary-foreground">4,980円～</span>
                            </div>
                          </>
                        }
                      />
                    </motion.div>
                    <motion.div
                      {...fadeInUp}
                      transition={{ delay: 1.4 }}
                      className="w-32"
                      style={{ willChange: "transform, opacity" }}
                    >
                      <InfoBox
                        title="全国発送"
                        description={
                          <>
                            <span className="text-xs">ご注文から</span>
                            <br />
                            <span className="font-bold text-secondary-foreground text-base">3週間以内</span>
                          </>
                        }
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                    className="relative aspect-square md:aspect-auto md:h-[550px] md:-mr-8 md:mt-[-50px]"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <Image
                      src="/images/fragrance-bottles.png"
                      alt="Oh My Fragranceのラインナップ"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                      quality={100}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* 以下は変更なし */}
          {/* 制作事例セクション（自動スクロール） - 香水作りのプロセスの上に配置 */}
          <section className="mb-16">
            <Suspense fallback={<div className="h-96 bg-white/50 animate-pulse" />}>
              <AutoScrollShowcase />
            </Suspense>
          </section>

          {/* Process Section */}
          <section className="mb-24">
            <div className="container mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <motion.h2
                  className="text-2xl font-medium mb-2 text-secondary-foreground font-zen"
                  {...fadeInUp}
                  viewport={{ once: true, margin: "-100px" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  香水作りのプロセス
                </motion.h2>
                <motion.p
                  className="text-secondary-foreground/70 font-montserrat"
                  {...fadeInUp}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  あなたの好みに合わせて、AIが最適な香りを提案します
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Process steps with optimized animations */}
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px", amount: 0.2 }}
                    transition={{ 
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                      delay: step.delay
                    }}
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-secondary-foreground font-medium mb-1 font-zen">{step.title}</h3>
                    <h4 className="text-primary-light font-medium mb-3 font-montserrat">{step.subtitle}</h4>
                    <p className="text-sm text-secondary-foreground/70 font-zen">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 料金プランセクション */}
          <section className="py-16" ref={pricingRef}>
            <div className="container mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-medium mb-2 text-secondary-foreground font-zen">料金プラン</h2>
                <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Custom Plan */}
                <motion.div
                  className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.2
                  }}
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
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
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
                  className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-500 border-2 border-accent-light relative z-10 transform scale-[1.02]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.1
                  }}
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
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <Link href="/Fragrance-Lab" replace>
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
                  className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isPricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.3
                  }}
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
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
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

          {/* About Section */}
          <section className="mb-24">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div
                  className="max-w-xl"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                >
                  <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">ABOUT</h2>
                  <p className="text-lg md:text-xl text-secondary-foreground/70 mb-12 font-zen">
                    Oh my fragranceは、AIを活用したオリジナルフレグランス作成サービスです。
                    あなたの好みや気分に合わせて、世界にひとつだけの香りを提案します。
                  </p>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} >
                    <Link href="/concept" replace>
                      <Button
                        variant="outline"
                        className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat"
                      >
                        詳しく見る
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="relative w-full md:w-2/5 h-[300px] md:ml-auto"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/424eafcc-4b50-44b5-b02b-d702b768972c-jquvl9BYL5NvChtVCu2hOguaF0hifM.png"
                    alt="Oh my fragranceのボトル"
                    fill
                    className="object-contain object-right"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* 「あなただけの香りを見つける」セクションを先に配置 */}
          <section className="mb-16">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                className="bg-white p-8 md:p-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="max-w-2xl mx-auto text-center">
                  <div className="relative z-10 text-center">
                    <motion.h2
                      className="text-2xl font-medium text-secondary-foreground font-zen mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      あなただけの香りを見つけませんか？
                    </motion.h2>
                    <motion.p
                      className="text-lg text-secondary-foreground/70 mt-4 font-zen max-w-xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      AIとの対話を通じて、あなたの個性や好みを反映したオリジナルフレグランスを作成できます。
                      <br />
                      今すぐ体験して、世界にひとつだけの香りを見つけましょう。
                    </motion.p>

                    <motion.p
                      className="text-2xl font-bold mt-6 mb-6 text-primary font-zen"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      5,980円（税込）〜
                    </motion.p>

                    {/* 検索バー (FragranceSearchコンポーネントを使用) */}
                    <motion.div
                      className="mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {/* placeholderプロップを削除してデフォルトのランダム表示にする */}
                      <div className="inline-block w-full max-w-xl mx-auto">
                        <FragranceSearch />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 「よくあるご質問」セクションを後に配置 */}
          <section>
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                className="bg-white p-8 md:p-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-medium mb-8 text-secondary-foreground font-zen text-center">
                    よくあるご質問
                  </h2>

                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px", amount: 0.2 }}
                        transition={{ 
                          duration: 0.8,
                          ease: [0.4, 0, 0.2, 1],
                          delay: index * 0.2
                        }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <div
                          className={`p-4 flex justify-between items-center cursor-pointer ${
                            openFaq === index ? "bg-primary/5" : "bg-white"
                          }`}
                          onClick={() => toggleFaq(index)}
                        >
                          <h3 className="font-medium text-secondary-foreground font-zen">Q. {faq.question}</h3>
                          <div className="flex-shrink-0 ml-2">
                            {openFaq === index ? (
                              <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-secondary-foreground" />
                            )}
                          </div>
                        </div>
                        {openFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4"
                          >
                            <p className="text-secondary-foreground/70 text-sm font-zen">A. {faq.answer}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </LazyMotion>
  )
}

