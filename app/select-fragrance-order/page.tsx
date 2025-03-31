"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Upload, Check, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { motion } from "framer-motion"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useStripeCart } from "@/contexts/stripe-cart-context"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

const CUSTOM_FRAGRANCE_PRICE_ID = "price_custom_fragrance" // Stripeのカスタム香水用のPrice ID
const CUSTOM_FRAGRANCE_PRICE_NUMBER = 15000 // カスタム香水の価格
const CUSTOM_FRAGRANCE_NAME = "カスタム香水"
const CUSTOM_FRAGRANCE_IMAGE = "/images/select-fragrance-bottles.png"

export default function SelectFragranceOrderPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { addToCart } = useStripeCart()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 現在のステップを管理
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6 // Increased from 5 to 6

  useEffect(() => {
    setMounted(true)
  }, [])

  // ページトップへのスクロール処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }
  }, [currentStep]) // ステップが変わるたびにスクロールトップ

  // 選択状態の管理
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null)
  const [selectedBottle, setSelectedBottle] = useState<string | null>(null)
  const [selectedLabelSize, setSelectedLabelSize] = useState<string | null>(null) // New state for label size
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [options, setOptions] = useState({
    transparentLabel: false,
    uvPrint: false,
    giftBox: false,
    ribbonColor: "pink", // デフォルトのリボン色
    messageCard: false,
    messageText: "",
  })

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
      id: "eternal-smoke",
      name: "エターナルスモーク",
      category: "スモーキー系",
      description: "神聖でスモーキーな香りが長く残る、静謐なブレンド。",
      emoji: "💨",
    },
    {
      id: "fruity-blossom",
      name: "フルーティブロッサム",
      category: "フルーティフローラル系",
      description: "花と果実のハーモニーが弾ける、明るく軽やかな香り。",
      emoji: "🍑",
    },
  ]

  // ボトルのデータ
  const bottles = [
    {
      id: "clear-gold",
      name: "クリアゴールドキャップ30ml",
      image: "/images/clear-gold-bottle.png",
    },
    {
      id: "black-bottle",
      name: "マットブラック30ml",
      image: "/images/matte-black-bottle.png",
    },
  ]

  // ラベルサイズのデータ (New)
  const labelSizes = [
    {
      id: "large",
      name: "大きいサイズ",
      description: "ボトル全体に大きく表示",
      image: "/images/label-size-large.png",
    },
    {
      id: "medium",
      name: "中くらいサイズ",
      description: "バランスの良い標準サイズ",
      image: "/images/label-size-medium.png",
    },
    {
      id: "small",
      name: "小さいサイズ",
      description: "シンプルでエレガントな小さめサイズ",
      image: "/images/label-size-small.png",
    },
  ]

  // ラベルテンプレートのデータ
  const labelTemplates = [
    {
      id: "minimal",
      name: "ミニマル",
      image: "/images/minimal-label.png",
    },
    {
      id: "standard",
      name: "スタンダード",
      image: "/images/standard-label.png",
    },
  ]

  // リボンの色のデータ
  const ribbonColors = [
    {
      id: "pink",
      name: "ピンクリボン",
      emoji: "🎀",
      color: "bg-pink-300",
    },
    {
      id: "white",
      name: "ホワイトリボン",
      emoji: "🎀",
      color: "bg-gray-100",
    },
    {
      id: "navy",
      name: "ネイビーリボン",
      emoji: "🎀",
      color: "bg-blue-900",
    },
    {
      id: "green",
      name: "グリーンリボン",
      emoji: "🎀",
      color: "bg-green-500",
    },
  ]

  // 画像アップロード処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setSelectedLabel(null) // テンプレート選択をリセット
        setTimeout(() => goToNextStep(), 500) // Add this line to automatically proceed
      }
      reader.readAsDataURL(file)
    }
  }

  // オプション変更処理
  const handleOptionChange = (option: keyof typeof options, value?: any) => {
    setOptions((prev) => {
      // ギフトボックスがオフになった場合、関連オプションもリセット
      if (option === "giftBox" && !value) {
        return {
          ...prev,
          [option]: value !== undefined ? value : !prev[option],
          messageCard: false,
          messageText: "",
        }
      }

      // メッセージカードがオフになった場合、メッセージテキストもリセット
      if (option === "messageCard" && !value) {
        return {
          ...prev,
          [option]: value !== undefined ? value : !prev[option],
          messageText: "",
        }
      }

      return {
        ...prev,
        [option]: value !== undefined ? value : !prev[option],
      }
    })
  }

  // メッセージテキスト変更処理
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= 100) {
      // 100文字制限
      setOptions((prev) => ({
        ...prev,
        messageText: text,
      }))
    }
  }

  // 合計金額計算
  const calculateTotal = () => {
    let total = 4400 // 基本価格
    if (options.transparentLabel) total += 500
    if (options.uvPrint) total += 1200
    if (options.giftBox) total += 500
    if (options.messageCard) total += 200
    return total
  }

  // カートに追加
  const handleAddToCart = () => {
    if (!mounted) return

    if (!selectedFragrance) {
      alert("香りを選択してください")
      return
    }
    if (!selectedBottle) {
      alert("ボトルを選択してください")
      return
    }
    if (!selectedLabelSize) {
      alert("ラベルサイズを選択してください")
      return
    }
    if (!selectedLabel && !uploadedImage) {
      alert("ラベルを選択またはアップロードしてください")
      return
    }

    const selectedFragranceData = fragrances.find((f) => f.id === selectedFragrance)
    const selectedBottleData = bottles.find((b) => b.id === selectedBottle)
    const selectedLabelSizeData = labelSizes.find((s) => s.id === selectedLabelSize)
    const selectedLabelData = selectedLabel ? labelTemplates.find((l) => l.id === selectedLabel) : null

    // オプションの詳細を作成
    const optionDetails = []
    if (options.transparentLabel) optionDetails.push("透明シール印刷（+500円）")
    if (options.uvPrint) optionDetails.push("ボトルにUV印刷（+1,200円）")
    if (options.giftBox) {
      const ribbonName = ribbonColors.find((r) => r.id === options.ribbonColor)?.name || "ピンクリボン"
      optionDetails.push(`ギフトボックス - ${ribbonName}（+500円）`)
      if (options.messageCard) {
        optionDetails.push("メッセージカード（+200円）")
      }
    }

    // 詳細情報を含むdescriptionを作成
    const description = `
ボトル：${selectedBottleData?.name || ""}
ラベルサイズ：${selectedLabelSizeData?.name || ""}
ラベル：${selectedLabelData?.name || (uploadedImage ? "オリジナル" : "")}
${optionDetails.length > 0 ? `オプション：${optionDetails.join("、 ")}` : ""}
    `.trim()

    addToCart({
      priceId: CUSTOM_FRAGRANCE_PRICE_ID,
      name: `カスタム香水: ${selectedFragranceData?.name || ""}`,
      price: calculateTotal(),
      image: selectedBottle
        ? bottles.find((b) => b.id === selectedBottle)?.image || "/images/select-fragrance-bottles.png"
        : "/images/select-fragrance-bottles.png",
      quantity: 1
    })
  }

  // 会員登録せずに購入する処理
  const handleGuestCheckout = () => {
    if (!selectedFragrance) {
      alert("香りを選択してください")
      return
    }
    if (!selectedBottle) {
      alert("ボトルを選択してください")
      return
    }
    if (!selectedLabelSize) {
      alert("ラベルサイズを選択してください")
      return
    }
    if (!selectedLabel && !uploadedImage) {
      alert("ラベルを選択またはアップロードしてください")
      return
    }
    if (options.giftBox && !options.ribbonColor) {
      alert("リボンの色を選択してください")
      return
    }

    // カートに追加してからゲストチェックアウトページへ遷移
    handleAddToCart()
    router.push("/guest-checkout")
  }

  // 次のステップに進む
  const goToNextStep = () => {
    // 各ステップのバリデーション
    if (currentStep === 1 && !selectedFragrance) {
      return // Don't proceed if no fragrance is selected
    }
    if (currentStep === 2 && !selectedBottle) {
      return // Don't proceed if no bottle is selected
    }
    if (currentStep === 3 && !selectedLabelSize) {
      return // Don't proceed if no label size is selected
    }
    if (currentStep === 4 && !selectedLabel && !uploadedImage) {
      return // Don't proceed if no label is selected or uploaded
    }
    if (currentStep === 5 && options.giftBox && !options.ribbonColor) {
      return // Don't proceed if gift box is selected but no ribbon color
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      // Scroll to top after changing step
      window.scrollTo(0, 0)
    }
  }

  // 前のステップに戻る
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // ステップのタイトルを取得
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "香りを選んでください"
      case 2:
        return "ボトルを選んでください"
      case 3:
        return "ラベルサイズを選んでください"
      case 4:
        return "ラベル画像を選んでください"
      case 5:
        return "オプションを選んでください"
      case 6:
        return "注文内容を確認してください"
      default:
        return ""
    }
  }

  // ステップのラベルを取得
  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "香りを選ぶ"
      case 2:
        return "ボトルを選ぶ"
      case 3:
        return "サイズを選ぶ"
      case 4:
        return "画像を選ぶ"
      case 5:
        return "オプションを選ぶ"
      case 6:
        return "注文を確認"
      default:
        return ""
    }
  }

  // ステップが完了しているかチェック
  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return !!selectedFragrance
      case 2:
        return !!selectedBottle
      case 3:
        return !!selectedLabelSize
      case 4:
        return !!selectedLabel || !!uploadedImage
      case 5:
        // Only mark as completed if user has interacted with options
        // or explicitly chosen not to use any options
        return options.giftBox || currentStep > 5 // Mark as completed if user has moved past this step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヘッダーセクション */}
        <section className="bg-white py-6 mb-6">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-4">
              <Link href="/select-fragrance">
                <Button variant="outline" className="rounded-full border-gray-400 text-gray-700 hover:bg-gray-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  セレクト香水プランに戻る
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-medium text-secondary-foreground font-zen mb-2">
                セレクト香水オーダーフォーム
              </h1>
              <p className="text-secondary-foreground/70 font-zen">
                あなただけのオリジナル香水をカスタマイズしましょう。
              </p>
            </div>
          </div>
        </section>

        {/* ステップインジケーター */}
        <section className="bg-white py-4 mb-6 sticky top-20 z-10 shadow-sm">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1
                const isActive = currentStep === stepNumber
                const isCompleted = stepNumber < currentStep || isStepCompleted(stepNumber)

                return (
                  <div key={stepNumber} className="flex flex-col items-center relative flex-1">
                    {/* ステップ間の線 */}
                    {stepNumber < totalSteps && (
                      <div
                        className={`absolute top-5 w-full h-1 ${
                          stepNumber < currentStep ? "bg-primary" : "bg-gray-200"
                        }`}
                        style={{ left: "50%" }}
                      ></div>
                    )}

                    {/* ステップの円 */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted && !isActive ? <Check className="h-5 w-5" /> : stepNumber}
                    </div>

                    {/* ステップ名（モバイルでは非表示） */}
                    <span
                      className={`text-xs mt-2 hidden md:block ${
                        isActive ? "text-primary font-medium" : "text-gray-500"
                      }`}
                    >
                      {getStepLabel(stepNumber)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ステップコンテンツ */}
        <section className="bg-white rounded-lg shadow-sm mb-6">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-medium text-secondary-foreground font-zen mb-8 text-center">
                {getStepTitle(currentStep)}
              </h2>

              {/* Step 1: 香りを選ぶ */}
              {currentStep === 1 && (
                <div className="min-h-[400px]">
                  <RadioGroup value={selectedFragrance || ""} onValueChange={setSelectedFragrance}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fragrances.map((fragrance) => (
                        <div
                          key={fragrance.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedFragrance === fragrance.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedFragrance(fragrance.id)
                            // Use a shorter timeout to make it feel more responsive
                            setTimeout(() => goToNextStep(), 300)
                          }}
                        >
                          <div className="flex items-start">
                            <RadioGroupItem
                              value={fragrance.id}
                              id={`fragrance-${fragrance.id}`}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <div className="flex items-center">
                                <span className="text-2xl mr-2">{fragrance.emoji}</span>
                                <Label
                                  htmlFor={`fragrance-${fragrance.id}`}
                                  className="text-lg font-medium text-secondary-foreground font-zen"
                                >
                                  {fragrance.name}
                                </Label>
                              </div>
                              <p className="text-sm text-secondary-foreground/70 font-zen">{fragrance.category}</p>
                              <p className="text-sm text-secondary-foreground/80 mt-2 font-zen">
                                {fragrance.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 2: ボトルを選ぶ */}
              {currentStep === 2 && (
                <div className="min-h-[400px]">
                  <RadioGroup value={selectedBottle || ""} onValueChange={setSelectedBottle}>
                    <div className="flex justify-center gap-10">
                      {bottles.map((bottle) => (
                        <div
                          key={bottle.id}
                          className={`border rounded-lg p-6 cursor-pointer transition-all w-64 ${
                            selectedBottle === bottle.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedBottle(bottle.id)
                            // Use a shorter timeout to make it feel more responsive
                            setTimeout(() => goToNextStep(), 300)
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-40 h-56 mb-6 flex items-center justify-center">
                              <Image
                                src={bottle.image || "/placeholder.svg"}
                                alt={bottle.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <RadioGroupItem value={bottle.id} id={`bottle-${bottle.id}`} className="mb-2" />
                            <Label
                              htmlFor={`bottle-${bottle.id}`}
                              className="text-center text-base font-medium text-secondary-foreground font-zen"
                            >
                              {bottle.name}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 3: ラベルサイズを選ぶ (New) */}
              {currentStep === 3 && (
                <div className="min-h-[400px]">
                  <RadioGroup value={selectedLabelSize || ""} onValueChange={setSelectedLabelSize}>
                    <div className="flex justify-center gap-8">
                      {labelSizes.map((size) => (
                        <div
                          key={size.id}
                          className={`border rounded-lg p-6 cursor-pointer transition-all w-64 ${
                            selectedLabelSize === size.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedLabelSize(size.id)
                            // Use a shorter timeout to make it feel more responsive
                            setTimeout(() => goToNextStep(), 300)
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-40 h-56 mb-6 flex items-center justify-center">
                              <Image
                                src={size.image || "/placeholder.svg"}
                                alt={size.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <RadioGroupItem value={size.id} id={`size-${size.id}`} className="mb-2" />
                            <Label
                              htmlFor={`size-${size.id}`}
                              className="text-center text-base font-medium text-secondary-foreground font-zen"
                            >
                              {size.name}
                            </Label>
                            <p className="text-sm text-center text-secondary-foreground/70 mt-1 font-zen">
                              {size.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 4: ラベルを選ぶ (Previously Step 3) */}
              {currentStep === 4 && (
                <div className="min-h-[400px]">
                  {/* 好きなラベル画像をアップロード */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-secondary-foreground mb-4 font-zen">
                      好きなラベル画像をアップロード
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {uploadedImage ? (
                        <div className="relative">
                          <div className="relative w-48 h-48 mx-auto mb-4">
                            <Image
                              src={uploadedImage || "/placeholder.svg"}
                              alt="アップロードされた画像"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setUploadedImage(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            削除して再アップロード
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-secondary-foreground/70 mb-4 font-zen">
                            JPG、PNG、GIF形式の画像をアップロード（正方形推奨・1000×1000px・5MB以内）
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              fileInputRef.current?.click()
                              setSelectedLabel(null) // テンプレート選択をリセット
                            }}
                            className="bg-white hover:bg-gray-100"
                          >
                            画像を選択
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* テンプレートから選ぶ */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-secondary-foreground mb-4 font-zen">
                      テンプレートから選ぶ
                    </h3>
                    <RadioGroup
                      value={selectedLabel || ""}
                      onValueChange={(value) => {
                        setSelectedLabel(value)
                        setUploadedImage(null) // アップロード画像をリセット
                      }}
                    >
                      <div className="flex flex-row items-center justify-center gap-8">
                        {labelTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`border rounded-lg p-6 cursor-pointer transition-all w-64 ${
                              selectedLabel === template.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedLabel(template.id)
                              setUploadedImage(null)
                              // Use a shorter timeout to make it feel more responsive
                              setTimeout(() => goToNextStep(), 300)
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="relative w-40 h-56 mb-4">
                                <Image
                                  src={template.image || "/placeholder.svg"}
                                  alt={template.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <RadioGroupItem value={template.id} id={`label-${template.id}`} className="mb-2" />
                              <Label
                                htmlFor={`label-${template.id}`}
                                className="text-center text-base font-medium text-secondary-foreground font-zen"
                              >
                                {template.name}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 5: オプションを選ぶ (Previously Step 4) */}
              {currentStep === 5 && (
                <div className="min-h-[400px]">
                  <div className="text-center mb-6">
                    <Button
                      onClick={() => {
                        // Reset all options to default
                        setOptions({
                          transparentLabel: false,
                          uvPrint: false,
                          giftBox: false,
                          ribbonColor: "pink",
                          messageCard: false,
                          messageText: "",
                        })
                        // Proceed to Step 6
                        setCurrentStep(6)
                      }}
                      variant="outline"
                      className="bg-white hover:bg-gray-100 border-gray-300 text-gray-700 font-zen px-8 py-3 rounded-full"
                    >
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      オプション不要で次へ進む
                    </Button>
                  </div>
                  <div className="bg-secondary rounded-lg p-6">
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <div className="flex items-start">
                          <Checkbox
                            id="gift-box"
                            checked={options.giftBox}
                            onCheckedChange={() => handleOptionChange("giftBox")}
                            className="mt-1"
                          />
                          <div className="ml-3">
                            <Label
                              htmlFor="gift-box"
                              className="text-base font-medium text-secondary-foreground font-zen flex items-center"
                            >
                              <span className="mr-2">🎁</span>
                              ギフトボックス（リボン包装）：＋500円（税込）
                            </Label>
                            <p className="text-sm text-secondary-foreground/70 font-zen">
                              プレゼントにぴったりな高級感のあるギフトボックス
                            </p>
                          </div>
                        </div>

                        {/* ギフトボックスが選択された場合のみ表示 */}
                        {options.giftBox && (
                          <div className="ml-8 mt-4 bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-secondary-foreground mb-3 font-zen">
                              リボンの色を選択（必須）
                            </h4>
                            <RadioGroup
                              value={options.ribbonColor}
                              onValueChange={(value) => handleOptionChange("ribbonColor", value)}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {ribbonColors.map((ribbon) => (
                                  <div
                                    key={ribbon.id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                      options.ribbonColor === ribbon.id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-gray-200 hover:border-primary/50"
                                    }`}
                                    onClick={() => handleOptionChange("ribbonColor", ribbon.id)}
                                  >
                                    <div className="flex items-center justify-center mb-2">
                                      <RadioGroupItem value={ribbon.id} id={`ribbon-${ribbon.id}`} className="mr-2" />
                                      <div className="flex items-center">
                                        <span className="text-xl mr-2">{ribbon.emoji}</span>
                                        <div className={`w-4 h-4 rounded-full ${ribbon.color}`}></div>
                                      </div>
                                    </div>
                                    <Label
                                      htmlFor={`ribbon-${ribbon.id}`}
                                      className="text-xs text-center block text-secondary-foreground font-zen"
                                    >
                                      {ribbon.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>

                            <div className="border-t pt-4">
                              <div className="flex items-start">
                                <Checkbox
                                  id="message-card"
                                  checked={options.messageCard}
                                  onCheckedChange={() => handleOptionChange("messageCard")}
                                  className="mt-1"
                                />
                                <div className="ml-3 w-full">
                                  <Label
                                    htmlFor="message-card"
                                    className="text-base font-medium text-secondary-foreground font-zen flex items-center"
                                  >
                                    <span className="mr-2">✉️</span>
                                    メッセージカードを追加：＋200円（税込）
                                  </Label>

                                  {options.messageCard && (
                                    <div className="mt-3">
                                      <Textarea
                                        placeholder="メッセージを入力してください（最大100文字）"
                                        value={options.messageText}
                                        onChange={handleMessageChange}
                                        className="w-full h-24 resize-none"
                                        maxLength={100}
                                      />
                                      <p className="text-xs text-right mt-1 text-secondary-foreground/50">
                                        {options.messageText.length}/100文字
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: 注文内容の確認 (Previously Step 5) */}
              {currentStep === 6 && (
                <div className="min-h-[400px]">
                  <div className="bg-secondary rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-medium text-secondary-foreground mb-4 font-zen">注文内容の確認</h3>

                    {selectedFragrance && (
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-secondary-foreground mb-2 font-zen">選択した香り</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {fragrances.find((f) => f.id === selectedFragrance)?.emoji}
                            </span>
                            <div>
                              <p className="font-medium text-secondary-foreground font-zen">
                                {fragrances.find((f) => f.id === selectedFragrance)?.name}
                              </p>
                              <p className="text-sm text-secondary-foreground/70 font-zen">
                                {fragrances.find((f) => f.id === selectedFragrance)?.category}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBottle && (
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-secondary-foreground mb-2 font-zen">選択したボトル</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                          <div className="relative w-16 h-16 mr-4">
                            <Image
                              src={bottles.find((b) => b.id === selectedBottle)?.image || "/placeholder.svg"}
                              alt={bottles.find((b) => b.id === selectedBottle)?.name || ""}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="font-medium text-secondary-foreground font-zen">
                            {bottles.find((b) => b.id === selectedBottle)?.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedLabelSize && (
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-secondary-foreground mb-2 font-zen">
                          選択したラベルサイズ
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                          <div className="relative w-16 h-16 mr-4">
                            <Image
                              src={labelSizes.find((s) => s.id === selectedLabelSize)?.image || "/placeholder.svg"}
                              alt={labelSizes.find((s) => s.id === selectedLabelSize)?.name || ""}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-secondary-foreground font-zen">
                              {labelSizes.find((s) => s.id === selectedLabelSize)?.name}
                            </p>
                            <p className="text-sm text-secondary-foreground/70 font-zen">
                              {labelSizes.find((s) => s.id === selectedLabelSize)?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedLabel || uploadedImage) && (
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-secondary-foreground mb-2 font-zen">選択したラベル</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                          {selectedLabel ? (
                            <>
                              <div className="relative w-16 h-16 mr-4">
                                <Image
                                  src={labelTemplates.find((l) => l.id === selectedLabel)?.image || "/placeholder.svg"}
                                  alt={labelTemplates.find((l) => l.id === selectedLabel)?.name || ""}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <p className="font-medium text-secondary-foreground font-zen">
                                {labelTemplates.find((l) => l.id === selectedLabel)?.name}
                              </p>
                            </>
                          ) : uploadedImage ? (
                            <>
                              <div className="relative w-16 h-16 mr-4">
                                <Image
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="アップロードされた画像"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <p className="font-medium text-secondary-foreground font-zen">オリジナル画像</p>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-secondary-foreground mb-2 font-zen">
                        選択したオプション
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <ul className="space-y-2 text-secondary-foreground font-zen">
                          {!options.transparentLabel && !options.uvPrint && !options.giftBox && (
                            <li>オプションは選択されていません</li>
                          )}
                          {options.transparentLabel && <li>✓ 透明シール印刷（+500円）</li>}
                          {options.uvPrint && <li>✓ ボトルにUV印刷（+1,200円）</li>}
                          {options.giftBox && (
                            <li>
                              ✓ ギフトボックス -
                              {ribbonColors.find((r) => r.id === options.ribbonColor)?.name || "ピンクリボン"}（+500円）
                            </li>
                          )}
                          {options.giftBox && options.messageCard && (
                            <li>
                              ✓ メッセージカード（+200円）
                              {options.messageText && (
                                <div className="mt-2 p-2 bg-secondary rounded text-sm italic">
                                  「{options.messageText}」
                                </div>
                              )}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-secondary-foreground font-zen">合計金額</h4>
                        <p className="text-2xl font-bold text-primary font-zen">
                          ¥{calculateTotal().toLocaleString()}（税込）
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-secondary-foreground/70 space-y-1 font-zen">
                        <p>基本価格：4,400円</p>
                        {options.transparentLabel && <p>透明シール印刷：+500円</p>}
                        {options.uvPrint && <p>ボトルにUV印刷：+1,200円</p>}
                        {options.giftBox && <p>ギフトボックス：+500円</p>}
                        {options.messageCard && <p>メッセージカード：+200円</p>}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-zen text-lg relative overflow-hidden group"
                    disabled={
                      !selectedFragrance ||
                      !selectedBottle ||
                      !selectedLabelSize ||
                      (!selectedLabel && !uploadedImage) ||
                      (options.giftBox && !options.ribbonColor)
                    }
                  >
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    <span className="relative">この内容でカートに追加</span>
                  </Button>

                  <Button
                    onClick={handleGuestCheckout}
                    variant="outline"
                    className="w-full mt-4 border-primary text-primary hover:bg-primary/5 rounded-full py-6 font-zen text-lg"
                    disabled={
                      !selectedFragrance ||
                      !selectedBottle ||
                      !selectedLabelSize ||
                      (!selectedLabel && !uploadedImage) ||
                      (options.giftBox && !options.ribbonColor)
                    }
                  >
                    会員登録せずに購入する
                  </Button>

                  <p className="text-center text-sm text-secondary-foreground/70 mt-4 font-zen">
                    ※カートに追加後、注文手続きへ進みます
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ナビゲーションボタン */}
        <section className="bg-white rounded-lg shadow-sm">
          <div className="container mx-auto px-4 md:px-8 py-6">
            <div className="max-w-4xl mx-auto flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 ${currentStep === 1 ? "invisible" : ""}`}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={goToNextStep} className="bg-primary hover:bg-primary/90 text-white px-6 py-2">
                  次へ
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

