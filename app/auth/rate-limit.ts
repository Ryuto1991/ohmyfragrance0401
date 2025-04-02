interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  private config: RateLimitConfig;

  private constructor(config: RateLimitConfig = { maxAttempts: 5, windowMs: 15 * 60 * 1000 }) {
    this.config = config;
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return false;
    }

    // 時間枠を超えている場合はリセット
    if (now - attempt.timestamp > this.config.windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return false;
    }

    // 試行回数が制限を超えている場合
    if (attempt.count >= this.config.maxAttempts) {
      return true;
    }

    // 試行回数を増やす
    attempt.count++;
    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) {
      return this.config.maxAttempts;
    }

    const now = Date.now();
    if (now - attempt.timestamp > this.config.windowMs) {
      return this.config.maxAttempts;
    }

    return Math.max(0, this.config.maxAttempts - attempt.count);
  }

  getTimeUntilReset(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) {
      return 0;
    }

    const now = Date.now();
    const timeElapsed = now - attempt.timestamp;
    return Math.max(0, this.config.windowMs - timeElapsed);
  }
}

export const rateLimiter = RateLimiter.getInstance(); 