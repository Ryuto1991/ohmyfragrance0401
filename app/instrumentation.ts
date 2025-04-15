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
          // Check entryType and cast to PerformanceEventTiming
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming;
            reportWebVitals({
              name: 'FID',
              value: firstInputEntry.processingStart - firstInputEntry.startTime,
              label: 'web-vital',
            })
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      let clsEntries: PerformanceEntry[] = [] // Use a more specific type if possible, or PerformanceEntry
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Check entryType, cast to any (since LayoutShift type isn't found), then check hadRecentInput
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as any; // Cast to any as LayoutShift is not found
            if (!layoutShiftEntry.hadRecentInput) {
              clsEntries.push(layoutShiftEntry);
              clsValue += layoutShiftEntry.value;
              reportWebVitals({
                name: 'CLS',
                value: clsValue,
                label: 'web-vital',
              });
            } // <-- Added missing closing brace here
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }
}
