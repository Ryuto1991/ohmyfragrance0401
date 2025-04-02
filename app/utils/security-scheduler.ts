import { SecurityScanner } from './security-scanner'
import { SecurityNotifications } from './security-notifications'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScheduledTask {
  id: string
  name: string
  schedule: string // cron式のスケジュール
  lastRun: Date | null
  nextRun: Date
  enabled: boolean
  type: 'security_scan' | 'session_cleanup' | 'vulnerability_update' | 'notification_check'
}

export class SecurityScheduler {
  private static instance: SecurityScheduler
  private readonly securityScanner: SecurityScanner
  private readonly securityNotifications: SecurityNotifications
  private tasks: Map<string, NodeJS.Timeout>

  private constructor() {
    this.securityScanner = SecurityScanner.getInstance()
    this.securityNotifications = SecurityNotifications.getInstance()
    this.tasks = new Map()
  }

  public static getInstance(): SecurityScheduler {
    if (!SecurityScheduler.instance) {
      SecurityScheduler.instance = new SecurityScheduler()
    }
    return SecurityScheduler.instance
  }

  public async initialize(): Promise<void> {
    try {
      // スケジュールタスクの取得
      const { data: tasks, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('enabled', true)

      if (error) {
        console.error('Failed to fetch scheduled tasks:', error)
        return
      }

      // 各タスクのスケジューリング
      for (const task of tasks || []) {
        await this.scheduleTask(task)
      }

    } catch (error) {
      console.error('Error initializing security scheduler:', error)
    }
  }

  private async scheduleTask(task: ScheduledTask): Promise<void> {
    try {
      // 既存のタスクをキャンセル
      if (this.tasks.has(task.id)) {
        clearTimeout(this.tasks.get(task.id))
        this.tasks.delete(task.id)
      }

      // 次の実行時刻を計算
      const nextRun = this.calculateNextRun(task.schedule)
      const delay = nextRun.getTime() - Date.now()

      // タスクをスケジュール
      const timeout = setTimeout(async () => {
        await this.executeTask(task)
      }, delay)

      this.tasks.set(task.id, timeout)

      // 次の実行時刻を更新
      await supabase
        .from('scheduled_tasks')
        .update({ nextRun })
        .eq('id', task.id)

    } catch (error) {
      console.error(`Error scheduling task ${task.name}:`, error)
    }
  }

  private calculateNextRun(schedule: string): Date {
    // 簡単なcron式のパース（例: "0 0 * * *" は毎日午前0時）
    const [minute, hour, dayOfMonth, month, dayOfWeek] = schedule.split(' ')
    
    const now = new Date()
    let nextRun = new Date(now)
    
    // 分の設定
    if (minute !== '*') {
      nextRun.setMinutes(parseInt(minute))
    }
    
    // 時間の設定
    if (hour !== '*') {
      nextRun.setHours(parseInt(hour))
    }
    
    // 日付の設定
    if (dayOfMonth !== '*') {
      nextRun.setDate(parseInt(dayOfMonth))
    }
    
    // 月の設定
    if (month !== '*') {
      nextRun.setMonth(parseInt(month) - 1)
    }
    
    // 曜日の設定
    if (dayOfWeek !== '*') {
      const targetDay = parseInt(dayOfWeek)
      const currentDay = nextRun.getDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7
      nextRun.setDate(nextRun.getDate() + daysUntilTarget)
    }
    
    // 過去の日付の場合は次の実行日を設定
    if (nextRun <= now) {
      if (schedule.includes('*')) {
        // 毎日実行の場合
        nextRun.setDate(nextRun.getDate() + 1)
      } else if (schedule.includes('0 0 * * *')) {
        // 毎日午前0時の場合
        nextRun.setDate(nextRun.getDate() + 1)
      } else if (schedule.includes('0 0 * * 0')) {
        // 毎週日曜日の場合
        nextRun.setDate(nextRun.getDate() + 7)
      } else if (schedule.includes('0 0 1 * *')) {
        // 毎月1日の場合
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }
    
    return nextRun
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      console.log(`Executing task: ${task.name}`)
      
      switch (task.type) {
        case 'security_scan':
          await this.securityScanner.runSecurityScan()
          break
          
        case 'session_cleanup':
          await this.cleanupSessions()
          break
          
        case 'vulnerability_update':
          await this.updateVulnerabilityReports()
          break
          
        case 'notification_check':
          await this.checkSecurityNotifications()
          break
      }

      // 実行時刻を更新
      await supabase
        .from('scheduled_tasks')
        .update({ lastRun: new Date() })
        .eq('id', task.id)

      // 次の実行をスケジュール
      await this.scheduleTask(task)

    } catch (error) {
      console.error(`Error executing task ${task.name}:`, error)
    }
  }

  private async cleanupSessions(): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .lt('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) {
        console.error('Failed to cleanup sessions:', error)
      }
    } catch (error) {
      console.error('Error cleaning up sessions:', error)
    }
  }

  private async updateVulnerabilityReports(): Promise<void> {
    try {
      // 未解決の脆弱性レポートを取得
      const { data: reports, error } = await supabase
        .from('vulnerability_reports')
        .select('*')
        .eq('status', 'open')

      if (error) {
        console.error('Failed to fetch vulnerability reports:', error)
        return
      }

      // 各レポートの更新状況を確認
      for (const report of reports || []) {
        const { error: updateError } = await supabase
          .from('vulnerability_reports')
          .update({
            updated_at: new Date(),
            status: 'in_progress'
          })
          .eq('id', report.id)

        if (updateError) {
          console.error(`Failed to update report ${report.id}:`, updateError)
        }
      }
    } catch (error) {
      console.error('Error updating vulnerability reports:', error)
    }
  }

  private async checkSecurityNotifications(): Promise<void> {
    try {
      // 未読の重要度の高い通知を取得
      const { data: notifications, error } = await supabase
        .from('security_notifications')
        .select('*')
        .eq('read', false)
        .eq('severity', 'high')

      if (error) {
        console.error('Failed to fetch security notifications:', error)
        return
      }

      // 管理者に通知
      for (const notification of notifications || []) {
        await this.securityNotifications.createNotification(
          'admin',
          'unread_notification',
          'Unread High Severity Notification',
          `There are ${notifications.length} unread high severity notifications`,
          'high',
          {
            notification_ids: notifications.map(n => n.id)
          }
        )
      }
    } catch (error) {
      console.error('Error checking security notifications:', error)
    }
  }

  public async stop(): Promise<void> {
    // すべてのスケジュールタスクを停止
    for (const timeout of this.tasks.values()) {
      clearTimeout(timeout)
    }
    this.tasks.clear()
  }
} 