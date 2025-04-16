import { randomBytes } from 'crypto'

// トークンをメモリ内に保存するためのMap
interface TokenData {
  token: string;
  expiry: number;
}

export class CSRFProtection {
  private static instance: CSRFProtection;
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24時間（ミリ秒）
  private tokenStore: Map<string, TokenData>;

  private constructor() {
    this.tokenStore = new Map();
  }

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  public generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  public async storeToken(token: string, userId: string): Promise<void> {
    const key = `csrf:${userId}`;
    const expiry = Date.now() + this.TOKEN_EXPIRY;
    this.tokenStore.set(key, { token, expiry });
    
    // 期限切れのトークンを定期的にクリーンアップ
    this.cleanupExpiredTokens();
  }

  public async validateToken(token: string, userId: string): Promise<boolean> {
    const key = `csrf:${userId}`;
    const data = this.tokenStore.get(key);
    
    if (!data) return false;
    
    // 期限切れチェック
    if (Date.now() > data.expiry) {
      this.tokenStore.delete(key);
      return false;
    }
    
    return token === data.token;
  }

  public async invalidateToken(userId: string): Promise<void> {
    const key = `csrf:${userId}`;
    this.tokenStore.delete(key);
  }
  
  // 期限切れのトークンをクリーンアップ
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, data] of this.tokenStore.entries()) {
      if (now > data.expiry) {
        this.tokenStore.delete(key);
      }
    }
  }
}