require('dotenv').config({ path: '.env.local' });
const { appendOrderToSpreadsheet, updateOrderStatus } = require('../lib/spreadsheet');

async function testSpreadsheet() {
  try {
    // テスト用の注文データを作成
    const testOrder = {
      orderId: 'test-' + Date.now(),
      stripeSessionId: 'test-session-' + Date.now(),
      customerName: 'テスト太郎',
      customerEmail: 'test@example.com',
      fragranceName: 'テストフレグランス',
      bottleName: 'テストボトル',
      amount: 4980,
      status: '注文受付',
      createdAt: new Date(),
      imageUrl: 'https://example.com/test-image.jpg', // テスト用の画像URL
    };

    console.log('1. スプレッドシートに新規注文を書き込みます...');
    const result = await appendOrderToSpreadsheet(testOrder);
    console.log('新規注文の書き込みが完了しました:', result);

    // 3秒待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n2. 注文状態を「発送準備中」に更新します...');
    const updateResult1 = await updateOrderStatus(testOrder.orderId, '発送準備中');
    console.log('注文状態の更新が完了しました:', updateResult1);

    // 3秒待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n3. 注文状態を「発送完了」に更新します...');
    const updateResult2 = await updateOrderStatus(testOrder.orderId, '発送完了');
    console.log('注文状態の更新が完了しました:', updateResult2);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testSpreadsheet(); 