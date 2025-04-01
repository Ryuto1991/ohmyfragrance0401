"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("有効なメールアドレスを入力してください。")
      setLoading(false)
      return
    }

    try {
      const result = await resetPassword(email)
      if (result.success) {
        setSuccess(true)
        toast({
          title: "パスワード再設定メールを送信しました",
          description: "メールをご確認ください。",
          duration: 3000,
        })
        router.push("/")
      } else {
        setError(result.error || "パスワード再設定メールの送信に失敗しました。")
      }
    } catch (error) {
      console.error("パスワード再設定エラー:", error)
      setError("パスワード再設定メールの送信に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-medium mb-6 text-center text-secondary-foreground font-zen">
            パスワード再設定
          </h1>
          <p className="text-sm text-secondary-foreground/70 mb-6 text-center font-zen">
            登録済みのメールアドレスを入力してください。
            <br />
            パスワード再設定用のリンクを送信します。
          </p>

          {success ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">パスワード再設定メールを送信しました。</p>
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                トップページに戻る
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                disabled={loading}
              >
                {loading ? "送信中..." : "再設定メールを送信"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

