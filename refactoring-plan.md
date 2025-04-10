
# Oh My Fragrance チャットシステム リファクタリング計画

## 現状の問題点

### 1. アーキテクチャと構造の問題
- **コンポーネント構造の分散**: `components/fragrance-chat.tsx` と `components/chat/fragrance-ai-chat.tsx` に類似機能が分散
- **ディレクトリ構造の不整合**: `app/fragrance-lab/chat` と `components/chat` に関連コードが分散
- **責任分担の不明確さ**: 機能の重複が多く、各コンポーネントの役割が曖昧

### 2. 状態管理の複雑さ
- **`useChatState` フックの肥大化**: 多数の状態と関数を単一のフックで管理
- **ステート境界の曖昧さ**: ローカルステートとグローバルステートの使い分けが不明確
- **状態更新ロジックの分散**: 複数の場所で同じ状態を更新している

### 3. 機能的な問題
- **クエリ処理の重複**: URL クエリパラメータが複数箇所で処理され、同じクエリが連続送信
- **クエリパラメータの不統一**: `query` と `q` の両方が使用されている
- **フェーズ管理の複雑さ**: チャットフェーズの遷移ロジックが複雑で予測しづらい

### 4. データ永続化の問題
- **localStorage の非一貫的な使用**: 複数の異なるキーで類似データを保存
- **セッション管理とデータ保存の混在**: 永続化ロジックが複数の場所に散在

### 5. 技術的な問題
- **TypeScript の型定義の不整合**: `ChoiceOption` と `string` の型不一致など
- **エラーハンドリングの不統一**: 一貫したエラー処理方法がない
- **非同期処理の複雑性**: 追跡しづらい非同期処理チェーン

### 6. コード品質の問題
- **冗長なコード**: 未使用のインポートや重複ロジック
- **コメント不足**: 複雑なロジックに対する説明が不足
- **テストの欠如**: 自動テストの不在

## リファクタリング計画

### フェーズ 1: アーキテクチャの再構築

#### 1.1 コンポーネント構造の整理
- `components/fragrance-chat.tsx` を削除し、機能を `components/chat/fragrance-ai-chat.tsx` に統合
- コンポーネントを機能別に分割（メッセージ表示、入力部分、選択肢表示など）
- ディレクトリ構造を整理し、関連ファイルをグループ化

```
components/chat/
  ├── FragranceChat.tsx       # メインのチャットコンポーネント
  ├── components/             # 個別のUI要素
  │   ├── MessageList.tsx     # メッセージ一覧表示
  │   ├── MessageInput.tsx    # メッセージ入力フォーム
  │   ├── ChoiceSelector.tsx  # 選択肢コンポーネント
  │   └── ChatProgressSteps.tsx # 進行状況表示
  ├── hooks/                  # カスタムフック
  │   ├── useChatState.ts     # 状態管理（リファクタリング）
  │   ├── useChatMessages.ts  # メッセージ関連の状態と処理
  │   ├── useChatPhases.ts    # フェーズ管理
  │   └── useRecipeState.ts   # レシピデータの管理
  └── utils/                  # ユーティリティ関数
      ├── message-parser.ts   # メッセージ解析
      ├── phase-utils.ts      # フェーズ遷移ロジック
      └── storage-utils.ts    # ストレージ操作
```

#### 1.2 API エンドポイントの統合
- `app/api/chat/route.ts` と `app/api/chat-query/route.ts` の機能を整理
- 共通ロジックを抽出し、一貫性のある API インターフェースを提供

### フェーズ 2: 状態管理のリファクタリング

#### 2.1 状態管理の分割
- `useChatState` を複数の特化したフックに分割:
  - `useChatCore`: 基本的なチャット状態（メッセージ、ローディング状態など）
  - `useChatPhases`: フェーズ管理と遷移ロジック
  - `useScentsSelection`: 香り選択関連の状態
  - `useRecipeManagement`: レシピ関連の状態と処理

#### 2.2 コンテキスト API の活用
- チャット全体の状態を管理する Context Provider を実装
- 複数のコンポーネント間で状態共有が必要な場合に使用

```tsx
// chat-context.tsx
export const ChatProvider: React.FC = ({ children }) => {
  // コアとなる状態管理
  const chatState = useChatCore();
  // フェーズ管理
  const phaseState = useChatPhases(chatState);
  // 香り選択の状態管理
  const scentsState = useScentsSelection(phaseState.currentPhase);
  // レシピ管理
  const recipeState = useRecipeManagement(scentsState.selectedScents);

  // すべての状態をコンテキストで提供
  const value = {
    ...chatState,
    ...phaseState,
    ...scentsState,
    ...recipeState
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
```

### フェーズ 3: 機能的な問題の解決

#### 3.1 クエリ処理の統合
- URL クエリパラメータの処理を一箇所に集約
- 命名規則の統一（`query` に標準化）
- クエリ処理の重複を防ぐためのキャッシュメカニズム実装

```ts
// query-processor.ts
export const processQueryParams = (router, searchParams) => {
  // クエリパラメータの処理を一箇所に集約
  const query = searchParams.get('query') || searchParams.get('q');
  
  // 処理済みクエリの追跡
  const [processedQueries] = useState(() => new Set<string>());
  
  useEffect(() => {
    if (!query) return;
    
    // 重複処理を防止
    const queryId = `${query}-${Date.now()}`;
    if (processedQueries.has(queryId)) return;
    
    // クエリ処理ロジック
    processedQueries.add(queryId);
    
    // URLからクエリパラメータを削除
    router.replace(window.location.pathname, { scroll: false });
    
    // ...クエリ処理コード...
  }, [query, router, processedQueries]);
};
```

#### 3.2 フェーズ管理の簡素化
- フェーズ遷移ロジックを状態マシンパターンで再設計
- フェーズ間の依存関係を明確に定義
- 自動遷移と手動遷移を統一的に扱うインターフェース実装

```ts
// phase-state-machine.ts
export const createPhaseMachine = () => {
  // フェーズ定義
  const phases = {
    welcome: {
      next: ['intro'],
      auto: false
    },
    intro: {
      next: ['themeSelected'],
      auto: false
    },
    themeSelected: {
      next: ['top'],
      auto: false
    },
    top: {
      next: ['middle'],
      auto: true,
      condition: () => true // 条件付き自動遷移
    },
    middle: {
      next: ['base'],
      auto: true,
      condition: () => true
    },
    base: {
      next: ['finalized'],
      auto: true,
      condition: (state) => 
        state.selectedScents.top.length > 0 &&
        state.selectedScents.middle.length > 0 &&
        state.selectedScents.base.length > 0
    },
    finalized: {
      next: ['complete'],
      auto: true,
      condition: () => true
    },
    complete: {
      next: [],
      auto: false
    }
  };

  // フェーズ遷移関数
  const canTransition = (from, to) => {
    return phases[from].next.includes(to);
  };

  const getNextPhase = (current) => {
    return phases[current].next[0] || null;
  };

  const shouldAutoTransition = (current, state) => {
    const phase = phases[current];
    return phase.auto && phase.condition(state);
  };

  return {
    canTransition,
    getNextPhase,
    shouldAutoTransition
  };
};
```

### フェーズ 4: データ永続化の改善

#### 4.1 ストレージ管理の統一
- ローカルストレージの使用を統一化
- 永続化ロジックを専用のヘルパーに集約

```ts
// storage-service.ts
export const StorageKeys = {
  CHAT_HISTORY: 'chat_history',
  SELECTED_RECIPE: 'selected_recipe',
  USER_PREFERENCES: 'user_preferences',
  SESSION_DATA: 'session_data'
} as const;

export const StorageService = {
  // チャット履歴の保存
  saveChatHistory(messages) {
    try {
      localStorage.setItem(StorageKeys.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  },

  // チャット履歴の取得
  getChatHistory() {
    try {
      const data = localStorage.getItem(StorageKeys.CHAT_HISTORY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return null;
    }
  },

  // レシピの保存
  saveRecipe(recipe) {
    try {
      localStorage.setItem(StorageKeys.SELECTED_RECIPE, JSON.stringify(recipe));
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  },

  // レシピの取得
  getRecipe() {
    try {
      const data = localStorage.getItem(StorageKeys.SELECTED_RECIPE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get recipe:', error);
      return null;
    }
  },

  // ストレージのクリア
  clearAll() {
    Object.values(StorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
```

#### 4.2 セッション管理の改善
- チャットセッションの状態管理を明確化
- セッションの永続化を一貫した方法で実装

### フェーズ 5: 技術的な問題の修正

#### 5.1 型定義の統一
- 重複する型定義の統合
- 厳密な型チェックの適用
- 一貫した命名規則の適用

```ts
// chat-types.ts
export type ChatPhase =
  | 'welcome'
  | 'intro'
  | 'themeSelected'
  | 'top'
  | 'middle'
  | 'base'
  | 'finalized'
  | 'complete';

// 選択肢の型を統一
export interface ChoiceOption {
  name: string;
  description?: string;
}

// 文字列も ChoiceOption に変換可能に
export type Choice = string | ChoiceOption;

// 変換ヘルパー
export const normalizeChoice = (choice: Choice): ChoiceOption => {
  if (typeof choice === 'string') {
    return { name: choice };
  }
  return choice;
};

// メッセージの型
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  choices?: ChoiceOption[];
  recipe?: FragranceRecipe;
}

// フレグランスレシピの型
export interface FragranceRecipe {
  name: string;
  description: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
}
```

#### 5.2 エラーハンドリングの統一
- エラー処理を集中管理する仕組みの実装
- 特定のエラータイプごとの処理方法を定義

```ts
// error-handler.ts
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

export class AppError extends Error {
  type: ErrorType;
  details?: any;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, details?: any) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'AppError';
  }
}

export const ErrorHandler = {
  handle(error: Error | AppError) {
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.NETWORK:
          // ネットワークエラー処理
          break;
        case ErrorType.API:
          // APIエラー処理
          break;
        // 他のケース
      }
    } else {
      // 未分類のエラー処理
      console.error('Unhandled error:', error);
    }

    // UIへのエラー通知
    return {
      message: error.message,
      type: error instanceof AppError ? error.type : ErrorType.UNKNOWN
    };
  }
};
```

#### 5.3 非同期処理の最適化
- 非同期処理のパターン統一
- レースコンディションの防止メカニズム実装
- キャンセル可能な非同期処理の導入

```ts
// async-utils.ts
export const createAsyncState = () => {
  const controller = new AbortController();
  let isActive = true;

  const execute = async (promise, onSuccess, onError) => {
    try {
      const result = await promise;
      if (isActive) {
        onSuccess(result);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // キャンセルされた場合は何もしない
      }
      
      if (isActive) {
        onError(error);
      }
    }
  };

  const cancel = () => {
    isActive = false;
    controller.abort();
  };

  return {
    signal: controller.signal,
    execute,
    cancel
  };
};
```

### フェーズ 6: コード品質の向上

#### 6.1 未使用コードの削除と重複の解消
- 未使用のインポートや変数を削除
- 重複するロジックを共通関数に抽出

#### 6.2 ドキュメンテーションの強化
- コードのドキュメント化とコメント追加
- 複雑なロジックや重要な部分に説明を追加

#### 6.3 テスト戦略の導入
- 主要コンポーネントと関数のユニットテスト
- インテグレーションテストでコンポーネント間の連携を検証
- E2Eテストで主要なユーザーフローをカバー

## 実装スケジュール

### 第1週: 計画と準備
- 詳細な変更計画の策定
- 既存コードの完全な評価
- リファクタリングの優先順位付け

### 第2週: アーキテクチャ再構築
- コンポーネント構造の整理
- ディレクトリ構造の再編成
- API エンドポイントの統合

### 第3週: 状態管理と機能改善
- 状態管理のリファクタリング
- クエリ処理の統合
- フェーズ管理の最適化

### 第4週: データ層と技術的改善
- ストレージ管理の統一
- 型定義の統一
- エラーハンドリングの実装

### 第5週: テストとドキュメント
- ユニットテストの実装
- インテグレーションテストの追加
- コードドキュメントの充実

## メリット

このリファクタリングを実施することで以下のメリットが期待できます：

1. **メンテナンス性の向上**: 責任の分離と明確なアーキテクチャにより、将来の変更が容易になる
2. **バグの減少**: 重複コードの削減と一貫したエラー処理により、潜在的なバグが減少
3. **パフォーマンスの向上**: 最適化された状態管理と非同期処理により、アプリケーションの応答性が向上
4. **拡張性の向上**: モジュール化されたコードベースにより、新機能の追加が容易になる
5. **開発効率の向上**: 明確な構造とドキュメントにより、チーム間のコラボレーションが改善
