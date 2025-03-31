"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingBag, Star, Clock, Droplet, Check, Info } from "lucide-react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useStripeCart } from "@/contexts/stripe-cart-context"

// Define type for fragrance options
interface FragranceOption {
  id: number;
  name: string;
  type: string;
  description: string;
}

// サンプルの制作事例データ（実際の実装ではAPIやデータベースから取得する）
const showcaseItems = [
  {
    id: 1,
    title: "セレクト香水プラン【1個から注文OK】",
    description:
      "定番の香りを、あなただけの1本に。高品質エッセンシャルオイルをふんだんにつかった香りのセレクトプラン。",
    fullDescription: "全10種類の定番の香りからお好きな香りを選んで、オリジナルパッケージをつくれます",
    image: "/placeholder.svg?height=600&width=400&text=セレクト",
    category: "セレクト香水プラン",
    slug: "select-fragrance",
    price: "4,400",
    priceId: "price_test_select_fragrance",
    priceNumber: 4400,
    rating: 4.8,
    reviewCount: 124,
    notes: {
      top: ["ベルガモット", "レモン", "ネロリ"],
      middle: ["ジャスミン", "イランイラン", "ローズ"],
      base: ["バニラ", "ムスク", "サンダルウッド"],
    },
    duration: "6-8時間",
    intensity: "中程度",
    season: "オールシーズン",
    relatedProducts: [2, 5, 8],
    fragranceOptions: [
      {
        id: 1,
        name: "ローズブロッサム",
        type: "フローラル系",
        description: "華やかで濃厚なフローラルに、甘さと温もりを添えて。ギフトにおすすめです。",
      },
      {
        id: 2,
        name: "シトラスシャワー",
        type: "シトラス系",
        description: "朝のシャワーのように清涼感あふれるフレッシュな香り。",
      },
      {
        id: 3,
        name: "スウィートドリーム",
        type: "スイート系",
        description: "甘く優しい眠りを誘う、穏やかで包容力のある香り。",
      },
      {
        id: 4,
        name: "ミルラナイト",
        type: "オリエンタル系",
        description: "神秘的な香煙のように、奥深く官能的な香り。",
      },
      {
        id: 5,
        name: "ディープフォレスト",
        type: "ウッディ系",
        description: "静かな森の奥で深呼吸するような、心落ち着く香り。",
      },
      {
        id: 6,
        name: "ブルーウェイブ",
        type: "マリン系",
        description: "海辺の風とハーブの清涼感が広がる、爽快マリン系。",
      },
      {
        id: 7,
        name: "ホットスパイス",
        type: "スパイシー系",
        description: "心と身体を温める、エネルギッシュなスパイシー系。",
      },
      {
        id: 8,
        name: "ハーバルグリーン",
        type: "ハーバル系",
        description: "ハーブと木の力強さが調和した、爽やかで芯のある香り。",
      },
      {
        id: 9,
        name: "エターナルスモーク",
        type: "スモーキー系",
        description: "神聖でスモーキーな香りが長く残る、静謐なブレンド。",
      },
      {
        id: 10,
        name: "フルーティブロッサム",
        type: "フルーティフローラル系",
        description: "花と果実のハーモニーが弾ける、明るく軽やかな香り。",
      },
    ],
  },
  {
    id: 2,
    title: "Soap Bubble Daydream",
    description: "朝露のように繊細で、どこか懐かしい。ふとした瞬間に浮かぶ、シャボンのような夢の記憶。",
    fullDescription: `― アーティスト「Risa」とつくる香りの記憶 ―

朝露のように繊細で、どこか懐かしい。
ふとした瞬間に浮かぶ、シャボンのような夢の記憶。
アーティスト「Risa」の世界観をイメージし、香りで表現したケーススタディ作品です。

小ロットでの香水制作も承ります
この香水はケーススタディ作品として開発されました。
当ブランドでは、10本からの小ロット生産にも対応しております。
アーティスト・クリエイター・ブランド様向けに、世界観を香りで表現するお手伝いをしています。`,
    image: "/images/soap-bubble-daydream.png",
    category: "アーティストコラボ",
    slug: "soap-bubble-daydream",
    price: "5,980",
    priceId: "price_test_soap_bubble",
    priceNumber: 5980,
    rating: 4.8,
    reviewCount: 42,
    notes: {
      top: ["ベルガモット", "ジャスミン"],
      middle: ["バニラ", "イランイラン"],
      base: ["サンダルウッド", "パチュリ"],
    },
    duration: "4〜6時間",
    intensity: "軽め",
    season: "オールシーズン",
    relatedProducts: [3, 5, 1],
  },
  {
    id: 3,
    title: "Eternal Smoke",
    description: "ネオンの残光、路地裏の静寂、その空気ごとまとうような、深く長いスモーキーな香り。",
    fullDescription: `― ラッパー「YuruFlex」とつくる香りの余韻 ―

ネオンの残光、路地裏の静寂、
その空気ごとまとうような、深く長いスモーキーな香り。
祈るように、囁くように紡がれる音と言葉。
YuruFlexが歩いてきた夜の軌跡を、香りで閉じ込めた一本。

神聖でありながら、どこか孤独。
その"余韻"こそが、彼の本質。

小ロットでの香水制作も承ります
この香水はケーススタディ作品として開発されました。
当ブランドでは、10本からの小ロット生産にも対応しています。
アーティスト・クリエイター・ブランド様向けに、世界観を香りで表現するお手伝いをしています。`,
    image: "/images/eternal-smoke.png",
    category: "アーティストコラボ",
    slug: "eternal-smoke",
    price: "5,500",
    priceId: "price_1R8PfWE0t3PGpOQ56jvdSTKf",
    priceNumber: 5500,
    rating: 4.9,
    reviewCount: 38,
    notes: {
      top: ["ミルラ"],
      middle: ["フランキンセンス", "ベチバー"],
      base: ["パチュリ", "サンダルウッド"],
    },
    duration: "4〜6時間",
    intensity: "やや強め",
    season: "オールシーズン",
    relatedProducts: [2, 4, 8],
  },
  {
    id: 4,
    title: "豪華なウードパフューム",
    description: "深みと神秘性を持つ東洋の香り。特別なイベントや夜のお出かけに最適です。",
    fullDescription:
      "深みと神秘性を持つ東洋の香り。特別なイベントや夜のお出かけに最適です。AIが世界中の高級フレグランスを分析し、最も印象に残る香りの要素を抽出して作られました。存在感のある香りで、周囲の人々に強い印象を残します。",
    image: "/placeholder.svg?height=600&width=400&text=ウード",
    category: "オリエンタル",
    slug: "luxurious-oud-perfume",
    price: "4,400",
    priceId: "price_test_oud",
    priceNumber: 4400,
    rating: 4.7,
    reviewCount: 87,
    notes: {
      top: ["サフラン", "シナモン", "カルダモン"],
      middle: ["ウード", "ローズ", "パチョリ"],
      base: ["アンバー", "バニラ", "ムスク"],
    },
    duration: "8-10時間",
    intensity: "強め",
    season: "秋・冬",
    relatedProducts: [8, 6, 3],
  },
  {
    id: 5,
    title: "フローラルブーケ",
    description: "春の花々を集めたような香り。ローズ、ジャスミン、スミレの調和が美しいフレグランス。",
    fullDescription:
      "春の花々を集めたような香り。ローズ、ジャスミン、スミレの調和が美しいフレグランス。AIが季節の移り変わりと花の開花データを分析し、最も心地よい花の香りの組み合わせを実現しました。華やかな場面や特別なデートにぴったりです。",
    image: "/placeholder.svg?height=600&width=400&text=フローラル",
    category: "フローラル",
    slug: "floral-bouquet",
    price: "4,400",
    priceId: "price_test_floral",
    priceNumber: 4400,
    rating: 4.8,
    reviewCount: 112,
    notes: {
      top: ["ベルガモット", "ピンクペッパー"],
      middle: ["ローズ", "ジャスミン", "スミレ"],
      base: ["ムスク", "シダーウッド", "アンバー"],
    },
    duration: "5-7時間",
    intensity: "中程度",
    season: "春・夏",
    relatedProducts: [1, 3, 7],
  },
  {
    id: 6,
    title: "ウッディアロマ",
    description: "森林の中にいるような自然な香り。シダーウッドとサンダルウッドの落ち着いた印象。",
    fullDescription:
      "森林の中にいるような自然な香り。シダーウッドとサンダルウッドの落ち着いた印象。AIが森林浴の効果を研究したデータを基に、最もリラックス効果の高い木々の香りを組み合わせました。集中したいときや、自然を感じたいときにおすすめです。",
    image: "/placeholder.svg?height=600&width=400&text=ウッディ",
    category: "ウッディ",
    slug: "woody-aroma",
    price: "4,400",
    priceId: "price_test_woody",
    priceNumber: 4400,
    rating: 4.6,
    reviewCount: 76,
    notes: {
      top: ["ベルガモット", "シトラス", "パイン"],
      middle: ["シダーウッド", "サイプレス", "ラベンダー"],
      base: ["サンダルウッド", "ベチバー", "オークモス"],
    },
    duration: "6-8時間",
    intensity: "中程度",
    season: "オールシーズン",
    relatedProducts: [4, 8, 2],
  },
  {
    id: 7,
    title: "マリンブリーズ",
    description: "海辺の爽やかな風を感じるような清々しい香り。夏のリフレッシュにぴったり。",
    fullDescription:
      "海辺の爽やかな風を感じるような清々しい香り。夏のリフレッシュにぴったり。AIが世界中の海岸線の空気成分を分析し、最も心地よい海の香りを再現しました。暑い日や、気分転換したいときに最適です。",
    image: "/placeholder.svg?height=600&width=400&text=マリン",
    category: "マリン",
    slug: "marine-breeze",
    price: "4,400",
    priceId: "price_test_marine",
    priceNumber: 4400,
    rating: 4.5,
    reviewCount: 68,
    notes: {
      top: ["海塩", "シトラス", "ウォーターノート"],
      middle: ["ラベンダー", "ローズマリー", "ジャスミン"],
      base: ["ムスク", "シダーウッド", "アンバーグリス"],
    },
    duration: "4-6時間",
    intensity: "軽め〜中程度",
    season: "春・夏",
    relatedProducts: [2, 5, 1],
  },
  {
    id: 8,
    title: "スパイシーアンバー",
    description: "温かみのあるスパイスとアンバーの組み合わせ。秋冬に身につけたい深みのある香り。",
    fullDescription:
      "温かみのあるスパイスとアンバーの組み合わせ。秋冬に身につけたい深みのある香り。AIが世界中のスパイスマーケットのデータを分析し、最も心地よい温かみのある香りを実現しました。寒い季節や、特別なディナーの席にぴったりです。",
    image: "/placeholder.svg?height=600&width=400&text=スパイシー",
    category: "スパイシー",
    slug: "spicy-perfume",
    price: "4,400",
    priceId: "price_test_spicy",
    priceNumber: 4400,
    rating: 4.7,
    reviewCount: 92,
    notes: {
      top: ["カルダモン", "シナモン", "ピンクペッパー"],
      middle: ["クローブ", "ナツメグ", "ローズ"],
      base: ["アンバー", "バニラ", "パチョリ"],
    },
    duration: "7-9時間",
    intensity: "強め",
    season: "秋・冬",
    relatedProducts: [4, 3, 6],
  },
]

export default function ShowcaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const { addToCart } = useStripeCart()
  const [selectedFragranceId, setSelectedFragranceId] = useState<number | null>(null)

  useEffect(() => {
    // URLのスラッグから製品を検索
    const slug = params.slug as string
    const foundProduct = showcaseItems.find((item) => item.slug === slug)

    if (foundProduct) {
      setProduct(foundProduct)

      // 関連製品を取得
      if (foundProduct.relatedProducts && foundProduct.relatedProducts.length > 0) {
        const related = showcaseItems.filter((item) => foundProduct.relatedProducts.includes(item.id))
        setRelatedProducts(related)
      }
    }
  }, [params])

  const handleAddToCart = () => {
    if (!product) return;

    // For 'select-fragrance', ensure an option is selected
    if (product.slug === 'select-fragrance' && !selectedFragranceId) {
      // Show an error or prompt to select a fragrance
      console.error("Please select a fragrance option.");
      // Maybe add a visual cue or toast message here
      return;
    }
    
    // Find selected fragrance details if applicable, adding type to opt parameter
    const selectedOption = product.fragranceOptions?.find((opt: FragranceOption) => opt.id === selectedFragranceId);
    const itemName = product.slug === 'select-fragrance' && selectedOption ? `${product.title} (${selectedOption.name})` : product.title;
    const itemPriceId = product.priceId // Assuming base price ID for now, adjust if options have different price IDs
    const itemPrice = product.priceNumber
    const itemImage = product.image
    
    if (!itemPriceId) {
        console.error("Product Price ID is missing!")
        return;
    }

    addToCart({
      priceId: itemPriceId,
      name: itemName,
      price: itemPrice,
      image: itemImage,
    });
    // Optionally show confirmation
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary">
        <SiteHeader />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center py-16">
              <h1 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">
                製品が見つかりませんでした
              </h1>
              <p className="text-secondary-foreground/70 mb-8 font-zen">
                お探しの製品は存在しないか、削除された可能性があります。
              </p>
              <Button
                onClick={() => router.push("/showcase")}
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                制作事例一覧に戻る
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // エレガントオードパルファム（プリセット香水プラン）のカスタムレイアウト
  const renderPresetPerfumePlan = () => {
    if (product.slug !== "select-fragrance") return null

    return (
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-2 gap-10">
          {/* 製品画像 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[3/4] bg-secondary/30 rounded-lg overflow-hidden"
          >
            <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
            <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
              {product.category}
            </div>
          </motion.div>

          {/* 製品情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="text-2xl md:text-3xl font-medium mb-4 text-secondary-foreground font-zen">
              {product.title}
            </h1>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium mb-1 text-secondary-foreground font-zen">価格</h3>
                <p className="text-xl font-medium text-primary font-zen">
                  ￥{product.price} <span className="text-sm text-secondary-foreground/70">（税込）</span>
                </p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!selectedFragranceId}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span className="relative">カートに追加</span>
              </Button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">プランの特徴</h3>
              <p className="text-secondary-foreground font-medium mb-2 font-zen">"定番の香りを、あなただけの1本に。"</p>
              <p className="text-secondary-foreground/70 font-zen">
                全10種類の香りからお好きな香りを選び、世界にひとつだけのフレグランスをお届けします。
              </p>
            </div>

            {/* セット内容 - プランの特徴の直下に移動 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-secondary-foreground font-zen">セット内容</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">内容量</p>
                      <p className="text-secondary-foreground/70 font-zen">30ml</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">選べる香り</p>
                      <p className="text-secondary-foreground/70 font-zen">人気の全10種類から選択（下記参照）</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">ラベル</p>
                      <p className="text-secondary-foreground/70 font-zen">
                        お好きな画像を印刷可能（写真・イラスト・ロゴなど）
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">納期目安</p>
                      <p className="text-secondary-foreground/70 font-zen">ご注文から約1週間以内に発送</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">持続時間</p>
                      <p className="text-secondary-foreground/70 font-zen">6〜8時間</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground font-zen">香りの強さ</p>
                      <p className="text-secondary-foreground/70 font-zen">中程度</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4"></div>
          </motion.div>
        </div>

        {/* 選べる香り一覧 */}
        <div className="mt-12">
          <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">選べる香り一覧（全10種類）</h2>
          <p className="text-secondary-foreground/70 mb-6 font-zen">香りごとに世界観とテーマをご用意しています。</p>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-secondary/20">
                  <th className="py-3 px-4 text-left font-zen">#</th>
                  <th className="py-3 px-4 text-left font-zen">香り名</th>
                  <th className="py-3 px-4 text-left font-zen">系統</th>
                  <th className="py-3 px-4 text-left font-zen">香りの特徴</th>
                </tr>
              </thead>
              <tbody>
                {product.fragranceOptions.map((option: FragranceOption, index: number) => (
                  <tr key={option.id} className={index % 2 === 0 ? "bg-white" : "bg-secondary/5"}>
                    <td className="py-3 px-4 font-zen">{option.id}</td>
                    <td className="py-3 px-4 font-medium font-zen">{option.name}</td>
                    <td className="py-3 px-4 font-zen">{option.type}</td>
                    <td className="py-3 px-4 text-secondary-foreground/70 font-zen">{option.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ご利用の流れ */}
        <div className="mt-12">
          <h2 className="text-xl font-medium mb-6 text-secondary-foreground font-zen">ご利用の流れ</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-secondary/10 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="font-zen">お好きな香りを10種の中から選択</p>
            </div>

            <div className="bg-secondary/10 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="font-zen">ラベルに使用する画像をアップロード</p>
            </div>

            <div className="bg-secondary/10 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <p className="font-zen">約1週間以内にお届け</p>
            </div>
          </div>
        </div>

        {/* ラベルについて */}
        <div className="mt-12">
          <h2 className="text-xl font-medium mb-4 text-secondary-foreground font-zen">ラベルについて</h2>
          <div className="bg-secondary/10 p-6 rounded-lg mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-secondary-foreground/70 font-zen">
                ラベルには<span className="font-medium">お好きな画像（写真・イラスト・ロゴなど）</span>
                を印刷可能です。推し活、ギフト、ブランドロゴなど、自由にデザインを楽しめます。
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-3"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            カートに追加
          </Button>
        </div>
      </div>
    )
  }

  // 通常の製品詳細レイアウト
  const renderNormalProductDetail = () => {
    if (product.slug === "select-fragrance") return null

    return (
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-2 gap-10">
          {/* 製品画像 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[3/4] bg-secondary/30 rounded-lg overflow-hidden"
          >
            <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
            <div className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
              {product.category}
            </div>
          </motion.div>

          {/* 製品情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="text-2xl md:text-3xl font-medium mb-2 text-secondary-foreground font-zen">
              {product.title}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-secondary-foreground/70">
                {product.rating} ({product.reviewCount}件のレビュー)
              </span>
            </div>

            <p className="text-lg font-medium text-primary mb-6 font-zen">
              ¥{product.price} <span className="text-sm text-secondary-foreground/70">（税込）</span>
            </p>

            <p className="text-secondary-foreground/70 mb-6 font-zen">{product.fullDescription}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-xs text-secondary-foreground/70">持続時間</p>
                  <p className="text-sm font-medium">{product.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Droplet className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-xs text-secondary-foreground/70">香りの強さ</p>
                  <p className="text-sm font-medium">{product.intensity}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 text-secondary-foreground font-zen">ノート構成</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary p-3 rounded-md">
                  <p className="text-xs text-secondary-foreground/70 mb-1">トップノート</p>
                  <ul className="text-xs">
                    {product.notes.top.map((note: string, index: number) => (
                      <li key={index} className="mb-1">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-secondary p-3 rounded-md">
                  <p className="text-xs text-secondary-foreground/70 mb-1">ミドルノート</p>
                  <ul className="text-xs">
                    {product.notes.middle.map((note: string, index: number) => (
                      <li key={index} className="mb-1">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-secondary p-3 rounded-md">
                  <p className="text-xs text-secondary-foreground/70 mb-1">ベースノート</p>
                  <ul className="text-xs">
                    {product.notes.base.map((note: string, index: number) => (
                      <li key={index} className="mb-1">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-6 text-secondary-foreground font-zen">製品情報</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.priceId}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-full py-3 font-montserrat relative overflow-hidden group mt-6"
                >
                  <>
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span className="relative">カートに追加</span>
                  </>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* 戻るボタン */}
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <Button
            onClick={() => router.push("/showcase")}
            variant="outline"
            className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            制作事例一覧に戻る
          </Button>
        </div>

        {/* 製品詳細セクション */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          {renderPresetPerfumePlan()}
          {renderNormalProductDetail()}
        </section>

        {/* 関連製品セクション */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl font-medium mb-6 text-secondary-foreground font-zen">関連する香り</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
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
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-medium">¥{item.price}</span>
                        <span className="text-primary text-sm flex items-center font-montserrat">詳細を見る</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CTAセクション */}
        <section className="py-16 bg-gray-50 mt-16">
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
                <Link href="/Fragrance-Lab">
                  <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-6 py-2 font-montserrat relative overflow-hidden group">
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <span className="relative">AIと香りをつくる</span>
                  </Button>
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

