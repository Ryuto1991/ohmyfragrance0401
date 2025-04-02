'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface ErrorProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export function Error({
  title = 'エラーが発生しました',
  message = '申し訳ありませんが、問題が発生しました。もう一度お試しください。',
  retry,
  className
}: ErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
      {retry && (
        <Button
          variant="outline"
          onClick={retry}
          className="mt-2"
        >
          再試行
        </Button>
      )}
    </div>
  )
} 