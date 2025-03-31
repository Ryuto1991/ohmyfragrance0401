"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type FloatingElement = {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  delay: number
  duration: number
  type: "circle" | "square" | "bottle" | "flower" | "leaf"
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initial size
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Generate floating elements
    const newElements: FloatingElement[] = []

    // Generate 6 random elements (reduced from 10)
    for (let i = 0; i < 6; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100, // percentage of screen width
        y: Math.random() * 100, // percentage of screen height
        size: Math.random() * 30 + 15, // size between 15-45px (smaller)
        rotation: Math.random() * 360, // random initial rotation
        delay: Math.random() * 2, // random delay for animation
        duration: Math.random() * 10 + 20, // animation duration between 20-30s (slower)
        type: ["circle", "square", "bottle", "flower", "leaf"][Math.floor(Math.random() * 5)] as any,
      })
    }

    setElements(newElements)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getElementColor = (type: string) => {
    switch (type) {
      case "circle":
        return "#FFE8E8" // very light pink
      case "square":
        return "#E8F0FF" // very light blue
      case "bottle":
        return "#E8F8E8" // very light green
      case "flower":
        return "#FFF0E8" // very light orange
      case "leaf":
        return "#E8FFF0" // very light mint
      default:
        return "#F8F8F8" // very light gray
    }
  }

  const getElementShape = (type: string, size: number) => {
    switch (type) {
      case "circle":
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: getElementColor(type),
            }}
          />
        )
      case "square":
        return (
          <div
            className=""
            style={{
              width: size,
              height: size,
              backgroundColor: getElementColor(type),
            }}
          />
        )
      case "bottle":
        return (
          <div className="relative" style={{ width: size, height: size * 1.5 }}>
            <div
              className="absolute bottom-0 w-full rounded-b-lg"
              style={{
                height: "80%",
                backgroundColor: getElementColor(type),
              }}
            />
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 rounded-t-lg"
              style={{
                width: "40%",
                height: "30%",
                backgroundColor: getElementColor(type),
              }}
            />
          </div>
        )
      case "flower":
        return (
          <div className="relative" style={{ width: size, height: size }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: size / 2,
                  height: size / 2,
                  backgroundColor: getElementColor(type),
                  top: i === 0 ? 0 : i === 1 ? size / 4 : i === 2 ? size / 2 : i === 3 ? size / 4 : 0,
                  left: i === 0 ? size / 4 : i === 1 ? 0 : i === 2 ? size / 4 : i === 3 ? size / 2 : size / 4,
                  transform: `rotate(${i * 72}deg)`,
                }}
              />
            ))}
            <div
              className="absolute rounded-full"
              style={{
                width: size / 3,
                height: size / 3,
                backgroundColor: "#FFFCE8",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        )
      case "leaf":
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size / 2,
              backgroundColor: getElementColor(type),
              borderTopLeftRadius: size,
              borderTopRightRadius: size,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              transform: "rotate(45deg)",
            }}
          />
        )
      default:
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: getElementColor(type),
            }}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            zIndex: 1,
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: element.rotation,
            opacity: 0.4,
          }}
          animate={{
            x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
            y: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
            rotate: element.rotation + 360,
            opacity: [0.4, 0.2, 0.4, 0.2, 0.4],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          {getElementShape(element.type, element.size)}
        </motion.div>
      ))}
    </div>
  )
}

