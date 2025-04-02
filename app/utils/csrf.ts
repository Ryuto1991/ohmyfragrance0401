import { Redis } from '@upstash/redis'
import { randomBytes } from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export class CSRFProtection {
  private static instance: CSRFProtection
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 // 24時間

  private constructor() {}

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection()
    }
    return CSRFProtection.instance
  }

  public generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  public async storeToken(token: string, userId: string): Promise<void> {
    const key = `csrf:${userId}`
    await redis.set(key, token, { ex: this.TOKEN_EXPIRY })
  }

  public async validateToken(token: string, userId: string): Promise<boolean> {
    const key = `csrf:${userId}`
    const storedToken = await redis.get<string>(key)
    return token === storedToken
  }

  public async invalidateToken(userId: string): Promise<void> {
    const key = `csrf:${userId}`
    await redis.del(key)
  }
} 