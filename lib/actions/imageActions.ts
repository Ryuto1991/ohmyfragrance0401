'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
// uploadCroppedImage のインポート元を確認・修正する必要があるかもしれません
// 元の actions.ts では './server/uploadImage' でしたが、
// このファイルの場所に合わせて調整が必要です。
// 仮に同じ階層にあると想定します。
// import { uploadCroppedImage } from './server/uploadImage'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type UploadResult = {
  success: boolean;
  imageKey?: string; // 例: temp/unique-id.png
  publicUrl?: string; // 例: https://.../storage/v1/object/public/custom-perfumes/temp/unique-id.png
  finalKey?: string; // 例: orders/unique-id.png
  error?: string;
};

export type MoveResult = {
  success: boolean;
  publicUrl?: string; // 例: https://.../storage/v1/object/public/custom-perfumes/orders/unique-id.png
  error?: string;
};

// ダミーの uploadCroppedImage 関数は削除

export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // ファイルサイズチェック（5MB以下に変更 - フロントエンドと合わせる）
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'ファイルサイズは5MB以下にしてください'
      };
    }

    // ファイルタイプチェック (フロントエンドと合わせる - WEBPも許可)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'JPG、PNG、WEBP形式の画像のみアップロード可能です'
      };
    }

    // 一意なファイル名を生成 (拡張子を保持)
    const fileExtension = file.name.split('.').pop();
    const uniqueId = uuidv4();
    const tempKey = `temp/${uniqueId}.${fileExtension}`;
    const finalKey = `orders/${uniqueId}.${fileExtension}`; // finalKeyもここで生成

    console.log(`Uploading to Supabase: ${tempKey}`);

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(tempKey, file, {
        cacheControl: '3600', // キャッシュ設定 (任意)
        upsert: false, // 同名ファイルが存在する場合はエラー (通常は一意なので不要)
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    if (!uploadData) {
       console.error('Supabase upload error: No data returned');
       return { success: false, error: 'Upload failed: No data returned from Supabase' };
    }

    console.log(`Successfully uploaded to ${uploadData.path}`);

    // アップロードしたファイルの公開URLを取得
    const { data: urlData } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(tempKey);

    if (!urlData?.publicUrl) {
      console.error(`Failed to get public URL for ${tempKey}`);
      // アップロード自体は成功しているので、URL取得失敗でもキーは返す
      return { success: true, imageKey: tempKey, finalKey: finalKey, publicUrl: '', error: 'Failed to get public URL' };
    }

    console.log(`Public URL: ${urlData.publicUrl}`);

    return {
      success: true,
      imageKey: tempKey, // temp/ から始まるキー
      publicUrl: urlData.publicUrl,
      finalKey: finalKey // orders/ から始まるキー
    };
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
    // キーの形式を検証 (Webhook側で整形済みのはずだが念のため)
    if (!tempKey || !finalKey) {
       return { success: false, error: 'Invalid keys provided' };
    }
    // プレフィックスの検証はWebhook側で行うため、ここでは緩めるか削除
    // if (!tempKey.startsWith('temp/') || !finalKey.startsWith('orders/')) {
    //   return {
    //     success: false,
    //     error: 'Invalid key format expected by moveImageToFinal'
    //   };
    // }

    console.log(`Attempting to move ${tempKey} to ${finalKey} in bucket custom-perfumes`);

    // 一時保存から最終保存に移動
    const { error: moveError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, finalKey);

    if (moveError) {
      console.error(`Supabase move error: ${moveError.message}`, { tempKey, finalKey });
      // 404エラーは移動元が存在しない可能性があるので、許容するか検討
      if (moveError.message.includes('Not Found')) {
         console.warn(`Source object ${tempKey} not found, possibly already moved or deleted.`);
         // 移動元がなくても、最終URL取得を試みる
      } else {
        return {
          success: false,
          error: `Move failed: ${moveError.message}`
        };
      }
    } else {
       console.log(`Successfully moved ${tempKey} to ${finalKey}`);
    }

    // 一時保存の記録を削除 (存在すれば)
    // 注意: temp_custom_perfume_images テーブルが存在するか確認が必要
    try {
      console.log(`Attempting to delete record for ${tempKey} from temp_custom_perfume_images`);
      const { error: deleteError } = await supabase
        .from('temp_custom_perfume_images') // テーブル名を確認
        .delete()
        .eq('image_key', tempKey); // カラム名を確認

      if (deleteError) {
         // 存在しない場合のエラーは無視しても良いかもしれない
         console.warn(`Failed to delete temp record for ${tempKey}: ${deleteError.message}`);
      } else {
         console.log(`Successfully deleted temp record for ${tempKey}`);
      }
    } catch (dbError) {
       console.error(`Error interacting with temp_custom_perfume_images table:`, dbError);
    }


    // 最終URLを取得
    console.log(`Getting public URL for ${finalKey}`);
    const { data } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(finalKey);

    if (!data?.publicUrl) {
       console.error(`Failed to get public URL for ${finalKey}`);
       return { success: false, error: `Failed to get public URL for ${finalKey}` };
    }

    console.log(`Successfully obtained public URL: ${data.publicUrl}`);
    return {
      success: true,
      publicUrl: data.publicUrl
    };
  } catch (error) {
    console.error('Error moving image:', error);
    return {
      success: false,
      error: 'Unexpected error occurred while moving image'
    };
  }
}
