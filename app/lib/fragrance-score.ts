import essentialOilsData from "@/components/chat/essential-oils.json"

// Define the structure for the fragrance score based on usage
interface FragranceScore {
  sweetness: number;
  freshness: number;
  woody: number;
  exotic: number;
  cleanliness: number;
}

interface EssentialOil {
  name: string
  description: string
  emotion: string
  category: string
  source: string
  info: string
}

// すべてのノートを結合して配列を作成
const essentialOils: EssentialOil[] = [
  ...(essentialOilsData.perfumeNotes.topNotes || []),
  ...(essentialOilsData.perfumeNotes.middleNotes || []),
  ...(essentialOilsData.perfumeNotes.baseNotes || [])
]

export function calculateFragranceScore(recipe: { name: string; amount: number }[]): FragranceScore {
  const scores: FragranceScore = {
    sweetness: 3, // 基本値として3を設定
    freshness: 3,
    woody: 3,
    exotic: 3,
    cleanliness: 3,
  }

  const totalAmount = recipe.reduce((sum, oil) => sum + oil.amount, 0)

  recipe.forEach((recipeOil) => {
    const oil = essentialOils.find((o: EssentialOil) => o.name === recipeOil.name)
    if (!oil) return

    const weight = (recipeOil.amount / totalAmount) * 2 // 重みを2倍に

    // 甘さの評価
    if (
      oil.description.includes("甘い") ||
      oil.description.includes("バニラ") ||
      oil.category.includes("フローラル")
    ) {
      scores.sweetness += 7 * weight
    }

    // 爽やかさの評価
    if (
      oil.category.includes("シトラス") ||
      oil.category.includes("ハーブ") ||
      oil.description.includes("爽やか") ||
      oil.description.includes("フレッシュ")
    ) {
      scores.freshness += 7 * weight
    }

    // ウッディ感の評価
    if (
      oil.source === "木部" ||
      oil.category.includes("ウッディ") ||
      oil.description.includes("木") ||
      oil.name === "シダーウッド" ||
      oil.name === "パチュリ"
    ) {
      scores.woody += 7 * weight
    }

    // エキゾチック感の評価
    if (
      oil.emotion.includes("スピリチュアル") ||
      oil.emotion.includes("神秘的") ||
      oil.category.includes("スパイシー") ||
      oil.category.includes("オリエンタル")
    ) {
      scores.exotic += 7 * weight
    }

    // 清潔感の評価
    if (
      oil.name === "ラベンダー" ||
      oil.name === "ローズマリー" ||
      oil.description.includes("クリーン") ||
      oil.description.includes("清潔") ||
      oil.description.includes("石鹸")
    ) {
      scores.cleanliness += 7 * weight
    }

    // 追加のボーナススコア
    if (oil.emotion === "爽快感") scores.freshness += 2
    if (oil.emotion === "安らぎ") scores.cleanliness += 2
    if (oil.category === "フローラル") scores.sweetness += 2
    if (oil.source === "木部") scores.woody += 2
    if (oil.category === "オリエンタル") scores.exotic += 2
  })

  // スコアを3-10の範囲に正規化（最小値を3に設定）
  Object.keys(scores).forEach((key) => {
    const score = scores[key as keyof FragranceScore]
    scores[key as keyof FragranceScore] = Math.min(10, Math.max(3, score))
  })

  return scores
}
