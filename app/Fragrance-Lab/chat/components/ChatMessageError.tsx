import { AlertCircle } from "lucide-react"

interface ChatMessageErrorProps {
  error: string
}

export function ChatMessageError({ error }: ChatMessageErrorProps) {
  return (
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  )
} 