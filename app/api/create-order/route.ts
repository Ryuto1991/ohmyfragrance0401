import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'orderId',
      'label_id',
      'scent',
      'bottle_type',
      'label_size',
      'image_before_url',
      'image_after_url'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'カスタムフレグランス',
              description: `${body.scent} - ${body.bottle_type} (${body.label_size})`,
            },
            unit_amount: 4980,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/custom-order?mode=custom`, // リンク修正
      metadata: {
        orderId: body.orderId,
        label_id: body.label_id,
        scent: body.scent,
        bottle_type: body.bottle_type,
        label_size: body.label_size,
        image_before_url: body.image_before_url,
        image_after_url: body.image_after_url,
      },
    })

    // Update order with Stripe session ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', body.orderId)

    if (updateError) {
      console.error('Error updating order with Stripe session ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order with Stripe session ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error in create-order route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
