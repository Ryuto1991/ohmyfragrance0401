import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

// スクロール位置の保存と復元
export function useScrollPosition(key: string) {
  const scrollPosition = useRef(0)
  const isScrolling = useRef(false)

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(key)
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition))
    }

    const handleScroll = () => {
      if (!isScrolling.current) {
        isScrolling.current = true
        requestAnimationFrame(() => {
          scrollPosition.current = window.scrollY
          sessionStorage.setItem(key, scrollPosition.current.toString())
          isScrolling.current = false
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [key])

  const saveScrollPosition = useCallback(() => {
    scrollPosition.current = window.scrollY
    sessionStorage.setItem(key, scrollPosition.current.toString())
  }, [key])

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem(key)
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition),
        behavior: 'smooth'
      })
    }
  }, [key])

  return {
    saveScrollPosition,
    restoreScrollPosition,
    currentPosition: scrollPosition.current
  }
}

// 画像の遅延読み込み最適化
export function useLazyImage(options = {}) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  })

  return { ref, inView }
}

// アニメーションの最適化
export function useOptimizedAnimation(options = {}) {
  const elementRef = useRef<HTMLElement>(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating.current) {
            isAnimating.current = true
            requestAnimationFrame(() => {
              element.style.opacity = '1'
              element.style.transform = 'translateY(0)'
              isAnimating.current = false
            })
          }
        })
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return elementRef
}

// デバウンス処理の最適化
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastCallRef = useRef<number>(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (now - lastCallRef.current >= delay) {
        callback(...args)
        lastCallRef.current = now
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastCallRef.current = Date.now()
        }, delay)
      }
    },
    [callback, delay]
  )
}

// スロットル処理の最適化
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
) {
  const inThrottle = useRef(false)
  const lastCallRef = useRef<number>(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (!inThrottle.current && now - lastCallRef.current >= limit) {
        callback(...args)
        lastCallRef.current = now
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    },
    [callback, limit]
  )
}

// メモリ使用量の最適化
export function useCleanupEffect(
  cleanup: () => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    return () => {
      cleanup()
      if (global.gc) {
        global.gc()
      }
    }
  }, dependencies)
}

// パフォーマンス最適化されたイベントリスナー
export function useOptimizedEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window,
  options: AddEventListenerOptions = {}
) {
  useEffect(() => {
    const optimizedHandler = (event: Event) => {
      requestAnimationFrame(() => {
        handler(event)
      })
    }

    element.addEventListener(eventName, optimizedHandler, {
      passive: true,
      ...options,
    })
    return () => element.removeEventListener(eventName, optimizedHandler)
  }, [eventName, handler, element, options])
}

// パフォーマンス最適化されたリサイズハンドラー
export function useOptimizedResize(handler: () => void) {
  const throttledHandler = useThrottle(handler, 100)
  useOptimizedEventListener('resize', throttledHandler)
}

// パフォーマンス最適化されたスクロールハンドラー
export function useOptimizedScroll(handler: () => void) {
  const throttledHandler = useThrottle(handler, 100)
  useOptimizedEventListener('scroll', throttledHandler, window)
}

// パフォーマンス最適化されたタッチハンドラー
export function useOptimizedTouch(handler: (event: TouchEvent) => void) {
  const debouncedHandler = useDebounce(handler, 100)
  useOptimizedEventListener('touchmove', debouncedHandler)
}

// メモ化された計算
export function useMemoizedValue<T>(
  factory: () => T,
  dependencies: any[]
): T {
  return useMemo(factory, dependencies)
}

// パフォーマンス最適化された状態更新
export function useOptimizedState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof newState === 'function' ? newState(prev) : newState
      return next
    })
  }, [])
  return [state, updateState] as const
} 