import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { RateLimiter } from './rate-limit'
import { SecurityAudit } from './security-audit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RecoveryMethod {
  type: 'email' | 'phone' | 'security_questions'
  value: string
  verified: boolean
}

interface RecoveryToken {
  token: string
  expiresAt: Date
  method: RecoveryMethod
}

export class AccountRecovery {
  private static instance: AccountRecovery
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000 // 30分
  private readonly MAX_ATTEMPTS = 3 // 最大試行回数
  private readonly LOCKOUT_DURATION = 24 * 60 * 60 * 1000 // 24時間

  private constructor() {}

  public static getInstance(): AccountRecovery {
    if (!AccountRecovery.instance) {
      AccountRecovery.instance = new AccountRecovery()
    }
    return AccountRecovery.instance
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  public async initiateRecovery(email: string): Promise<boolean> {
    try {
      // レート制限のチェック
      const rateLimiter = RateLimiter.getInstance()
      const { allowed } = await rateLimiter.checkRateLimit(email, 'account_recovery')
      
      if (!allowed) {
        throw new Error('Too many recovery attempts. Please try again later.')
      }

      // ユーザーの存在確認と復旧方法の取得
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, recovery_methods, recovery_attempts, locked_until')
        .eq('email', email)
        .single()

      if (userError || !user) {
        return false // ユーザーが存在しない場合でもtrueを返す（セキュリティ対策）
      }

      // アカウントロックのチェック
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new Error('Account is locked. Please try again later.')
      }

      // 利用可能な復旧方法の確認
      const recoveryMethods = user.recovery_methods || []
      if (recoveryMethods.length === 0) {
        throw new Error('No recovery methods available.')
      }

      // 各復旧方法に対してトークンを生成
      const tokens: RecoveryToken[] = recoveryMethods.map(method => ({
        token: this.generateToken(),
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY),
        method
      }))

      // トークンの保存
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          recovery_tokens: tokens,
          recovery_attempts: (user.recovery_attempts || 0) + 1
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update recovery tokens:', updateError)
        return false
      }

      // 復旧メールの送信
      const { error: emailError } = await supabase.functions.invoke('send-recovery-email', {
        body: { email, tokens }
      })

      if (emailError) {
        console.error('Failed to send recovery email:', emailError)
        return false
      }

      // セキュリティ監査ログの記録
      const securityAudit = SecurityAudit.getInstance()
      await securityAudit.logEvent(user.id, 'account_recovery_initiated', {
        email,
        recovery_methods: recoveryMethods.map(m => m.type)
      })

      return true
    } catch (error) {
      console.error('Error initiating account recovery:', error)
      return false
    }
  }

  public async verifyRecoveryToken(token: string, method: RecoveryMethod): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('recovery_tokens')
        .eq('recovery_tokens->>token', token)
        .single()

      if (error || !user?.recovery_tokens) {
        return false
      }

      const recoveryToken = user.recovery_tokens.find(
        (t: RecoveryToken) => t.token === token && t.method.type === method.type
      )

      if (!recoveryToken || new Date(recoveryToken.expiresAt) < new Date()) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error verifying recovery token:', error)
      return false
    }
  }

  public async resetAccount(token: string, method: RecoveryMethod, newPassword: string): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, recovery_tokens')
        .eq('recovery_tokens->>token', token)
        .single()

      if (userError || !user) {
        return false
      }

      const recoveryToken = user.recovery_tokens.find(
        (t: RecoveryToken) => t.token === token && t.method.type === method.type
      )

      if (!recoveryToken || new Date(recoveryToken.expiresAt) < new Date()) {
        return false
      }

      // パスワードの更新
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Failed to update password:', updateError)
        return false
      }

      // 復旧トークンの無効化
      const { error: tokenError } = await supabase
        .from('profiles')
        .update({
          recovery_tokens: null,
          recovery_attempts: 0,
          locked_until: null
        })
        .eq('id', user.id)

      if (tokenError) {
        console.error('Failed to invalidate recovery tokens:', tokenError)
        return false
      }

      // セキュリティ監査ログの記録
      const securityAudit = SecurityAudit.getInstance()
      await securityAudit.logEvent(user.id, 'account_recovered', {
        method: method.type
      })

      return true
    } catch (error) {
      console.error('Error resetting account:', error)
      return false
    }
  }

  public async addRecoveryMethod(userId: string, method: RecoveryMethod): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('recovery_methods')
        .eq('id', userId)
        .single()

      if (userError) {
        return false
      }

      const recoveryMethods = user.recovery_methods || []
      if (recoveryMethods.some(m => m.type === method.type)) {
        return false // 既に存在する復旧方法
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          recovery_methods: [...recoveryMethods, method]
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to add recovery method:', updateError)
        return false
      }

      // セキュリティ監査ログの記録
      const securityAudit = SecurityAudit.getInstance()
      await securityAudit.logEvent(userId, 'recovery_method_added', {
        method: method.type
      })

      return true
    } catch (error) {
      console.error('Error adding recovery method:', error)
      return false
    }
  }

  public async removeRecoveryMethod(userId: string, methodType: RecoveryMethod['type']): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('recovery_methods')
        .eq('id', userId)
        .single()

      if (userError) {
        return false
      }

      const recoveryMethods = user.recovery_methods || []
      if (recoveryMethods.length <= 1) {
        return false // 少なくとも1つの復旧方法が必要
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          recovery_methods: recoveryMethods.filter(m => m.type !== methodType)
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to remove recovery method:', updateError)
        return false
      }

      // セキュリティ監査ログの記録
      const securityAudit = SecurityAudit.getInstance()
      await securityAudit.logEvent(userId, 'recovery_method_removed', {
        method: methodType
      })

      return true
    } catch (error) {
      console.error('Error removing recovery method:', error)
      return false
    }
  }
} 