"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, Clock } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function VerifyEmail() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isValid, setIsValid] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/signup")
        return
      }

      // メール認証済みの場合はトップページにリダイレクト
      if (session.user.email_confirmed_at) {
        router.push("/")
        return
      }

      setIsValid(true)
    }

    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    if (!isValid) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, isValid])

  if (!isValid) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-secondary-foreground/70 mb-6 font-zen">
              新規登録ページに移動します...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">
            メール認証をお願いします
          </h1>
          
          <p className="text-secondary-foreground/70 mb-6 font-zen">
            ご登録いただいたメールアドレスに認証リンクを送信しました。
            メール内のリンクをクリックして、アカウントの認証を完了してください。
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-center text-sm text-secondary-foreground/70">
              <Clock className="h-4 w-4 mr-2" />
              <span>{countdown}秒後にトップページに移動します</span>
            </div>

            <p className="text-sm text-secondary-foreground/70 font-zen">
              ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>

            <div className="flex justify-center space-x-4">
              <Link href="/" replace>
                <Button variant="outline" className="rounded-full">
                  トップページに戻る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 