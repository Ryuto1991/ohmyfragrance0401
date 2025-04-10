import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FragranceAIChat } from '@/components/chat/fragrance-ai-chat';

// Mock all the required dependencies and hooks
jest.mock('@/app/fragrance-lab/chat/hooks/useChatState', () => ({
  useChatState: () => ({
    messages: [
      {
        id: 'initial-message',
        role: 'assistant',
        content: 'こんにちは！フレグランスラボへようこそ。どのような香りをお探しですか？',
        timestamp: Date.now()
      }
    ],
    currentPhaseId: 'welcome',
    selectedScents: { top: [], middle: [], base: [] },
    isLoading: false,
    isSubmitting: false,
    error: null,
    addMessage: jest.fn(),
    sendMessage: jest.fn(),
    handleError: jest.fn(),
    isOrderButtonEnabled: false,
    updatePhase: jest.fn(),
    updateSelectedScents: jest.fn(),
    resetChat: jest.fn(),
    handleGoToOrder: jest.fn(),
    handleAutoCreateRecipe: jest.fn()
  })
}));

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

// Mock the TipsSidebar component
jest.mock('@/components/chat/tips-sidebar', () => ({
  TipsSidebar: () => <div data-testid="tips-sidebar">Tips Sidebar</div>
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} width={props.width} height={props.height} />;
  }
}));

// Mock the ChoiceButton component
jest.mock('@/components/chat/choice-button', () => ({
  ChoiceButton: ({ choice, onClick }: { choice: { name: string, description?: string }, onClick: any }) => (
    <button onClick={() => onClick(choice)}>{choice.name}</button>
  )
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef(({ ...props }: any, ref) => <input ref={ref} {...props} />)
}));

jest.mock('@/app/fragrance-lab/chat/components/ChatProgressSteps', () => ({
  ChatProgressSteps: ({ currentPhaseId }: { currentPhaseId: string }) => (
    <div data-testid="chat-progress-steps">Current Phase: {currentPhaseId}</div>
  )
}));

// Spy on process.env.NODE_ENV to hide debug info
let nodeEnvSpy: jest.SpyInstance;
beforeAll(() => {
  nodeEnvSpy = jest.spyOn(process.env, 'NODE_ENV', 'get').mockReturnValue('production');
});

afterAll(() => {
  nodeEnvSpy.mockRestore();
});

describe('FragranceAIChat Snapshots', () => {
  test('renders correctly in welcome phase', () => {
    const { container } = render(<FragranceAIChat />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly with initial query', () => {
    const { container } = render(<FragranceAIChat initialQuery="柑橘系の香りが欲しい" />);
    expect(container).toMatchSnapshot('with-initial-query');
  });
});
