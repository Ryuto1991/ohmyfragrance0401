import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

type ChatMessageProps = {
  isAi: boolean
  children: ReactNode
  avatar?: string
}

export function ChatMessage({ isAi, children, avatar }: ChatMessageProps) {
  return (
    <div className={cn("flex w-full mb-4 animate-fadeIn", isAi ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[80%] md:max-w-[70%]", isAi ? "flex-row" : "flex-row-reverse")}>
        {isAi && (
          <div className="flex-shrink-0 mr-3">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <span className="text-xs">AI</span>
            </Avatar>
           </div>
         )}
         <div className={cn("rounded-lg p-4", isAi ? "bg-white text-secondary-foreground" : "bg-indigo-500 text-white")}>
           {children}
         </div>
       </div>
    </div>
  )
}
