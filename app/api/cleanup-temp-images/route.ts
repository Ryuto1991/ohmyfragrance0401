import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igpsidgueemtziedebcs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // 期限切れの画像を取得
    const { data: expiredImages, error: fetchError } = await supabase
      .from('temp_custom_perfume_images')
      .select('image_key')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredImages || expiredImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired images found',
        cleaned: 0
      });
    }

    // 期限切れの画像を削除
    const imageKeys = expiredImages.map(img => img.image_key);
    
    // Storageから画像を削除
    const { error: storageError } = await supabase.storage
      .from('custom-perfumes')
      .remove(imageKeys);

    if (storageError) {
      throw storageError;
    }

    // データベースから記録を削除
    const { error: dbError } = await supabase
      .from('temp_custom_perfume_images')
      .delete()
      .in('image_key', imageKeys);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${imageKeys.length} expired images`,
      cleaned: imageKeys.length
    });
  } catch (error) {
    console.error('Error cleaning up temp images:', error);
    return NextResponse.json(
      { error: 'Failed to clean up temp images' },
      { status: 500 }
    );
  }
} 