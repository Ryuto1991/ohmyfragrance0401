const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const path = require('path');

// スプレッドシートのヘッダー行のインデックス
const HEADERS_ROW = 1;

// サービスアカウントの認証を設定
const getAuth = async () => {
  const keyPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
  return new JWT({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// スプレッドシートに注文情報を追加する関数
async function appendOrderToSpreadsheet(orderData) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        orderData.orderId,
        orderData.stripeSessionId,
        orderData.customerName,
        orderData.customerEmail,
        orderData.fragranceName,
        orderData.bottleName,
        orderData.amount,
        orderData.status,
        orderData.createdAt.toISOString(),
        orderData.imageUrl || '',
      ],
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'シート1', // シート名を指定
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending order to spreadsheet:', error);
    throw error;
  }
}

// スプレッドシートの注文ステータスを更新する関数
async function updateOrderStatus(orderId, newStatus) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // まず、orderIdに一致する行を検索
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'シート1!A:A',
    });

    const rows = response.data.values;
    if (!rows) {
      throw new Error('No data found in spreadsheet');
    }

    // orderIdが一致する行のインデックスを探す
    const rowIndex = rows.findIndex((row) => row[0] === orderId);
    if (rowIndex === -1) {
      throw new Error(`Order ID ${orderId} not found in spreadsheet`);
    }

    // ステータスを更新（H列）
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: `シート1!H${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating order status in spreadsheet:', error);
    throw error;
  }
}

module.exports = {
  appendOrderToSpreadsheet,
  updateOrderStatus,
}; 