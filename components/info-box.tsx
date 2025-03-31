import type { ReactNode } from "react"

interface InfoBoxProps {
  title: string
  description: ReactNode
  className?: string
}

export default function InfoBox({ title, description, className = "" }: InfoBoxProps) {
  return (
    <div className={`rounded-md overflow-hidden shadow-sm ${className}`}>
      <div className="bg-primary text-white text-sm font-medium p-2 text-center font-montserrat">{title}</div>
      <div className="bg-white p-2 text-center">
        <div className="text-xs text-secondary-foreground font-zen">{description}</div>
      </div>
    </div>
  )
}

