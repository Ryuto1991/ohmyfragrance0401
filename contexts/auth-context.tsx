"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        emailVerified: data.user?.email_confirmed_at !== null,
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      setError('ログインに失敗しました。')
      return { success: false, error: 'ログインに失敗しました。' }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('パスワードリセットエラー:', error)
      setError('パスワードリセットメールの送信に失敗しました。')
      return { success: false, error: 'パスワードリセットメールの送信に失敗しました。' }
    }
  }

  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    try {
      setError(null)
      const { error } = await supabase.auth.updateUser({
        data,
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