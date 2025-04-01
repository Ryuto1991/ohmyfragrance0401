// 瓶の実寸とピクセルサイズ
const BOTTLE_DIMENSIONS = {
  totalHeight: 9.3,    // 全体の高さ (cm)
  bodyHeight: 6.3,     // 本体部分の高さ (cm)
  width: 4.4,         // 横幅 (cm)
  pixelHeight: 1000,  // px
  pixelWidth: 1000,   // px
}

// スケーリング係数を計算（px/cm）
// 横方向は実際のボトル画像の見た目に合わせて調整
export const SCALE_FACTOR = {
  vertical: BOTTLE_DIMENSIONS.pixelHeight / BOTTLE_DIMENSIONS.totalHeight,
  horizontal: (BOTTLE_DIMENSIONS.pixelWidth * 0.4) / BOTTLE_DIMENSIONS.width, // ボトル画像の実際の見た目に合わせて40%に調整
}

// cmをpxに変換する関数
export const cmToPx = (cm: number, direction: 'vertical' | 'horizontal') => {
  return Math.round(cm * SCALE_FACTOR[direction])
}

// ラベル貼付開始位置の計算（上部からの距離）
const LABEL_START_POSITION = {
  y: cmToPx((BOTTLE_DIMENSIONS.totalHeight - BOTTLE_DIMENSIONS.bodyHeight) / 2, 'vertical')
}

// 中央配置のためのX位置を計算する関数
const calculateCenterX = (width: number) => {
  return Math.round((BOTTLE_DIMENSIONS.pixelWidth - width) / 2)
}

// ラベルサイズの定義（px）と配置位置
export const LABEL_SIZES = {
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
} 