interface AuthCache {
  session: {
    expires_at: number;
    user: {
      id: string;
      email: string;
      email_confirmed_at: string | null;
    };
  } | null;
  lastChecked: number;
  isValid: boolean;
}

class AuthCacheManager {
  private static instance: AuthCacheManager;
  private cache: AuthCache = {
    session: null,
    lastChecked: 0,
    isValid: false,
  };
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分

  private constructor() {}

  static getInstance(): AuthCacheManager {
    if (!AuthCacheManager.instance) {
      AuthCacheManager.instance = new AuthCacheManager();
    }
    return AuthCacheManager.instance;
  }

  setSession(session: AuthCache['session']) {
    this.cache = {
      session,
      lastChecked: Date.now(),
      isValid: true,
    };
  }

  getSession(): AuthCache['session'] {
    if (!this.isValid()) {
      return null;
    }
    return this.cache.session;
  }

  isValid(): boolean {
    if (!this.cache.isValid) {
      return false;
    }

    const now = Date.now();
    if (now - this.cache.lastChecked > this.CACHE_TTL) {
      this.cache.isValid = false;
      return false;
    }

    if (this.cache.session?.expires_at) {
      const expiresAt = new Date(this.cache.session.expires_at * 1000).getTime();
      if (now >= expiresAt) {
        this.cache.isValid = false;
        return false;
      }
    }

    return true;
  }

  invalidate() {
    this.cache = {
      session: null,
      lastChecked: 0,
      isValid: false,
    };
  }
}

export const authCache = AuthCacheManager.getInstance(); 