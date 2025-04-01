import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function POST(req: NextRequest) {
  try {
    // Expect either a single priceId/quantity OR an array of line_items
    const body = await req.json();
    const { line_items } = body;
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Check if the request body contains an array of line items (from cart)
    if (Array.isArray(line_items)) {
      lineItems = line_items.map((item: { price: string; quantity: number }) => {
        if (!item.price || !item.quantity || item.quantity < 1) {
          throw new Error('Invalid line item data in request.');
        }
        return {
          price: item.price,
          quantity: item.quantity,
        };
      });
    } 
    // Check if the request body contains single item details (legacy, can be removed later)
    else if (body.priceId && body.quantity) {
      console.warn("Received single item checkout request (legacy)"); // Add warning
      lineItems = [
        {
          price: body.priceId,
          quantity: body.quantity,
        },
      ];
    } 
    // Invalid request body
    else {
        throw new Error('Invalid request body. Expected line_items array or priceId/quantity.')
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No items to checkout' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems, // Use the prepared lineItems array
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      shipping_address_collection: {
        allowed_countries: ['JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "jpy",
            },
            display_name: "ゆうパケット",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 2,
              },
              maximum: {
                unit: "business_day",
                value: 4,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 550,
              currency: "jpy",
            },
            display_name: "宅急便コンパクト",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 2,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true, // 電話番号の収集を有効化
      },
      locale: "ja", // 日本語表示
      allow_promotion_codes: true, // プロモーションコードを許可
      automatic_tax: {
        enabled: true, // 自動税計算を有効化
      },
      metadata: {
        source: "omf_website", // 注文ソースの識別用
      },
      /* 一時的に無効化
      payment_method_options: {
        konbini: {
          expires_after_days: 3, // 支払い期限を3日に設定
          product_description: 'OMFフレグランスオーダー', // 商品説明（レシート等に表示）
        },
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'jp_bank_transfer',
          },
        },
      },
      */
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    
    // 詳細なエラーログを追加
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error type:', error.type);
      console.error('Stripe error code:', error.code);
      console.error('Stripe error param:', error.param);
      
      return NextResponse.json({ 
        error: `Stripe Error: ${error.message}`,
        type: error.type,
        code: error.code,
        param: error.param
      }, { status: 500 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
} 