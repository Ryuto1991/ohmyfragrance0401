import { supabase } from '@/lib/supabase'
import { verifyAuth, verifyProvider } from '../verify-auth'

export async function testAuthFlow(provider: string, email: string) {
  const results = {
    provider: '',
    status: '',
    error: null as string | null,
    success: false
  }

  try {
    // 1. プロバイダー検証
    const providerCheck = await verifyProvider(provider)
    results.provider = provider
    
    if (!providerCheck.success) {
      results.status = 'provider_error'
      results.error = providerCheck.error
      return results
    }

    // 2. メールドメイン検証（Googleの場合）
    if (provider === 'google' && !email.endsWith('@gmail.com')) {
      results.status = 'domain_error'
      results.error = 'Googleアカウントでログインしてください'
      return results
    }

    // 3. 認証状態の検証
    const authCheck = await verifyAuth()
    
    if (!authCheck.success) {
      results.status = authCheck.status
      results.error = authCheck.error
      return results
    }

    results.success = true
    results.status = 'authenticated'
    return results

  } catch (error) {
    results.status = 'unknown_error'
    results.error = error instanceof Error ? error.message : '不明なエラーが発生しました'
    return results
  }
}

export async function cleanupTestSession() {
  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'セッションのクリーンアップに失敗しました'
    }
  }
} 