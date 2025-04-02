import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  
  use: {
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // デスクトップブラウザテスト
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // モバイルブラウザテスト
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    
    // タブレットテスト
    {
      name: 'tablet-safari',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  // テストの並列実行設定
  fullyParallel: true,
  
  // CIでの実行時の設定
  webServer: process.env.CI ? {
    command: 'npm run build && npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
};

export default config; 