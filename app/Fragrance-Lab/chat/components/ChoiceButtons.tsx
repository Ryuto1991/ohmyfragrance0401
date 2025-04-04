"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ChoiceButtonsProps {
  choices: string[]
  onSelect: (choice: string) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function ChoiceButtons({ choices, onSelect }: ChoiceButtonsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2 w-full"
    >
      {choices.map((choice, index) => (
        <motion.div key={index} variants={item}>
          <Button
            variant="outline"
            className="w-full text-left justify-start hover:bg-primary/5 transition-colors"
            onClick={() => onSelect(choice)}
          >
            {choice}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  )
} 