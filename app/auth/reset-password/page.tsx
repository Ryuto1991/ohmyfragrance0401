'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layout } from '@/components/ui/layout'
import { useToast } from '@/components/ui/use-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { success, error } = await resetPassword(email)

      if (success) {
        toast({
          title: 'パスワードリセットメールを送信しました',
          description: 'メールの指示に従ってパスワードをリセットしてください。',
        })
        router.push('/login')
      } else {
        toast({
          title: 'エラー',
          description: error || 'パスワードリセットに失敗しました。',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'パスワードリセットに失敗しました。',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      className="flex items-center justify-center"
      loading={loading}
    >
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            パスワードをリセット
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            登録したメールアドレスを入力してください。
            パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'メール送信中...' : 'パスワードをリセット'}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              ログインページに戻る
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
} 