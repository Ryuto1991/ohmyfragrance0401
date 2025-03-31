"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimate } from "framer-motion"

interface CherryBlossomProps {
  duration?: number // アニメーションの表示時間（秒）
}

const CherryBlossom = ({ duration = 10 }: CherryBlossomProps) => {
  const [petals, setPetals] = useState<
    Array<{ id: number; x: number; y: number; size: number; rotation: number; delay: number }>
  >([])
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scope, animate] = useAnimate()

  // 花びらを生成
  useEffect(() => {
    const generatePetals = () => {
      const newPetals = []
      const count = window.innerWidth < 768 ? 15 : 25 // モバイルでは少なめに

      for (let i = 0; i < count; i++) {
        newPetals.push({
          id: i,
          x: Math.random() * 100, // 初期X位置（画面幅の割合）
          y: -10 - Math.random() * 10, // 画面上部から少し上に配置
          size: Math.random() * 15 + 10, // 10px〜25pxのサイズ
          rotation: Math.random() * 360, // ランダムな回転
          delay: Math.random() * 3, // 0〜3秒のランダムな遅延
        })
      }
      setPetals(newPetals)
    }

    generatePetals()

    // durationで指定された時間後にアニメーションを非表示
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration * 1000)

    return () => clearTimeout(timer)
  }, [duration])

  // 花びらのスタイル
  const petalStyle = {
    width: "100%",
    height: "100%",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffc0cb' opacity='0.7'%3E%3Cpath d='M12,2C7.86,2,4.5,5.36,4.5,9.5c0,5.69,7.5,12.5,7.5,12.5s7.5-6.81,7.5-12.5C19.5,5.36,16.14,2,12,2z'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  }

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-10"
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 1s ease-out" }}
    >
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          ref={scope}
          className="absolute"
          initial={{
            x: `${petal.x}%`,
            y: `${petal.y}%`,
            rotate: petal.rotation,
            opacity: 0.8,
          }}
          animate={{
            x: [`${petal.x}%`, `${petal.x - 20 + Math.random() * 10}%`, `${petal.x - 40 + Math.random() * 20}%`],
            y: [`${petal.y}%`, "50%", "120%"],
            rotate: [petal.rotation, petal.rotation + 360 + Math.random() * 180],
            opacity: [0.8, 0.9, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            delay: petal.delay,
            ease: "easeInOut",
          }}
          style={{
            width: petal.size,
            height: petal.size,
          }}
        >
          <div style={petalStyle}></div>
        </motion.div>
      ))}
    </div>
  )
}

export default CherryBlossom

