"use client"

import { Button } from '@/components/ui/button'

interface Choice {
  name: string
  description?: string
}

interface ChoiceButtonsProps {
  choices: Choice[]
  onSelect: (value: string) => void
}

export function ChoiceButtons({ choices, onSelect }: ChoiceButtonsProps) {
  return (
    <div className="space-y-2">
      {choices.map((choice, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <Button
            variant="outline"
            onClick={() => onSelect(choice.name)}
            className="w-full text-left font-zen justify-start"
          >
            {choice.name}
          </Button>
          {choice.description && (
            <p className="text-sm text-muted-foreground pl-2">
              {choice.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
} 