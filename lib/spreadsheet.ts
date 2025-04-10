import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// 修正: 環境変数のメールアドレスと秘密鍵を直接使用
const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.MY_GOOGLE_SHEET_ID;

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

// 新しいシートを作成 (16列対応)
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
                  columnCount: 16, // 列数を16に設定
                },
              },
            },
          },
        ],
      },
    });

    // ヘッダー行を設定 (16列)
    const headers = [
      '注文ID', '注文日時', '顧客名', 'メールアドレス', '電話番号',
      'モード', // モード列追加
      '香り', 'レシピ', // レシピ列追加
      'ボトル', 'ラベルサイズ', 'ラベルタイプ',
      '金額', '支払い状態', '注文状態', '画像URL', '画像URL(切り抜き後)'
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:P1`, // ヘッダー範囲をP列まで拡張
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    // 注文状態のドロップダウンリストを追加 (14列目 = N列)
    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const targetSheet = sheetInfo.data.sheets?.find(s => s.properties?.title === sheetName);
    const sheetId = targetSheet?.properties?.sheetId;

    if (sheetId !== undefined && sheetId !== null) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1,
                  startColumnIndex: 13, // N列 (0-indexed)
                  endColumnIndex: 14,
                },
                cell: {
                  dataValidation: {
                    condition: {
                      type: 'ONE_OF_LIST',
                      values: [
                        { userEnteredValue: '未発送' },
                        { userEnteredValue: '発送準備中' },
                        { userEnteredValue: '発送済み' },
                        { userEnteredValue: 'キャンセル' }
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
    } else {
      console.warn(`Sheet ID for "${sheetName}" not found. Skipping data validation setup.`);
    }

    return true;
  } catch (error) {
    console.error('Error creating new sheet:', error);
    return false;
  }
}

// この関数は現在使用されていないようですが、念のため残します
export async function appendSpreadsheetRow(values: Array<string | number | undefined | null>) {
  // ... (内容は変更なし)
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:I', // この範囲も要確認
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values.map(value => (value === null || value === undefined ? '' : value.toString()))],
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error appending to spreadsheet (generic):', error);
    return { success: false, error };
  }
}

// 注文情報をスプレッドシートに追記する関数 (16列対応)
export async function appendOrderToSpreadsheet({
  orderId,
  orderTimestamp,
  customerName,
  customerEmail,
  customerPhone,
  mode, // mode引数を追加
  fragranceName,
  recipe, // recipe引数を追加
  bottleType,
  labelSize,
  labelType,
  amountTotal, // -1 を受け取る可能性がある
  paymentStatus,
  orderStatus,
  imageUrl,
  finalImageUrl,
}: {
  orderId: string;
  orderTimestamp: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  mode?: string;
  fragranceName?: string;
  recipe?: string;
  bottleType?: string;
  labelSize?: string;
  labelType?: string;
  amountTotal: number; // 型はnumberのまま
  paymentStatus: string;
  orderStatus: string;
  imageUrl?: string;
  finalImageUrl?: string;
}) {
  try {
    console.log('🔄 スプレッドシートへのデータ追加を開始');
    const sheetName = getSheetName();
    console.log('📄 シート名:', sheetName);

    // シート存在確認と作成
    const sheetExists = await checkSheetExists(sheetName);
    console.log('🔍 シートの存在確認:', sheetExists ? '存在する' : '存在しない');
    if (!sheetExists) {
      console.log('📝 新規シートを作成');
      const created = await createNewSheet(sheetName);
      if (!created) throw new Error('Failed to create new sheet');
      console.log('✅ 新規シートの作成完了');
    }

    // データを準備 (16列)
    const values = [
      orderId,
      orderTimestamp,
      customerName,
      customerEmail,
      customerPhone,
      mode || '', // モード
      fragranceName || '',
      recipe || '', // レシピ
      bottleType || '',
      labelSize || '',
      labelType || '',
      amountTotal === -1 ? '' : amountTotal, // 金額 (-1なら空文字)
      paymentStatus,
      orderStatus,
      imageUrl || '',
      finalImageUrl || '',
    ];
    console.log('📝 追加するデータ:', JSON.stringify(values, null, 2));

    // append を使用し、範囲を A1:P1 と明示してテーブル範囲を指定
    console.log(`📤 スプレッドシート (${sheetName}) のテーブル範囲 A1:P1 にデータを追記中...`);
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1:P1`, // テーブル範囲をP列まで拡張
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [values.map(v => (v === null || v === undefined ? '' : v))],
      },
    });

    if (!appendResponse.data) {
      throw new Error('No response data from Google Sheets API after append');
    }
    console.log('✅ スプレッドシートへのデータ追記成功:', appendResponse.data);
    return { success: true, data: appendResponse.data };

  } catch (error) {
    console.error('❌ スプレッドシートへのデータ追加エラー:', error);
    return { success: false, error };
  }
}

// スプレッドシートの注文ステータスを更新する関数 (16列対応)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const sheetName = getSheetName();
    console.log(`🔄 Updating order status for ${orderId} in sheet ${sheetName}`);

    // orderIdに一致する行を検索 (A列を検索)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values;
    if (!rows) {
      console.error(`No data found in sheet ${sheetName}`);
      throw new Error('No data found in spreadsheet');
    }

    const rowIndex = rows.findIndex((row) => row[0] === orderId);
    if (rowIndex === -1) {
      console.error(`Order ID ${orderId} not found in sheet ${sheetName}`);
      throw new Error(`Order ID ${orderId} not found in spreadsheet`);
    }
    const targetRow = rowIndex + 1;

    // ステータスを更新 (N列 = 14列目)
    const targetRange = `${sheetName}!N${targetRow}`;
    console.log(`📤 Updating status at ${targetRange} to ${newStatus}`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]],
      },
    });

    console.log(`✅ Status updated successfully for ${orderId}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating order status in spreadsheet:', error);
    throw error;
  }
}
