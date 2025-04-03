"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { toast } from "@/components/ui/use-toast"
import { ChevronLeft } from "lucide-react"

interface OrderPreview {
  label_id: string
  scent: string
  bottle_type: string
  label_size: string
  image_before_url: string
  image_after_url: string
}

export default function OrderConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<OrderPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // URLパラメータから注文データを取得
    const data = searchParams.get('data')
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data))
        setOrderData(decodedData)
      } catch (error) {
        console.error('Error parsing order data:', error)
        toast({
          title: "エラー",
          description: "注文データの読み込みに失敗しました。",
          variant: "destructive",
        })
        router.push('/oh-my-custom-order')
      }
    }
  }, [searchParams, router])

  const handleConfirmOrder = async () => {
    if (!orderData) return

    try {
      setIsLoading(true)

      // 注文IDを生成
      const orderId = uuidv4()

      // Supabaseに仮注文を保存
      const { error: orderError, data } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          label_id: orderData.label_id,
          scent: orderData.scent,
          bottle_type: orderData.bottle_type,
          label_size: orderData.label_size,
          image_before_url: orderData.image_before_url,
          image_after_url: orderData.image_after_url,
          status: 'pending',
          email: null,
          name: null,
          phone: null,
          address: null,
          stripe_session_id: null,
          created_at: new Date().toISOString()
        })
        .select()

      if (orderError) {
        console.error('Supabase error:', orderError)
        throw new Error(`注文の保存に失敗しました: ${orderError.message}`)
      }

      if (!data) {
        throw new Error('注文データが保存されませんでした')
      }

      // Stripe Checkoutセッションを作成
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          label_id: orderData.label_id,
          scent: orderData.scent,
          bottle_type: orderData.bottle_type,
          label_size: orderData.label_size,
          image_before_url: orderData.image_before_url,
          image_after_url: orderData.image_after_url
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Stripeセッションの作成に失敗しました: ${errorData.message || '不明なエラー'}`)
      }

      const { url } = await response.json()

      // Stripe Checkoutにリダイレクト
      window.location.href = url

    } catch (error) {
      console.error('Error in handleConfirmOrder:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "注文処理中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!orderData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
            前の画面に戻る
          </Button>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">注文内容の確認</h1>

          {/* プレビュー画像 */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">ラベル画像</h2>
            <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={orderData.image_after_url}
                alt="ラベル画像"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 注文詳細 */}
          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-2">注文内容</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">香り</span>
                  <span className="font-medium">{orderData.scent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ボトル</span>
                  <span className="font-medium">{orderData.bottle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ラベルサイズ</span>
                  <span className="font-medium">{orderData.label_size}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 確認ボタン */}
          <Button
            className="w-full py-6 text-lg rounded-full text-white shadow-lg bg-[#FF6B6B] hover:bg-[#FF6B6B]/90"
            onClick={handleConfirmOrder}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : '購入を確定する（4,980円）'}
          </Button>
        </div>
      </main>
    </div>
  )
} 