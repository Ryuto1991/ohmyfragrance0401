import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { appendOrderToSpreadsheet } from '@/lib/spreadsheet'
import { moveImageToFinal } from '@/app/oh-my-custom-order/actions'
import { appendSpreadsheetRow } from '@/lib/spreadsheet'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ received: false }, { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      console.log('✅ Checkout Session:', session.id)

      const metadata = session.metadata || {}
      const {
        fragranceName,
        bottleType,
        imageKey,
        finalImageKey,
        customerName,
        customerEmail,
        originalImageUrl,
        originalImageSize,
        originalImageFormat,
        labelImageUrl,
        labelImageSize,
        labelImageFormat,
        labelSize,
        userId,
        anonymousId
      } = metadata

      // カスタムフィールドの値を取得
      const orderNote = session.custom_fields?.find(
        field => field.key === 'order_note'
      )?.text?.value || '';

      if (!fragranceName || !bottleType) {
        console.warn('⚠️ 必須メタデータが不足:', metadata)
      }

      // カートをクリア
      if (userId) {
        console.log('🛒 Clearing cart for user:', userId)
        const { error: deleteError } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', userId)

        if (deleteError) {
          console.error('❌ Failed to clear cart:', deleteError)
        } else {
          console.log('✅ Cart cleared successfully')
        }
      } else if (anonymousId) {
        // 非ログインユーザーのカートクリアは、フロントエンド側で
        // localStorage.removeItem('cartItems') を実行する必要があります
        console.log('🛒 Anonymous user cart will be cleared on client side:', anonymousId)
      }

      // 画像移動
      if (imageKey && finalImageKey) {
        console.log('🛠 Moving image...')
        const moveResult = await moveImageToFinal(imageKey, finalImageKey)
        if (!moveResult.success) {
          console.error('❌ Failed to move image:', moveResult.error)
        } else {
          console.log('✅ Image moved to:', moveResult.publicUrl)
        }
      }

      // スプレッドシートに注文記録
      await appendSpreadsheetRow([
        new Date().toISOString(),
        session.id,
        session.payment_status,
        customerName || '',
        customerEmail || '',
        fragranceName || '',
        bottleType || '',
        labelImageUrl || '',
        session.amount_total ? (session.amount_total / 100).toString() : '0',
        orderNote // 注文メモを追加
      ])

      await appendOrderToSpreadsheet({
        fragranceName,
        bottleType,
        originalImageUrl,
        originalImageSize,
        originalImageFormat,
        labelImageUrl,
        labelImageSize,
        labelImageFormat,
        labelSize,
        stripeSessionId: session.id,
      })

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('❌ Webhook 処理エラー:', error)
      // Stripeに「処理済み」と返して再送を防ぐ
      return NextResponse.json({ received: true })
    }
  }

  return NextResponse.json({ received: true })
}
