"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const fragrances = [
  {
    id: 0,
    name: "セレクト香水プラン",
    description: "10種類の香りから選べる",
    image: "/images/select-fragrance.png",
  },
  {
    id: 1,
    name: "エレガントオードパルファム",
    description: "ジャスミンとバニラの優雅な調和",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 2,
    name: "Soap Bubble Daydream",
    description: "アーティスト「Risa」とつくる香りの記憶",
    image: "/images/soap-bubble-daydream.png",
  },
  {
    id: 3,
    name: "Eternal Smoke",
    description: "ラッパー「YuruFlex」とつくる香りの余韻",
    image: "/images/eternal-smoke.webp",
  },
  {
    id: 4,
    name: "豪華なウードパフューム",
    description: "深みと神秘性を持つ東洋の香り",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 5,
    name: "フローラルブーケ",
    description: "春の花々を集めたような香り",
    image: "/placeholder.svg?height=400&width=300",
  },
]

export default function FragranceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1)
      } else if (window.innerWidth < 768) {
        setVisibleCount(2)
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3)
      } else {
        setVisibleCount(4)
      }
    }

    updateVisibleCount()
    window.addEventListener("resize", updateVisibleCount)
    return () => window.removeEventListener("resize", updateVisibleCount)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + visibleCount >= fragrances.length ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? Math.max(0, fragrances.length - visibleCount) : prevIndex - 1))
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1"></div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-none border-black hover:bg-black hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-none border-black hover:bg-black hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            width: `${(fragrances.length / visibleCount) * 100}%`,
          }}
        >
          {fragrances.map((fragrance) => (
            <div key={fragrance.id} className="px-2" style={{ width: `${(100 / fragrances.length) * visibleCount}%` }}>
              <div className="bg-white">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={fragrance.image || "/placeholder.svg"}
                    alt={fragrance.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    priority={fragrance.id === 0}
                    quality={85}
                    loading={fragrance.id === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium">{fragrance.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{fragrance.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

