import { config } from 'dotenv';
import { uploadImage } from '../app/oh-my-custom-order/actions';
import fs from 'fs';
import path from 'path';

// 環境変数を読み込む
config({ path: '.env.test' });

// 環境変数が正しく設定されているか確認
console.log('Checking environment variables...');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

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

async function testImageUpload() {
  try {
    // テスト用の画像ファイルを作成
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    const testImageBuffer = Buffer.from('test image content');
    fs.writeFileSync(testImagePath, testImageBuffer);

    // NodeFile オブジェクトを作成
    const file = new NodeFile(testImageBuffer, 'test-image.jpg', 'image/jpeg') as unknown as File;

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