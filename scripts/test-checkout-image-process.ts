import dotenv from 'dotenv';
import { createCanvas } from 'canvas';
import { v4 as uuid } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// 環境変数の読み込み
dotenv.config({ path: '.env.test' });

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// テスト用の画像データを作成
function createTestImageData() {
  const canvas = createCanvas(600, 480);
  const ctx = canvas.getContext('2d');

  // 黒い背景
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 600, 480);

  // テキストを追加
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Test Image', 200, 240);

  return canvas.toDataURL('image/jpeg');
}

// テスト用の画像をアップロード
async function uploadTestImage() {
  try {
    const imageData = createTestImageData();
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');
    const tempKey = `temp/${uuid()}.jpg`;

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

// チェックアウトプロセスのシミュレーション
async function simulateCheckout() {
  try {
    console.log('Starting checkout simulation...');

    // テスト用の画像をアップロード
    console.log('Uploading test image...');
    const { tempKey, error: uploadError } = await uploadTestImage();
    if (uploadError) {
      console.error('Failed to upload test image:', uploadError);
      return;
    }
    console.log('Test image uploaded:', tempKey);

    // テスト用の注文データを作成
    const orderDetails = [{
      id: `test-order-${uuid()}`,
      f: 'test-fragrance',
      fn: 'Test Fragrance',
      b: 'test-bottle',
      bn: 'Test Bottle',
      ls: '600x480',
      lt: 'standard',
      li: tempKey,
      q: 1,
      t: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }
    }];

    // チェックアウトAPIをシミュレート
    console.log('Simulating checkout API call...');
    const response = await fetch('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_items: [{
          price: 'price_test',
          quantity: 1
        }],
        orderDetails: orderDetails,
        fragranceName: orderDetails[0].fn,
        bottleType: orderDetails[0].bn,
        imageKey: orderDetails[0].li,
        finalImageKey: `orders/label/${orderDetails[0].id}.jpg`,
        customer_email: 'required',
        billing_address_collection: 'required',
        customer_creation: 'always',
        phone_number_collection: {
          enabled: true
        }
      }),
    });

    const data = await response.json();
    console.log('Checkout response:', data);

    // 画像の移動を確認
    console.log('Checking final image locations...');
    const { data: originalImage } = await supabase.storage
      .from('custom-perfumes')
      .list(`orders/original`);

    const { data: labelImage } = await supabase.storage
      .from('custom-perfumes')
      .list(`orders/label`);

    console.log('Original images:', originalImage);
    console.log('Label images:', labelImage);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// テストの実行
simulateCheckout().catch(console.error); 