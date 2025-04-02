type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };
  }

  private async saveLog(entry: LogEntry) {
    // ログをメモリに保存
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry);
    }

    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        console.error('Failed to send log to server:', error);
      }
    }
  }

  info(message: string, data?: any) {
    const entry = this.createLogEntry('info', message, data);
    this.saveLog(entry);
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry('warn', message, data);
    this.saveLog(entry);
  }

  error(message: string, error?: Error | any) {
    const entry = this.createLogEntry('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    });
    this.saveLog(entry);
  }

  // パフォーマンスメトリクスの記録
  performance(name: string, value: number) {
    this.info(`Performance Metric: ${name}`, { value });
  }

  // ユーザーアクションの記録
  trackUserAction(action: string, details?: any) {
    this.info(`User Action: ${action}`, details);
  }

  // APIリクエストの記録
  trackApiRequest(
    method: string,
    url: string,
    status: number,
    duration: number
  ) {
    this.info(`API Request: ${method} ${url}`, {
      status,
      duration,
    });
  }

  // エラー分析用のメソッド
  getErrorStats() {
    const errorLogs = this.logs.filter(log => log.level === 'error');
    return {
      total: errorLogs.length,
      byType: errorLogs.reduce((acc, log) => {
        const errorType = log.data?.error?.name || 'Unknown';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentErrors: errorLogs.slice(-10),
    };
  }

  // ログのエクスポート
  exportLogs() {
    return {
      logs: this.logs,
      stats: {
        total: this.logs.length,
        byLevel: this.logs.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {} as Record<LogLevel, number>),
      },
    };
  }
}

export const logger = Logger.getInstance(); 