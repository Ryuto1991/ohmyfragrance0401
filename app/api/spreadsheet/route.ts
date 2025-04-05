import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

// バリデーションルールの型定義
type ValidationRule = {
  required: boolean;
  pattern?: RegExp;
  maxLength?: number;
  enum?: string[];
  min?: number;
  max?: number;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

// バリデーションルール
const validationRules: ValidationRules = {
  orderId: {
    required: true,
    pattern: /^[a-zA-Z0-9-]+$/,
    maxLength: 50
  },
  product_name: {
    required: true,
    maxLength: 100
  },
  bottle_type: {
    required: true,
    enum: ['30ml', '50ml', '100ml']
  },
  label_size: {
    required: true,
    enum: ['標準', '大', '特大']
  },
  label_type: {
    required: true,
    enum: ['オリジナル', 'プレミアム']
  },
  total_amount: {
    required: true,
    min: 0,
    max: 100000
  }
};

// カスタムエラークラス
class SpreadsheetError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SpreadsheetError';
  }
}

// データのバリデーション
function validateData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = data[field];

    if (rules.required && !value) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value) {
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} exceeds maximum length`);
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be greater than or equal to ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be less than or equal to ${rules.max}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// スプレッドシートのフォーマット設定
const formatSettings = {
  headerFormat: {
    backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
  },
  dataFormat: {
    dateFormat: {
      type: 'DATE_TIME',
      pattern: 'yyyy/MM/dd HH:mm:ss'
    },
    amountFormat: {
      type: 'NUMBER',
      pattern: '#,##0'
    }
  }
};

// データの検証関数
const validateRowData = (data: any, headers: string[]) => {
  const validatedData: { [key: string]: any } = {};
  
  headers.forEach(header => {
    switch(header) {
      case '発送チェック':
        validatedData[header] = '';
        break;
      case '注文日時':
        validatedData[header] = new Date().toISOString();
        break;
      case '注文ID':
        validatedData[header] = data.orderId || '';
        break;
      case '顧客名':
        validatedData[header] = data.customerName || '';
        break;
      case '住所':
        validatedData[header] = data.shippingAddress || '';
        break;
      case 'メールアドレス':
        validatedData[header] = data.customerEmail || '';
        break;
      case '電話番号':
        validatedData[header] = data.customerPhone || '';
        break;
      case '香り':
        validatedData[header] = data.product_name || '';
        break;
      case 'ボトル':
        validatedData[header] = data.bottle_type || '';
        break;
      case 'ラベルサイズ':
        validatedData[header] = data.label_size || '';
        break;
      case 'ラベルタイプ':
        validatedData[header] = data.label_type || '';
        break;
      case '金額':
        validatedData[header] = data.total_amount || 0;
        break;
      case '支払い状態':
        validatedData[header] = data.payment_status || 'pending';
        break;
      case '注文状態':
        validatedData[header] = data.order_status || 'pending';
        break;
      case '元画像URL':
        validatedData[header] = data.original_image_url || '';
        break;
      case '画像URL(切り抜き後)':
        validatedData[header] = data.cropped_image_url || '';
        break;
      case 'メモ':
        validatedData[header] = data.memo || '';
        break;
      default:
        validatedData[header] = data[header] || '';
    }
  });

  return validatedData;
};

// スプレッドシートへのデータ追加関数
const appendToSpreadsheet = async (data: any) => {
  try {
    const auth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();

    // シートのフォーマット設定
    await sheet.resize({ rowCount: 1000, columnCount: 26 });

    // 日本時間の日付を取得
    const now = new Date();
    const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const formattedDate = japanTime.toISOString().replace('T', ' ').replace('.000Z', '');

    // データをスプレッドシートに追加
    const rowData = {
      '注文ID': data.orderId,
      '注文日時': formattedDate,
      '顧客名': '',
      'メールアドレス': '',
      '電話番号': '',
      '香り': data.product_name,
      'ボトル': data.bottle_type,
      'ラベルサイズ': data.label_size,
      'ラベルタイプ': data.label_type,
      '金額': data.total_amount,
      '支払い状態': data.payment_status,
      '注文状態': data.order_status,
      '画像URL': data.original_image_url,
      '画像URL(切り抜き後)': data.cropped_image_url
    };

    // データを追加
    await sheet.addRow(rowData, { raw: false });

    return { success: true };
  } catch (error) {
    throw new SpreadsheetError(
      'Failed to append data to spreadsheet',
      'SPREADSHEET_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// リトライ関数
const retryOperation = async (operation: () => Promise<any>, maxRetries: number = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('リクエストデータ:', JSON.stringify(data, null, 2));

    // データのバリデーション
    const { isValid, errors } = validateData(data);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    // リトライ付きでスプレッドシートに追加
    const result = await retryOperation(() => appendToSpreadsheet(data));
    console.log('スプレッドシートへの書き込み結果:', result);

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    
    if (error instanceof SpreadsheetError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    return NextResponse.json(
      { error: 'Failed to append data to spreadsheet' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
} 