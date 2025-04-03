import { useEffect, useRef, useState } from 'react'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  className?: string
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
  overscan = 3,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  })

  if (!isMounted) {
    return null
  }

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => (
        <div
          key={virtualRow.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          {renderItem(items[virtualRow.index], virtualRow.index)}
        </div>
      ))}
    </div>
  )
} 