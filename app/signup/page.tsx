"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signUp, updateProfile } = useAuth()
  const { toast } = useToast()

  // フォームの入力値をリセット
  useEffect(() => {
    setName("")
    setEmail("")
    setPassword("")
    setError(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signUp(email, password)
      if (result.success) {
        await updateProfile({ name })
        toast({
          title: "アカウントを作成しました",
          description: "メールアドレスの確認をお願いします",
          duration: 3000,
        })
        router.push("/auth/verify-email")
      } else {
        setError(result.error || "アカウントの作成に失敗しました。")
      }
    } catch (error) {
      console.error("サインアップエラー:", error)
      setError("アカウントの作成に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* 左側：ログインフォーム */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center bg-white px-8 py-12"
      >
        <div className="w-full max-w-[360px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative bg-white rounded-xl shadow-sm p-8 space-y-6"
          >
            {/* トップへ戻るボタン - 常に表示 */}
            <Link
              href="/"
              className="absolute left-8 top-8 flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm">トップへ</span>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <h1 className="text-2xl font-medium text-gray-900">
                新規登録
              </h1>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="お名前"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-10 text-sm"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-10 text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg h-10 text-sm font-medium"
                disabled={loading}
              >
                {loading ? "登録中..." : "アカウントを作成"}
              </Button>
            </motion.form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-6 space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 ml-1 font-medium"
                >
                  ログイン
                </Link>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Copyright © 2024 Oh my fragrance. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 右側：イラストレーション */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:block relative bg-secondary overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-8 left-8 z-10"
        >
          <Link href="/" className="text-2xl font-bold text-white">
            Oh my fragrance
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/signup.png"
              alt="新規登録イラストレーション"
              fill
              className="object-cover object-[25%_center]"
              priority
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            type: "spring",
            stiffness: 100
          }}
          className="absolute inset-y-0 right-12 z-10 hidden lg:flex items-center"
        >
          <div className="space-y-6 text-white">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-6xl font-bold tracking-tight whitespace-pre-line leading-tight"
            >
              あなたの言葉が、{"\n"}香りになる。
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-2xl font-medium"
            >
              AIとつくる、あなただけのフレグランス。
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 