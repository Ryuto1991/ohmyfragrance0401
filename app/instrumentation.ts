export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    return
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Core Web Vitalsの監視
  if (typeof window !== 'undefined') {
    const reportWebVitals = (metric: any) => {
      console.log(metric)
      // ここでメトリクスを分析サービスに送信
      if (metric.label === 'web-vital') {
        console.log(metric.name, metric.value)
      }
    }

    // FCP (First Contentful Paint)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: 'FCP',
            value: entry.startTime,
            label: 'web-vital',
          })
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    }

    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: 'LCP',
            value: entry.startTime,
            label: 'web-vital',
          })
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            label: 'web-vital',
          })
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      let clsEntries: any[] = []
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry)
            clsValue += entry.value
            reportWebVitals({
              name: 'CLS',
              value: clsValue,
              label: 'web-vital',
            })
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }
} 