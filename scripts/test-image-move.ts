import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function moveImageToFinal(tempKey: string, finalKey: string): Promise<any> {
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

async function testImageMove() {
  try {
    // アップロードテストの結果から取得したキーを使用
    const tempKey = 'temp/384256e9-2e5f-4164-bbf7-46967e266996.jpg';
    const finalKey = 'orders/384256e9-2e5f-4164-bbf7-46967e266996.jpg';

    console.log('Moving image from temp to final location...');
    const result = await moveImageToFinal(tempKey, finalKey);

    if (result.success) {
      console.log('Move successful!');
      console.log('Final Public URL:', result.publicUrl);
    } else {
      console.error('Move failed:', result.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageMove(); 