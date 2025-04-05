import { motion } from "framer-motion"
import { EmotionScore } from "../types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EmotionScoreCardProps {
  scores: EmotionScore
  title?: string
  description?: string
}

const scoreColors = {
  calm: {
    bg: "bg-blue-200",
    text: "text-blue-700",
    border: "border-blue-300"
  },
  refresh: {
    bg: "bg-green-200",
    text: "text-green-700",
    border: "border-green-300"
  },
  romantic: {
    bg: "bg-pink-200",
    text: "text-pink-700",
    border: "border-pink-300"
  },
  spiritual: {
    bg: "bg-purple-200",
    text: "text-purple-700",
    border: "border-purple-300"
  },
  energy: {
    bg: "bg-yellow-200",
    text: "text-yellow-700",
    border: "border-yellow-300"
  }
}

const scoreLabels = {
  calm: "落ち着き",
  refresh: "リフレッシュ",
  romantic: "ロマンティック",
  spiritual: "スピリチュアル",
  energy: "エネルギー"
}

const scoreDescriptions = {
  calm: "心を落ち着かせ、リラックス効果のある香り",
  refresh: "気分をリフレッシュし、爽快感を与える香り",
  romantic: "ロマンチックな雰囲気を演出する香り",
  spiritual: "心を癒し、精神的な安らぎを与える香り",
  energy: "活力を与え、元気を引き出す香り"
}

export function EmotionScoreCard({ scores, title, description }: EmotionScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg p-4 space-y-4 shadow-sm border"
      role="region"
      aria-label="感情スコア"
    >
      {title && (
        <h3 className="font-medium text-lg">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-3">
        {(Object.entries(scores) as [keyof EmotionScore, number][]).map(([key, score]) => (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
                  <div className="flex justify-between text-sm">
                    <span className={cn("font-medium", scoreColors[key].text)}>
                      {scoreLabels[key]}
                    </span>
                    <span className={cn("font-medium", scoreColors[key].text)}>
                      {score}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        scoreColors[key].bg,
                        scoreColors[key].border,
                        "border"
                      )}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{scoreDescriptions[key]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </motion.div>
  )
} 