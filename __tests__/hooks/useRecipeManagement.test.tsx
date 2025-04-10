import { renderHook, act } from '@testing-library/react';
import { useRecipeManagement } from '@/components/chat/hooks/useRecipeManagement';
import { FragranceRecipe, Message, ChatPhase } from '@/app/fragrance-lab/chat/types';

// Mock the StorageService
jest.mock('@/utils/storage-service', () => ({
  StorageService: {
    getRecipe: jest.fn(),
    saveRecipe: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock window.location
const mockLocationAssign = jest.fn();
Object.defineProperty(window, 'location', {
  value: { href: mockLocationAssign },
  writable: true
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Import the mocked storage service
import { StorageService } from '@/utils/storage-service';

// Default test props
const defaultProps = {
  messages: [] as Message[],
  selectedScents: {
    top: [] as string[],
    middle: [] as string[],
    base: [] as string[]
  },
  currentPhase: 'welcome' as ChatPhase
};

// Mock recipe data
const mockRecipe: FragranceRecipe = {
  name: 'テストレシピ',
  description: 'テスト用の香りのレシピです',
  topNotes: ['レモン', 'ベルガモット'],
  middleNotes: ['ローズ', 'ジャスミン'],
  baseNotes: ['サンダルウッド', 'バニラ']
};

describe('useRecipeManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.location.href as any) = '';
  });

  test('初期状態ではStorageService.getRecipeを呼び出す', () => {
    renderHook(() => useRecipeManagement(defaultProps));
    
    expect(StorageService.getRecipe).toHaveBeenCalled();
  });

  test('ストレージにレシピがある場合は読み込む', () => {
    // StorageServiceが値を返すようにモック
    (StorageService.getRecipe as jest.Mock).mockReturnValue(mockRecipe);
    
    const { result } = renderHook(() => useRecipeManagement(defaultProps));
    
    // 正しくレシピが読み込まれていることを確認
    expect(result.current.recipe).toEqual(mockRecipe);
  });

  test('isOrderButtonEnabledはフェーズと選択された香りに基づいて値を返す', () => {
    // 初期状態では無効
    const { result, rerender } = renderHook(
      (props) => useRecipeManagement(props), 
      { initialProps: defaultProps }
    );
    
    expect(result.current.isOrderButtonEnabled).toBe(false);
    
    // finalizedフェーズでscentsがあれば有効
    const propsWithScents = {
      ...defaultProps,
      currentPhase: 'finalized' as ChatPhase,
      selectedScents: {
        top: ['レモン'],
        middle: ['ラベンダー'],
        base: ['サンダルウッド']
      }
    };
    
    rerender(propsWithScents);
    
    expect(result.current.isOrderButtonEnabled).toBe(true);
  });

  test('finalizedフェーズで選択された香りがあるとレシピを自動保存する', () => {
    // レシピ情報を含むメッセージを用意
    const messagesWithRecipe: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: '香りの情報',
        timestamp: Date.now(),
        recipe: {
          name: 'カスタムレシピ',
          description: 'カスタムブレンド',
          topNotes: [],
          middleNotes: [],
          baseNotes: []
        }
      }
    ];
    
    const propsWithRecipeInfo = {
      messages: messagesWithRecipe,
      selectedScents: {
        top: ['レモン'],
        middle: ['ラベンダー'],
        base: ['サンダルウッド']
      },
      currentPhase: 'finalized' as ChatPhase
    };
    
    renderHook(() => useRecipeManagement(propsWithRecipeInfo));
    
    // レシピが保存されることを確認
    expect(StorageService.saveRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'カスタムレシピ',
        description: 'カスタムブレンド',
        topNotes: ['レモン'],
        middleNotes: ['ラベンダー'],
        baseNotes: ['サンダルウッド']
      })
    );
  });

  test('resetRecipe関数でレシピをリセットできる', () => {
    // 初期レシピ設定
    (StorageService.getRecipe as jest.Mock).mockReturnValue(mockRecipe);
    
    const { result } = renderHook(() => useRecipeManagement(defaultProps));
    
    // 初期状態を確認
    expect(result.current.recipe).toEqual(mockRecipe);
    
    // リセット実行
    act(() => {
      result.current.resetRecipe();
    });
    
    // ストレージクリア呼び出しを確認
    expect(StorageService.clear).toHaveBeenCalledWith('SELECTED_RECIPE');
    
    // レシピがnullに設定されたことを確認
    expect(result.current.recipe).toBeNull();
  });

  test('handleGoToOrder関数で注文ページへリダイレクトする', () => {
    // 注文可能な状態を設定
    const propsWithCompletePhase = {
      ...defaultProps,
      currentPhase: 'complete' as ChatPhase,
      selectedScents: {
        top: ['レモン'],
        middle: ['ラベンダー'],
        base: ['サンダルウッド']
      }
    };
    
    const { result } = renderHook(() => useRecipeManagement(propsWithCompletePhase));
    
    // 注文実行
    act(() => {
      result.current.handleGoToOrder();
    });
    
    // レシピが保存されていることを確認
    expect(StorageService.saveRecipe).toHaveBeenCalled();
    
    // リダイレクトが行われることを確認
    expect(window.location.href).toBe('/custom-order?mode=lab');
  });

  test('handleGoToOrder関数はボタンが無効な時は何もしない', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // ボタンが無効な状態（ウェルカムフェーズ）
    const { result } = renderHook(() => useRecipeManagement(defaultProps));
    
    act(() => {
      result.current.handleGoToOrder();
    });
    
    // レシピが保存されていないことを確認
    expect(StorageService.saveRecipe).not.toHaveBeenCalled();
    
    // リダイレクトも行われないことを確認
    expect(window.location.href).not.toBe('/custom-order?mode=lab');
    
    // 無効理由がログに出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      '注文ボタンが無効です:',
      expect.anything()
    );
    
    consoleSpy.mockRestore();
  });
});
