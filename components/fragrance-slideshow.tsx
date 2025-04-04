"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const fragrances = [
  {
    id: 0,
    name: "セレクト香水プラン",
    description: "10種類の香りから選べる",
    image: "/images/select-fragrance.png",
    link: "/showcase/select-fragrance",
  },
  {
    id: 1,
    name: "Eternal Smoke",
    description: "ラッパー「YuruFlex」とつくる香りの余韻",
    image: "/images/eternal-smoke.webp",
    link: "/showcase/eternal-smoke",
  },
  {
    id: 2,
    name: "Bloom Whisper",
    description: "アイドル「りり香」とつくる青春の香り",
    image: "/images/bloom-whisper.webp",
    link: "/showcase/bloom-whisper",
  },
  {
    id: 3,
    name: "Soap Bubble Daydream",
    description: "アーティスト「Risa」とつくる香りの記憶",
    image: "/images/soap-bubble-daydream.png",
    link: "/showcase/soap-bubble-daydream",
  },
  {
    id: 4,
    name: "Silent Pulse",
    description: "DJ「Neon」とつくる夜の鼓動",
    image: "/images/silent-pulse.webp",
    link: "/showcase/silent-pulse",
  },
  {
    id: 5,
    name: "Erina Grace",
    description: "モデル「Erina」とつくる優雅な一日",
    image: "/images/erina-grace.webp",
    link: "/showcase/erina-grace",
  },
]

export default function FragranceSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % fragrances.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrev = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + fragrances.length) % fragrances.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % fragrances.length)
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 z-10 rounded-full bg-white/80 hover:bg-white/90"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="relative w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {fragrances.map((fragrance, index) => (
              <div key={fragrance.id} className="min-w-full">
                <Link href={fragrance.link}>
                  <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
                    <Image
                      src={fragrance.image || "/placeholder.svg"}
                      alt={fragrance.name}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
                      quality={85}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white">
                      <motion.h2
                        className="text-2xl md:text-4xl font-bold mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {fragrance.name}
                      </motion.h2>
                      <motion.p
                        className="text-sm md:text-lg max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        {fragrance.description}
                      </motion.p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 z-10 rounded-full bg-white/80 hover:bg-white/90"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        {fragrances.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-black" : "bg-gray-300"}`}
            onClick={() => {
              setAutoplay(false)
              setCurrentIndex(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}

