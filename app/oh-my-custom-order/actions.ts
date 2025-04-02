'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type UploadResult = {
  success: boolean;
  imageKey?: string;
  publicUrl?: string;
  finalKey?: string;
  error?: string;
};

export type MoveResult = {
  success: boolean;
  publicUrl?: string;
  error?: string;
};

export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // ファイルサイズのチェック（3MB以下）
    if (file.size > 3 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size must be less than 3MB'
      };
    }

    // ファイル形式のチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'File type must be JPEG, PNG, or GIF'
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const tempKey = `temp/${fileName}`;
    const finalKey = `orders/${fileName}`;

    // FileをBufferに変換
    let buffer: Buffer;
    try {
      if ('arrayBuffer' in file) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = (file as any).buffer;
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process file'
      };
    }

    // 一時保存用のパスに画像をアップロード
    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(tempKey, buffer, {
        contentType: file.type
      });

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`
      };
    }

    // 一時保存の記録を作成（24時間後に期限切れ）
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: dbError } = await supabase
      .from('temp_custom_perfume_images')
      .insert([
        {
          image_key: tempKey,
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (dbError) {
      // エラーが発生した場合は一時保存した画像を削除
      await supabase.storage
        .from('custom-perfumes')
        .remove([tempKey]);
      
      return {
        success: false,
        error: `Database error: ${dbError.message}`
      };
    }

    // 一時URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(tempKey);

    return {
      success: true,
      imageKey: tempKey,
      publicUrl,
      finalKey
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: 'Unexpected error occurred while uploading image'
    };
  }
}

export async function moveImageToFinal(tempKey: string, finalKey: string): Promise<MoveResult> {
  try {
    // キーの形式を検証
    if (!tempKey.startsWith('temp/') || !finalKey.startsWith('orders/')) {
      return {
        success: false,
        error: 'Invalid key format'
      };
    }

    // 一時保存から最終保存に移動
    const { error: moveError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, finalKey);

    if (moveError) {
      return {
        success: false,
        error: `Move failed: ${moveError.message}`
      };
    }

    // 一時保存の記録を削除
    const { error: deleteError } = await supabase
      .from('temp_custom_perfume_images')
      .delete()
      .eq('image_key', tempKey);

    if (deleteError) {
      return {
        success: false,
        error: `Failed to delete temp record: ${deleteError.message}`
      };
    }

    // 最終URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(finalKey);

    return {
      success: true,
      publicUrl
    };
  } catch (error) {
    console.error('Error moving image:', error);
    return {
      success: false,
      error: 'Unexpected error occurred while moving image'
    };
  }
} 