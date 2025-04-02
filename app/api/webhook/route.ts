import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { appendOrderToSpreadsheet } from '@/lib/spreadsheet';
import { createClient } from '@supabase/supabase-js';
import { moveImageToFinal } from '@/app/oh-my-custom-order/actions';
import { appendSpreadsheetRow } from '@/lib/spreadsheet';

// Supabaseクライアントの初期化
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      console.log('Processing completed checkout session:', session.id);
      
      // メタデータから必要な情報を取得
      const metadata = session.metadata || {};
      const {
        fragranceName,
        bottleType,
        imageKey,
        finalImageKey,
        customerName,
        customerEmail
      } = metadata;

      console.log('Order details:', {
        fragranceName,
        bottleType,
        imageKey,
        finalImageKey,
        customerName,
        customerEmail
      });

      // 画像を一時保存から本保存に移動
      if (imageKey && finalImageKey) {
        console.log('Moving image from temp to final location...');
        const moveResult = await moveImageToFinal(imageKey, finalImageKey);
        if (!moveResult.success) {
          console.error('Failed to move image:', moveResult.error);
        } else {
          console.log('Image moved successfully. New URL:', moveResult.publicUrl);
          metadata.imageUrl = moveResult.publicUrl;
        }
      }

      // スプレッドシートに注文情報を記録
      console.log('Recording order in spreadsheet...');
      await appendSpreadsheetRow([
        new Date().toISOString(), // 注文日時
        session.id, // セッションID
        session.payment_status, // 支払い状態
        customerName || '', // 顧客名
        customerEmail || '', // メールアドレス
        fragranceName || '', // フレグランス名
        bottleType || '', // ボトルタイプ
        metadata.imageUrl || '', // 画像URL
        session.amount_total ? (session.amount_total / 100).toString() : '0' // 合計金額（円）
      ]);
      console.log('Order recorded in spreadsheet');

      // スプレッドシートに注文情報を追加
      await appendOrderToSpreadsheet({
        fragranceName: metadata.fragranceName,
        bottleType: metadata.bottleType,
        originalImageUrl: metadata.originalImageUrl,
        originalImageSize: metadata.originalImageSize,
        originalImageFormat: metadata.originalImageFormat,
        labelImageUrl: metadata.labelImageUrl,
        labelImageSize: metadata.labelImageSize,
        labelImageFormat: metadata.labelImageFormat,
        labelSize: metadata.labelSize,
        stripeSessionId: session.id, // StripeセッションIDを追加
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
} 