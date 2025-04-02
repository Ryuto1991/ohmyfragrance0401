import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// スプレッドシートの設定
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'OrderDetails';

// デバッグ用のログ出力
console.log('環境変数の確認:');
console.log('GOOGLE_SHEET_ID:', SPREADSHEET_ID);
console.log('SHEET_NAME:', SHEET_NAME);

if (!SPREADSHEET_ID) {
  console.error('GOOGLE_SHEET_IDが設定されていません。');
  process.exit(1);
}

// サービスアカウントの認証情報を読み込む
const CREDENTIALS_PATH = path.join(process.cwd(), 'secrets', 'service-account.json');
console.log('認証情報のパス:', CREDENTIALS_PATH);

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('サービスアカウントの認証情報ファイルが見つかりません:', CREDENTIALS_PATH);
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
console.log('認証情報の読み込みに成功しました');
console.log('サービスアカウントメール:', credentials.client_email);

// JWTクライアントの作成
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheets APIクライアントの作成
const sheets = google.sheets({ version: 'v4', auth });

async function testAppendOrder() {
  try {
    // テスト用の注文データ
    const orderData = {
      fragranceName: 'テスト香り',
      bottleType: 'クリアガラス',
      originalImageUrl: 'https://example.com/test-image.jpg',
      labelImageUrl: 'https://example.com/test-label.jpg',
      labelSize: '中',
      stripeSessionId: 'test_session_123',
      customerName: 'テスト太郎',
      email: 'test@example.com',
      phone: '090-1234-5678',
      address: '東京都渋谷区テスト1-1-1',
      amount: '4,980',
      paymentStatus: '支払い待ち',
      orderStatus: '新規注文',
    };

    // スプレッドシートに追加するデータを準備
    const values = [
      [
        '', // 発送チェック
        orderData.stripeSessionId,
        new Date().toLocaleString('ja-JP'),
        orderData.customerName,
        orderData.address,
        orderData.email,
        orderData.phone,
        orderData.fragranceName,
        orderData.bottleType,
        orderData.labelSize,
        'オリジナル',
        orderData.amount,
        orderData.paymentStatus,
        orderData.orderStatus,
        orderData.originalImageUrl,
        orderData.labelImageUrl,
      ],
    ];

    console.log('\n追加するデータの内容:');
    console.log(JSON.stringify(values, null, 2));

    console.log('\nスプレッドシートにデータを追加します...');
    console.log('Spreadsheet ID:', SPREADSHEET_ID);
    console.log('Range:', `${SHEET_NAME}!A:Q`);

    // スプレッドシートの現在の内容を確認
    console.log('\n現在のスプレッドシートの内容を確認します...');
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Q`,
    });
    console.log('現在の行数:', currentData.data.values?.length || 0);
    console.log('ヘッダー行:', currentData.data.values?.[0]);

    // スプレッドシートにデータを追加
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Q`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    console.log('\nデータの追加結果:');
    console.log(JSON.stringify(response.data, null, 2));

    // 追加後のスプレッドシートの内容を確認
    console.log('\n追加後のスプレッドシートの内容を確認します...');
    const updatedData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Q`,
    });
    console.log('更新後の行数:', updatedData.data.values?.length || 0);
    console.log('最新の行:', updatedData.data.values?.[updatedData.data.values.length - 1]);

  } catch (error) {
    console.error('\nエラーが発生しました:');
    console.error(error);
    if (error instanceof Error) {
      console.error('エラーの詳細:', error.message);
      console.error('スタックトレース:', error.stack);
    }
  }
}

// テストを実行
testAppendOrder(); 