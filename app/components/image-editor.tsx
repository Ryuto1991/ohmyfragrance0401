"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, 
  Move, Type, Bold, Italic, Trash2, Plus
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fontWeight: string
  color: string
  isSelected: boolean
}

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onClose: () => void
  labelSize: { width: number; height: number }
}

const fonts = [
  { name: "Noto Sans JP", value: "'Noto Sans JP', sans-serif" },
  { name: "Noto Serif JP", value: "'Noto Serif JP', serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
]

const fontWeights = [
  { name: "Regular", value: "400" },
  { name: "Medium", value: "500" },
  { name: "Bold", value: "700" },
]

export default function ImageEditorComponent({ imageUrl, onSave, onClose, labelSize }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [isAddingText, setIsAddingText] = useState(false)
  const [newText, setNewText] = useState("")
  const [draggedLayer, setDraggedLayer] = useState<{ id: string; startX: number; startY: number } | null>(null)
  const [labelConfig, setLabelConfig] = useState<{ width: number; height: number; x: number; y: number } | null>(null)

  useEffect(() => {
    const loadLabelConfig = async () => {
      try {
        const response = await fetch('/api/label-sizes')
        const data = await response.json()
        const bottleType = imageUrl.includes('Black') ? 'black' : 'clear'
        const sizeKey = `${labelSize.width}x${labelSize.height}`
        const savedData = data[bottleType][sizeKey]
        if (savedData) {
          setLabelConfig(savedData)
        }
      } catch (error) {
        console.error('Failed to load label config:', error)
      }
    }
    loadLabelConfig()
  }, [imageUrl, labelSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスのサイズを設定（アスペクト比 4:3）
    canvas.width = 800
    canvas.height = 600

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // 画像のアスペクト比を維持しながら、キャンバスに合わせてスケーリング
      const imgAspectRatio = img.width / img.height
      const canvasAspectRatio = canvas.width / canvas.height
      
      let scale = 1
      if (imgAspectRatio > canvasAspectRatio) {
        // 画像が横長の場合
        scale = canvas.width / img.width
      } else {
        // 画像が縦長の場合
        scale = canvas.height / img.height
      }
      
      setScale(scale)
      drawImage(img, ctx)
    }
    img.src = imageUrl
  }, [imageUrl, rotation, flipH, flipV, imagePosition, scale])

  const drawImage = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 画像を描画
    ctx.save()
    ctx.translate(canvas.width / 2 + imagePosition.x, canvas.height / 2 + imagePosition.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.scale(scale, scale)

    const scaledWidth = img.width * scale
    const scaledHeight = img.height * scale
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    )

    ctx.restore()

    // テキストレイヤーの描画
    textLayers.forEach(layer => {
      ctx.save()
      ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`
      ctx.fillStyle = layer.color
      ctx.fillText(layer.text, layer.x, layer.y)
      
      // 選択中のレイヤーは枠を表示
      if (layer.id === selectedLayer) {
        const metrics = ctx.measureText(layer.text)
        const height = layer.fontSize
        ctx.strokeStyle = '#00a9ff'
        ctx.lineWidth = 1
        ctx.strokeRect(
          layer.x - 2,
          layer.y - height + 2,
          metrics.width + 4,
          height + 4
        )
      }
      ctx.restore()
    })
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  const handleAddText = () => {
    if (!newText) return

    const canvas = canvasRef.current
    if (!canvas) return

    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: newText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize: 24,
      fontFamily: fonts[0].value,
      fontWeight: "400",
      color: "#000000",
      isSelected: true
    }

    setTextLayers(prev => prev.map(layer => ({ ...layer, isSelected: false })).concat(newLayer))
    setSelectedLayer(newLayer.id)
    setNewText("")
    setIsAddingText(false)
  }

  const handleTextLayerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // クリックされた座標にあるテキストレイヤーを探す
    const clickedLayer = textLayers.findLast(layer => {
      ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`
      const metrics = ctx.measureText(layer.text)
      const height = layer.fontSize

      return (
        x >= layer.x - 2 &&
        x <= layer.x + metrics.width + 2 &&
        y >= layer.y - height + 2 &&
        y <= layer.y + 4
      )
    })

    if (clickedLayer) {
      setSelectedLayer(clickedLayer.id)
      setTextLayers(prev =>
        prev.map(layer => ({
          ...layer,
          isSelected: layer.id === clickedLayer.id
        }))
      )
    } else {
      setSelectedLayer(null)
      setTextLayers(prev =>
        prev.map(layer => ({ ...layer, isSelected: false }))
      )
    }
  }

  const handleTextDragStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedLayer) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDraggedLayer({
      id: selectedLayer,
      startX: x,
      startY: y
    })
  }

  const handleTextDragMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedLayer) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const deltaX = x - draggedLayer.startX
    const deltaY = y - draggedLayer.startY

    setTextLayers(prev =>
      prev.map(layer =>
        layer.id === draggedLayer.id
          ? {
              ...layer,
              x: layer.x + deltaX,
              y: layer.y + deltaY
            }
          : layer
      )
    )

    setDraggedLayer({
      ...draggedLayer,
      startX: x,
      startY: y
    })
  }

  const handleTextDragEnd = () => {
    setDraggedLayer(null)
  }

  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    setTextLayers(prev =>
      prev.map(layer =>
        layer.id === selectedLayer ? { ...layer, ...updates } : layer
      )
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 bg-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRotation(prev => (prev - 90) % 360)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRotation(prev => (prev + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFlipH(prev => !prev)}>
              <FlipHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFlipV(prev => !prev)}>
              <FlipVertical className="h-4 w-4" />
            </Button>
            <Button
              variant={isMoving ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsMoving(!isMoving)}
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddText}>
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">拡大・縮小</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="relative border rounded-lg overflow-hidden bg-gray-50" style={{ aspectRatio: '4/3' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            onMouseDown={(e) => {
              if (!isMoving) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y })
            }}
            onMouseMove={(e) => {
              if (!isMoving || !dragStart) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              setImagePosition({
                x: x - dragStart.x,
                y: y - dragStart.y
              })
            }}
            onMouseUp={() => setDragStart(null)}
            onMouseLeave={() => setDragStart(null)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  )
} 