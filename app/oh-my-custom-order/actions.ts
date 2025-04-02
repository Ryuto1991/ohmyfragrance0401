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

export type ImageTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type LabelSize = {
  width: number;
  height: number;
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

export async function moveImagesToFinal(
  tempKey: string,
  orderId: string
): Promise<{ success: boolean; originalUrl?: string; labelUrl?: string; error?: string }> {
  try {
    // キーの形式を検証
    if (!tempKey.startsWith('temp/')) {
      return {
        success: false,
        error: 'Invalid key format'
      };
    }

    // 新しいキーを生成
    const fileExt = tempKey.split('.').pop();
    const originalKey = `orders/original/${orderId}.${fileExt}`;
    const labelKey = `orders/label/${orderId}.${fileExt}`;

    // 一時保存から最終保存に移動（元画像）
    const { error: moveOriginalError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, originalKey);

    if (moveOriginalError) {
      return {
        success: false,
        error: `Failed to move original image: ${moveOriginalError.message}`
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

    // URLを取得
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(originalKey);

    const { data: { publicUrl: labelUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(labelKey);

    return {
      success: true,
      originalUrl,
      labelUrl
    };
  } catch (error) {
    console.error('Error moving images:', error);
    return {
      success: false,
      error: 'Unexpected error occurred while moving images'
    };
  }
}

export async function moveAndProcessImages(
  tempKey: string,
  orderId: string,
  imageTransform: ImageTransform,
  labelSize: LabelSize,
  imageData: string
): Promise<{ success: boolean; originalUrl?: string; labelUrl?: string; error?: string }> {
  try {
    // 一時保存された画像のキーの形式を検証
    if (!tempKey.startsWith('temp/')) {
      return { success: false, error: 'Invalid temporary image key format' };
    }

    // 新しいキーを生成
    const originalKey = `orders/original/${orderId}.jpg`;
    const labelKey = `orders/label/${orderId}.jpg`;

    // 元画像の移動
    console.log('Moving from:', tempKey);
    console.log('To original:', originalKey);
    console.log('To label:', labelKey);

    // 元画像の移動
    const { error: moveError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, originalKey);

    if (moveError) {
      console.error('Failed to move original image:', moveError);
      return { success: false, error: `Failed to move original image: ${moveError.message}` };
    }

    // ラベル画像の保存
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(labelKey, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to save label image:', uploadError);
      // 元画像の移動を元に戻す
      await supabase.storage
        .from('custom-perfumes')
        .move(originalKey, tempKey);
      return { success: false, error: `Failed to save label image: ${uploadError.message}` };
    }

    // 一時保存の記録を削除
    const { error: deleteError } = await supabase
      .from('temp_custom_perfume_images')
      .delete()
      .eq('image_key', tempKey);

    if (deleteError) {
      console.error('Failed to delete temporary record:', deleteError);
      // エラーは記録するが、処理は続行
    }

    // 画像変換情報を保存
    const { error: transformError } = await supabase
      .from('custom_perfume_images')
      .insert([
        {
          order_id: orderId,
          original_key: originalKey,
          label_key: labelKey,
          transform: imageTransform,
          label_size: labelSize
        }
      ]);

    if (transformError) {
      console.error('Failed to save image transform data:', transformError);
      // エラーは記録するが、処理は続行
    }

    // 画像のURLを取得
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(originalKey);

    const { data: { publicUrl: labelUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(labelKey);

    return { success: true, originalUrl, labelUrl };
  } catch (error) {
    console.error('Error in moveAndProcessImages:', error);
    return { 
      success: false, 
      error: error instanceof Error 
        ? `Unexpected error: ${error.message}` 
        : 'An unexpected error occurred while processing images'
    };
  }
}

// 一時ファイルのクリーンアップ関数を追加
export async function cleanupTempImages(): Promise<{ success: boolean; error?: string }> {
  try {
    // 24時間以上経過した一時保存の記録を取得
    const { data: oldRecords, error: fetchError } = await supabase
      .from('temp_custom_perfume_images')
      .select('image_key')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Failed to fetch old records:', fetchError);
      return { success: false, error: `Failed to fetch old records: ${fetchError.message}` };
    }

    if (!oldRecords || oldRecords.length === 0) {
      return { success: true };
    }

    // 一時ファイルを削除
    for (const record of oldRecords) {
      const { error: deleteError } = await supabase.storage
        .from('custom-perfumes')
        .remove([record.image_key]);

      if (deleteError) {
        console.error(`Failed to delete temporary file ${record.image_key}:`, deleteError);
        // エラーは記録するが、処理は続行
      }

      // データベースの記録を削除
      const { error: dbError } = await supabase
        .from('temp_custom_perfume_images')
        .delete()
        .eq('image_key', record.image_key);

      if (dbError) {
        console.error(`Failed to delete temporary record for ${record.image_key}:`, dbError);
        // エラーは記録するが、処理は続行
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cleanupTempImages:', error);
    return { 
      success: false, 
      error: error instanceof Error 
        ? `Unexpected error: ${error.message}` 
        : 'An unexpected error occurred while cleaning up temporary images'
    };
  }
} 