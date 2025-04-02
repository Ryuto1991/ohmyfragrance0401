import { z } from 'zod'

// 共通のバリデーションスキーマ
export const emailSchema = z
  .string()
  .email('有効なメールアドレスを入力してください')
  .min(1, 'メールアドレスは必須です')

export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'パスワードは大文字、小文字、数字、特殊文字を含める必要があります'
  )

export const nameSchema = z
  .string()
  .min(1, '名前は必須です')
  .max(50, '名前は50文字以内で入力してください')
  .regex(/^[a-zA-Z0-9\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/, '無効な文字が含まれています')

export const phoneSchema = z
  .string()
  .regex(/^[0-9-+()]+$/, '有効な電話番号を入力してください')
  .min(10, '電話番号は10桁以上で入力してください')

export const addressSchema = z
  .string()
  .min(1, '住所は必須です')
  .max(200, '住所は200文字以内で入力してください')

// 入力値のサニタイズ
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // XSS対策
    .replace(/\s+/g, ' ') // 連続する空白を1つに
}

// エラーメッセージのフォーマット
export function formatValidationError(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const field = err.path.join('.')
    return `${field}: ${err.message}`
  })
}

// バリデーション結果の型
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: string[]
}

// バリデーション実行関数
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatValidationError(error),
      }
    }
    return {
      success: false,
      errors: ['予期せぬエラーが発生しました'],
    }
  }
} 