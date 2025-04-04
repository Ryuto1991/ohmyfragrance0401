"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

// fragranceShowcasesの順番を変更します
const fragranceShowcases = [
  {
    id: 1,
    name: "好きな香りを選ぶ【4980円～】",
    image: "/images/select-fragrance.png",
    link: "/select-fragrance",
  },
  {
    id: 4,
    name: "Erina Grace",
    image: "/images/erina-grace.webp",
    link: "/showcase/erina-grace",
  },
  {
    id: 5,
    name: "Silent Pulse",
    image: "/images/silent-pulse.webp",
    link: "/showcase/silent-pulse",
  },
  {
    id: 2,
    name: "Soap Bubble Daydream",
    image: "/images/soap-bubble-daydream-new.webp",
    link: "/showcase/soap-bubble-daydream",
  },
  {
    id: 3,
    name: "Eternal Smoke",
    image: "/images/eternal-smoke.webp",
    link: "/showcase/eternal-smoke",
  },
  {
    id: 6,
    name: "Bloom Whisper",
    image: "/images/bloom-whisper.webp",
    link: "/showcase/bloom-whisper",
  },
]

export default function AutoScrollShowcase() {
  const [isPaused, setIsPaused] = useState(false)

  // 表示用のアイテム（3セット用意して無限スクロールを実現）
  const displayItems = [...fragranceShowcases, ...fragranceShowcases, ...fragranceShowcases]

  // アイテムの合計幅を計算（アイテム幅 + マージン）× アイテム数
  const totalWidth = displayItems.length * (320 + 24) // 320px(アイテム幅) + 24px(マージン)

  return (
    <div className="relative py-4 overflow-hidden bg-secondary">
      {/* 円形の背景 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full bg-primary/10 -z-10" />

      {/* スクロールコンテナ */}
      <div className="overflow-hidden mx-auto max-w-[90vw]">
        <div
          className={`flex ${isPaused ? "pause-animation" : ""}`}
          style={{
            width: `${totalWidth}px`,
            animation: "scroll 60s linear infinite",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {displayItems.map((item, index) => (
            <Link href={item.link} key={`${item.id}-${index}`} className="flex-shrink-0">
              <div className="w-[280px] md:w-[320px] mx-3 overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-white flex items-center justify-center">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-medium text-secondary-foreground font-zen">{item.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MORE WORKSボタン */}
      <div className="flex justify-center mt-8">
        <Link
          href="/showcase"
          className="inline-flex items-center justify-center border border-secondary-foreground rounded-full px-8 py-2 text-sm text-secondary-foreground hover:bg-secondary-foreground hover:text-white transition-colors duration-300 font-montserrat"
        >
          MORE WORKS
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* CSS アニメーション */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%); /* 1セット分だけスクロール */
          }
        }
        
        .pause-animation {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  )
}

