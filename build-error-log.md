# ビルドエラー調査ログ (2025-04-16)

## 発生した問題

`npm run build` を実行すると、複数のページ (特に `/404`, `/order/success`, `/auth/callback`, `/oh-my-custom`, `/label-size-guide`) で以下の種類のエラーが発生し、ビルドが失敗する。

1.  `TypeError: Cannot read properties of null (reading 'useContext')` (主に `/404`)
2.  `Error: Event handlers cannot be passed to Client Component props.` (多くのページ)
3.  `Static page generation for /_not-found is still timing out after 3 attempts.` (Next.js 14.x で発生)

## 試したことと結果

1.  **メール送信機能の追加:**
    *   `app/api/webhook/route.ts` に `sendOrderConfirmationEmail` の呼び出しを追加。
    *   `lib/email.ts` のメールテンプレートを更新。
    *   `.env.development` に `RESEND_API_KEY` を追加。
    *   `.gitignore` に `.env.development` を追加。
    *   **結果:** ローカルでのメール送信テストはAPIキー設定後、ドメイン未認証エラーまで進んだ。しかし、この変更後にビルドエラーが発生し始めた可能性が高い。
2.  **キャッシュクリアと依存関係再インストール:**
    *   `.next` ディレクトリ削除、`node_modules` と `pnpm-lock.yaml` 削除後、`pnpm install` を実行。
    *   **結果:** ビルドエラーは解消されなかった。
3.  **`app/client-layout.tsx` のデバッグ:**
    *   `Analytics`, `SpeedInsights` をコメントアウト → 効果なし。
    *   `ThemeProvider` をコメントアウト → 効果なし。
    *   `AuthProvider` をコメントアウト → 効果なし。
    *   `StripeCartProvider` をコメントアウト → 効果なし。
    *   `CartDrawerProvider` をコメントアウト → 効果なし。
4.  **`app/not-found.tsx` のデバッグ:**
    *   `export const dynamic = 'force-dynamic'` を追加 → 効果なし。
    *   ファイルをリネームして無効化 → 効果なし。
    *   内容を最小限に書き換え → 効果なし。
5.  **`"use client"` ディレクティブの追加:**
    *   `app/order/success/page.tsx` に追加 → `/order/success` のエラーは解消されたが、他のページで同様のエラーが発生。
    *   `app/auth/callback/page.tsx` は元々 `"use client"` だった。
6.  **UIライブラリの更新:**
    *   `pnpm update` を実行。
    *   **結果:** ビルドエラーは解消されなかった。
7.  **Next.jsのダウングレード:**
    *   `package.json` で `next` を `15.3.0` から `14.2.5` に変更し、`pnpm install` を実行。
    *   **結果:** ビルドエラーは解消されず、タイムアウトエラーも発生した。

## 次のアクション

*   メール送信関連の変更 (`app/api/webhook/route.ts`, `lib/email.ts`, `.gitignore`) のみをコミットする。
*   それ以外の変更（Next.jsダウングレード、`app/order/success/page.tsx` の `"use client"` 追加、その他ステージされたファイル）を `git restore` や `git checkout` で破棄し、ビルドが成功していた可能性のある状態に戻す。
*   再度ビルドを試す。
