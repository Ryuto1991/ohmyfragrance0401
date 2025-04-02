import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 環境変数を読み込む
config({ path: '.env.test' });

// 環境変数が正しく設定されているか確認
console.log('Checking environment variables...');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables are not set');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceKey ? 'Set' : 'Not set');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadTestImage(): Promise<string> {
  // テスト用の画像ファイルを作成
  const testImagePath = path.join(process.cwd(), 'test-image.jpg');
  const testImageBuffer = Buffer.from('test image content');
  fs.writeFileSync(testImagePath, testImageBuffer);

  try {
    // 一時キーを生成
    const fileName = `${uuidv4()}.jpg`;
    const tempKey = `temp/${fileName}`;

    // 画像をアップロード
    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(tempKey, testImageBuffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      throw uploadError;
    }

    // 一時保存の記録を作成
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
      throw dbError;
    }

    // テスト用の画像ファイルを削除
    fs.unlinkSync(testImagePath);

    return tempKey;
  } catch (error) {
    // エラーが発生した場合、テスト用の画像ファイルを削除
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    throw error;
  }
}

async function moveImagesToFinal(
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

    console.log('Moving from:', tempKey);
    console.log('To original:', originalKey);
    console.log('To label:', labelKey);

    // 一時保存から最終保存に移動（元画像）
    const { error: moveOriginalError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, originalKey);

    if (moveOriginalError) {
      console.error('Move error:', moveOriginalError);
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
      console.error('Delete error:', deleteError);
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

async function testImageMoveFinal() {
  try {
    // まず、テスト用の画像をアップロード
    console.log('Uploading test image...');
    const tempKey = await uploadTestImage();
    console.log('Test image uploaded:', tempKey);

    // テスト用の注文ID
    const orderId = 'test-order-001';

    console.log('Moving images to final location...');
    const result = await moveImagesToFinal(tempKey, orderId);

    if (result.success) {
      console.log('Move successful!');
      console.log('Original Image URL:', result.originalUrl);
      console.log('Label Image URL:', result.labelUrl);
    } else {
      console.error('Move failed:', result.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageMoveFinal(); 