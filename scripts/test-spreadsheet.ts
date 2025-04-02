import { appendOrderToSpreadsheet } from '../lib/spreadsheet';

async function testSpreadsheet() {
  try {
    const testOrder = {
      orderId: 'test-' + Date.now(),
      stripeSessionId: 'test-session-' + Date.now(),
      customerName: 'テスト太郎',
      customerEmail: 'test@example.com',
      fragranceName: 'テストフレグランス',
      bottleName: 'テストボトル',
      amount: 4980,
      status: 'テスト',
      createdAt: new Date(),
    };

    console.log('スプレッドシートに書き込みを開始します...');
    const result = await appendOrderToSpreadsheet(testOrder);
    console.log('書き込みが完了しました:', result);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

testSpreadsheet(); 