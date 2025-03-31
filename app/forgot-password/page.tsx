"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email) {
      setError("メールアドレスを入力してください")
      return
    }

    try {
      setLoading(true)
      await resetPassword(email)
      setSuccess(true)
    } catch (error: any) {
      console.error("パスワードリセットエラー:", error)
      if (error.code === "auth/user-not-found") {
        setError("このメールアドレスのユーザーが見つかりません")
      } else if (error.code === "auth/invalid-email") {
        setError("有効なメールアドレスを入力してください")
      } else {
        setError("パスワードリセットに失敗しました。もう一度お試しください")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/login">
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-zen">ログインに戻る</span>
            </Button>
          </Link>
          <Link href="/" className="text-2xl font-medium text-secondary-foreground font-zen">
            <div className="flex flex-col">
              <span className="text-2xl">Oh my</span>
              <span className="text-2xl -mt-1">fragrance</span>
            </div>
          </Link>
          <div className="w-[100px]"></div> {/* スペーサー */}
        </div>

        <div className="max-w-md mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-sm"
          >
            <h1 className="text-2xl font-medium mb-6 text-center font-zen">パスワードをお忘れの方</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm font-zen">{error}</p>
              </div>
            )}

            {success ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4 flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-zen">パスワードリセットのリンクを送信しました。</p>
                  <p className="text-sm font-zen mt-1">
                    メールをご確認いただき、リンクをクリックしてパスワードを再設定してください。
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-secondary-foreground font-zen">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="your@email.com"
                    />
                  </div>
                  <p className="text-xs text-secondary-foreground/70 font-zen mt-1">
                    登録時に使用したメールアドレスを入力してください。パスワードリセットのリンクをお送りします。
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-montserrat"
                  disabled={loading}
                >
                  {loading ? "送信中..." : "リセットリンクを送信"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-foreground/70 font-zen">
                <Link href="/login" className="text-primary hover:underline">
                  ログインページに戻る
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

