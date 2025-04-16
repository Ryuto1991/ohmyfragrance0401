'use client'

import { useEffect, useRef, useState } from 'react'

interface LabelSizeGuideProps {
  size: 'large' | 'medium' | 'small' | 'square'
  bottleImage: string
}

const labelSizes = {
  large: { width: 189, height: 151 },
  medium: { width: 151, height: 121 },
  small: { width: 113, height: 91 },
  square: { width: 113, height: 113 }
}

export default function LabelSizeGuide({ size, bottleImage }: LabelSizeGuideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [customSize, setCustomSize] = useState(labelSizes[size])
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // 初期データの読み込み
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const response = await fetch('/api/label-sizes')
        const data = await response.json()
        const bottleType = bottleImage.includes('Black') ? 'black' : 'clear'
        
        // データ構造のチェック
        if (!data || !data[bottleType] || !data[bottleType][size]) {
          console.log('No saved data found, using default values')
          return
        }

        const savedData = data[bottleType][size]
        if (savedData) {
          setCustomSize({ 
            width: savedData.width || labelSizes[size].width, 
            height: savedData.height || labelSizes[size].height 
          })
          setPosition({ 
            x: savedData.x || 0, 
            y: savedData.y || 0 
          })
        }
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
    loadSavedData()
  }, [size, bottleImage])

  useEffect(() => {
    setCustomSize(labelSizes[size])
  }, [size])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスサイズを1000x1000に設定
    canvas.width = 1000
    canvas.height = 1000

    // ボトル画像を読み込んで描画
    const img = new Image()
    img.src = bottleImage
    img.onload = () => {
      // ボトル画像を描画
      ctx.drawImage(img, 0, 0, 1000, 1000)

      // ラベルサイズの枠を描画
      const x = (1000 - customSize.width) / 2 + position.x
      const y = (1000 - customSize.height) / 2 + position.y

      // 白い枠を描画
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, customSize.width, customSize.height)

      // サイズ情報を表示
      ctx.fillStyle = 'white'
      ctx.font = '16px Arial'
      ctx.fillText(`${customSize.width}px × ${customSize.height}px`, x, y - 10)
    }
  }, [bottleImage, customSize, position])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 枠の範囲内かチェック
    const labelX = (1000 - customSize.width) / 2 + position.x
    const labelY = (1000 - customSize.height) / 2 + position.y

    if (
      x >= labelX &&
      x <= labelX + customSize.width &&
      y >= labelY &&
      y <= labelY + customSize.height
    ) {
      setIsDragging(true)
      setDragStart({ x: x - position.x, y: y - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPosition({
      x: x - dragStart.x - (1000 - customSize.width) / 2,
      y: y - dragStart.y - (1000 - customSize.height) / 2
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setCustomSize(prev => ({
      ...prev,
      [dimension]: Math.max(1, value)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const bottleType = bottleImage.includes('Black') ? 'black' : 'clear'
      const response = await fetch('/api/label-sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [bottleType]: {
            [size]: {
              width: customSize.width,
              height: customSize.height,
              x: position.x,
              y: position.y
            }
          }
        }),
      })

      if (!response.ok) throw new Error('Failed to save')
      setSaveStatus('success')
    } catch (error) {
      console.error('Failed to save:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">幅 (px)</label>
          <input
            type="number"
            value={customSize.width}
            onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">高さ (px)</label>
          <input
            type="number"
            value={customSize.height}
            onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">X位置 (px)</label>
          <input
            type="number"
            value={position.x}
            onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Y位置 (px)</label>
          <input
            type="number"
            value={position.y}
            onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded ${
              isSaving
                ? 'bg-gray-400'
                : saveStatus === 'success'
                ? 'bg-green-500'
                : saveStatus === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isSaving ? '保存中...' : saveStatus === 'success' ? '保存完了' : saveStatus === 'error' ? '保存失敗' : '保存'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setPosition({ x: 0, y: 0 })}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          中央に配置
        </button>
        <button
          onClick={() => {
            setCustomSize(labelSizes[size])
            setPosition({ x: 0, y: 0 })
          }}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          デフォルトに戻す
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="max-w-full h-auto cursor-move"
        style={{ border: '1px solid #e5e5e5' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}