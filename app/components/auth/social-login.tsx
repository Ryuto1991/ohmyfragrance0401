'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { providers, type SocialProvider } from '@/app/auth/providers'
import { supabase } from '@/lib/supabase'
import { FadeIn } from '@/components/ui/animations'
import { verifyProvider } from '@/app/auth/verify-auth'
import {
  Google,
  Twitter,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const providerIcons = {
  google: Google,
  twitter: Twitter,
}

export function SocialLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(provider.id)

      // プロバイダーの検証
      const { success, error, data } = await verifyProvider(provider.provider)
      if (!success) {
        throw new Error(error)
      }

      // プロバイダー固有のエラーチェック
      if (provider.id === 'google' && !data?.user?.email?.endsWith('@gmail.com')) {
        throw new Error('Googleアカウントでログインしてください')
      }

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: provider.provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) {
        throw signInError
      }

      // ログイン成功時のフィードバック
      toast({
        title: 'ログイン中',
        description: `${provider.name}アカウントで認証しています...`,
      })

    } catch (error) {
      console.error(`${provider.name}ログインエラー:`, error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : `${provider.name}でのログインに失敗しました。`,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <FadeIn className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            または
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {providers.map((provider) => {
          const Icon = providerIcons[provider.id as keyof typeof providerIcons]
          return (
            <Button
              key={provider.id}
              variant="outline"
              className={cn(
                'w-full',
                provider.color,
                provider.textColor,
                provider.borderColor
              )}
              onClick={() => handleSocialLogin(provider)}
              disabled={loading !== null}
            >
              {loading === provider.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icon className="mr-2 h-4 w-4" />
              )}
              {provider.name}でログイン
            </Button>
          )
        })}
      </div>
    </FadeIn>
  )
} 