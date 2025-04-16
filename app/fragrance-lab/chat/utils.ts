import { ChatPhase, FragranceRecipe, NoteSelectionPhase } from './types';

// フェーズに対応する表示名を取得する関数 (新しいフェーズに合わせて修正)
export const getPhaseDisplayName = (phase: ChatPhase): string => {
  switch (phase) {
    case 'start': return 'はじめに';
    case 'selecting': return '香りを選択中';
    case 'complete': return 'レシピ完成';
    default: return phase; // 不明なフェーズはそのまま表示
  }
};

// ノート選択フェーズに対応する表示名を取得する関数 (新設)
export const getNoteSelectionDisplayName = (notePhase: NoteSelectionPhase): string => {
  switch (notePhase) {
    case 'top': return 'トップノート';
    case 'middle': return 'ミドルノート';
    case 'base': return 'ベースノート';
    default: return '';
  }
};

// ノート選択フェーズに対応するノートタイプキーを取得する関数 (新設)
// useChatState 内の getPhaseNoteType の代わりに使用する想定
export const getNoteKeyFromSelectionPhase = (notePhase: NoteSelectionPhase): keyof Pick<FragranceRecipe, 'topNotes' | 'middleNotes' | 'baseNotes'> | null => {
  switch (notePhase) {
    case 'top': return 'topNotes';
    case 'middle': return 'middleNotes';
    case 'base': return 'baseNotes';
    default: return null;
  }
};
