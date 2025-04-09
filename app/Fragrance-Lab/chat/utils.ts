import { ChatPhase } from './types';

// フェーズの順序を定義
export const PHASE_ORDER: ChatPhase[] = [
  'welcome',
  'intro',
  'themeSelected',
  'top',
  'middle',
  'base',
  'finalized',
  'complete'
];

// フェーズ遷移を定義
export const PHASE_TRANSITIONS: Record<ChatPhase, ChatPhase[]> = {
  welcome: ['intro'],
  intro: ['themeSelected'],
  themeSelected: ['top'],
  top: ['middle'],
  middle: ['base'],
  base: ['finalized'],
  finalized: ['complete'],
  complete: []
} as const;

// フェーズ遷移が有効かどうかを検証する関数
export const canTransition = (from: ChatPhase, to: ChatPhase): boolean => {
  return PHASE_TRANSITIONS[from]?.includes(to) ?? false;
};

// 次のフェーズを取得する関数
export const getNextPhase = (currentPhase: ChatPhase): ChatPhase | null => {
  const nextPhases = PHASE_TRANSITIONS[currentPhase];
  return nextPhases && nextPhases.length > 0 ? nextPhases[0] : null;
};

// フェーズ名を取得する関数
export const getPhaseLabel = (phase: ChatPhase): string => {
  switch (phase) {
    case 'welcome': return 'ようこそ';
    case 'intro': return 'テーマ選択';
    case 'themeSelected': return 'テーマ決定';
    case 'top': return 'トップノート';
    case 'middle': return 'ミドルノート';
    case 'base': return 'ベースノート';
    case 'finalized': return 'レシピ確認';
    case 'complete': return '完了';
    default: return phase;
  }
};

// フェーズのステップ番号を取得する関数
export const getPhaseStep = (phase: ChatPhase): number => {
  return PHASE_ORDER.indexOf(phase);
}; 