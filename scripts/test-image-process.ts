import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';

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

// テスト用の画像データを作成（シンプルな黒い四角形）
function createTestImageData(): string {
  const canvas = createCanvas(600, 480);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg');
}

async function uploadTestImage(): Promise<{ tempKey: string; error?: string }> {
  try {
    // テスト用の画像データを作成
    const imageData = createTestImageData();
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');

    // 一時的なキーを生成
    const tempKey = `temp/${uuidv4()}.jpg`;

    // Supabaseにアップロード
    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(tempKey, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { tempKey: '', error: uploadError.message };
    }

    return { tempKey };
  } catch (error) {
    return { tempKey: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function moveAndProcessImages(
  tempKey: string,
  orderId: string,
  imageTransform: { x: number; y: number; scale: number; rotation: number },
  labelSize: { width: number; height: number },
  imageData: string
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

    // 1. 元画像を移動
    const { error: moveOriginalError } = await supabase.storage
      .from('custom-perfumes')
      .move(tempKey, originalKey);

    if (moveOriginalError) {
      return {
        success: false,
        error: `Failed to move original image: ${moveOriginalError.message}`
      };
    }

    // 2. 切り抜かれたラベル画像を保存
    // Base64データをバイナリに変換
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const labelBuffer = Buffer.from(base64Data, 'base64');

    const { error: uploadLabelError } = await supabase.storage
      .from('custom-perfumes')
      .upload(labelKey, labelBuffer, {
        contentType: `image/${fileExt}`
      });

    if (uploadLabelError) {
      // エラーが発生した場合、元画像を元の場所に戻す
      await supabase.storage
        .from('custom-perfumes')
        .move(originalKey, tempKey);

      return {
        success: false,
        error: `Failed to upload label image: ${uploadLabelError.message}`
      };
    }

    // 3. 一時保存の記録を削除
    const { error: deleteError } = await supabase
      .from('temp_custom_perfume_images')
      .delete()
      .eq('image_key', tempKey);

    if (deleteError) {
      console.error('Failed to delete temp record:', deleteError);
      // この段階でのエラーは無視して続行
    }

    // 4. 画像の変換情報を保存
    const { error: saveTransformError } = await supabase
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

    if (saveTransformError) {
      console.error('Failed to save transform data:', saveTransformError);
      // この段階でのエラーは無視して続行
    }

    // 5. URLを取得
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
    console.error('Error processing images:', error);
    return {
      success: false,
      error: 'Unexpected error occurred while processing images'
    };
  }
}

async function testImageProcess() {
  try {
    console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set');

    // テスト画像のアップロード
    console.log('Uploading test image...');
    const { tempKey, error: uploadError } = await uploadTestImage();
    if (uploadError) {
      console.error('Failed to upload test image:', uploadError);
      return;
    }
    console.log('Test image uploaded:', tempKey);

    // 画像の移動と処理
    console.log('Moving and processing images...');
    const orderId = `test-order-${uuidv4()}`; // UUIDを使用して一意の注文IDを生成
    const { originalUrl, labelUrl, error: processError } = await moveAndProcessImages(tempKey, orderId, { x: 0, y: 0, scale: 1, rotation: 0 }, { width: 600, height: 480 }, createTestImageData());
    
    if (processError) {
      console.error('Process failed:', processError);
      return;
    }

    console.log('Process successful!');
    console.log('Original image URL:', originalUrl);
    console.log('Label image URL:', labelUrl);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageProcess(); 