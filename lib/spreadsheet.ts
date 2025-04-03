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
                  columnCount: 25,
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
      range: `${sheetName}!A1:AC1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          // 注文情報
          '注文日時',
          '注文ID',
          'StripeセッションID',
          '支払い状況',
          '支払い方法',
          '合計金額',
          '配送料',
          '消費税',
          '小計',
          
          // 顧客情報
          '顧客名',
          'メールアドレス',
          '電話番号',
          '郵便番号',
          '都道府県',
          '市区町村',
          '番地・建物名',
          
          // 商品情報
          '商品タイプ',
          '香り',
          'ボトル',
          'ラベルサイズ',
          'ラベル画像URL',
          '備考',
          
          // 画像情報
          '元画像URL',
          '元画像サイズ',
          '元画像形式',
          '編集後画像URL',
          '編集後画像サイズ',
          '編集後画像形式',
          
          // 発送情報
          '発送状況',
          '発送日',
          '追跡番号'
        ]],
      },
    });

    // チェックボックスを追加（発送状況）
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
                startColumnIndex: 22,
                endColumnIndex: 23,
              },
              cell: {
                dataValidation: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: [
                      { userEnteredValue: '未発送' },
                      { userEnteredValue: '発送済み' },
                      { userEnteredValue: '配送中' },
                      { userEnteredValue: '配達完了' }
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
  orderId,
  stripeSessionId,
  paymentStatus,
  paymentMethod,
  amountTotal,
  shippingCost,
  taxAmount,
  subtotal,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  productType,
  fragranceName,
  bottleType,
  labelSize,
  labelImageUrl,
  orderNote,
  originalImageUrl,
  originalImageSize,
  originalImageFormat,
  editedImageUrl,
  editedImageSize,
  editedImageFormat,
}: {
  orderId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paymentMethod: string;
  amountTotal: number;
  shippingCost: number;
  taxAmount: number;
  subtotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
  };
  productType: string;
  fragranceName?: string;
  bottleType?: string;
  labelSize?: string;
  labelImageUrl?: string;
  orderNote?: string;
  originalImageUrl?: string;
  originalImageSize?: string;
  originalImageFormat?: string;
  editedImageUrl?: string;
  editedImageSize?: string;
  editedImageFormat?: string;
}) {
  const values = [
    new Date().toISOString(),
    orderId,
    stripeSessionId,
    paymentStatus,
    paymentMethod,
    amountTotal.toString(),
    shippingCost.toString(),
    taxAmount.toString(),
    subtotal.toString(),
    customerName,
    customerEmail,
    customerPhone,
    customerAddress.postalCode,
    customerAddress.prefecture,
    customerAddress.city,
    customerAddress.address,
    productType,
    fragranceName || '',
    bottleType || '',
    labelSize || '',
    labelImageUrl || '',
    orderNote || '',
    originalImageUrl || '',
    originalImageSize || '',
    originalImageFormat || '',
    editedImageUrl || '',
    editedImageSize || '',
    editedImageFormat || '',
    '未発送',
    '',
    '',
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