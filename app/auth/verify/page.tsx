'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/ui/layout'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) {
          setStatus('error')
          setMessage('認証トークンが見つかりません。')
          return
        }

        // トークンの検証処理をここに実装
        // 例: const response = await verifyEmailToken(token)
        
        // 仮の成功処理
        setStatus('success')
        setMessage('メールアドレスの認証が完了しました。')
      } catch (error) {
        setStatus('error')
        setMessage('認証に失敗しました。もう一度お試しください。')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <Layout className="flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto" />
            <div className="h-4 w-3/4 bg-muted mx-auto rounded" />
          </div>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">
              認証完了
            </h1>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            <div className="pt-4">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                ログインページへ
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">
              認証エラー
            </h1>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            <div className="pt-4 space-y-4">
              <Button
                onClick={() => router.push('/signup')}
                variant="outline"
                className="w-full"
              >
                新規登録をやり直す
              </Button>
              <Button
                onClick={() => router.push('/contact')}
                variant="link"
                className="text-sm"
              >
                お問い合わせ
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
} 