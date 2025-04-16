const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const TerserPlugin = require('terser-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ohmyfragrance.s3.ap-northeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'igpsidgueemtziedebcs.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', '@radix-ui/react-slot'],
  },
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },
  webpack: (config, { dev, isServer }) => {
    // 開発環境では最適化をスキップ
    if (dev) return config

    // 本番環境での最適化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single',
      minimize: true,
      moduleIds: 'deterministic',
      removeAvailableModules: true,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
    }

    // 未使用のモジュールを削除
    config.optimization.usedExports = true
    config.optimization.sideEffects = true

    // 圧縮設定
    config.optimization.minimize = true
    config.optimization.minimizer = [
      ...config.optimization.minimizer,
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !dev,
          },
        },
      }),
    ]

    config.resolve.symlinks = false;
    return config
  },
  // パフォーマンス最適化
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  staticPageGenerationTimeout: 120, // 120秒に設定
}

module.exports = withBundleAnalyzer(nextConfig)