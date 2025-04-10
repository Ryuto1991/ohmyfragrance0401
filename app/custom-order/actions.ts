'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { uploadCroppedImage } from './server/uploadImage';

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
  labelId?: string; // Added labelId to the return type of uploadCroppedImage
  error?: string;
};

// Modify uploadImage to accept ArrayBuffer and file details
export async function uploadImage(
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileType: string
): Promise<UploadResult> {
  try {
    // Check file size (5MB limit) - Check buffer size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'ファイルサイズは5MB以下にしてください。'
      };
    }

    // ファイルタイプチェック - Use passed fileType
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: 'JPG、PNG、GIF形式の画像のみアップロード可能です'
      };
    }

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);

    // 画像をアップロード - Pass buffer, fileName, fileType
    return await uploadCroppedImage(buffer, fileName, fileType);
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像のアップロードに失敗しました'
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
