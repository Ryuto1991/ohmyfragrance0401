'use client'

import { cn } from "@/lib/utils"
import { Loading } from "./loading"
import { Error } from "./error"

interface LayoutProps {
  children: React.ReactNode
  className?: string
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
  sidebar?: React.ReactNode
  fullWidth?: boolean
}

export function Layout({
  children,
  className,
  loading,
  error,
  onRetry,
  header,
  footer,
  sidebar,
  fullWidth = false,
}: LayoutProps) {
  const mainClasses = cn(
    'min-h-screen bg-background',
    fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    className
  )

  const contentClasses = cn(
    'flex-1',
    sidebar ? 'lg:ml-64' : ''
  )

  if (loading) {
    return (
      <div className={mainClasses}>
        <Loading
          text="読み込み中..."
          className="min-h-screen"
          size="lg"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className={mainClasses}>
        <Error
          title="エラーが発生しました"
          message={error}
          retry={onRetry}
          className="min-h-screen"
        />
      </div>
    )
  }

  return (
    <div className={mainClasses}>
      {header && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}

      <div className="flex min-h-screen">
        {sidebar && (
          <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r bg-background lg:block">
            {sidebar}
          </aside>
        )}

        <main className={contentClasses}>
          {children}
        </main>
      </div>

      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  )
} 