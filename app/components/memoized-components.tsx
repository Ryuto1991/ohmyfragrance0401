import { memo, useMemo } from 'react'
import { OptimizedImage } from './optimized-image'
import { VirtualizedList } from './virtualized-list'

// メモ化された画像コンポーネント
export const MemoizedImage = memo(OptimizedImage, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className &&
    prevProps.priority === nextProps.priority
  )
})

// メモ化されたリストコンポーネント
export const MemoizedList = memo(VirtualizedList, (prevProps, nextProps) => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.className === nextProps.className &&
    prevProps.overscan === nextProps.overscan
  )
})

// メモ化されたリストアイテムレンダリング関数
export function useMemoizedRenderItem<T>(
  renderItem: (item: T, index: number) => React.ReactNode
) {
  return useMemo(
    () => (item: T, index: number) => renderItem(item, index),
    [renderItem]
  )
}

// メモ化されたフィルター関数
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean
) {
  return useMemo(() => items.filter(filterFn), [items, filterFn])
}

// メモ化されたソート関数
export function useMemoizedSort<T>(
  items: T[],
  sortFn: (a: T, b: T) => number
) {
  return useMemo(() => [...items].sort(sortFn), [items, sortFn])
} 