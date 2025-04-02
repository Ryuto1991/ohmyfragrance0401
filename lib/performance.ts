import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Core Web Vitalsの監視
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        const metric: PerformanceMetric = {
          name: entry.name,
          value: entry.value,
          rating: this.getRating(entry.name, entry.value),
        };

        const metrics = this.metrics.get(entry.name) || [];
        metrics.push(metric);
        this.metrics.set(entry.name, metrics);

        logger.performance(entry.name, entry.value);
      });
    });

    observer.observe({ 
      entryTypes: [
        'largest-contentful-paint',
        'first-input',
        'layout-shift',
        'longtask',
        'paint',
        'resource'
      ] 
    });

    // ナビゲーションタイミングの記録
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordNavigationTiming(navigation);
      }
    });
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'TTFB': { good: 800, poor: 1800 },
    };

    const metric = metricName.toUpperCase();
    if (metric in thresholds) {
      const { good, poor } = thresholds[metric as keyof typeof thresholds];
      if (value <= good) return 'good';
      if (value <= poor) return 'needs-improvement';
      return 'poor';
    }
    
    return 'needs-improvement';
  }

  private recordNavigationTiming(navigation: PerformanceNavigationTiming) {
    const timings = {
      'TTFB': navigation.responseStart - navigation.requestStart,
      'DomContentLoaded': navigation.domContentLoadedEventEnd - navigation.requestStart,
      'WindowLoad': navigation.loadEventEnd - navigation.requestStart,
    };

    Object.entries(timings).forEach(([name, value]) => {
      const metric: PerformanceMetric = {
        name,
        value,
        rating: this.getRating(name, value),
      };

      const metrics = this.metrics.get(name) || [];
      metrics.push(metric);
      this.metrics.set(name, metrics);

      logger.performance(name, value);
    });
  }

  // リソースのロード時間を監視
  trackResourceTiming(resourceUrl: string) {
    const entries = performance.getEntriesByName(resourceUrl);
    if (entries.length > 0) {
      const entry = entries[entries.length - 1] as PerformanceResourceTiming;
      const loadTime = entry.responseEnd - entry.startTime;
      
      logger.performance(`Resource Load: ${resourceUrl}`, loadTime);
    }
  }

  // JavaScriptの実行時間を計測
  measureExecutionTime(callback: () => void, label: string) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    logger.performance(`JS Execution: ${label}`, duration);
  }

  // メトリクスの取得
  getMetrics(metricName?: string) {
    if (metricName) {
      return this.metrics.get(metricName);
    }
    return Object.fromEntries(this.metrics);
  }

  // パフォーマンスレポートの生成
  generateReport() {
    const report = {
      metrics: this.getMetrics(),
      summary: {
        totalMetrics: this.metrics.size,
        poorPerformanceCount: 0,
        needsImprovementCount: 0,
        goodPerformanceCount: 0,
      },
      recommendations: [] as string[],
    };

    this.metrics.forEach((metrics, name) => {
      const latestMetric = metrics[metrics.length - 1];
      if (latestMetric) {
        switch (latestMetric.rating) {
          case 'poor':
            report.summary.poorPerformanceCount++;
            report.recommendations.push(
              `${name} needs immediate attention (${latestMetric.value}ms)`
            );
            break;
          case 'needs-improvement':
            report.summary.needsImprovementCount++;
            report.recommendations.push(
              `${name} could be improved (${latestMetric.value}ms)`
            );
            break;
          case 'good':
            report.summary.goodPerformanceCount++;
            break;
        }
      }
    });

    return report;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 