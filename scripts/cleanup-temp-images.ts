import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config({ path: '.env.test' });

async function cleanupTempImages() {
  try {
    console.log('Starting cleanup process...');

    // クリーンアップAPIを呼び出し
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cleanup-temp-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLEANUP_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Cleanup failed');
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// スクリプトの実行
cleanupTempImages(); 