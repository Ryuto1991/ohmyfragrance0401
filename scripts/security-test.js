const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const fs = require('fs')
const path = require('path')

async function runSecurityTests() {
  console.log('🔒 セキュリティテストを開始します...\n')

  // OWASP ZAPの実行
  try {
    console.log('🔍 OWASP ZAPによる脆弱性スキャンを実行中...')
    await execAsync('zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:3000')
    console.log('✅ OWASP ZAPスキャン完了\n')
  } catch (error) {
    console.error('❌ OWASP ZAPスキャンエラー:', error.message)
  }

  // 依存関係の脆弱性チェック
  try {
    console.log('📦 依存関係の脆弱性チェックを実行中...')
    await execAsync('npm audit')
    console.log('✅ 依存関係チェック完了\n')
  } catch (error) {
    console.error('❌ 依存関係チェックエラー:', error.message)
  }

  // TypeScriptの型チェック
  try {
    console.log('📝 TypeScriptの型チェックを実行中...')
    await execAsync('tsc --noEmit')
    console.log('✅ 型チェック完了\n')
  } catch (error) {
    console.error('❌ 型チェックエラー:', error.message)
  }

  // 環境変数のチェック
  console.log('🔑 環境変数のチェックを実行中...')
  const envFile = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8')
    const sensitiveKeys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'STRIPE_SECRET_KEY']
    const foundSensitiveKeys = sensitiveKeys.filter(key => envContent.includes(key))
    
    if (foundSensitiveKeys.length > 0) {
      console.warn('⚠️ 注意: 以下の機密キーが.env.localファイルに含まれています:')
      foundSensitiveKeys.forEach(key => console.warn(`   - ${key}`))
    } else {
      console.log('✅ 環境変数チェック完了\n')
    }
  } else {
    console.log('⚠️ .env.localファイルが見つかりません\n')
  }

  // セキュリティヘッダーのチェック
  try {
    console.log('🛡️ セキュリティヘッダーのチェックを実行中...')
    const response = await fetch('http://localhost:3000')
    const headers = response.headers
    
    const requiredHeaders = {
      'X-DNS-Prefetch-Control': 'on',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
    }

    const missingHeaders = Object.entries(requiredHeaders).filter(
      ([key, value]) => !headers.get(key)?.includes(value)
    )

    if (missingHeaders.length > 0) {
      console.warn('⚠️ 以下のセキュリティヘッダーが設定されていません:')
      missingHeaders.forEach(([key]) => console.warn(`   - ${key}`))
    } else {
      console.log('✅ セキュリティヘッダーチェック完了\n')
    }
  } catch (error) {
    console.error('❌ セキュリティヘッダーチェックエラー:', error.message)
  }

  console.log('🔒 セキュリティテスト完了')
}

runSecurityTests().catch(console.error) 