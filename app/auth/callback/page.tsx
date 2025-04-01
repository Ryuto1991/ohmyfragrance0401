"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, AlertCircle } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        setError("認証コードが見つかりません。")
        return
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          throw error
        }
        router.push("/")
      } catch (error) {
        console.error("認証エラー:", error)
        setError("認証に失敗しました。もう一度お試しください。")
      }
    }

    handleCallback()
  }, [code, router, supabase])

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">
              認証エラー
            </h1>
            <p className="text-secondary-foreground/70 mb-6 font-zen">
              {error}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push("/signup")}
                className="text-primary hover:text-primary/80 font-zen"
              >
                新規登録ページに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-secondary-foreground/70 font-zen">認証処理中...</p>
        </div>
      </div>
    </div>
  )
} 