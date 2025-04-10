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

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      content: 'Test response',
      followUp: null
    })
  })
);

// Mock timers
jest.useFakeTimers();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  (global.fetch as jest.Mock).mockClear();
  (chatUtils.splitMessageIntoParts as jest.Mock) = jest.fn().mockImplementation((content) => [{
    content: typeof content === 'string' ? content : content.text || '',
    choices: typeof content !== 'string' ? content.choices : undefined,
    recipe: typeof content !== 'string' ? content.recipe : undefined,
    shouldSplit: false
  }]);
});

describe('useChatState', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useChatState());
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.currentPhaseId).toBe('welcome');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should initialize with provided messages and phase', () => {
    const initialMessages: Message[] = [
      {
        id: 'message-1',
        role: 'assistant',
        content: 'Initial message',
        timestamp: Date.now()
      }
    ];
    
    const initialPhase = 'top' as ChatPhase;
    
    const { result } = renderHook(() => useChatState({
      messages: initialMessages,
      currentPhase: initialPhase
    }));
    
    expect(result.current.messages).toEqual(initialMessages);
    expect(result.current.currentPhaseId).toBe(initialPhase);
  });

  test('should update phase correctly', () => {
    const { result } = renderHook(() => useChatState());
    
    act(() => {
      result.current.updatePhase('top');
    });
    
    expect(result.current.currentPhaseId).toBe('top');
  });

  test('should not allow invalid phase transitions', () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'welcome'
    }));
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    act(() => {
      result.current.updatePhase('finalized');
    });
    
    expect(result.current.currentPhaseId).toBe('welcome');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('should update selected scents', async () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'top'
    }));
    
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    expect(result.current.selectedScents.top).toEqual(['レモン']);
  });

  test('should send message and update state', async () => {
    const { result } = renderHook(() => useChatState());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    // Should add two messages (user message + assistant response)
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe('user');
    expect(result.current.messages[1].content).toBe('Hello');
    expect(result.current.messages[2].role).toBe('assistant');
    
    // Should have called fetch API
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
  });

  test('should handle errors when sending message', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const { result } = renderHook(() => useChatState());
    
    await act(async () => {
      await result.current.sendMessage('Fail request');
    });
    
    expect(result.current.error).not.toBeNull();
    expect(result.current.messages[result.current.messages.length - 1].content).toContain('エラー');
  });

  test('should handle choice selection', async () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'top'
    }));
    
    await act(async () => {
      await result.current.handleChoiceClick('レモン');
    });
    
    expect(result.current.selectedScents.top).toEqual(['レモン']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Should auto-advance to next phase
    expect(result.current.currentPhaseId).toBe('middle');
  });

  test('should automatically transition when all scents are selected', async () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'base'
    }));
    
    // Set top and middle scents
    act(() => {
      result.current.updateSelectedScents('レモン');
      result.current.updatePhase('middle');
      result.current.updateSelectedScents('ラベンダー');
      result.current.updatePhase('base');
    });
    
    // Select base scent to complete the recipe
    await act(async () => {
      await result.current.handleChoiceClick('サンダルウッド');
    });
    
    // Fast-forward timers
    jest.advanceTimersByTime(1000);
    
    // Should have auto-transitioned to finalized
    expect(result.current.currentPhaseId).toBe('finalized');
    
    // Recipe should be saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should reset chat state', async () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'finalized'
    }));
    
    // Setup some state
    act(() => {
      result.current.updateSelectedScents('レモン');
    });
    
    // Reset chat
    await act(async () => {
      result.current.resetChat();
      // Fast-forward past the setTimeout
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.currentPhaseId).toBe('welcome');
    expect(result.current.selectedScents).toEqual({ top: [], middle: [], base: [] });
    expect(localStorageMock.removeItem).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();
  });

  test('should support auto create recipe', async () => {
    const { result } = renderHook(() => useChatState());
    
    await act(async () => {
      await result.current.handleAutoCreateRecipe();
      // Fast-forward past the setTimeout
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.selectedScents).toEqual({
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    });
    
    expect(result.current.currentPhaseId).toBe('complete');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should check order button eligibility', () => {
    const { result } = renderHook(() => useChatState({
      currentPhase: 'finalized'
    }));
    
    // Initially not enabled (no scents selected)
    expect(result.current.isOrderButtonEnabled).toBe(false);
    
    // Add all scents to make it enabled
    act(() => {
      result.current.updateSelectedScents('レモン');
      result.current.updatePhase('middle');
      result.current.updateSelectedScents('ラベンダー');
      result.current.updatePhase('base');
      result.current.updateSelectedScents('サンダルウッド');
    });
    
    expect(result.current.isOrderButtonEnabled).toBe(true);
  });

  test('should redirect to order page when handleGoToOrder is called', () => {
    // Mock window.location.href assignment
    const originalAssign = Object.getOwnPropertyDescriptor(window, 'location');
    const mockHref = jest.fn();
    
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: '',
      },
      writable: true,
      configurable: true,
    });
    
    const hrefSetter = jest.spyOn(window.location, 'href', 'set');
    
    const { result } = renderHook(() => useChatState({
      currentPhase: 'complete'
    }));
    
    // Setup selected scents
    act(() => {
      result.current.updateSelectedScents('レモン');
      result.current.updatePhase('middle');
      result.current.updateSelectedScents('ラベンダー');
      result.current.updatePhase('base');
      result.current.updateSelectedScents('サンダルウッド');
      result.current.updatePhase('complete');
    });
    
    // Call the order function
    act(() => {
      result.current.handleGoToOrder();
    });
    
    expect(hrefSetter).toHaveBeenCalledWith('/custom-order?mode=lab');
    
    // Restore original window.location
    if (originalAssign) {
      Object.defineProperty(window, 'location', originalAssign);
    }
    hrefSetter.mockRestore();
  });
});
