import { renderHook, act } from '@testing-library/react';
import { useScentsSelection } from '@/components/chat/hooks/useScentsSelection';
import { StorageService } from '@/utils/storage-service';
import { ChatPhase, FragranceRecipe } from '@/app/fragrance-lab/chat/types';

// Mock the StorageService
jest.mock('@/utils/storage-service', () => ({
  StorageService: {
    getRecipe: jest.fn(),
    saveRecipe: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock setTimeout
jest.useFakeTimers();

describe('useScentsSelection', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getRecipe as jest.Mock).mockReturnValue(null);
  });

  test('初期状態では空の香り選択状態で初期化される', () => {
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'welcome' 
    }));
    
    expect(result.current.selectedScents).toEqual({
      top: [],
      middle: [],
      base: []
    });
    expect(result.current.isAllScentsSelected).toBe(false);
  });

  test('保存されたレシピがある場合はロードする', () => {
    const savedRecipe: Partial<FragranceRecipe> = {
      topNotes: ['レモン'],
      middleNotes: ['ラベンダー'],
      baseNotes: ['サンダルウッド']
    };
    
    (StorageService.getRecipe as jest.Mock).mockReturnValue(savedRecipe);
    
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'welcome' 
    }));
    
    // useEffectが実行されるのを待つ
    act(() => {
      jest.runAllTimers();
    });
    
    expect(result.current.selectedScents).toEqual({
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    });
    expect(result.current.isAllScentsSelected).toBe(true);
  });

  test('updateSelectedScentsで香りを選択できる', () => {
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'top' 
    }));
    
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    expect(result.current.selectedScents.top).toEqual(['レモン']);
    expect(result.current.currentPhaseScents).toEqual(['レモン']);
  });

  test('フェーズごとに異なる香りを選択できる', () => {
    const { result, rerender } = renderHook(
      (props) => useScentsSelection(props), 
      { initialProps: { currentPhase: 'top' as ChatPhase } }
    );
    
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    // ミドルフェーズに移行
    rerender({ currentPhase: 'middle' as ChatPhase });
    
    act(() => {
      result.current.updateSelectedScents('ラベンダー');
    });
    
    // ベースフェーズに移行
    rerender({ currentPhase: 'base' as ChatPhase });
    
    act(() => {
      result.current.updateSelectedScents('サンダルウッド');
    });
    
    expect(result.current.selectedScents).toEqual({
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    });
    expect(result.current.isAllScentsSelected).toBe(true);
  });

  test('すべての香りが選択されたらレシピが保存される', () => {
    const updatePhaseMock = jest.fn().mockReturnValue(true);
    
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'top',
      updatePhase: updatePhaseMock
    }));
    
    // トップノート選択
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    // StorageServiceはまだ呼ばれないはず（すべての香りが選択されていない）
    expect(StorageService.saveRecipe).not.toHaveBeenCalled();
    
    // ミドルノート選択
    act(() => {
      jest.spyOn(result.current, 'getPhaseNoteType').mockReturnValue('middle');
      result.current.updateSelectedScents('ラベンダー');
    });
    
    // ベースノート選択
    act(() => {
      jest.spyOn(result.current, 'getPhaseNoteType').mockReturnValue('base');
      result.current.updateSelectedScents('サンダルウッド');
    });
    
    // すべての香りが選択された状態で変更を検知するuseEffectが実行される
    act(() => {
      jest.runAllTimers();
    });
    
    // レシピが保存されたことを確認
    expect(StorageService.saveRecipe).toHaveBeenCalledWith({
      topNotes: ['レモン'],
      middleNotes: ['ラベンダー'],
      baseNotes: ['サンダルウッド']
    });
  });

  test('ベースノート選択後に自動的にフェーズ遷移する', () => {
    const updatePhaseMock = jest.fn().mockReturnValue(true);
    
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'base',
      updatePhase: updatePhaseMock
    }));
    
    // 事前に他のノートも選択済みの状態にする
    act(() => {
      result.current.updateSelectedScents('レモン');
      jest.spyOn(result.current, 'getPhaseNoteType').mockReturnValueOnce('top');
    });
    
    act(() => {
      result.current.updateSelectedScents('ラベンダー');
      jest.spyOn(result.current, 'getPhaseNoteType').mockReturnValueOnce('middle');
    });
    
    // ベースノート選択（最後のノート）
    act(() => {
      jest.spyOn(result.current, 'getPhaseNoteType').mockReturnValue('base');
      result.current.updateSelectedScents('サンダルウッド');
    });
    
    // タイマーを進める（自動遷移のsetTimeout）
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // finalizedフェーズに自動遷移したことを確認
    expect(updatePhaseMock).toHaveBeenCalledWith('finalized');
  });

  test('resetScentsですべての選択を解除できる', () => {
    // 初期状態で香りが選択されている状態を設定
    const savedRecipe: Partial<FragranceRecipe> = {
      topNotes: ['レモン'],
      middleNotes: ['ラベンダー'],
      baseNotes: ['サンダルウッド']
    };
    
    (StorageService.getRecipe as jest.Mock).mockReturnValue(savedRecipe);
    
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'welcome' 
    }));
    
    // useEffectが実行されるのを待つ
    act(() => {
      jest.runAllTimers();
    });
    
    // リセット前の状態を確認
    expect(result.current.isAllScentsSelected).toBe(true);
    
    // リセット実行
    act(() => {
      result.current.resetScents();
    });
    
    // すべての選択が解除されたことを確認
    expect(result.current.selectedScents).toEqual({
      top: [],
      middle: [],
      base: []
    });
    expect(result.current.isAllScentsSelected).toBe(false);
  });

  test('無効なフェーズでの香り選択は警告を出して無視される', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'finalized' 
    }));
    
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    // 選択が変更されていないことを確認
    expect(result.current.selectedScents.top).toEqual([]);
    expect(result.current.selectedScents.middle).toEqual([]);
    expect(result.current.selectedScents.base).toEqual([]);
    
    // 警告が出力されたことを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('無効なフェーズでの香り選択')
    );
    
    consoleSpy.mockRestore();
  });

  test('getPhaseNoteTypeで正しいノートタイプを返す', () => {
    const { result } = renderHook(() => useScentsSelection({ 
      currentPhase: 'welcome' 
    }));
    
    expect(result.current.getPhaseNoteType('top')).toBe('top');
    expect(result.current.getPhaseNoteType('middle')).toBe('middle');
    expect(result.current.getPhaseNoteType('base')).toBe('base');
    expect(result.current.getPhaseNoteType('welcome')).toBeNull();
    expect(result.current.getPhaseNoteType('finalized')).toBeNull();
    expect(result.current.getPhaseNoteType('complete')).toBeNull();
  });
});
