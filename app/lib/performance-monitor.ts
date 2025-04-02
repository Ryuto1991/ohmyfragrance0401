interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  tti: number // Time to Interactive
  tbt: number // Total Blocking Time
  memory: number // Memory Usage
  network: number // Network Speed
  resourceTiming: ResourceTiming[] // Resource Timing
  navigationTiming: NavigationTiming // Navigation Timing
  layoutMetrics: LayoutMetrics // Layout Metrics
}

interface ResourceTiming {
  name: string
  duration: number
  size: number
  type: string
}

interface NavigationTiming {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
}

interface LayoutMetrics {
  totalElements: number
  visibleElements: number
  layoutShifts: number
  layoutShiftScore: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics
  private observers: Map<string, PerformanceObserver>
  private isInitialized: boolean
  private lastMemoryCheck: number
  private memoryCheckInterval: number
  private resourceTimings: ResourceTiming[]
  private layoutMetrics: LayoutMetrics

  private constructor() {
    this.metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      tti: 0,
      tbt: 0,
      memory: 0,
      network: 0,
      resourceTiming: [],
      navigationTiming: {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
      },
      layoutMetrics: {
        totalElements: 0,
        visibleElements: 0,
        layoutShifts: 0,
        layoutShiftScore: 0,
      },
    }
    this.observers = new Map()
    this.isInitialized = false
    this.lastMemoryCheck = 0
    this.memoryCheckInterval = 60000 // 1分
    this.resourceTimings = []
    this.layoutMetrics = {
      totalElements: 0,
      visibleElements: 0,
      layoutShifts: 0,
      layoutShiftScore: 0,
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  init(): void {
    if (this.isInitialized) return

    // 基本メトリクスの計測
    this.observeFCP()
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.measureTTFB()
    this.measureTTI()
    this.measureTBT()

    // 追加メトリクスの計測
    this.observeMemory()
    this.measureNetworkSpeed()
    this.observeResourceTiming()
    this.observeNavigationTiming()
    this.observeLayoutMetrics()

    this.isInitialized = true
  }

  private observeFCP(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.fcp = lastEntry.startTime
      this.logMetric('FCP', this.metrics.fcp)
    })

    observer.observe({ entryTypes: ['paint'] })
    this.observers.set('fcp', observer)
  }

  private observeLCP(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.lcp = lastEntry.startTime
      this.logMetric('LCP', this.metrics.lcp)
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', observer)
  }

  private observeFID(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.fid = lastEntry.processingStart - lastEntry.startTime
      this.logMetric('FID', this.metrics.fid)
    })

    observer.observe({ entryTypes: ['first-input'] })
    this.observers.set('fid', observer)
  }

  private observeCLS(): void {
    let clsValue = 0
    let clsEntries = []

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry)
          clsValue += entry.value
          this.metrics.cls = clsValue
          this.logMetric('CLS', this.metrics.cls)
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('cls', observer)
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart
      this.logMetric('TTFB', this.metrics.ttfb)
    }
  }

  private measureTTI(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.tti = lastEntry.startTime
      this.logMetric('TTI', this.metrics.tti)
    })

    observer.observe({ entryTypes: ['longtask'] })
    this.observers.set('tti', observer)
  }

  private measureTBT(): void {
    let tbt = 0
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        tbt += entry.duration - 50
        this.metrics.tbt = tbt
        this.logMetric('TBT', this.metrics.tbt)
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
    this.observers.set('tbt', observer)
  }

  private observeMemory(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const now = Date.now()
        if (now - this.lastMemoryCheck >= this.memoryCheckInterval) {
          const memory = (performance as any).memory
          this.metrics.memory = memory.usedJSHeapSize / 1024 / 1024 // MB
          this.logMetric('Memory', this.metrics.memory)
          this.lastMemoryCheck = now
        }
      }

      setInterval(checkMemory, this.memoryCheckInterval)
    }
  }

  private async measureNetworkSpeed(): Promise<void> {
    try {
      const start = performance.now()
      const response = await fetch('/api/network-test', {
        method: 'HEAD',
        cache: 'no-cache',
      })
      const end = performance.now()
      const duration = end - start
      this.metrics.network = duration
      this.logMetric('Network', this.metrics.network)
    } catch (error) {
      console.error('Network speed measurement failed:', error)
    }
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming
        this.resourceTimings.push({
          name: resourceEntry.name,
          duration: resourceEntry.duration,
          size: resourceEntry.transferSize,
          type: resourceEntry.initiatorType,
        })
      }
      this.metrics.resourceTiming = this.resourceTimings
      this.logMetric('ResourceTiming', this.resourceTimings)
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resourceTiming', observer)
  }

  private observeNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation) {
      this.metrics.navigationTiming = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
      this.logMetric('NavigationTiming', this.metrics.navigationTiming)
    }
  }

  private observeLayoutMetrics(): void {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          this.layoutMetrics.layoutShifts++
          this.layoutMetrics.layoutShiftScore += entry.value
        }
      }
      this.metrics.layoutMetrics = this.layoutMetrics
      this.logMetric('LayoutMetrics', this.layoutMetrics)
    })

    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('layoutMetrics', observer)

    // DOM要素の計測
    const updateElementCounts = () => {
      const elements = document.getElementsByTagName('*')
      this.layoutMetrics.totalElements = elements.length
      this.layoutMetrics.visibleElements = Array.from(elements).filter(
        (el) => el.getBoundingClientRect().top < window.innerHeight
      ).length
      this.metrics.layoutMetrics = this.layoutMetrics
      this.logMetric('LayoutMetrics', this.layoutMetrics)
    }

    window.addEventListener('load', updateElementCounts)
    window.addEventListener('resize', updateElementCounts)
  }

  private logMetric(name: string, value: any): void {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          value,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          devicePixelRatio: window.devicePixelRatio,
        }),
      }).catch(console.error)
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
    this.isInitialized = false
  }
}

// シングルトンインスタンスをエクスポート
export const performanceMonitor = PerformanceMonitor.getInstance()

// パフォーマンスモニタリングフック
export function usePerformanceMonitoring() {
  useEffect(() => {
    performanceMonitor.init()
    return () => {
      performanceMonitor.disconnect()
    }
  }, [])
} 