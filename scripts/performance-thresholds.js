/**
 * パフォーマンス測定のしきい値設定
 * 
 * これらの値はCI/CDパイプラインでの品質チェックに使用され、
 * 値を下回ると警告または失敗として処理されます
 */

module.exports = {
  // Web Vitalsの目標値
  thresholds: {
    // Lighthouse スコア (0-100)
    performance: 80, // 80%以上が目標
    accessibility: 90, // 90%以上が目標
    bestPractices: 90, // 90%以上が目標
    seo: 90, // 90%以上が目標
    
    // Core Web Vitals
    fcp: 1800, // First Contentful Paint: 1.8秒以下が目標 (ミリ秒)
    lcp: 2500, // Largest Contentful Paint: 2.5秒以下が目標 (ミリ秒)
    fid: 100, // First Input Delay: 100ミリ秒以下が目標 (ミリ秒)
    tti: 3500, // Time to Interactive: 3.5秒以下が目標 (ミリ秒)
    tbt: 300, // Total Blocking Time: 300ミリ秒以下が目標 (ミリ秒)
    cls: 0.1, // Cumulative Layout Shift: 0.1以下が目標
    
    // アプリケーション固有のしきい値
    // フレグランスチャットの特性に合わせた値
    chatResponseTime: 1000, // チャットレスポンス時間: 1秒以下が目標 (ミリ秒)
    initialLoadTime: 2000, // 初期読み込み時間: 2秒以下が目標 (ミリ秒)
    memoryUsage: 50 // メモリ使用量: 50MB以下が目標 (MB)
  }
};
