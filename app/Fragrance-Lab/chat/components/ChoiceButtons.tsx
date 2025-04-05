"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChoiceButtonsProps {
  choices: string[]
  choices_descriptions?: { [key: string]: string }
  onSelect?: (choice: string) => void
}

const ChoiceButton = memo(function ChoiceButton({ 
  choice,
  description,
  onSelect 
}: { 
  choice: string
  description?: string
  onSelect?: (choice: string) => void 
}) {
  const button = (
    <Button
      variant="outline"
      className={cn(
        "w-full text-sm py-1 px-3 h-auto whitespace-normal text-left",
        description && "hover:bg-primary/5"
      )}
      onClick={() => onSelect?.(choice)}
    >
      <div className="flex flex-col">
        <span className="font-medium">{choice}</span>
        {description && (
          <span className="text-xs text-muted-foreground mt-1">
            {description}
          </span>
        )}
      </div>
    </Button>
  )

  if (!description) {
    return button
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px]">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export const ChoiceButtons = memo(function ChoiceButtons({ 
  choices,
  choices_descriptions,
  onSelect 
}: ChoiceButtonsProps) {
  if (!choices || choices.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-[80%]">
      {choices.map((choice, index) => (
        <ChoiceButton
          key={index}
          choice={choice}
          description={choices_descriptions?.[choice]}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}) 