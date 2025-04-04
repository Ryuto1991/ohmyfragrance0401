import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadCroppedImage(blob: Blob): Promise<{ 
  success: boolean; 
  publicUrl?: string; 
  labelId?: string;
  error?: string;
}> {
  try {
    // ラベルIDを生成
    const labelId = uuidv4();
    const path = `temp/${labelId}.png`;

    // 画像をアップロード
    const { error } = await supabase
      .storage
      .from('custom-perfumes')
      .upload(path, blob, {
        upsert: true,
        contentType: 'image/png',
      });

    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }

    // アップロードした画像のURLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('custom-perfumes')
      .getPublicUrl(path);

    return { 
      success: true, 
      publicUrl,
      labelId
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '画像のアップロードに失敗しました'
    };
  }
} 