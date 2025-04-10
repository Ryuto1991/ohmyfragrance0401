import { renderHook, act } from '@testing-library/react';
import { useChatState } from '@/app/fragrance-lab/chat/hooks/useChatState';
import * as chatUtils from '@/lib/chat-utils';
import { v4 as uuid } from 'uuid';
import { ChatPhase, Message } from '@/app/fragrance-lab/chat/types';

// Mock dependencies
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Spy on localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    getAllKeys: jest.fn(() => Object.keys(store))
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock timers
jest.useFakeTimers();

// 準備関数
const generateMockMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'assistant' : 'user',
    content: `Test message ${i}`,
    timestamp: Date.now() - (count - i) * 1000
  }));
};

describe('useChatState Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.Mock) = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          content: 'Test response',
          followUp: null
        })
      })
    );
    (chatUtils.splitMessageIntoParts as jest.Mock) = jest.fn().mockImplementation((content) => [{
      content: typeof content === 'string' ? content : content.text || '',
      choices: typeof content !== 'string' ? content.choices : undefined,
      recipe: typeof content !== 'string' ? content.recipe : undefined,
      shouldSplit: false
    }]);
  });

  test('ネットワークタイムアウトが発生した場合のエラーハンドリング', async () => {
    // タイムアウトエラーをシミュレート
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 30000);
      })
    );
    
    // タイマーをモック
    jest.spyOn(global, 'setTimeout');
    
    const { result } = renderHook(() => useChatState());
    
    let sendPromise: Promise<void>;
    
    act(() => {
      sendPromise = result.current.sendMessage('タイムアウトメッセージ');
    });
    
    // タイムアウト時間を進める（実際のタイムアウト値より大きく）
    jest.advanceTimersByTime(35000);
    
    await act(async () => {
      await sendPromise;
    });
    
    // エラーが設定されていることを確認
    expect(result.current.error).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    
    // エラーメッセージがユーザーに表示されていることを確認
    const errorMessage = result.current.messages[result.current.messages.length - 1];
    expect(errorMessage.role).toBe('assistant');
    expect(errorMessage.content).toContain('エラー');
  });

  test('大量のメッセージがある場合のパフォーマンス', async () => {
    // 大量のメッセージを生成
    const largeMessageSet = generateMockMessages(100);
    
    // パフォーマンス計測開始
    const startTime = performance.now();
    
    const { result } = renderHook(() => useChatState({
      messages: largeMessageSet
    }));
    
    // パフォーマンス計測終了
    const endTime = performance.now();
    
    // 初期化時間をログ
    console.log(`大量メッセージの初期化時間: ${endTime - startTime}ms`);
    
    // 最低限のレンダリング時間の検証（環境によって異なるため緩い制約）
    expect(endTime - startTime).toBeLessThan(5000); // 5秒以内に初期化できること
    
    // メッセージが正しくロードされていることを確認
    expect(result.current.messages.length).toBe(100);
    
    // 追加のメッセージ送信のパフォーマンステスト
    const sendStartTime = performance.now();
    
    await act(async () => {
      await result.current.sendMessage('パフォーマンステストメッセージ');
    });
    
    const sendEndTime = performance.now();
    
    console.log(`大量メッセージ後の送信時間: ${sendEndTime - sendStartTime}ms`);
    
    // メッセージが追加されていることを確認
    expect(result.current.messages.length).toBe(102); // 元の100 + ユーザーメッセージ + システム応答
  });

  test('連続した複数のメッセージ送信のハンドリング', async () => {
    const { result } = renderHook(() => useChatState());
    
    // 連続したメッセージ送信をシミュレート
    await act(async () => {
      const promise1 = result.current.sendMessage('First message');
      const promise2 = result.current.sendMessage('Second message'); // 最初のリクエストが完了する前に送信
      
      // 両方のプロミスが解決するのを待つ
      await Promise.all([promise1, promise2]);
    });
    
    // 重複メッセージなく正しく処理されていることを確認
    const userMessages = result.current.messages.filter(m => m.role === 'user');
    expect(userMessages.length).toBe(2);
    expect(userMessages[0].content).toBe('First message');
    expect(userMessages[1].content).toBe('Second message');
    
    // 応答メッセージも正しく処理されていることを確認
    const assistantMessages = result.current.messages.filter(m => m.role === 'assistant');
    expect(assistantMessages.length).toBe(3); // 初期メッセージ + 2つの応答
  });

  test('ネットワークエラーからの回復', async () => {
    // 最初のリクエストでネットワークエラーをシミュレート
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const { result } = renderHook(() => useChatState());
    
    // エラーが発生するリクエスト
    await act(async () => {
      await result.current.sendMessage('Error message');
    });
    
    // エラー状態を確認
    expect(result.current.error).not.toBeNull();
    
    // エラーメッセージが表示されていることを確認
    expect(result.current.messages[result.current.messages.length - 1].content).toContain('エラー');
    
    // 次のリクエストは成功するようにモック
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          content: 'Recovery successful',
          followUp: null
        })
      })
    );
    
    // 回復するリクエスト
    await act(async () => {
      await result.current.sendMessage('Recovery message');
    });
    
    // エラー状態がクリアされていることを確認
    expect(result.current.error).toBeNull();
    
    // 成功メッセージが表示されていることを確認
    expect(result.current.messages[result.current.messages.length - 1].content).toBe('Recovery successful');
  });

  test('ローカルストレージが利用できない場合の対応', async () => {
    // ローカルストレージへのアクセスでエラーをスローするようにモック
    const originalGetItem = localStorageMock.getItem;
    const originalSetItem = localStorageMock.setItem;
    
    localStorageMock.getItem = jest.fn().mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    localStorageMock.setItem = jest.fn().mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // ローカルストレージエラーがあっても初期化できることを確認
    const { result } = renderHook(() => useChatState());
    
    // 通常の機能が引き続き動作することを確認
    await act(async () => {
      await result.current.sendMessage('Test without localStorage');
    });
    
    // エラーログが出力されていることを確認
    expect(consoleSpy).toHaveBeenCalled();
    
    // メッセージが正常に送信されていることを確認
    expect(result.current.messages[result.current.messages.length - 1].content).toBe('Test response');
    
    // クリーンアップ
    localStorageMock.getItem = originalGetItem;
    localStorageMock.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  test('無効なJSONレスポンスの処理', async () => {
    // 無効なJSONレスポンスをシミュレート
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
    );
    
    const { result } = renderHook(() => useChatState());
    
    await act(async () => {
      await result.current.sendMessage('Invalid JSON response');
    });
    
    // エラーが設定されていることを確認
    expect(result.current.error).not.toBeNull();
    
    // エラーメッセージがユーザーに表示されていることを確認
    const errorMessage = result.current.messages[result.current.messages.length - 1];
    expect(errorMessage.role).toBe('assistant');
    expect(errorMessage.content).toContain('エラー');
  });

  test('HTTP 429 (レート制限) エラーの処理', async () => {
    // HTTP 429エラーをシミュレート
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({
          error: 'Rate limit exceeded'
        })
      })
    );
    
    const { result } = renderHook(() => useChatState());
    
    await act(async () => {
      await result.current.sendMessage('Rate limited request');
    });
    
    // エラーが設定されていることを確認
    expect(result.current.error).not.toBeNull();
    
    // レート制限エラーメッセージがユーザーに表示されていることを確認
    const errorMessage = result.current.messages[result.current.messages.length - 1];
    expect(errorMessage.role).toBe('assistant');
    expect(errorMessage.content).toContain('エラー');
    expect(errorMessage.content).toContain('リクエストが多すぎます');
  });
});
