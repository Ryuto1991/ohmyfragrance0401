import { ChatPhase, FragranceRecipe } from './types';

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

// 条件付きフェーズ遷移を処理する関数
export const getNextPhaseWithCondition = (
  currentPhase: ChatPhase,
  selectedScents: { top: string[], middle: string[], base: string[] },
  userInput?: string
): ChatPhase | null => {
  // 基本的な次のフェーズを取得
  const nextPhase = getNextPhase(currentPhase);

  // ユーザー入力に基づく条件付き遷移
  if (userInput) {
    const lowerInput = userInput.toLowerCase();
    
    // 「おまかせ」などのキーワードがある場合は一気に進める
    if (currentPhase === 'intro' || currentPhase === 'themeSelected') {
      if (lowerInput.includes('おまかせ') || lowerInput.includes('一気に') || lowerInput.includes('全部')) {
        return 'base'; // 一気にベースノートまで進む
      }
    }
    
    // 完了を示すキーワードがある場合
    if (currentPhase === 'finalized' && 
        (lowerInput === 'おわり' || lowerInput === '完了' || lowerInput === 'はい')) {
      return 'complete';
    }
  }

  // 香り選択の状態に基づく遷移
  if (currentPhase === 'base' && 
      selectedScents.top.length > 0 &&
      selectedScents.middle.length > 0 && 
      selectedScents.base.length > 0) {
    return 'finalized'; // すべての香りが選択されたら確認フェーズへ
  }

  return nextPhase;
};

// フェーズ名を取得する関数
export const getPhaseLabel = (phase: ChatPhase): string => {
  switch (phase) {
    case 'welcome': return 'ようこそ';
    case 'intro': return 'イメージ';
    case 'themeSelected': return 'テーマ';
    case 'top': return 'トップ';
    case 'middle': return 'ミドル';
    case 'base': return 'ベース';
    case 'finalized': return '確認';
    case 'complete': return '完了';
    default: return '';
  }
};

// フェーズのステップ番号を取得する関数
export const getPhaseStep = (phase: ChatPhase): number => {
  return PHASE_ORDER.indexOf(phase);
};

// フェーズに対応するノートタイプを取得する関数
export const getPhaseNoteType = (phase: ChatPhase): keyof Pick<FragranceRecipe, 'topNotes' | 'middleNotes' | 'baseNotes'> | null => {
  switch (phase) {
    case 'top': return 'topNotes';
    case 'middle': return 'middleNotes';
    case 'base': return 'baseNotes';
    default: return null;
  }
};

// フェーズに対応する表示名を取得する関数
export const getPhaseDisplayName = (phase: ChatPhase): string => {
  switch (phase) {
    case 'welcome': return 'ようこそ';
    case 'intro': return 'イメージ入力';
    case 'themeSelected': return 'テーマ選択';
    case 'top': return 'ステップ2: トップノート';
    case 'middle': return 'ステップ3: ミドルノート';
    case 'base': return 'ステップ4: ベースノート';
    case 'finalized': return 'ステップ5: レシピ確認';
    case 'complete': return 'ステップ6: 完了';
    default: return phase;
  }
};

// 自動モードでのフェーズ遷移を許可する拡張関数
export const canTransitionWithAutoMode = (from: ChatPhase, to: ChatPhase, isAutoMode: boolean): boolean => {
  // 詳細なデバッグ情報
  console.log(`フェーズ遷移チェック: ${from} -> ${to}, 自動モード=${isAutoMode}, typeof isAutoMode=${typeof isAutoMode}`);
  
  // 自動モードの場合、常にtrueを返す（検証スキップ）
  if (isAutoMode === true) {
    console.log(`✅ 自動モード検出: ${from} -> ${to} (許可)`);
    return true;
  }
  
  // 通常の遷移ルールを適用
  const allowed = PHASE_TRANSITIONS[from]?.includes(to) ?? false;
  
  if (allowed) {
    console.log(`✅ 通常モードでの有効な遷移: ${from} -> ${to}`);
  } else {
    console.warn(`❌ 通常モードでの無効な遷移: ${from} -> ${to}`);
  }
  
  return allowed;
};
