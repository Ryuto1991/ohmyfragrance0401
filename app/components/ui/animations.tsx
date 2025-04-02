'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface SlideInProps {
  children: React.ReactNode
  className?: string
  direction?: 'left' | 'right' | 'top' | 'bottom'
  delay?: number
  duration?: number
}

export function SlideIn({
  children,
  className,
  direction = 'left',
  delay = 0,
  duration = 0.5,
}: SlideInProps) {
  const directionMap = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  }

  const initial = directionMap[direction]

  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...initial }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
}

export function AnimatedList({
  children,
  className,
  itemClassName,
  staggerDelay = 0.1,
}: AnimatedListProps) {
  return (
    <motion.div className={className}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: index * staggerDelay,
              ease: 'easeOut',
            }}
            className={itemClassName}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
} 