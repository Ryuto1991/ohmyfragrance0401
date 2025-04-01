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

    // Determine number of elements based on screen width
    let elementCount = 8; // default for desktop
    if (window.innerWidth < 640) { // mobile
      elementCount = 4;
    } else if (window.innerWidth < 1024) { // tablet
      elementCount = 6;
    }

    // Generate random elements with more random positioning
    for (let i = 0; i < elementCount; i++) {
      // Create random quadrant for initial position
      const quadrant = Math.floor(Math.random() * 3) // Changed from 4 to 3 to exclude bottom-right
      let x, y
      
      switch (quadrant) {
        case 0: // top-left
          x = 20 + Math.random() * 25 // 20-45%
          y = 20 + Math.random() * 25 // 20-45%
          break
        case 1: // top-right
          x = 55 + Math.random() * 25 // 55-80%
          y = 20 + Math.random() * 25 // 20-45%
          break
        default: // bottom-left only
          x = 20 + Math.random() * 25 // 20-45%
          y = 55 + Math.random() * 25 // 55-80%
          break
      }

      // Adjust position if it's too close to the center-right (where the hero image is)
      if (x > 45 && y > 40) {
        x = 20 + Math.random() * 25 // Move it to the left side
      }

      newElements.push({
        id: i,
        x,
        y,
        size: Math.random() * 30 + 20, // slightly smaller size range: 20-50px
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
        duration: Math.random() * 6 + 14, // longer duration: 14-20s
        type: ["circle", "square", "bottle", "flower", "leaf"][Math.floor(Math.random() * 5)] as any,
      })
    }

    setElements(newElements)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getElementColor = (type: string) => {
    switch (type) {
      case "circle":
        return "#FFD6D6" // slightly darker pink
      case "square":
        return "#D6E4FF" // slightly darker blue
      case "bottle":
        return "#D6FFD6" // slightly darker green
      case "flower":
        return "#FFE0D6" // slightly darker orange
      case "leaf":
        return "#D6FFE0" // slightly darker mint
      default:
        return "#F0F0F0" // slightly darker gray
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full opacity-70">
        {elements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              zIndex: 0,
              transform: 'translate(-50%, -50%)', // Center the element
            }}
            initial={{
              x: 0,
              y: 0,
              rotate: element.rotation,
              opacity: 0.6,
              scale: 1,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0], // reduced movement range
              y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0], // reduced movement range
              rotate: element.rotation + 360,
              opacity: [0.6, 0.3, 0.6, 0.3, 0.6],
              scale: [1, 1.1, 1, 0.9, 1], // add subtle scale animation
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            <div className="transform-gpu"> {/* GPU acceleration for smoother animations */}
              {getElementShape(element.type, element.size)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

