import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type ChatPhase = 1 | 2 | 3 | 4 | 5

interface ChatProgressStepsProps {
  currentStep: ChatPhase
}

const steps = [
  { id: 1 as ChatPhase, label: "イメージ入力" },
  { id: 2 as ChatPhase, label: "トップノート選択" },
  { id: 3 as ChatPhase, label: "ミドルノート選択" },
  { id: 4 as ChatPhase, label: "ラストノート選択" },
  { id: 5 as ChatPhase, label: "レシピ確認" },
]

export function ChatProgressSteps({ currentStep }: ChatProgressStepsProps) {
  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 py-4 sticky top-16 border-b">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-center gap-4 flex-wrap text-sm">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor: currentStep > step.id ? "#22c55e" : "rgba(255, 255, 255, 0)"
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    currentStep > step.id
                      ? "border-green-500 text-white"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </motion.div>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    currentStep === step.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "2rem" }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "h-[2px] hidden md:block",
                    currentStep > step.id + 1
                      ? "bg-green-500"
                      : currentStep > step.id
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 