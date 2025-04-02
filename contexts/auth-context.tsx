"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// パスワードポリシーのバリデーション
const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (password.length < 8) {
    return { isValid: false, error: "パスワードは8文字以上である必要があります" }
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "パスワードには少なくとも1つの大文字が必要です" }
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "パスワードには少なくとも1つの小文字が必要です" }
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "パスワードには少なくとも1つの数字が必要です" }
  }
  return { isValid: true }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; emailVerified?: boolean }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  clearError: () => {},
})

// デバイス情報を解析する関数
const parseUserAgent = (userAgent: string): string => {
  if (!userAgent) return "不明";
  
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }
  if (/Android/i.test(userAgent)) {
    return "Android";
  }
  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return "Mac";
  }
  return "その他";
};

// IPアドレスから位置情報を取得する関数
const getLocationFromIP = async (ip: string): Promise<string> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    console.error("位置情報の取得エラー:", error);
    return "不明";
  }
};

// ログイン履歴を記録する関数
const recordLoginHistory = async (
  status: "success" | "failure" | "session_refresh",
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    let location = "不明";
    if (ipAddress) {
      location = await getLocationFromIP(ipAddress);
    }

    const device = userAgent ? parseUserAgent(userAgent) : "不明";

    const { error } = await supabase
      .from('login_history')
      .insert([
        {
          user_id: ipAddress,
          email: ipAddress,
          status,
          device,
          ip_address: ipAddress,
          location,
        }
      ])

    if (error) {
      console.error('ログイン履歴の記録に失敗:', error)
    }
  } catch (error) {
    console.error('ログイン履歴の記録エラー:', error)
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState<{ [key: string]: { count: number; lastAttempt: number } }>({})
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    // 初期セッションチェック
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('セッションチェックエラー:', error)
      } finally {
        setSessionChecked(true)
        setLoading(false)
      }
    }

    checkInitialSession()

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // セッション変更時にログイン履歴を記録
      if (session?.user) {
        await recordLoginHistory('session_refresh')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // セッションの自動更新
  useEffect(() => {
    const refreshSession = async () => {
      if (user) {
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('セッション更新エラー:', error)
        }
      }
    }

    const interval = setInterval(refreshSession, 1000 * 60 * 30) // 30分ごとに更新

    return () => clearInterval(interval)
  }, [user])

  // レート制限のチェック
  const checkRateLimit = (email: string): boolean => {
    const now = Date.now()
    const attempts = loginAttempts[email] || { count: 0, lastAttempt: 0 }
    
    // 5分以内に5回以上の失敗でブロック
    if (attempts.count >= 5 && now - attempts.lastAttempt < 5 * 60 * 1000) {
      return false
    }
    
    // 1時間以内に10回以上の失敗でブロック
    if (attempts.count >= 10 && now - attempts.lastAttempt < 60 * 60 * 1000) {
      return false
    }
    
    return true
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      
      if (!checkRateLimit(email)) {
        setError("ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。")
        await recordLoginHistory("failure")
        return { success: false, error: "ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。" }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // ログイン失敗時のレート制限更新
        setLoginAttempts(prev => ({
          ...prev,
          [email]: {
            count: (prev[email]?.count || 0) + 1,
            lastAttempt: Date.now()
          }
        }))
        
        setError(error.message)
        await recordLoginHistory("failure")
        return { success: false, error: error.message }
      }

      // ログイン成功時にレート制限をリセット
      setLoginAttempts(prev => {
        const newAttempts = { ...prev }
        delete newAttempts[email]
        return newAttempts
      })

      // ログイン履歴を記録
      await recordLoginHistory("success")

      return {
        success: true,
        emailVerified: data.user?.email_confirmed_at !== null,
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      setError('ログインに失敗しました。')
      await recordLoginHistory("failure")
      return { success: false, error: 'ログインに失敗しました。' }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // パスワードのバリデーション
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error)
        return { success: false, error: passwordValidation.error }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            created_at: new Date().toISOString(),
          }
        },
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("ユーザー登録に失敗しました。")
      }

      return { success: true, emailVerified: data.user.email_confirmed_at !== null }
    } catch (error) {
      console.error("Sign up error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("予期せぬエラーが発生しました。")
      }
      return { success: false, error: error instanceof Error ? error.message : "予期せぬエラーが発生しました。" }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // セッション関連のデータをクリア
      setUser(null)
      setLoginAttempts({})

      return { success: true }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      setError('ログアウトに失敗しました。')
      return { success: false, error: 'ログアウトに失敗しました。' }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('パスワードリセットエラー:', error)
      setError('パスワードリセットに失敗しました。')
      return { success: false, error: 'パスワードリセットに失敗しました。' }
    }
  }

  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    try {
      setError(null)
      const { error } = await supabase.auth.updateUser({
        data: {
          ...data,
          updated_at: new Date().toISOString(),
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィールの更新に失敗しました。')
      return { success: false, error: 'プロフィールの更新に失敗しました。' }
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 