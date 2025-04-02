import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface LoginHistoryEntry {
  user_id: string
  ip_address: string
  user_agent: string
  device_type: string
  browser: string
  os: string
  location?: string
  status: 'success' | 'failure'
  failure_reason?: string
}

export class LoginHistory {
  private static instance: LoginHistory

  private constructor() {}

  public static getInstance(): LoginHistory {
    if (!LoginHistory.instance) {
      LoginHistory.instance = new LoginHistory()
    }
    return LoginHistory.instance
  }

  private parseUserAgent(userAgent: string): { deviceType: string; browser: string; os: string } {
    const ua = userAgent.toLowerCase()
    let deviceType = 'unknown'
    let browser = 'unknown'
    let os = 'unknown'

    // デバイスタイプの判定
    if (ua.includes('mobile')) {
      deviceType = 'mobile'
    } else if (ua.includes('tablet')) {
      deviceType = 'tablet'
    } else {
      deviceType = 'desktop'
    }

    // ブラウザの判定
    if (ua.includes('chrome')) {
      browser = 'Chrome'
    } else if (ua.includes('firefox')) {
      browser = 'Firefox'
    } else if (ua.includes('safari')) {
      browser = 'Safari'
    } else if (ua.includes('edge')) {
      browser = 'Edge'
    }

    // OSの判定
    if (ua.includes('windows')) {
      os = 'Windows'
    } else if (ua.includes('mac')) {
      os = 'MacOS'
    } else if (ua.includes('linux')) {
      os = 'Linux'
    } else if (ua.includes('android')) {
      os = 'Android'
    } else if (ua.includes('ios')) {
      os = 'iOS'
    }

    return { deviceType, browser, os }
  }

  public async recordLogin(
    userId: string,
    status: 'success' | 'failure',
    failureReason?: string
  ): Promise<void> {
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const { deviceType, browser, os } = this.parseUserAgent(userAgent)

    const entry: LoginHistoryEntry = {
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_type: deviceType,
      browser: browser,
      os: os,
      status: status,
      failure_reason: failureReason,
    }

    try {
      const { error } = await supabase
        .from('login_history')
        .insert([entry])

      if (error) {
        console.error('Failed to record login history:', error)
      }
    } catch (error) {
      console.error('Error recording login history:', error)
    }
  }

  public async getLoginHistory(userId: string, limit: number = 10): Promise<LoginHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch login history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching login history:', error)
      return []
    }
  }

  public async getSuspiciousActivity(userId: string): Promise<LoginHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'failure')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch suspicious activity:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching suspicious activity:', error)
      return []
    }
  }
} 