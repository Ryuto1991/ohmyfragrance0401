import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SessionInfo {
  id: string
  user_id: string
  device_info: {
    user_agent: string
    ip_address: string
    device_type: string
    browser: string
    os: string
  }
  last_active: Date
  created_at: Date
}

export class SessionManager {
  private static instance: SessionManager
  private readonly MAX_CONCURRENT_SESSIONS = 5 // 最大同時セッション数
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24時間

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
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

  public async createSession(userId: string): Promise<SessionInfo | null> {
    try {
      const headersList = headers()
      const userAgent = headersList.get('user-agent') || 'unknown'
      const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
      const { deviceType, browser, os } = this.parseUserAgent(userAgent)

      // 同時セッション数のチェック
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })

      if (sessions && sessions.length >= this.MAX_CONCURRENT_SESSIONS) {
        // 最も古いセッションを終了
        await this.terminateSession(sessions[sessions.length - 1].id)
      }

      // 新しいセッションの作成
      const { data: session, error } = await supabase
        .from('sessions')
        .insert([{
          user_id: userId,
          device_info: {
            user_agent: userAgent,
            ip_address: ipAddress,
            device_type: deviceType,
            browser: browser,
            os: os
          },
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Failed to create session:', error)
        return null
      }

      return session
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  }

  public async updateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', sessionId)

      if (error) {
        console.error('Failed to update session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating session:', error)
      return false
    }
  }

  public async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        console.error('Failed to terminate session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error terminating session:', error)
      return false
    }
  }

  public async terminateAllSessions(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to terminate all sessions:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error terminating all sessions:', error)
      return false
    }
  }

  public async getActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })

      if (error) {
        console.error('Failed to get active sessions:', error)
        return []
      }

      return sessions || []
    } catch (error) {
      console.error('Error getting active sessions:', error)
      return []
    }
  }

  public async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiryTime = new Date(Date.now() - this.SESSION_TIMEOUT)
      const { error } = await supabase
        .from('sessions')
        .delete()
        .lt('last_active', expiryTime.toISOString())

      if (error) {
        console.error('Failed to cleanup expired sessions:', error)
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error)
    }
  }
} 