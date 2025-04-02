import { Redis } from '@upstash/redis'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class RateLimiter {
  private static instance: RateLimiter
  private configs: Map<string, RateLimitConfig>

  private constructor() {
    this.configs = new Map([
      ['auth', { maxRequests: 5, windowMs: 60 * 1000 }], // 1分間に5回
      ['api', { maxRequests: 100, windowMs: 60 * 1000 }], // 1分間に100回
      ['upload', { maxRequests: 10, windowMs: 60 * 1000 }], // 1分間に10回
    ])
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  public async checkRateLimit(
    key: string,
    type: string = 'api'
  ): Promise<{ allowed: boolean; remaining: number }> {
    const config = this.configs.get(type)
    if (!config) {
      throw new Error(`Unknown rate limit type: ${type}`)
    }

    const now = Date.now()
    const windowKey = `${key}:${type}:${Math.floor(now / config.windowMs)}`
    
    const [count] = await redis
      .multi()
      .incr(windowKey)
      .expire(windowKey, Math.ceil(config.windowMs / 1000))
      .exec()

    const remaining = Math.max(0, config.maxRequests - count)
    const allowed = count <= config.maxRequests

    return { allowed, remaining }
  }

  public async resetRateLimit(key: string, type: string = 'api'): Promise<void> {
    const now = Date.now()
    const windowKey = `${key}:${type}:${Math.floor(now / this.configs.get(type)!.windowMs / 1000)}`
    await redis.del(windowKey)
  }
} 