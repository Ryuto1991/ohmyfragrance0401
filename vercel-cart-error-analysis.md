# Vercelカートエラー分析レポート

**日付**: 2025年4月16日

## 発生している問題

Vercel上で以下のエラーが発生しています:

1. **複数のSupabaseクライアントインスタンス検出**: 
   ```
   Multiple GoTrueClient instances detected in the same browser context.
   ```

2. **Supabase APIへの401認証エラー**:
   ```
   POST https://igpsidgueemtziedebcs.supabase.co/rest/v1/recipes?... 401 (Unauthorized)
   ```

3. **カートページへのアクセスエラー**:
   ```
   GET https://ohmyfragrance.com/cart?_rsc=56xh8 404 (Not Found)
   ```

## 調査結果

### 1. 複数のSupabaseクライアントインスタンス

コードベース内の複数の場所でSupabaseクライアントが初期化されています:

- `lib/supabase.ts` - メインのSupabaseクライアント定義
- `app/lib/supabase.ts` - App Router内での別クライアント
- `app/lib/supabase-client.ts` - 3つ目のクライアント実装
- `app/custom-order/utils/supabase-client.ts` - カスタムオーダー機能用
- `app/custom-order/utils/stripe.ts` - 決済処理内でのクライアント初期化
- `app/custom-order/utils/image-processing.ts` - 同一ファイル内で複数回クライアント初期化
- 複数のページコンポーネント内での`createClientComponentClient`の使用

これにより、ブラウザ内で複数の認証インスタンス（GoTrueClient）が作成され、不整合が発生しています。

### 2. Supabase認証エラー（対応済み）

recipesテーブルへのアクセス権限の問題は既に解決済みです。

### 3. カートページに関する誤解

プロジェクト構造を分析した結果、このアプリケーションではカートページではなく、ドロワー形式のカートUI（`components/stripe-cart-drawer.tsx`）を使用していることが確認されました。したがって、`/cart`エンドポイントへの404エラーは実際の問題ではない可能性があります。

## 推奨される解決策

### Supabaseクライアントの一元化

Supabaseクライアント初期化を一元管理するために、以下の対応が必要です:

1. シングルトンパターンによるクライアント管理の実装
2. 各ファイル内の独立したクライアント初期化を共通実装に置き換え

### 具体的な実装手順

1. `lib/supabase.ts`を以下のようにシングルトンパターンで実装:
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

   // グローバル変数としてインスタンスを保持
   let supabaseInstance = null

   // シングルトンパターンを使用して一度だけクライアントを初期化
   export function getSupabase() {
     if (!supabaseInstance) {
       supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
         auth: {
           autoRefreshToken: true,
           persistSession: true,
           detectSessionInUrl: true,
         },
       })
     }
     return supabaseInstance
   }

   // 直接エクスポートするクライアントインスタンス
   export const supabase = getSupabase()
   ```

2. 他のファイルでのSupabaseクライアント初期化を削除し、共通の`getSupabase`関数を使用するよう修正

3. 特に`app/custom-order/utils/image-processing.ts`内での複数回の初期化を解消

## 補足情報

- カート機能はすでに実装済みで、ドロワー形式のUIを使用
- StripeとSupabaseの連携は既に適切に構成されている
- 環境変数設定はローカル環境では正常に動作
- 今回の問題はVercel上での本番環境特有の問題