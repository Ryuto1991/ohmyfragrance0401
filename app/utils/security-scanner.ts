import { createClient } from '@supabase/supabase-js'
import { SecurityAudit } from './security-audit'
import { SecurityNotifications } from './security-notifications'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScanResult {
  type: string
  status: 'pass' | 'fail' | 'warning'
  details: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
}

interface VulnerabilityReport {
  id: string
  scan_id: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  affected_components: string[]
  remediation_steps: string[]
  status: 'open' | 'in_progress' | 'resolved'
  created_at: Date
  updated_at: Date
}

export class SecurityScanner {
  private static instance: SecurityScanner
  private readonly securityAudit: SecurityAudit
  private readonly securityNotifications: SecurityNotifications

  private constructor() {
    this.securityAudit = SecurityAudit.getInstance()
    this.securityNotifications = SecurityNotifications.getInstance()
  }

  public static getInstance(): SecurityScanner {
    if (!SecurityScanner.instance) {
      SecurityScanner.instance = new SecurityScanner()
    }
    return SecurityScanner.instance
  }

  public async runSecurityScan(): Promise<void> {
    try {
      const scanId = crypto.randomUUID()
      const results: ScanResult[] = []

      // 認証セキュリティのスキャン
      const authResults = await this.scanAuthentication()
      results.push(...authResults)

      // セッションセキュリティのスキャン
      const sessionResults = await this.scanSessions()
      results.push(...sessionResults)

      // データベースセキュリティのスキャン
      const dbResults = await this.scanDatabase()
      results.push(...dbResults)

      // ファイルストレージのスキャン
      const storageResults = await this.scanStorage()
      results.push(...storageResults)

      // 脆弱性レポートの生成
      const vulnerabilities = this.generateVulnerabilityReport(scanId, results)

      // 結果の保存
      await this.saveScanResults(scanId, results, vulnerabilities)

      // 重要度の高い脆弱性の通知
      await this.notifyHighSeverityVulnerabilities(vulnerabilities)

    } catch (error) {
      console.error('Error running security scan:', error)
    }
  }

  private async scanAuthentication(): Promise<ScanResult[]> {
    const results: ScanResult[] = []

    try {
      // 2FAの使用状況チェック
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, two_factor_enabled')
        .eq('two_factor_enabled', false)

      if (profiles && profiles.length > 0) {
        results.push({
          type: '2fa_usage',
          status: 'warning',
          details: `${profiles.length} users without 2FA enabled`,
          severity: 'medium',
          timestamp: new Date()
        })
      }

      // パスワードポリシーのチェック
      const { data: weakPasswords } = await supabase
        .from('profiles')
        .select('id')
        .eq('password_strength', 'weak')

      if (weakPasswords && weakPasswords.length > 0) {
        results.push({
          type: 'password_policy',
          status: 'warning',
          details: `${weakPasswords.length} users with weak passwords`,
          severity: 'medium',
          timestamp: new Date()
        })
      }

    } catch (error) {
      console.error('Error scanning authentication:', error)
    }

    return results
  }

  private async scanSessions(): Promise<ScanResult[]> {
    const results: ScanResult[] = []

    try {
      // 古いセッションのチェック
      const { data: oldSessions } = await supabase
        .from('sessions')
        .select('*')
        .lt('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (oldSessions && oldSessions.length > 0) {
        results.push({
          type: 'session_management',
          status: 'warning',
          details: `${oldSessions.length} inactive sessions found`,
          severity: 'low',
          timestamp: new Date()
        })
      }

      // 同時セッション数のチェック
      const { data: multipleSessions } = await supabase
        .from('sessions')
        .select('user_id, count')
        .group('user_id')
        .having('count', '>', 5)

      if (multipleSessions && multipleSessions.length > 0) {
        results.push({
          type: 'concurrent_sessions',
          status: 'warning',
          details: `${multipleSessions.length} users with multiple active sessions`,
          severity: 'medium',
          timestamp: new Date()
        })
      }

    } catch (error) {
      console.error('Error scanning sessions:', error)
    }

    return results
  }

  private async scanDatabase(): Promise<ScanResult[]> {
    const results: ScanResult[] = []

    try {
      // RLSポリシーのチェック
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

      for (const table of tables || []) {
        const { data: policies } = await supabase
          .from('information_schema.policies')
          .select('*')
          .eq('table_name', table.table_name)

        if (!policies || policies.length === 0) {
          results.push({
            type: 'database_security',
            status: 'fail',
            details: `No RLS policies found for table ${table.table_name}`,
            severity: 'high',
            timestamp: new Date()
          })
        }
      }

    } catch (error) {
      console.error('Error scanning database:', error)
    }

    return results
  }

  private async scanStorage(): Promise<ScanResult[]> {
    const results: ScanResult[] = []

    try {
      // 公開アクセス可能なファイルのチェック
      const { data: publicFiles } = await supabase
        .storage
        .from('public')
        .list()

      if (publicFiles && publicFiles.length > 0) {
        results.push({
          type: 'storage_security',
          status: 'warning',
          details: `${publicFiles.length} files in public bucket`,
          severity: 'medium',
          timestamp: new Date()
        })
      }

    } catch (error) {
      console.error('Error scanning storage:', error)
    }

    return results
  }

  private generateVulnerabilityReport(
    scanId: string,
    results: ScanResult[]
  ): VulnerabilityReport[] {
    return results
      .filter(result => result.status === 'fail' || result.severity === 'high')
      .map(result => ({
        id: crypto.randomUUID(),
        scan_id: scanId,
        type: result.type,
        description: result.details,
        severity: result.severity,
        affected_components: this.getAffectedComponents(result),
        remediation_steps: this.getRemediationSteps(result),
        status: 'open',
        created_at: new Date(),
        updated_at: new Date()
      }))
  }

  private getAffectedComponents(result: ScanResult): string[] {
    const componentMap: Record<string, string[]> = {
      '2fa_usage': ['Authentication', 'User Security'],
      'password_policy': ['Authentication', 'User Security'],
      'session_management': ['Session Management', 'User Security'],
      'concurrent_sessions': ['Session Management', 'User Security'],
      'database_security': ['Database', 'Data Security'],
      'storage_security': ['Storage', 'Data Security']
    }

    return componentMap[result.type] || []
  }

  private getRemediationSteps(result: ScanResult): string[] {
    const stepsMap: Record<string, string[]> = {
      '2fa_usage': [
        'Enable 2FA for all user accounts',
        'Send reminder emails to users without 2FA',
        'Consider making 2FA mandatory'
      ],
      'password_policy': [
        'Enforce stronger password requirements',
        'Send password reset notifications to affected users',
        'Implement password strength indicators'
      ],
      'session_management': [
        'Terminate inactive sessions',
        'Implement session timeout warnings',
        'Review session management policies'
      ],
      'concurrent_sessions': [
        'Review concurrent session limits',
        'Implement device tracking',
        'Send notifications for new device logins'
      ],
      'database_security': [
        'Implement RLS policies for all tables',
        'Review database access permissions',
        'Audit database access patterns'
      ],
      'storage_security': [
        'Review public bucket contents',
        'Implement proper access controls',
        'Move sensitive files to private buckets'
      ]
    }

    return stepsMap[result.type] || []
  }

  private async saveScanResults(
    scanId: string,
    results: ScanResult[],
    vulnerabilities: VulnerabilityReport[]
  ): Promise<void> {
    try {
      // スキャン結果の保存
      const { error: scanError } = await supabase
        .from('security_scans')
        .insert([{
          id: scanId,
          results,
          created_at: new Date()
        }])

      if (scanError) {
        console.error('Failed to save scan results:', scanError)
      }

      // 脆弱性レポートの保存
      if (vulnerabilities.length > 0) {
        const { error: vulnError } = await supabase
          .from('vulnerability_reports')
          .insert(vulnerabilities)

        if (vulnError) {
          console.error('Failed to save vulnerability reports:', vulnError)
        }
      }

    } catch (error) {
      console.error('Error saving scan results:', error)
    }
  }

  private async notifyHighSeverityVulnerabilities(
    vulnerabilities: VulnerabilityReport[]
  ): Promise<void> {
    const highSeverityVulns = vulnerabilities.filter(v => v.severity === 'high')

    for (const vuln of highSeverityVulns) {
      await this.securityNotifications.createNotification(
        'admin', // 管理者ユーザーID
        'security_vulnerability',
        'High Severity Vulnerability Detected',
        `Vulnerability: ${vuln.description}\nType: ${vuln.type}\nAffected Components: ${vuln.affected_components.join(', ')}`,
        'high',
        {
          vulnerability_id: vuln.id,
          scan_id: vuln.scan_id
        }
      )
    }
  }
} 