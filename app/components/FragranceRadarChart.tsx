import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"

export interface FragranceScore {
  sweetness: number    // 甘さ
  freshness: number   // 爽やかさ
  woody: number       // ウッディ
  exotic: number      // エキゾチック
  cleanliness: number // 清潔感
}

interface FragranceRadarChartProps {
  scores: FragranceScore
}

export function FragranceRadarChart({ scores }: FragranceRadarChartProps) {
  const data = [
    { name: "甘さ", value: scores.sweetness },
    { name: "爽やかさ", value: scores.freshness },
    { name: "ウッディ", value: scores.woody },
    { name: "エキゾチック", value: scores.exotic },
    { name: "清潔感", value: scores.cleanliness },
  ]

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} />
          <Radar
            name="香りの特徴"
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
} 