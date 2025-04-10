import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProgressSteps } from '@/components/chat/components/ChatProgressSteps';
import { ChatPhase } from '@/app/fragrance-lab/chat/types';

describe('ChatProgressSteps Snapshots', () => {
  // 各フェーズの状態をスナップショットとして保存
  test.each([
    'welcome',
    'top',
    'middle',
    'base',
    'finalized',
    'complete'
  ] as ChatPhase[])('renders correctly in %s phase', (phase) => {
    const { container } = render(<ChatProgressSteps currentPhaseId={phase} />);
    expect(container).toMatchSnapshot();
  });

  // モバイル表示のスナップショットテスト
  test('renders correctly on mobile view', () => {
    // モバイルビューをシミュレート
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = render(<ChatProgressSteps currentPhaseId="middle" />);
    expect(container).toMatchSnapshot('mobile-view');
  });

  // デスクトップ表示のスナップショットテスト
  test('renders correctly on desktop view', () => {
    // デスクトップビューをシミュレート
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: !query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = render(<ChatProgressSteps currentPhaseId="middle" />);
    expect(container).toMatchSnapshot('desktop-view');
  });
});
