import { createClient } from '@supabase/supabase-js'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TwoFactorSecret {
  secret: string
  qrCode: string
}

export class TwoFactorAuth {
  private static instance: TwoFactorAuth

  private constructor() {}

  public static getInstance(): TwoFactorAuth {
    if (!TwoFactorAuth.instance) {
      TwoFactorAuth.instance = new TwoFactorAuth()
    }
    return TwoFactorAuth.instance
  }

  public generateSecret(userId: string, email: string): TwoFactorSecret {
    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(email, 'Oh My Fragrance', secret)
    
    return {
      secret,
      qrCode: QRCode.toDataURL(otpauth)
    }
  }

  public async setupTwoFactor(userId: string, secret: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_secret: secret,
          two_factor_enabled: true
        })
        .eq('id', userId)

      if (error) {
        console.error('Failed to setup 2FA:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error setting up 2FA:', error)
      return false
    }
  }

  public async verifyCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('two_factor_secret')
        .eq('id', userId)
        .single()

      if (error || !profile?.two_factor_secret) {
        return false
      }

      return authenticator.verify({
        token: code,
        secret: profile.two_factor_secret
      })
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      return false
    }
  }

  public async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_secret: null,
          two_factor_enabled: false
        })
        .eq('id', userId)

      if (error) {
        console.error('Failed to disable 2FA:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      return false
    }
  }

  public async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to check 2FA status:', error)
        return false
      }

      return profile?.two_factor_enabled || false
    } catch (error) {
      console.error('Error checking 2FA status:', error)
      return false
    }
  }
} 