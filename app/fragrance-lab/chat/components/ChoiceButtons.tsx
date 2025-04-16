"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChoiceButtonsProps {
  choices: string[];
  choices_descriptions?: string[];
  onChoiceClick: (choice: string) => void;
  className?: string;
}

export function ChoiceButtons({
  choices,
  choices_descriptions = [],
  onChoiceClick,
  className,
}: ChoiceButtonsProps) {
  const handleClick = (choice: string) => {
    onChoiceClick(choice);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {choices.map((choice, index) => (
        <Button
          key={choice}
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => handleClick(choice)}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">{choice}</span>
            {choices_descriptions[index] && (
              <span className="text-sm text-muted-foreground">
                {choices_descriptions[index]}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
} 