# パフォーマンス最適化とレンダリング改善

フレグランスチャットコンポーネントのパフォーマンス向上と不要な再レンダリングを削減するための最適化策をまとめました。

## 現状の課題

現在のコンポーネント実装には以下のような潜在的なパフォーマンス問題があります：

1. 大量のメッセージが蓄積した際のレンダリング負荷
2. チャットステート更新時の不要なコンポーネント再レンダリング
3. 複雑な状態計算が再レンダリングの度に実行される
4. ローカルストレージ操作による潜在的なパフォーマンスボトルネック

## 最適化戦略

### 1. メモ化によるコンポーネントの最適化

#### React.memo の活用

子コンポーネントを `React.memo` でラップして、props に変更がない場合は再レンダリングをスキップします。

```tsx
// 最適化前
function ChatMessage({ message, ...props }) {
  return <div>{message.content}</div>;
}

// 最適化後
const ChatMessage = React.memo(({ message, ...props }) => {
  return <div>{message.content}</div>;
});
```

実装例：

```tsx
// components/chat/components/ChatMessage.tsx
import React from 'react';
import { Message } from '@/app/fragrance-lab/chat/types';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export const ChatMessage = React.memo(({ message, isLatest }: ChatMessageProps) => {
  // メッセージの表示ロジック
  return (
    <div className={`chat-message ${message.role}`}>
      {message.content}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage'; // デバッグ用に名前を設定
```

#### 選択肢ボタンの最適化

選択肢ボタンコンポーネントも同様に最適化できます：

```tsx
// components/chat/components/ChoiceButton.tsx
import React from 'react';
import { ChoiceOption } from '@/app/fragrance-lab/chat/types';

interface ChoiceButtonProps {
  choice: ChoiceOption;
  onClick: (choice: ChoiceOption) => void;
  disabled?: boolean;
}

export const ChoiceButton = React.memo(({ choice, onClick, disabled }: ChoiceButtonProps) => {
  const handleClick = React.useCallback(() => {
    onClick(choice);
  }, [choice, onClick]);

  return (
    <button
      className="choice-button"
      onClick={handleClick}
      disabled={disabled}
    >
      {choice.name}
    </button>
  );
});

ChoiceButton.displayName = 'ChoiceButton';
```

### 2. useCallback と useMemo の活用

関数とオブジェクトの不要な再生成を防ぐために `useCallback` と `useMemo` を使用します。

#### イベントハンドラーの最適化

```tsx
// 最適化前
function ChatComponent() {
  const handleClick = () => {
    // 処理
  };
  
  return <button onClick={handleClick}>クリック</button>;
}

// 最適化後
function ChatComponent() {
  const handleClick = useCallback(() => {
    // 処理
  }, [/* 依存配列 */]);
  
  return <button onClick={handleClick}>クリック</button>;
}
```

#### 派生データの最適化

```tsx
// 最適化前
function ChatComponent({ messages }) {
  const latestMessage = messages[messages.length - 1];
  
  return <div>{latestMessage.content}</div>;
}

// 最適化後
function ChatComponent({ messages }) {
  const latestMessage = useMemo(() => 
    messages[messages.length - 1], 
    [messages]
  );
  
  return <div>{latestMessage.content}</div>;
}
```

### 3. レンダリングの分割とレイジーローディング

#### コンポーネントの分割

大きなコンポーネントを小さく分割し、関心の分離を図ります：

```tsx
// 最適化前
function ChatContainer() {
  // 多くの状態と処理を含む大きなコンポーネント
  return (
    <div>
      <ChatHeader />
      <MessageList />
      <InputForm />
    </div>
  );
}

// 最適化後
function ChatContainer() {
  return (
    <div>
      <ChatHeader />
      <MessageList />
      <InputForm />
    </div>
  );
}

// 個々のコンポーネントは自身の関心事のみに集中
function MessageList() {
  // ...
}
```

#### 動的インポートの活用

重いコンポーネントは必要になったときにのみロードします：

```tsx
// components/chat/lazy-components.tsx
import dynamic from 'next/dynamic';

export const LazyRecipeVisualization = dynamic(
  () => import('./components/RecipeVisualization'),
  { 
    loading: () => <div>Loading...</div>,
    ssr: false 
  }
);
```

### 4. 状態管理の最適化

#### 状態の分割

大きな状態を小さな独立した部分に分割し、関連するコンポーネントのみが再レンダリングされるようにします：

```tsx
// 最適化前
function useChatState() {
  const [state, setState] = useState({
    messages: [],
    inputValue: '',
    isLoading: false,
    selectedScents: { top: [], middle: [], base: [] }
  });
  
  // すべての状態更新が全体の再レンダリングを引き起こす
}

// 最適化後
function useChatState() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScents, setSelectedScents] = useState({ top: [], middle: [], base: [] });
  
  // 個別の状態更新は関連コンポーネントのみ再レンダリング
}
```

#### コンテキストの適切な分割

```tsx
// 最適化前
const ChatContext = createContext();

function ChatProvider({ children }) {
  const [state, setState] = useState(/* 大きな状態オブジェクト */);
  
  return (
    <ChatContext.Provider value={{ state, setState }}>
      {children}
    </ChatContext.Provider>
  );
}

// 最適化後
const MessagesContext = createContext();
const InputContext = createContext();
const RecipeContext = createContext();

function ChatProvider({ children }) {
  // 状態を分割
  const messagesState = useMessagesState();
  const inputState = useInputState();
  const recipeState = useRecipeState();
  
  return (
    <MessagesContext.Provider value={messagesState}>
      <InputContext.Provider value={inputState}>
        <RecipeContext.Provider value={recipeState}>
          {children}
        </RecipeContext.Provider>
      </InputContext.Provider>
    </MessagesContext.Provider>
  );
}
```

### 5. 仮想化リストの活用

メッセージ数が多くなった場合に、画面に表示されているメッセージのみをレンダリングします：

```tsx
import { FixedSizeList as List } from 'react-window';

function MessageList({ messages }) {
  const renderRow = ({ index, style }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  );

  return (
    <List
      height={500}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {renderRow}
    </List>
  );
}
```

### 6. ローカルストレージ操作の最適化

ストレージ操作はパフォーマンスに影響するため、適切に最適化します：

```tsx
// 最適化前
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// 最適化後
function saveToLocalStorage(key, value) {
  // デバウンスして頻繁な更新を防止
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, 300);
}
```

## 実装推奨事項

1. **ChatMessage コンポーネントの最適化**：メッセージリストの各アイテムを React.memo でラップ
2. **選択肢ボタンの最適化**：ChoiceButton コンポーネントの React.memo 化と useCallback の活用
3. **メッセージリストの仮想化**：react-window または react-virtualized の導入検討
4. **状態の分割**：大きな状態オブジェクトを複数の小さな状態に分割
5. **コンテキストの分割**：異なる関心事ごとにコンテキストを分割
6. **useCallback と useMemo の活用**：計算コストの高い処理や再作成を避けたい関数・オブジェクトに適用
7. **ストレージ操作のデバウンス**：頻繁なストレージ更新を防止

これらの最適化を適用することで、特に長い会話や多くの選択肢がある場合のパフォーマンスが向上し、ユーザー体験が改善されます。
