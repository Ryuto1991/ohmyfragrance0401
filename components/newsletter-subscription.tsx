"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // メールアドレスのバリデーション
    if (!email) {
      setStatus("error")
      setErrorMessage("メールアドレスを入力してください")
      return
    }

    if (!validateEmail(email)) {
      setStatus("error")
      setErrorMessage("有効なメールアドレスを入力してください")
      return
    }

    // 送信中状態に設定
    setStatus("loading")

    // 実際のAPIリクエストの代わりに、タイムアウトでシミュレーション
    setTimeout(() => {
      // 成功状態に設定（実際の実装では、APIレスポンスに基づいて設定）
      setStatus("success")

      // 3秒後にフォームをリセット
      setTimeout(() => {
        setEmail("")
        setStatus("idle")
      }, 3000)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === "error") setStatus("idle")
            }}
            placeholder="メールアドレス"
            className="rounded-full pl-4 pr-10 py-2 w-full"
            disabled={status === "loading" || status === "success"}
          />
          {status === "error" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
        </div>

        <motion.div
          whileHover={status !== "loading" && status !== "success" ? { scale: 1.05 } : {}}
          whileTap={status !== "loading" && status !== "success" ? { scale: 0.95 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Button
            type="submit"
            className={`w-full sm:w-auto rounded-full px-6 py-2 font-montserrat relative overflow-hidden ${
              status === "success" ? "bg-green-500 hover:bg-green-500" : "bg-primary hover:bg-primary/90"
            } text-white`}
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : status === "success" ? (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>登録完了</span>
              </div>
            ) : (
              <span className="relative">
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                <span className="relative">登録する</span>
              </span>
            )}
          </Button>
        </motion.div>
      </div>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2 text-left pl-4 font-zen"
        >
          {errorMessage}
        </motion.p>
      )}

      {status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 text-sm mt-2 text-left pl-4 font-zen"
        >
          ニュースレターの購読ありがとうございます！
        </motion.p>
      )}
    </form>
  )
}

