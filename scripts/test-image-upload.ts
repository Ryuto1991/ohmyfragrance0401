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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Node.js環境用のFileオブジェクトをシミュレート
class NodeFile {
  name: string;
  type: string;
  buffer: Buffer;

  constructor(buffer: Buffer, name: string, type: string) {
    this.buffer = buffer;
    this.name = name;
    this.type = type;
  }

  arrayBuffer() {
    return Promise.resolve(this.buffer);
  }
}

async function uploadImage(file: NodeFile): Promise<any> {
  try {
    // ファイルサイズのチェック（3MB以下）
    if (file.buffer.length > 3 * 1024 * 1024) {
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

    // 一時保存用のパスに画像をアップロード
    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(tempKey, file.buffer, {
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

async function testImageUpload() {
  try {
    // テスト用の画像ファイルを作成
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    const testImageBuffer = Buffer.from('test image content');
    fs.writeFileSync(testImagePath, testImageBuffer);

    // NodeFile オブジェクトを作成
    const file = new NodeFile(testImageBuffer, 'test-image.jpg', 'image/jpeg');

    // 画像をアップロード
    console.log('Uploading test image...');
    const result = await uploadImage(file);

    if (result.success) {
      console.log('Upload successful!');
      console.log('Image Key:', result.imageKey);
      console.log('Public URL:', result.publicUrl);
      console.log('Final Key:', result.finalKey);
    } else {
      console.error('Upload failed:', result.error);
    }

    // テスト用の画像ファイルを削除
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageUpload(); 