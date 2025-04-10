import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProgressSteps } from '@/components/chat/components/ChatProgressSteps';
import { ChatPhase } from '@/app/fragrance-lab/chat/types';

describe('ChatProgressSteps', () => {
  test('renders all steps', () => {
    render(<ChatProgressSteps currentPhaseId="welcome" />);
    
    // Check that all required steps are present
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Check that labels are present (for desktop view)
    expect(screen.getByText('イメージ入力')).toBeInTheDocument();
    expect(screen.getByText('トップノート')).toBeInTheDocument();
    expect(screen.getByText('ミドルノート')).toBeInTheDocument();
    expect(screen.getByText('ベースノート')).toBeInTheDocument();
    expect(screen.getByText('レシピ確認')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  test('highlights current step correctly', () => {
    render(<ChatProgressSteps currentPhaseId="middle" />);
    
    // Since 'middle' is the 4th visible step (array index 2), the number 3 should be highlighted
    const middleStepNumber = screen.getByText('3');
    const middleStepElement = middleStepNumber.closest('div');
    
    // Check that the current step has the correct styling
    expect(middleStepElement).toHaveClass('border-primary');
    expect(middleStepElement).toHaveClass('bg-white');
    expect(middleStepElement).toHaveClass('text-primary');
    
    // The mobile view should show the current phase label
    expect(screen.getByText('ミドルノート', { selector: '.flex.md\\:hidden .text-xs' })).toBeInTheDocument();
  });

  test('shows completed steps with check icons', () => {
    render(<ChatProgressSteps currentPhaseId="base" />);
    
    // For the "base" phase, intro, top, and middle phases should be completed
    // Completed steps have check icons instead of numbers
    const checkIcons = screen.getAllByTestId('check-icon');
    
    // There should be 3 completed steps (intro, top, middle)
    expect(checkIcons).toHaveLength(3);
    
    // Step 4 (base) should be current and have a number
    const baseStepNumber = screen.getByText('4');
    expect(baseStepNumber).toBeInTheDocument();
  });

  test('shows progress correctly for completed flow', () => {
    render(<ChatProgressSteps currentPhaseId="complete" />);
    
    // For the "complete" phase, all previous steps should be completed
    const checkIcons = screen.getAllByTestId('check-icon');
    
    // There should be 5 completed steps (intro, top, middle, base, finalized)
    expect(checkIcons).toHaveLength(5);
    
    // "Complete" should be highlighted as current
    const completeStepNumber = screen.getByText('6');
    const completeStepElement = completeStepNumber.closest('div');
    expect(completeStepElement).toHaveClass('border-primary');
  });

  test('handles unknown phase gracefully', () => {
    // Using a non-existent phase to test error handling
    render(<ChatProgressSteps currentPhaseId={'unknown' as ChatPhase} />);
    
    // Should still render without crashing
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('イメージ入力')).toBeInTheDocument();
  });
});
