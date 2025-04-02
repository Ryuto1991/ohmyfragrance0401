import { testAuthFlow, cleanupTestSession } from './auth-test-utils'
import { supabase } from '@/lib/supabase'

describe('認証フローのテスト', () => {
  afterEach(async () => {
    await cleanupTestSession()
    jest.clearAllMocks()
  })

  describe('Google認証', () => {
    it('正常系: @gmail.comドメインでログイン', async () => {
      const result = await testAuthFlow('google', 'test@gmail.com')
      expect(result.success).toBe(true)
      expect(result.status).toBe('authenticated')
    })

    it('異常系: 非@gmail.comドメインでログイン', async () => {
      const result = await testAuthFlow('google', 'test@example.com')
      expect(result.success).toBe(false)
      expect(result.status).toBe('domain_error')
    })
  })

  describe('X (Twitter)認証', () => {
    it('正常系: 通常のログイン', async () => {
      const result = await testAuthFlow('twitter', 'test@twitter.com')
      expect(result.success).toBe(true)
      expect(result.status).toBe('authenticated')
    })
  })

  describe('セッション検証', () => {
    it('異常系: セッション期限切れ', async () => {
      // セッション期限切れをモック
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: {
          session: {
            expires_at: Math.floor((Date.now() - 3600000) / 1000), // 1時間前に期限切れ（Unix timestamp）
            user: { email: 'test@gmail.com', email_confirmed_at: new Date() }
          }
        },
        error: null
      })

      const result = await testAuthFlow('google', 'test@gmail.com')
      expect(result.success).toBe(false)
      expect(result.status).toBe('expired')
    })

    it('異常系: 未認証メールアドレス', async () => {
      // 未認証メールアドレスをモック
      jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: '123',
            email: 'unverified@gmail.com',
            email_confirmed_at: null
          }
        },
        error: null
      })

      const result = await testAuthFlow('google', 'unverified@gmail.com')
      expect(result.success).toBe(false)
      expect(result.status).toBe('unverified')
    })
  })
}) 