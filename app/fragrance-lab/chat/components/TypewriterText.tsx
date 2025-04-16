"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TypewriterTextProps {
  content: string
  speed?: number
}

export function TypewriterText({ content, speed = 30 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + content[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [content, currentIndex, speed])

  return <div className="whitespace-pre-wrap">{displayText}</div>
} 