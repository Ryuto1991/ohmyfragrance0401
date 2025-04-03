import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const labelId = session.metadata?.label_id;

    if (!labelId) {
      return NextResponse.json(
        { error: 'No label_id in session metadata' },
        { status: 400 }
      );
    }

    // 画像URLを組み立て
    const imageAfterUrl = `${supabaseUrl}/storage/v1/object/public/labels/tmp/${labelId}_after.png`;

    // 注文データを保存
    const { error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          label_id: labelId,
          image_after_url: imageAfterUrl,
          scent: session.metadata?.scent,
          bottle_type: session.metadata?.bottle_type,
          label_size: session.metadata?.label_size,
          status: 'paid',
          stripe_session_id: session.id,
          email: session.customer_details?.email,
          name: session.customer_details?.name,
          phone: session.customer_details?.phone,
          address: session.customer_details?.address,
          created_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error inserting order:', insertError);
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
} 