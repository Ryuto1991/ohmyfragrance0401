import { motion } from "framer-motion"

interface EmotionScore {
  calm: number      // 落ち着き
  refresh: number   // リフレッシュ
  romantic: number  // ロマンティック
  spiritual: number // スピリチュアル
  energy: number    // エネルギー
}

interface EmotionScoreCardProps {
  scores: EmotionScore
  title?: string
  description?: string
}

const scoreColors = {
  calm: "bg-blue-200",
  refresh: "bg-green-200",
  romantic: "bg-pink-200",
  spiritual: "bg-purple-200",
  energy: "bg-yellow-200",
}

const scoreLabels = {
  calm: "落ち着き",
  refresh: "リフレッシュ",
  romantic: "ロマンティック",
  spiritual: "スピリチュアル",
  energy: "エネルギー",
}

export function EmotionScoreCard({ scores, title, description }: EmotionScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-4 space-y-4"
    >
      {title && (
        <h3 className="font-medium text-lg">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-2">
        {(Object.entries(scores) as [keyof EmotionScore, number][]).map(([key, score]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{scoreLabels[key]}</span>
              <span className="text-muted-foreground">{score}/5</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score / 5) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${scoreColors[key]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
} 