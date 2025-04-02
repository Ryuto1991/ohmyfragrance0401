import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Sheets APIの認証情報
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // 現在の日時を取得
    const now = new Date();
    const timestamp = now.toLocaleString('ja-JP');

    // スプレッドシートに追加するデータ
    const values = [[
      '', // 発送チェック（空欄）
      orderData.stripeSessionId, // 注文ID
      timestamp, // 注文日時
      orderData.customerName || '', // 顧客名
      orderData.address || '', // 住所
      orderData.email || '', // メールアドレス
      orderData.phone || '', // 電話番号
      orderData.fragranceName, // 香り
      orderData.bottleType, // ボトル
      orderData.labelSize, // ラベルサイズ
      orderData.labelType || '', // ラベルタイプ
      orderData.amount || '', // 金額
      '支払い待ち', // 支払い状態
      '新規注文', // 注文状態
      orderData.originalImageUrl, // 元画像URL
      orderData.labelImageUrl, // 画像URL(切り抜き後)
    ]];

    // スプレッドシートにデータを追加
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:Q', // ヘッダー行の後に追加
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error appending to spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to append to spreadsheet' },
      { status: 500 }
    );
  }
} 