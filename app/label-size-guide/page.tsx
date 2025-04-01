'use client'

import { useState } from 'react'
import LabelSizeGuide from '../components/label-size-guide'

export default function LabelSizeGuidePage() {
  const [size, setSize] = useState<'large' | 'medium' | 'small' | 'square'>('large')
  const [bottleType, setBottleType] = useState<'black' | 'clear'>('black')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ラベルサイズガイド</h1>
      
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ラベルサイズ</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="large">大 (189×151px)</option>
            <option value="medium">中 (151×121px)</option>
            <option value="small">小 (113×91px)</option>
            <option value="square">スクエア (113×113px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ボトルタイプ</label>
          <select
            value={bottleType}
            onChange={(e) => setBottleType(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="black">ブラックボトル</option>
            <option value="clear">クリアボトル</option>
          </select>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto">
        <LabelSizeGuide
          size={size}
          bottleImage={`/labels/${bottleType === 'black' ? 'Black' : 'Clear'}_bottle.png`}
        />
      </div>
    </div>
  )
} 