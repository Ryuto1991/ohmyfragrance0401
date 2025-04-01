"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await resetPassword(email)
      toast({
        title: "パスワード再設定メールを送信しました",
        description: "メールをご確認ください。",
        duration: 3000,
      })
      // パスワード再設定メール送信後にトップページにリダイレクト
      router.push("/")
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
        </div>
      </div>
    </div>
  )
} 