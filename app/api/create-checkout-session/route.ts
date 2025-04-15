import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received checkout request body:', body);

    // リクエストボディからデータを抽出 (imageKey, finalImageKey は削除し、finalImageUrl を受け取る)
    const { line_items, orderDetails, fragranceName, bottleType, userId, anonymousId, mode, recipe, originalImageUrl, finalImageUrl } = body;
    console.log('Extracted data:', { line_items, orderDetails, fragranceName, bottleType, userId, anonymousId, mode, recipe, originalImageUrl, finalImageUrl });


    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      console.error('Invalid line_items:', line_items);
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of line_items) {
      console.log('Validating line item:', item);
      if (!item.price || !item.quantity || item.quantity < 1) {
        console.error('Invalid line item:', item);
        return NextResponse.json(
          { error: 'Invalid line item data' },
          { status: 400 }
        );
      }
    }

    // セッション作成用のパラメータを定義 (型を明示)
    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/custom-order?mode=custom`, // リンク修正
      metadata: {
        fragranceName: fragranceName ?? null,
        bottleType: bottleType ?? null,
        // imageKey, finalImageKey は削除
        originalImageUrl: originalImageUrl ?? null,
        finalImageUrl: finalImageUrl ?? null, // キャプチャ画像のURL
        userId: userId ?? null,
        anonymousId: anonymousId ?? null,
        mode: mode ?? null, // mode をメタデータに追加
        recipe: recipe ?? null, // recipe をメタデータに追加
        orderDetails: JSON.stringify(orderDetails || [])
      },
      custom_fields: [
        {
          key: 'order_note',
          label: { 
            type: 'custom', 
            custom: 'ご希望やメモ（任意）' 
          },
          type: 'text',
          optional: true
        }
      ],
      shipping_address_collection: {
        allowed_countries: ['JP'], // 日本のみ許可
      },
      billing_address_collection: 'required', // 請求先住所（名前含む）の収集を必須にする
      phone_number_collection: { // 電話番号の収集を有効にする
        enabled: true
      }
    };

    // セッションを作成
    const session = await stripe.checkout.sessions.create(params);

    console.log('Created checkout session:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error instanceof Error ? error.message : 'Unknown error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
