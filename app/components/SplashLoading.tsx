'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false
})

const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), {
  ssr: false
})

interface SplashLoadingProps {
  onLoadingComplete?: () => void
}

export function SplashLoading({ onLoadingComplete }: SplashLoadingProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onLoadingComplete?.()
    }, 2000) // 2秒後に非表示

    return () => clearTimeout(timer)
  }, [onLoadingComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <div className="relative flex flex-col items-center">
            <MotionDiv
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="mb-4 h-16 w-16 rounded-full bg-primary"
            >
              <MotionDiv
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="h-full w-full rounded-full bg-primary/50"
              />
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-primary">Fragrance Lab</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                読み込み中...
              </p>
            </MotionDiv>
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "linear" }}
              className="mt-4 h-1 w-48 rounded-full bg-primary/20"
            >
              <MotionDiv
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-full rounded-full bg-primary"
              />
            </MotionDiv>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
} 