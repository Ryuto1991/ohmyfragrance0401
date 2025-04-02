import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useLazyImage } from '@/lib/performance-utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const { ref, inView } = useLazyImage({
    threshold: 0.1,
    triggerOnce: true,
  })

  // 画像のプリロード
  useEffect(() => {
    if (priority) {
      const img = new Image()
      img.src = src
      img.onload = () => {
        setIsLoading(false)
        onLoad?.()
      }
      img.onerror = (e) => {
        setError(true)
        onError?.(new Error('Failed to load image'))
      }
    }
  }, [priority, src, onLoad, onError])

  // ビューポートに入った時の処理
  useEffect(() => {
    if (inView) {
      setIsInView(true)
    }
  }, [inView])

  // 画像の最適化設定
  const imageProps = {
    src,
    alt,
    width,
    height,
    className: cn(
      'duration-700 ease-in-out',
      isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
      error && 'opacity-50'
    ),
    onLoadingComplete: () => {
      setIsLoading(false)
      onLoad?.()
    },
    onError: (e: Error) => {
      setError(true)
      onError?.(e)
    },
    loading: priority ? 'eager' : 'lazy',
    quality,
    sizes,
    placeholder,
    blurDataURL,
  }

  // プレースホルダーの生成
  const generatePlaceholder = useCallback(() => {
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            filter: 'blur(20px)',
          }}
        />
      )
    }
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }, [placeholder, blurDataURL])

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {isInView && <Image {...imageProps} />}
      {isLoading && generatePlaceholder()}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">画像の読み込みに失敗しました</span>
        </div>
      )}
    </div>
  )
} 