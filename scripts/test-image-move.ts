import { uploadImage, moveImageToFinal } from '../app/oh-my-custom-order/actions';
import fs from 'fs';
import path from 'path';

// 環境変数を直接設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://igpsidgueemtziedebcs.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncHNpZGd1ZWVtdHppZWRlYmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzE3MTk4MiwiZXhwIjoyMDU4NzQ3OTgyfQ.YWaLE2vMj1Km4lmY7ZNr6zzQ8Qz0n3UcKtwm-pPFyrk';

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

async function testImageMove() {
  try {
    // テスト用の画像ファイルを作成
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    const testImageBuffer = Buffer.from('test image content');
    fs.writeFileSync(testImagePath, testImageBuffer);

    // NodeFile オブジェクトを作成
    const file = new NodeFile(testImageBuffer, 'test-image.jpg', 'image/jpeg') as unknown as File;

    // 1. 画像をアップロード（一時保存）
    console.log('1. Uploading test image...');
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success) {
      throw new Error('Upload failed: ' + uploadResult.error);
    }

    console.log('Upload successful!');
    console.log('Temp Image Key:', uploadResult.imageKey);
    console.log('Temp Public URL:', uploadResult.publicUrl);

    // 2. 画像を移動（本保存）
    console.log('\n2. Moving image to final location...');
    const moveResult = await moveImageToFinal(uploadResult.imageKey, uploadResult.finalKey);

    if (!moveResult.success) {
      throw new Error('Move failed: ' + moveResult.error);
    }

    console.log('Move successful!');
    console.log('Final Public URL:', moveResult.publicUrl);

    // テスト用の画像ファイルを削除
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageMove(); 