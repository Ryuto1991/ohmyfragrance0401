# useChatState-fix.ts の修正手順

`patches/useChatState-fix.ts` ファイルには多数のエラーが表示されていますが、これは単独のファイルとして実行することを意図したものではなく、既存の `useChatState.ts` ファイルの特定の関数を置き換えるためのコードスニペットだからです。

## 修正アプローチ

このファイルは **そのままコピー＆ペースト** するのではなく、以下のように修正して使用してください：

1. 既存の `app/fragrance-lab/chat/hooks/useChatState.ts` ファイルを開く
2. 既存の `handleAutoCreateRecipe` 関数と `updatePhase` 関数を探す
3. 各関数を、パッチファイルの対応する関数で置き換える
4. 置き換える際は、関数の内容だけを置き換え、関数の宣言部分（`const handleAutoCreateRecipe = useCallback...`）と依存配列（`[isLoading, currentPhase, ...]`）は既存のファイルのものを維持する

## パッチ内容の統合方法

### handleAutoCreateRecipe 関数の置き換え

既存の `handleAutoCreateRecipe` 関数を探して、以下のように変更します：

```typescript
// 既存の宣言部分はそのまま残す
const handleAutoCreateRecipe = useCallback(async () => {
  // ここから下の実装を新しいコードに置き換え
  if (isLoading) return;

  try {
    setIsLoading(true);
    console.log('おまかせレシピ作成を開始します');

    // 現在のフェーズを保存
    const originalPhase = currentPhase;
    console.log('元のフェーズ:', originalPhase);

    // おまかせモードフラグの設定
    const isAutoMode = true;

    // (パッチファイルの内容に置き換え...)
    
  } finally {
    setIsLoading(false);
  }
  // 既存の依存配列はそのまま残す
}, [isLoading, currentPhase, setMessages, ...]);
```

### updatePhase 関数の置き換え

既存の `updatePhase` 関数を探して、同様に実装部分を置き換えます：

```typescript
// 既存の宣言部分はそのまま残す
const updatePhase = useCallback((newPhase: ChatPhase, isAutoMode: boolean = false) => {
  // ここから下の実装を新しいコードに置き換え
  // おまかせモードの場合、遷移バリデーションをスキップ
  if (isAutoMode) {
    console.log(`自動モードによるフェーズ更新: ${currentPhase} -> ${newPhase}`);
    setCurrentPhase(newPhase);
    setLastPhaseChangeTime(Date.now());
    
    // (パッチファイルの内容に置き換え...)
  }
  // 既存の依存配列はそのまま残す
}, [currentPhase, onPhaseAdvance, ...]);
```

## 追加で必要な修正

1. **importの追加**：
   必要であれば、以下のimport文が存在するか確認し、なければ追加してください：

   ```typescript
   import { v4 as uuid } from 'uuid';
   ```

2. **バリデーション関数の追加**：
   `app/fragrance-lab/chat/utils.ts` ファイルの最後に、以下の関数を追加します：

   ```typescript
   export const canTransitionWithAutoMode = (from: ChatPhase, to: ChatPhase, isAutoMode: boolean): boolean => {
     // 自動モードの場合は特定の遷移を許可
     if (isAutoMode) {
       return true;
     }
     
     // 通常の遷移ルールを適用
     return PHASE_TRANSITIONS[from]?.includes(to) ?? false;
   };
   ```

## 注意事項

- エラー表示はパッチファイルを単独で見ているために発生しているため、既存のファイルに統合すれば解決します
- 変更前にファイルのバックアップを取ってください
- 置き換え後、コードが既存の変数や関数を正しく参照しているか確認してください
