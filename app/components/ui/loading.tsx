'use client'

import { cn } from "@/lib/utils"

interface LoadingProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'overlay'
}

export function Loading({
  text = 'Loading...',
  className,
  size = 'md',
  variant = 'default'
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    variant === 'overlay' && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    className
  )

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
} 