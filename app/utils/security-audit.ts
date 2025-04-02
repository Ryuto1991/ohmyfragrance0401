import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AuditEventType =
  | 'login'
  | 'logout'
  | 'session_created'
  | 'session_terminated'
  | 'password_change'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'security_setting_change'
  | 'suspicious_activity'

type AuditEventSeverity = 'low' | 'medium' | 'high'

interface AuditEvent {
  id: string
  user_id: string
  event_type: AuditEventType
  ip_address: string
  user_agent: string
  details: string
  severity: AuditEventSeverity
  created_at: Date
}

const EVENT_SEVERITY: Record<AuditEventType, AuditEventSeverity> = {
  login: 'low',
  logout: 'low',
  session_created: 'low',
  session_terminated: 'low',
  password_change: 'medium',
  two_factor_enabled: 'medium',
  two_factor_disabled: 'medium',
  security_setting_change: 'medium',
  suspicious_activity: 'high'
}

export class SecurityAudit {
  private static instance: SecurityAudit

  private constructor() {}

  public static getInstance(): SecurityAudit {
    if (!SecurityAudit.instance) {
      SecurityAudit.instance = new SecurityAudit()
    }
    return SecurityAudit.instance
  }

  public async logEvent(
    userId: string,
    eventType: AuditEventType,
    details: string,
    severity?: AuditEventSeverity
  ): Promise<void> {
    try {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      const ipAddress = await this.getClientIp()

      const event: Omit<AuditEvent, 'id' | 'created_at'> = {
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent,
        details,
        severity: severity || EVENT_SEVERITY[eventType]
      }

      const { error } = await supabase
        .from('security_audit_logs')
        .insert([event])

      if (error) {
        console.error('Failed to log security event:', error)
      }
    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }

  public async getAuditLogs(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    eventType?: AuditEventType,
    severity?: AuditEventSeverity,
    limit: number = 100
  ): Promise<AuditEvent[]> {
    try {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      if (eventType) {
        query = query.eq('event_type', eventType)
      }

      if (severity) {
        query = query.eq('severity', severity)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  }

  public async getSuspiciousEvents(
    timeWindow: number = 24 * 60 * 60 * 1000 // 24時間
  ): Promise<AuditEvent[]> {
    try {
      const startDate = new Date(Date.now() - timeWindow)
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('severity', 'high')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch suspicious events:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching suspicious events:', error)
      return []
    }
  }

  public async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      const { error } = await supabase
        .from('security_audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) {
        console.error('Failed to cleanup old logs:', error)
      }
    } catch (error) {
      console.error('Error cleaning up old logs:', error)
    }
  }

  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'unknown'
    }
  }
} 