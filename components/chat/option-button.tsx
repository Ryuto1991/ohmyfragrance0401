"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

type OptionButtonProps = {
  onClick: () => void
  children: React.ReactNode
  delay?: number
}

export function OptionButton({ onClick, children }: OptionButtonProps) {
  return (
    <div className="mb-2 animate-fadeIn">
      <Button
        onClick={onClick}
        variant="outline"
        className="w-full justify-start text-left border-gray-300 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
      >
        {children}
      </Button>
    </div>
  )
}

