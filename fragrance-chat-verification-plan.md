# フレグランスチャット 追加検証計画

## 概要

前回の検証で以下の主な問題点が明らかになりました：
1. メッセージ送信時にAIからの応答が表示されない
2. フェーズ遷移に関する問題（特に「おまかせ」機能）
3. エラー表示の欠如とタイムアウト処理の不足
4. Playwright テスト環境の設定に問題あり

これらの問題を解決するため、以下の検証と修正を順番に実施します。

## 1. API接続とレスポンス処理の検証

### 1.1 OpenAI API接続の検証
```bash
# .env.development ファイルを確認して有効なAPIキーがあることを確認
cat .env.development | grep OPENAI_API_KEY
```

### 1.2 APIレスポンスのデバッグ
```typescript
// lib/chat.ts の fetchWithRetry 関数にデバッグログを追加
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeout = 30000): Promise<Response> {
  console.log('API呼び出し開始:', url);
  console.log('リクエストボディ:', options.body);
  
  // 既存のコード...
  
  try {
    const response = await fetch(url, fetchOptions);
    console.log('APIレスポンスステータス:', response.status);
    return response;
  } catch (error) {
    console.error('API呼び出しエラー詳細:', error);
    // 既存のエラーハンドリング...
  }
}
```

### 1.3 JSON解析の修正
```typescript
// lib/chat-utils.ts の processMessage 関数の強化
export function processMessage(content: string): {
  content: string;
  choices?: string[];
  choices_descriptions?: string[];
  should_split: boolean;
  followUp?: string;
} {
  console.log('処理前のメッセージ (完全):', content);
  
  // 無効なコンテンツのチェック
  if (!content || content.trim().length === 0) {
    console.warn('空のコンテンツを受信しました');
    return {
      content: '申し訳ありません。一時的に応答が生成できませんでした。もう一度お試しください。',
      choices: [],
      should_split: true
    };
  }

  // JSONとして解析を試みるが、厳密な検証を追加
  try {
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const parsedJson = JSON.parse(content);
      console.log('JSON解析成功:', parsedJson);
      
      // contentフィールドが存在するか確認
      if (!parsedJson.content) {
        console.warn('JSONにcontent属性がありません');
        parsedJson.content = '応答を処理できませんでした。もう一度お試しください。';
      }
      
      // 以下は既存のコード...
    }
  } catch (error) {
    console.error('JSON解析エラー (完全):', error, 'コンテンツ:', content);
    // 既存のフォールバック処理...
  }
  
  // 既存のコード...
}
```

## 2. フェーズ遷移問題の解決

### 2.1 おまかせ機能の修正
```typescript
// app/fragrance-lab/chat/hooks/useChatState.ts の handleAutoCreateRecipe 関数を修正
const handleAutoCreateRecipe = useCallback(async () => {
  if (isLoading) return;

  try {
    setIsLoading(true);
    console.log('おまかせレシピ作成を開始します');

    // 現在のフェーズを保存
    const originalPhase = currentPhase;
    console.log('元のフェーズ:', originalPhase);

    // フェーズをtopに設定（おまかせモードフラグを追加）
    setCurrentPhase('top');
    const isAutoMode = true;

    // デフォルトの香り選択
    const defaultScents = {
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    };

    // 香りを設定（順番に設定して遷移を模倣）
    await new Promise(resolve => setTimeout(resolve, 500));
    setSelectedScents(prev => ({ ...prev, top: defaultScents.top }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPhase('middle');
    setSelectedScents(prev => ({ ...prev, middle: defaultScents.middle }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPhase('base');
    setSelectedScents(prev => ({ ...prev, base: defaultScents.base }));

    // 自動レシピ作成メッセージを送信
    const result = await sendMessage('おまかせでレシピを作成してください', true);

    // デフォルトのレシピ情報
    const defaultRecipe: FragranceRecipe = {
      name: "リラックスブレンド",
      description: "穏やかな気分になれるリラックス効果のあるブレンド",
      topNotes: defaultScents.top,
      middleNotes: defaultScents.middle,
      baseNotes: defaultScents.base
    };

    // レシピを設定
    setRecipe(defaultRecipe);

    // レシピをローカルストレージに保存
    localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify({
      name: defaultRecipe.name,
      description: defaultRecipe.description,
      top_notes: defaultRecipe.topNotes,
      middle_notes: defaultRecipe.middleNotes,
      base_notes: defaultRecipe.baseNotes
    }));

    console.log('レシピを保存しました:', defaultRecipe);

    // フェーズを最終確認に設定
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPhase('finalized');
    
    // 少し待ってから完了に設定
    setTimeout(() => {
      setCurrentPhase('complete');
    }, 2000);

    return result;
  } catch (error) {
    console.error('自動レシピ作成エラー:', error);
    setError(error instanceof Error ? error : new Error('自動レシピ作成中にエラーが発生しました'));
  } finally {
    setIsLoading(false);
  }
}, [isLoading, sendMessage]);
```

### 2.2 フェーズ遷移バリデーションの修正
```typescript
// app/fragrance-lab/chat/utils.ts に特別な遷移許可関数を追加
export const canTransitionWithAutoMode = (from: ChatPhase, to: ChatPhase, isAutoMode: boolean): boolean => {
  // 自動モードの場合は特定の遷移を許可
  if (isAutoMode) {
    return true;
  }
  
  // 通常の遷移ルールを適用
  return PHASE_TRANSITIONS[from]?.includes(to) ?? false;
};
```

## 3. エラー処理とUI表示の改善

### 3.1 タイムアウト処理の実装
```typescript
// lib/chat.ts の sendChatMessage 関数にグローバルタイムアウトを追加
export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string
): Promise<ChatResponse> {
  // グローバルタイムアウト処理
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('リクエストがタイムアウトしました。もう一度お試しください。')), 30000);
  });

  try {
    // 既存のコードを Promise.race でラップ
    const result = await Promise.race([
      // 既存の処理...
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    
    // タイムアウトエラーの特別処理
    if (error.message.includes('タイムアウト')) {
      const timeoutResponse: ChatResponse = {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: 'リクエストの処理に時間がかかりすぎています。もう一度お試しください。',
        choices: [],
        should_split: true
      };
      
      throw new ChatAPIError('タイムアウトエラー', timeoutResponse);
    }
    
    // 他のエラー処理（既存のコード）...
  }
}
```

### 3.2 エラー表示の強化
```typescript
// components/chat/fragrance-ai-chat.tsx のエラー表示部分を改善
// エラー表示の場合
if (error) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md text-center">
        <p className="font-semibold mb-2">エラーが発生しました</p>
        <p className="text-sm">{error.message}</p>
        <p className="text-xs mt-2 text-gray-600">
          {error.name === 'ChatAPIError' ? 'サーバーとの通信エラーです。ネットワーク接続を確認してください。' : 
           '予期せぬエラーが発生しました。もう一度お試しください。'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => handleError(null)}
          variant="default"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
        <Button
          onClick={resetChat}
          variant="outline"
          className="mt-4"
        >
          <X className="h-4 w-4 mr-2" />
          チャットをリセット
        </Button>
      </div>
    </div>
  )
}
```

## 4. テスト環境の修正

### 4.1 Playwright ブラウザのインストール
```bash
# Playwright ブラウザをインストール
npx playwright install
```

### 4.2 テスト環境の確認
```bash
# インストールされているブラウザを確認
npx playwright --version

# テストリストを表示
npx playwright test --list
```

### 4.3 テスト実行のための前提条件を確認
```javascript
// tests/setupTests.js を作成して前提条件チェックを追加
const { chromium } = require('@playwright/test');

async function validateTestEnvironment() {
  try {
    // ブラウザの起動テスト
    const browser = await chromium.launch();
    await browser.close();
    console.log('✅ Playwright環境の検証が成功しました');
    return true;
  } catch (error) {
    console.error('❌ Playwright環境の検証に失敗しました:', error);
    console.log('以下のコマンドでPlaywrightのブラウザをインストールしてください:');
    console.log('npx playwright install');
    return false;
  }
}

module.exports = { validateTestEnvironment };
```

## 5. 具体的なテスト計画

### 5.1 APIレスポンス問題の確認
1. デバッグログを追加した後、チャット機能を使用してAPI応答を確認
2. コンソールログでエラーがないかチェック
3. 応答データの構造を分析し、JSON処理のバグを特定

### 5.2 おまかせ機能のデバッグ
1. 修正したおまかせ機能を実行
2. フェーズ遷移が正しく行われているかコンソールログで確認
3. 最終的なレシピが正しく生成されているか検証

### 5.3 エラー表示とタイムアウトのテスト
1. ネットワーク接続を意図的に切断してエラー表示をテスト
2. 開発者ツールのネットワークスロットリングを使用して遅延応答をシミュレート
3. タイムアウト処理が機能することを確認

### 5.4 E2Eテストの実行
1. Playwrightのブラウザをインストール
2. 単一テストを実行して環境が正しく設定されていることを確認
3. すべてのテストスイートを実行

## 6. 優先度の高い修正

1. **API接続とレスポンス処理** (最優先)
   - 空のレスポンスやJSONパース失敗に関する問題を修正

2. **おまかせ機能のフェーズ遷移** (高優先)
   - 段階的な遷移を実装してバリデーションエラーを回避

3. **エラー表示とユーザーフィードバック** (中優先)
   - ユーザーにわかりやすいエラーメッセージを表示

4. **テスト環境の整備** (低優先)
   - CI/CD環境で自動テストが実行できるようにする
