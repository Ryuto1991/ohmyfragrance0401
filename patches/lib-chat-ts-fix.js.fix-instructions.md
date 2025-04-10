# lib-chat-ts-fix.js の修正手順

現在のファイル `patches/lib-chat-ts-fix.js` に TypeScript エラーが多数出ています。これはファイル拡張子が `.js` であるのに TypeScript 構文が含まれているためです。

## 修正手順

1. ファイル名の修正
```bash
# .js ファイルを削除
rm patches/lib-chat-ts-fix.js

# すでに作成済みの .ts ファイルを使用
# patches/lib-chat-ts-fix.ts が存在することを確認
ls -la patches/lib-chat-ts-fix.ts
```

2. 適用方法の修正
`fragrance-chat-implementation-status.md` に記載されている通り、`.ts` ファイルを直接 `lib/chat.ts` にコピーして使用してください：

```bash
# 修正ファイルの内容をコピー
cp patches/lib-chat-ts-fix.ts lib/chat.ts
```

## 注意事項

- パッチファイルは完全な TypeScript ファイルなので、そのままコピーして使用できます
- 元のファイルはバックアップを取ってから上書きしてください
