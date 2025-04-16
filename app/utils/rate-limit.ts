interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RequestRecord {
  count: number;
  timestamp: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private configs: Map<string, RateLimitConfig>;
  private requestRecords: Map<string, RequestRecord>;

  private constructor() {
    this.configs = new Map([
      ['auth', { maxRequests: 5, windowMs: 60 * 1000 }], // 1分間に5回
      ['api', { maxRequests: 100, windowMs: 60 * 1000 }], // 1分間に100回
      ['upload', { maxRequests: 10, windowMs: 60 * 1000 }], // 1分間に10回
    ]);
    this.requestRecords = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public async checkRateLimit(
    key: string,
    type: string = 'api'
  ): Promise<{ allowed: boolean; remaining: number }> {
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`Unknown rate limit type: ${type}`);
    }

    const now = Date.now();
    const windowKey = `${key}:${type}:${Math.floor(now / config.windowMs)}`;
    
    // 古いウィンドウのデータをクリーンアップ
    this.cleanupOldRecords(now);

    // 既存のレコードを取得するか、新しいレコードを作成
    let record = this.requestRecords.get(windowKey);
    
    if (!record) {
      record = { count: 0, timestamp: now };
      this.requestRecords.set(windowKey, record);
    }
    
    // カウントを増やす
    record.count++;
    
    const remaining = Math.max(0, config.maxRequests - record.count);
    const allowed = record.count <= config.maxRequests;

    return { allowed, remaining };
  }

  public async resetRateLimit(key: string, type: string = 'api'): Promise<void> {
    const now = Date.now();
    const windowKey = `${key}:${type}:${Math.floor(now / this.configs.get(type)!.windowMs)}`;
    this.requestRecords.delete(windowKey);
  }

  // 期限切れのレコードをクリーンアップ
  private cleanupOldRecords(now: number): void {
    for (const [key, record] of this.requestRecords.entries()) {
      const [_, type, _window] = key.split(':');
      const config = this.configs.get(type);
      
      if (config && (now - record.timestamp) > config.windowMs) {
        this.requestRecords.delete(key);
      }
    }
  }
}