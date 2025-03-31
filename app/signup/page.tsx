"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Lock, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("すべての項目を入力してください")
      return
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      return
    }

    if (!agreeTerms) {
      setError("利用規約とプライバシーポリシーに同意してください")
      return
    }

    try {
      setLoading(true)
      await signUp(email, password)
      // ここでユーザー名を保存する処理を追加することもできます
      router.push("/")
    } catch (error: any) {
      console.error("登録エラー:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に使用されています")
      } else if (error.code === "auth/invalid-email") {
        setError("有効なメールアドレスを入力してください")
      } else if (error.code === "auth/weak-password") {
        setError("パスワードが弱すぎます。より強力なパスワードを設定してください")
      } else {
        setError("アカウント作成に失敗しました。もう一度お試しください")
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

        <div className="max-w-md mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-sm"
          >
            <h1 className="text-2xl font-medium mb-6 text-center font-zen">新規登録</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm font-zen">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-secondary-foreground font-zen">
                  お名前
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="山田 フレグランス"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="text-sm font-medium text-secondary-foreground font-zen">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="6文字以上"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary-foreground font-zen">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="パスワードを再入力"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-secondary-foreground/70 font-zen">
                  <span>
                    <Link href="/terms" className="text-primary hover:underline">
                      利用規約
                    </Link>
                    と
                    <Link href="/privacy" className="text-primary hover:underline">
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-montserrat"
                disabled={loading}
              >
                {loading ? "登録中..." : "登録する"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-foreground/70 font-zen">
                既にアカウントをお持ちの方は
                <Link href="/login" className="text-primary hover:underline ml-1">
                  ログイン
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

