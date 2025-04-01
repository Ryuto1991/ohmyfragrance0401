import { LabelSize } from '../types';

// 瓶の実寸とピクセルサイズ
const BOTTLE_DIMENSIONS = {
  width: 4.5,  // cm
  height: 12.0 // cm
};

// ピクセル変換の基準値
const PIXEL_RATIO = {
  horizontal: 100, // px/cm
  vertical: 100    // px/cm
};

// ラベル配置の開始位置
const LABEL_START_POSITION = {
  x: 0,
  y: 200
};

// cmからpxへの変換関数
function cmToPx(cm: number, direction: 'horizontal' | 'vertical'): number {
  return cm * PIXEL_RATIO[direction];
}

// ラベルを中央に配置するためのX座標計算
function calculateCenterX(labelWidth: number): number {
  const bottleWidthPx = cmToPx(BOTTLE_DIMENSIONS.width, 'horizontal');
  return (bottleWidthPx - labelWidth) / 2;
}

// ラベルサイズの定義（px）と配置位置
export const LABEL_SIZES: Record<LabelSize, {
  width: number;
  height: number;
  x: number;
  y: number;
  description: string;
}> = {
  large: {
    width: cmToPx(4.0, 'horizontal'),
    height: cmToPx(5.5, 'vertical'),
    get x() { return calculateCenterX(this.width) },
    y: LABEL_START_POSITION.y,
    description: "縦5.5cm × 横4.0cm"
  },
  medium: {
    width: cmToPx(3.2, 'horizontal'),
    height: cmToPx(4.0, 'vertical'),
    get x() { return calculateCenterX(this.width) },
    y: LABEL_START_POSITION.y,
    description: "縦4.0cm × 横3.2cm"
  },
  small: {
    width: cmToPx(2.4, 'horizontal'),
    height: cmToPx(3.0, 'vertical'),
    get x() { return calculateCenterX(this.width) },
    y: LABEL_START_POSITION.y,
    description: "縦3.0cm × 横2.4cm"
  },
  square: {
    width: cmToPx(3.0, 'horizontal'),
    height: cmToPx(3.0, 'vertical'),
    get x() { return calculateCenterX(this.width) },
    y: LABEL_START_POSITION.y,
    description: "縦3.0cm × 横3.0cm"
  }
}; 