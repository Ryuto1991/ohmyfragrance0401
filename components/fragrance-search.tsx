"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 例のリスト - 短めの例文に調整
const EXAMPLE_PHRASES = [
  "初恋の香り",
  "放課後の図書室",
  "雨上がりの空気",
  "寂しさを癒すバニラ",
  "旅に出たくなる香り",
  "目覚めるような柑橘系",
  "幸せになれるベリー",
  "推しとすれ違った時",
  "花火大会の帰り道",
  "静かな夜のジャスミン",
  "失恋したあとの香り",
  "新しい街の風",
  "寝る前の香り",
  "淡い桜の記憶",
  "抱きしめられたい香り",
  "海沿いドライブ",
  "映画のラストシーン",
  "サプライズの香り",
  "冬の夜のカフェラテ",
  "夏祭りの金木犀",
  "髪を乾かす柔軟剤",
  "好きな人の香り",
  "胸が高鳴る香り",
  "自分らしさの香り",
  "背伸びしたい夜",
  "おしゃれなカフェ",
  "憧れの人の香り",
  "麦わら帽子の記憶",
  "甘いチョコの誘惑",
  "大切な人との休日",
  "二度と戻れない夏",
]

// モバイル用の短い例文リスト（7文字以内）
const MOBILE_EXAMPLE_PHRASES = [
  "雨音の香り",
  "星の余韻",
  "あの日の嘘",
  "涙の理由",
  "君色の空とか",
  "秘密の香り",
  "月と君と推し",
  "君がいた夏の色香",
  "恋とカフェラテ",
  "最後の花火",
  "熱い雪の約束",
  "僕と君と微熱",
  "朝焼けの匂い",
  "夜風の記憶",
  "恋の余白",
  "午後三時に",
  "小さな花束の嘘",
  "冬のせつな",
  "空白の夏",
  "君の面影の香り",
];

// placeholderプロップを追加
interface FragranceSearchProps {
  placeholder?: string
}

export default function FragranceSearch({ placeholder }: FragranceSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [randomExample, setRandomExample] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // 画面サイズとランダムな例文の設定
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初期設定
    handleResize()
    const exampleList = window.innerWidth < 768 ? MOBILE_EXAMPLE_PHRASES : EXAMPLE_PHRASES
    const randomIndex = Math.floor(Math.random() * exampleList.length)
    setRandomExample(exampleList[randomIndex])

    // リサイズイベントの監視
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 画面サイズが変更されたときに例文を更新
  useEffect(() => {
    const exampleList = isMobile ? MOBILE_EXAMPLE_PHRASES : EXAMPLE_PHRASES
    const randomIndex = Math.floor(Math.random() * exampleList.length)
    setRandomExample(exampleList[randomIndex])
  }, [isMobile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ナビゲーションパスを修正
    router.push(`/Fragrance-AI${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ""}`)
  }

  // placeholderを決定
  const finalPlaceholder = placeholder || `今日はどんな香りをつくる？（例： ${randomExample}）`

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl">
      <div className="relative flex-grow">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={finalPlaceholder}
          className="pr-4 h-[42px] rounded-l-full border-r-0 bg-white text-secondary-foreground placeholder:text-secondary-foreground/50 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-sm"
        />
      </div>
      <Button
        type="submit"
        className="rounded-r-full bg-primary hover:bg-primary/90 text-white px-4 h-[42px] font-montserrat relative overflow-hidden group"
      >
        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-64 opacity-10"></span>
        <span className="relative flex items-center">
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">今すぐ体験</span>
        </span>
      </Button>
    </form>
  )
}

