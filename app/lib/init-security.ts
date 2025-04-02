import { SecurityScheduler } from '../utils/security-scheduler'

export async function initializeSecurity() {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return
  }

  try {
    // セキュリティスケジューラーの初期化
    const scheduler = SecurityScheduler.getInstance()
    await scheduler.initialize()

    // アプリケーション終了時のクリーンアップ
    window.addEventListener('beforeunload', async () => {
      await scheduler.stop()
    })

  } catch (error) {
    console.error('Failed to initialize security features:', error)
  }
} 