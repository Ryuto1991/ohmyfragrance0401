import React, { Suspense } from 'react'; // Import React
import dynamic from 'next/dynamic'

// ローディングコンポーネント
function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// エラーコンポーネント
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-600">エラーが発生しました</h3>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
      </div>
    </div>
  )
}

// 遅延ロード用のラッパー
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    loading?: React.ComponentType
    fallback?: React.ComponentType<{ error: Error }>
    ssr?: boolean
  } = {}
) {
  const {
    loading: LoadingComponent = LoadingSpinner,
    fallback: FallbackComponent = ErrorFallback,
    ssr = true,
  } = options

  const LazyComponent = dynamic(importFunc, {
    ssr,
    loading: () => <LoadingComponent />,
  })

  return function LazyLoadWrapper(props: P) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <ErrorBoundary FallbackComponent={FallbackComponent}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    )
  }
}

// エラーバウンダリ
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode
    FallbackComponent: React.ComponentType<{ error: Error }>
  }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <this.props.FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

// 使用例 (削除)
// export const LazyModal = lazyLoad(
//   () => import('@/components/Modal'),
//   { ssr: false }
// )
//
// export const LazyChart = lazyLoad(
//   () => import('@/components/Chart'),
//   { ssr: false }
// )
//
// export const LazyForm = lazyLoad(
//   () => import('@/components/Form'),
//   { ssr: true }
// )
