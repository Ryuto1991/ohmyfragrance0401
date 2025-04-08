import { supabase } from '@/lib/supabase'
import { authCache } from './auth-cache'

class SessionSync {
  private static instance: SessionSync;
  private listeners: Set<(event: StorageEvent) => void> = new Set();
  private readonly STORAGE_KEY = 'auth_session_sync';

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  static getInstance(): SessionSync {
    if (!SessionSync.instance) {
      SessionSync.instance = new SessionSync();
    }
    return SessionSync.instance;
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === this.STORAGE_KEY && event.newValue) {
      const data = JSON.parse(event.newValue);
      if (data.type === 'session_update') {
        this.notifyListeners(event);
      }
    }
  }

  private notifyListeners(event: StorageEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  addListener(listener: (event: StorageEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async syncSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        // セッション情報をローカルストレージに保存
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify({
            type: 'session_update',
            session: {
              expires_at: session.expires_at,
              user: session.user,
            },
            timestamp: Date.now(),
          })
        );

        // キャッシュを更新
        if (session && 
            typeof session.expires_at === 'number' &&
            session.user && 
            typeof session.user.email === 'string') {
          authCache.setSession({
            expires_at: session.expires_at,
            user: {
              id: session.user.id,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at || null,
            }
          });
        } else {
          authCache.invalidate();
          console.warn('Session, expires_at, user, or user.email is invalid, invalidating cache.');
        }
      } else {
        // セッションが無効な場合はキャッシュをクリア
        authCache.invalidate();
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('セッション同期エラー:', error);
    }
  }

  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    }
    this.listeners.clear();
  }
}

export const sessionSync = SessionSync.getInstance(); 