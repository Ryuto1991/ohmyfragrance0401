"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TypewriterTextProps {
  content: string
  typingSpeed?: number
  onComplete?: () => void
}

export function TypewriterText({ 
  content, 
  typingSpeed = 30,
  onComplete 
}: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!content || typeof content !== 'string') {
      console.log("TypewriterText: Invalid content", content)
      return
    }

    let currentIndex = 0
    setDisplayedContent("")
    setIsComplete(false)

    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(prev => prev + content[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, typingSpeed)

    return () => clearInterval(interval)
  }, [content, typingSpeed, onComplete])

  if (!content || typeof content !== 'string') {
    return null
  }

  return (
    <div className="relative">
      <span>{displayedContent}</span>
      <AnimatePresence>
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute -right-2 bottom-0"
          >
            ▍
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
} 