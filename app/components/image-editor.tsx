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
        const savedData = data[bottleType][labelSize]
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

    // キャンバスのサイズをラベルサイズに設定（ピクセルに変換）
    const pxPerCm = 37.795275591  // 1cm = 37.7953px
    canvas.width = labelSize.width * pxPerCm
    canvas.height = labelSize.height * pxPerCm

    const img = new Image()
    img.onload = () => {
      drawImage(img, ctx)
    }
    img.src = imageUrl
  }, [imageUrl, rotation, flipH, flipV, imagePosition, labelSize])

  const drawImage = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // ラベルサイズのガイドを描画
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // 画像を描画
    ctx.save()
    ctx.translate(canvas.width / 2 + imagePosition.x, canvas.height / 2 + imagePosition.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

    // ラベル設定に基づいて画像を描画
    if (labelConfig) {
      const scale = Math.max(
        labelConfig.width / img.width,
        labelConfig.height / img.height
      ) * 1.2

      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      ctx.drawImage(
        img,
        -scaledWidth / 2 + labelConfig.x,
        -scaledHeight / 2 + labelConfig.y,
        scaledWidth,
        scaledHeight
      )
    }
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

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360)
  }

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleFlipHorizontal = () => {
    setFlipH((prev) => !prev)
  }

  const handleFlipVertical = () => {
    setFlipV((prev) => !prev)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isMoving) {
      setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isMoving && dragStart) {
      setImagePosition({
        x: x - dragStart.x,
        y: y - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setDragStart(null)
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-medium">画像を編集</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRotateLeft}
              className="hover:bg-gray-100"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRotateRight}
              className="hover:bg-gray-100"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFlipHorizontal}
              className="hover:bg-gray-100"
            >
              <FlipHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFlipVertical}
              className="hover:bg-gray-100"
            >
              <FlipVertical className="h-4 w-4" />
            </Button>
            <Button
              variant={isMoving ? "default" : "outline"}
              size="icon"
              onClick={() => setIsMoving(!isMoving)}
              className="hover:bg-gray-100"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={isAddingText ? "default" : "outline"}
              size="icon"
              onClick={() => setIsAddingText(!isAddingText)}
              className="hover:bg-gray-100"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {isAddingText && (
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Input
                placeholder="テキストを入力..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddText}>
                追加
              </Button>
            </div>
          </div>
        )}

        {selectedLayer && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                value={textLayers.find(l => l.id === selectedLayer)?.fontFamily}
                onValueChange={(value) => updateSelectedLayer({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="フォント" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={textLayers.find(l => l.id === selectedLayer)?.fontWeight}
                onValueChange={(value) => updateSelectedLayer({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ウェイト" />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map(weight => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm">サイズ:</span>
                <Input
                  type="number"
                  min="8"
                  max="72"
                  value={textLayers.find(l => l.id === selectedLayer)?.fontSize}
                  onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">色:</span>
                <Input
                  type="color"
                  value={textLayers.find(l => l.id === selectedLayer)?.color}
                  onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                  className="w-20 h-8 p-0"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 min-h-0 p-4 flex items-center justify-center bg-gray-50">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full"
            style={{ 
              cursor: isMoving ? 'move' : selectedLayer ? 'text' : 'default',
              border: '1px solid #e5e5e5'
            }}
            onClick={handleTextLayerClick}
            onMouseDown={(e) => {
              if (selectedLayer) {
                handleTextDragStart(e)
              } else {
                handleMouseDown(e)
              }
            }}
            onMouseMove={(e) => {
              if (draggedLayer) {
                handleTextDragMove(e)
              } else {
                handleMouseMove(e)
              }
            }}
            onMouseUp={() => {
              if (draggedLayer) {
                handleTextDragEnd()
              } else if (isMoving) {
                handleMouseUp()
              }
            }}
            onMouseLeave={() => {
              if (draggedLayer) {
                handleTextDragEnd()
              } else if (isMoving) {
                handleMouseUp()
              }
            }}
          />
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  )
} 