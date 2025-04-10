/**
 * パフォーマンス測定自動化スクリプト
 * 
 * CI/CDパイプラインでの継続的なパフォーマンス監視のためのスクリプト
 * Lighthouseテストの実行とWeb Vitalsの測定・記録を行う
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { thresholds } = require('./performance-thresholds');

// 結果保存先ディレクトリ
const RESULTS_DIR = path.join(__dirname, '../performance-results');

// テスト対象ページ
const PAGES_TO_TEST = [
  { name: 'home', url: 'http://localhost:3000' },
  { name: 'fragrance-lab', url: 'http://localhost:3000/fragrance-lab' },
  { name: 'fragrance-chat', url: 'http://localhost:3000/fragrance-lab/chat' },
];

/**
 * Lighthouseを使用したパフォーマンス測定を実行
 */
async function runLighthouseTests() {
  console.log('🚀 Lighthouseテストを開始します...');
  
  // 結果ディレクトリの作成
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Chrome起動
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  };

  const results = [];
  const dateString = new Date().toISOString().replace(/[:.]/g, '-');

  // 各ページでLighthouseを実行
  for (const page of PAGES_TO_TEST) {
    console.log(`📊 ${page.name} のパフォーマンスを測定中...`);
    
    try {
      const runnerResult = await lighthouse(page.url, options);
      const reportHtml = runnerResult.report;
      const reportPath = path.join(RESULTS_DIR, `lighthouse-${page.name}-${dateString}.html`);
      
      fs.writeFileSync(reportPath, reportHtml);
      console.log(`✅ レポート保存: ${reportPath}`);

      // 結果の集計
      const { performance, accessibility, 'best-practices': bestPractices, seo } = runnerResult.lhr.categories;
      
      const metrics = {
        name: page.name,
        url: page.url,
        performance: performance.score * 100,
        accessibility: accessibility.score * 100,
        bestPractices: bestPractices.score * 100,
        seo: seo.score * 100,
        fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
        lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
        tti: runnerResult.lhr.audits['interactive'].numericValue,
        tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
        cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
        timestamp: new Date().toISOString(),
      };
      
      results.push(metrics);
      
      // しきい値チェック
      validateMetrics(metrics);
      
    } catch (error) {
      console.error(`❌ ${page.name} の測定中にエラーが発生しました:`, error);
    }
  }

  // Chrome終了
  await chrome.kill();
  
  // 結果をJSONとして保存
  const resultsPath = path.join(RESULTS_DIR, `performance-results-${dateString}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📝 測定結果を保存しました: ${resultsPath}`);
  
  return results;
}

/**
 * 測定値がしきい値を満たしているか検証
 */
function validateMetrics(metrics) {
  console.log(`\n📈 ${metrics.name} の測定結果:`);
  console.log(`パフォーマンススコア: ${metrics.performance.toFixed(1)}% (目標: ${thresholds.performance}%)`);
  console.log(`初回コンテンツ描画 (FCP): ${(metrics.fcp/1000).toFixed(2)}秒 (目標: ${thresholds.fcp/1000}秒)`);
  console.log(`最大コンテンツ描画 (LCP): ${(metrics.lcp/1000).toFixed(2)}秒 (目標: ${thresholds.lcp/1000}秒)`);
  console.log(`インタラクティブまでの時間 (TTI): ${(metrics.tti/1000).toFixed(2)}秒 (目標: ${thresholds.tti/1000}秒)`);
  console.log(`累積レイアウトシフト (CLS): ${metrics.cls.toFixed(3)} (目標: ${thresholds.cls})`);
  console.log(`総ブロッキング時間 (TBT): ${(metrics.tbt/1000).toFixed(2)}秒 (目標: ${thresholds.tbt/1000}秒)\n`);
  
  // CI環境で失敗条件として使用
  let passed = true;
  
  if (metrics.performance < thresholds.performance) {
    console.warn(`⚠️ パフォーマンススコアがしきい値を下回っています: ${metrics.performance.toFixed(1)}% < ${thresholds.performance}%`);
    passed = false;
  }
  
  if (metrics.fcp > thresholds.fcp) {
    console.warn(`⚠️ FCPがしきい値を超えています: ${(metrics.fcp/1000).toFixed(2)}秒 > ${thresholds.fcp/1000}秒`);
    passed = false;
  }
  
  if (metrics.lcp > thresholds.lcp) {
    console.warn(`⚠️ LCPがしきい値を超えています: ${(metrics.lcp/1000).toFixed(2)}秒 > ${thresholds.lcp/1000}秒`);
    passed = false;
  }
  
  if (metrics.tti > thresholds.tti) {
    console.warn(`⚠️ TTIがしきい値を超えています: ${(metrics.tti/1000).toFixed(2)}秒 > ${thresholds.tti/1000}秒`);
    passed = false;
  }
  
  if (metrics.cls > thresholds.cls) {
    console.warn(`⚠️ CLSがしきい値を超えています: ${metrics.cls.toFixed(3)} > ${thresholds.cls}`);
    passed = false;
  }
  
  console.log(passed ? '✅ すべての指標が目標値を満たしています!' : '❌ 一部の指標が目標値を満たしていません');
  
  return passed;
}

/**
 * 時系列パフォーマンストレンドの生成
 */
function generatePerformanceTrend() {
  console.log('📊 パフォーマンストレンドを生成中...');
  
  // 過去の測定結果を読み込む
  const files = fs.readdirSync(RESULTS_DIR)
    .filter(file => file.startsWith('performance-results-') && file.endsWith('.json'))
    .sort();
  
  if (files.length < 2) {
    console.log('⚠️ トレンド生成に十分なデータがありません。少なくとも2回の測定が必要です。');
    return;
  }
  
  // 最新5回分のデータを分析
  const recentFiles = files.slice(-5);
  const trendData = {};
  
  PAGES_TO_TEST.forEach(page => {
    trendData[page.name] = {
      performance: [],
      fcp: [],
      lcp: [],
      tti: [],
      cls: [],
      dates: []
    };
  });
  
  recentFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8'));
    const date = file.replace('performance-results-', '').replace('.json', '');
    
    data.forEach(pageData => {
      if (trendData[pageData.name]) {
        trendData[pageData.name].performance.push(pageData.performance);
        trendData[pageData.name].fcp.push(pageData.fcp);
        trendData[pageData.name].lcp.push(pageData.lcp);
        trendData[pageData.name].tti.push(pageData.tti);
        trendData[pageData.name].cls.push(pageData.cls);
        trendData[pageData.name].dates.push(date);
      }
    });
  });
  
  // トレンドレポートを生成
  const trendReport = {};
  
  Object.keys(trendData).forEach(pageName => {
    const pageData = trendData[pageName];
    const getAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const getTrend = arr => {
      if (arr.length < 2) return 'stable';
      const first = arr[0];
      const last = arr[arr.length - 1];
      const diff = last - first;
      const percentChange = (diff / first) * 100;
      
      if (Math.abs(percentChange) < 5) return 'stable';
      return diff < 0 ? 'improving' : 'degrading';
    };
    
    trendReport[pageName] = {
      performanceAvg: getAverage(pageData.performance),
      performanceTrend: getTrend(pageData.performance),
      fcpAvg: getAverage(pageData.fcp),
      fcpTrend: getTrend(pageData.fcp),
      lcpAvg: getAverage(pageData.lcp),
      lcpTrend: getTrend(pageData.lcp),
      ttiAvg: getAverage(pageData.tti),
      ttiTrend: getTrend(pageData.tti),
      clsAvg: getAverage(pageData.cls),
      clsTrend: getTrend(pageData.cls),
      dates: pageData.dates
    };
  });
  
  // トレンドレポートの保存
  const trendReportPath = path.join(RESULTS_DIR, 'performance-trend.json');
  fs.writeFileSync(trendReportPath, JSON.stringify(trendReport, null, 2));
  console.log(`📈 パフォーマンストレンドを保存しました: ${trendReportPath}`);
  
  // トレンドサマリーの表示
  Object.keys(trendReport).forEach(pageName => {
    const trend = trendReport[pageName];
    console.log(`\n📊 ${pageName} のパフォーマンストレンド:`);
    console.log(`パフォーマンススコア: ${trend.performanceAvg.toFixed(1)}% (${trend.performanceTrend})`);
    console.log(`FCP: ${(trend.fcpAvg/1000).toFixed(2)}秒 (${trend.fcpTrend})`);
    console.log(`LCP: ${(trend.lcpAvg/1000).toFixed(2)}秒 (${trend.lcpTrend})`);
    console.log(`TTI: ${(trend.ttiAvg/1000).toFixed(2)}秒 (${trend.ttiTrend})`);
    console.log(`CLS: ${trend.clsAvg.toFixed(3)} (${trend.clsTrend})`);
  });
}

/**
 * 実行中のNext.jsアプリを検出
 */
function checkIfNextJsRunning() {
  try {
    // 3000ポートが使用されているか確認
    const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
    return result.includes('LISTENING');
  } catch (error) {
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔍 パフォーマンス測定自動化を開始します...');
  
  // Next.jsアプリが起動しているか確認
  if (!checkIfNextJsRunning()) {
    console.error('❌ Next.jsアプリが起動していません。http://localhost:3000 でアプリを起動してください。');
    process.exit(1);
  }
  
  try {
    // Lighthouseテスト実行
    const results = await runLighthouseTests();
    
    // トレンド生成
    generatePerformanceTrend();
    
    // すべてのテストが成功したか確認
    const allPassed = results.every(metrics => 
      metrics.performance >= thresholds.performance &&
      metrics.fcp <= thresholds.fcp &&
      metrics.lcp <= thresholds.lcp &&
      metrics.tti <= thresholds.tti &&
      metrics.cls <= thresholds.cls
    );
    
    if (allPassed) {
      console.log('✅ すべてのパフォーマンステストが成功しました!');
      process.exit(0);
    } else {
      console.error('❌ 一部のパフォーマンステストが失敗しました。詳細はレポートを確認してください。');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ パフォーマンス測定中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  runLighthouseTests,
  validateMetrics,
  generatePerformanceTrend
};
