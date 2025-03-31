"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    try {
      setLoading(true)
      await signIn(email, password)
      router.push("/")
    } catch (error: any) {
      console.error("ログインエラー:", error)
      if (error.code === "auth/invalid-credential") {
        setError("メールアドレスまたはパスワードが正しくありません")
      } else if (error.code === "auth/user-not-found") {
        setError("このメールアドレスのユーザーが見つかりません")
      } else if (error.code === "auth/wrong-password") {
        setError("パスワードが正しくありません")
      } else {
        setError("ログインに失敗しました。もう一度お試しください")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-zen">戻る</span>
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
            <h1 className="text-2xl font-medium mb-6 text-center font-zen">ログイン</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm font-zen">{error}</p>
              </div>
            )}

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
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-secondary-foreground font-zen">
                    パスワード
                  </label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline font-zen">
                    パスワードをお忘れですか？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-montserrat"
                disabled={loading}
              >
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-foreground/70 font-zen">
                アカウントをお持ちでない方は
                <Link href="/signup" className="text-primary hover:underline ml-1">
                  新規登録
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

