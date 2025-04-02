import { createClient } from '@supabase/supabase-js';

// 環境変数を設定
const supabaseUrl = 'https://igpsidgueemtziedebcs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncHNpZGd1ZWVtdHppZWRlYmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzE3MTk4MiwiZXhwIjoyMDU4NzQ3OTgyfQ.YWaLE2vMj1Km4lmY7ZNr6zzQ8Qz0n3UcKtwm-pPFyrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCleanup() {
  try {
    // 1. テスト用の期限切れデータを作成
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() - 25); // 25時間前

    const { error: insertError } = await supabase
      .from('temp_custom_perfume_images')
      .insert([
        {
          image_key: 'temp/test-expired-1.jpg',
          expires_at: expiredDate.toISOString()
        },
        {
          image_key: 'temp/test-expired-2.jpg',
          expires_at: expiredDate.toISOString()
        }
      ]);

    if (insertError) {
      console.error('Failed to insert test data:', insertError);
      return;
    }

    console.log('Created test expired records');

    // 2. クリーンアップAPIを呼び出し
    const response = await fetch('http://localhost:3001/api/cleanup-temp-images', {
      method: 'POST'
    });

    const result = await response.json();
    console.log('Cleanup result:', result);

    // 3. 結果を確認
    const { data: remainingData, error: checkError } = await supabase
      .from('temp_custom_perfume_images')
      .select('*')
      .in('image_key', ['temp/test-expired-1.jpg', 'temp/test-expired-2.jpg']);

    if (checkError) {
      console.error('Failed to check remaining data:', checkError);
      return;
    }

    console.log('Remaining records:', remainingData?.length || 0);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCleanup(); 