
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' as const,
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// スプレッドシートの行の型定義
interface SpreadsheetRow {
  '注文ID': string;
  '注文日時': string;
  '顧客名': string;
  'メールアドレス': string;
  '電話番号': string;
  '香り': string;
  'ボトル': string;
  'ラベルサイズ': string;
  'ラベルタイプ': string;
  '金額': number;
  '支払い状態': string;
  '注文状態': string;
  '画像URL': string;
  '画像URL(切り抜き後)': string;
}

// 日時フォーマット関数
const formatDateTime = (date: Date): string => {
  return date.toISOString().replace('T', ' ').replace('Z', '');
};

// 金額フォーマット関数
const formatAmount = (amount: number): number => {
  return Math.round(amount / 100); // セントから円に変換
};

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Webhookの検証
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // チェックアウトセッション完了イベントの処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Supabaseから注文情報を取得
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();

      if (orderError) {
        console.error('Error fetching order from Supabase:', orderError);
        return NextResponse.json(
          { error: 'Failed to fetch order details' },
          { status: 500 }
        );
      }

      if (!order) {
        console.error('Order not found in Supabase');
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // スプレッドシートの更新
      const auth = new JWT({
        email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
      await doc.loadInfo();

      const sheet = doc.sheetsByIndex[0];
      await sheet.loadHeaderRow();

      // 注文IDで行を検索（重複チェック）
      const rows = await sheet.getRows();
      const existingRows = rows.filter(row => row.get('注文ID') === order.id);

      if (existingRows.length > 1) {
        console.error('Duplicate order found in spreadsheet:', order.id);
        return NextResponse.json(
          { error: 'Duplicate order found' },
          { status: 409 }
        );
      }

      const targetRow = existingRows[0];

      // データの整合性チェック
      if (!order.scent || !order.bottle_type || !order.label_size || !order.label_id) {
        console.error('Missing required order details:', order);
        return NextResponse.json(
          { error: 'Missing required order details' },
          { status: 400 }
        );
      }

      if (targetRow) {
        // 支払い情報を更新
        targetRow.set('注文ID', order.id);
        targetRow.set('注文日時', formatDateTime(new Date(order.created_at)));
        targetRow.set('顧客名', session.customer_details?.name || '');
        targetRow.set('メールアドレス', session.customer_details?.email || '');
        targetRow.set('電話番号', session.customer_details?.phone || '');
        targetRow.set('香り', order.scent);
        targetRow.set('ボトル', order.bottle_type);
        targetRow.set('ラベルサイズ', order.label_size);
        targetRow.set('ラベルタイプ', order.label_id);
        targetRow.set('金額', formatAmount(session.amount_total || 0));
        targetRow.set('支払い状態', 'completed');
        targetRow.set('注文状態', order.status);
        targetRow.set('画像URL', order.image_before_url);
        targetRow.set('画像URL(切り抜き後)', order.image_after_url);
        await targetRow.save();
      } else {
        // 新しい行を追加
        await sheet.addRow({
          '注文ID': order.id,
          '注文日時': formatDateTime(new Date(order.created_at)),
          '顧客名': session.customer_details?.name || '',
          'メールアドレス': session.customer_details?.email || '',
          '電話番号': session.customer_details?.phone || '',
          '香り': order.scent,
          'ボトル': order.bottle_type,
          'ラベルサイズ': order.label_size,
          'ラベルタイプ': order.label_id,
          '金額': formatAmount(session.amount_total || 0),
          '支払い状態': 'completed',
          '注文状態': order.status,
          '画像URL': order.image_before_url,
          '画像URL(切り抜き後)': order.image_after_url
        });
      }

      // Supabaseの注文状態を更新
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          email: session.customer_details?.email,
          name: session.customer_details?.name,
          phone: session.customer_details?.phone,
          address: session.customer_details?.address?.line1
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order status in Supabase:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 