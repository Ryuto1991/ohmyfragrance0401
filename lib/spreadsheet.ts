import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

// 月ごとのシート名を生成
function getSheetName() {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
}

// シートが存在するか確認
async function checkSheetExists(sheetName: string) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    return response.data.sheets?.some(sheet => sheet.properties?.title === sheetName);
  } catch (error) {
    console.error('Error checking sheet existence:', error);
    return false;
  }
}

// 新しいシートを作成
async function createNewSheet(sheetName: string) {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 12,
                },
              },
            },
          },
        ],
      },
    });

    // ヘッダー行を設定
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:Q1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          '注文日時',
          '香り',
          'ボトル',
          '元画像URL',
          '元画像プレビュー',
          '元画像サイズ',
          '元画像形式',
          'ラベル画像URL',
          'ラベル画像プレビュー',
          'ラベル画像サイズ',
          'ラベル画像形式',
          '注文完了',
          '発送完了',
          '発送日',
          '備考',
          'ラベルサイズ',
          'StripeセッションID'
        ]],
      },
    });

    // チェックボックスを追加（注文完了と発送完了）
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 11,
                endColumnIndex: 13,
              },
              cell: {
                dataValidation: {
                  condition: {
                    type: 'BOOLEAN',
                    values: [
                      {
                        userEnteredValue: 'TRUE',
                      },
                    ],
                  },
                  showCustomUi: true,
                },
              },
              fields: 'dataValidation',
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error('Error creating new sheet:', error);
    return false;
  }
}

export async function appendSpreadsheetRow(values: Array<string | number | undefined | null>) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:I', // シート名と範囲を指定
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values.map(value => {
          if (value === null || value === undefined) return '';
          return value.toString();
        })],
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error appending to spreadsheet:', error);
    return { success: false, error };
  }
}

export async function appendOrderToSpreadsheet({
  fragranceName,
  bottleType,
  originalImageUrl,
  originalImageSize,
  originalImageFormat,
  labelImageUrl,
  labelImageSize,
  labelImageFormat,
  labelSize,
  stripeSessionId,
}: {
  fragranceName?: string;
  bottleType?: string;
  originalImageUrl?: string;
  originalImageSize?: string;
  originalImageFormat?: string;
  labelImageUrl?: string;
  labelImageSize?: string;
  labelImageFormat?: string;
  labelSize?: string;
  stripeSessionId: string;
}) {
  const values = [
    new Date().toISOString(),
    stripeSessionId,
    fragranceName || '',
    bottleType || '',
    originalImageUrl || '',
    originalImageSize || '',
    originalImageFormat || '',
    labelImageUrl || '',
    labelImageSize || '',
    labelImageFormat || '',
    labelSize || '',
  ];

  return appendSpreadsheetRow(values);
}

// スプレッドシートの注文ステータスを更新する関数
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // まず、orderIdに一致する行を検索
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:A',
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
      spreadsheetId,
      range: `Sheet1!H${rowIndex + 1}`,
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