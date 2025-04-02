import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const cartItem = await request.json();
    console.log('Received cart item:', cartItem);

    // 必須フィールドのバリデーション
    if (!cartItem.id || !cartItem.name || !cartItem.price) {
      console.error('Missing required fields:', cartItem);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // カートアイテムをデータベースに保存
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        quantity: cartItem.quantity || 1,
        image: cartItem.image || null,
        metadata: cartItem.metadata || null,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add item to cart' },
        { status: 500 }
      );
    }

    console.log('Successfully added item to cart:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error adding item to cart' },
      { status: 500 }
    );
  }
} 