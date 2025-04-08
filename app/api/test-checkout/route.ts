import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
  try {
    // 環境変数のチェック
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not set");
    }

    // テスト用のセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        'card',
        // 'konbini',     // コンビニ払い
        // 'customer_balance',  // 銀行振込
      ],
      line_items: [
        {
          price: "price_1R8PfWE0t3PGpOQ56jvdSTKf", // Eternal Smoke
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      shipping_address_collection: {
        allowed_countries: ["JP"],
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
      metadata: {
        test_order: "true",
      },
      /* 一時的に無効化
      payment_method_options: {
        konbini: {
          expires_after_days: 3, // 支払い期限を3日に設定
          product_description: 'OMFフレグランステスト注文', // 商品説明（レシート等に表示）
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating test session:", error);
    
    // エラーの詳細を取得
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Stripe.errors.StripeError 
      ? {
          type: error.type,
          code: error.code,
          message: error.message,
          param: error.param,
        }
      : null;

    return NextResponse.json(
      { 
        error: "テストセッションの作成に失敗しました",
        details: errorMessage,
        stripeError: errorDetails
      },
      { status: 500 }
    );
  }
} 