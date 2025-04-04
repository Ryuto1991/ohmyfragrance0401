import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingResult {
  labelId: string;
  originalUrl: string;
  processedUrl: string;
}

export async function uploadTemporaryImage(file: File): Promise<ImageProcessingResult> {
  const supabase = createClientComponentClient();
  const labelId = uuidv4();
  const fileExt = file.name.split('.').pop();
  const originalKey = `labels/tmp/${labelId}_before.${fileExt}`;

  // 画像をアップロード
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(originalKey, file);

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // 公開URLを取得
  const { data: { publicUrl: originalUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(originalKey);

  return {
    labelId,
    originalUrl,
    processedUrl: '', // 後で編集後の画像URLを設定
  };
}

export async function saveEditedImage(
  labelId: string,
  imageData: string
): Promise<string> {
  const supabase = createClientComponentClient();
  const labelKey = `labels/tmp/${labelId}_after.png`;

  // Base64データをBlobに変換
  const base64Data = imageData.split(',')[1];
  const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());

  // 編集後の画像をアップロード
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(labelKey, blob);

  if (uploadError) {
    throw new Error(`Failed to upload edited image: ${uploadError.message}`);
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(labelKey);

  return publicUrl;
}

export async function getSavedImages(labelId: string): Promise<{
  originalUrl: string;
  processedUrl: string;
} | null> {
  const supabase = createClientComponentClient();
  
  // custom_perfume_imagesテーブルから画像情報を取得
  const { data, error } = await supabase
    .from('custom_perfume_images')
    .select('original_key, label_key')
    .eq('order_id', labelId)
    .single();

  if (error || !data) {
    return null;
  }

  // 画像の公開URLを取得
  const { data: { publicUrl: originalUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(data.original_key);

  const { data: { publicUrl: processedUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(data.label_key);

  return {
    originalUrl,
    processedUrl,
  };
} 