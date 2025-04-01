"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, Upload, ChevronDown, ChevronUp, Image, Info, X, Type, Move, Trash, Edit2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ImageEditorComponent from '../components/image-editor'
import { LabelSize } from '../types'
import { LABEL_SIZES } from '../utils/size-utils'

const ImageEditorComponent = dynamic(() => import("../components/image-editor"), {
  ssr: false,
})

interface FragranceNote {
  top: string[]
  middle: string[]
  last: string[]
}

interface Fragrance {
  id: string
  name: string
  description: string
  notes: FragranceNote
}

interface Bottle {
  id: string
  name: string
  image: string
}

interface ImageTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

export default function PerfumeOrderingPage() {
  // State for selections
  const [expandedSection, setExpandedSection] = useState(1)
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null)
  const [selectedBottle, setSelectedBottle] = useState<'black' | 'clear'>('clear')
  const [selectedLabelSize, setSelectedLabelSize] = useState<LabelSize>('medium')
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectLater, setSelectLater] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeInfoId, setActiveInfoId] = useState<number | null>(null)
  const [infoPosition, setInfoPosition] = useState<{ top: number; left: number } | null>(null)
  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  })
  const [screenWidth, setScreenWidth] = useState(0)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    // Set initial width
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sample data
  const fragrances: Fragrance[] = [
    {
      id: "lavender-dream",
      name: "ラベンダードリーム",
      description: "落ち着くラベンダーとバニラのヒント",
      notes: {
        top: ["ラベンダー", "ベルガモット"],
        middle: ["ジャスミン", "イランイラン"],
        last: ["バニラ", "サンダルウッド"]
      }
    },
    {
      id: "ocean-breeze",
      name: "オーシャンブリーズ",
      description: "さわやかな海の香り",
      notes: {
        top: ["シトラス", "マリン"],
        middle: ["ローズ", "ジャスミン"],
        last: ["ムスク", "アンバー"]
      }
    },
    {
      id: "citrus-burst",
      name: "シトラスバースト",
      description: "活力を与える柑橘系の香りのブレンド",
      notes: {
        top: ["レモン", "オレンジ", "グレープフルーツ"],
        middle: ["ネロリ", "ペチグレイン"],
        last: ["ベチバー", "シダーウッド"]
      }
    },
  ]

  const bottles: Bottle[] = [
    { id: "clear", name: "クリアガラス", image: "/labels/Clear_bottle.png" },
    { id: "black", name: "マットブラック", image: "/labels/Black_bottle.png" },
  ]

  const labelSizes = [
    {
      id: "large",
      name: "大",
      description: "縦5.5cm × 横4.0cm",
      width: 4.0,
      height: 5.5
    },
    {
      id: "medium",
      name: "中",
      description: "縦5.0cm × 横3.5cm",
      width: 3.5,
      height: 5.0
    },
    {
      id: "small",
      name: "小",
      description: "縦4.5cm × 横3.0cm",
      width: 3.0,
      height: 4.5
    },
    {
      id: "square",
      name: "スクエア",
      description: "縦4.5cm × 横4.5cm",
      width: 4.5,
      height: 4.5
    }
  ]

  // デフォルトのラベル画像をテンプレートラベルに変更
  const defaultLabelImage = "/labels/Template_label.png"

  // Toggle section expansion
  const toggleSection = (sectionNumber: number) => {
    setExpandedSection(expandedSection === sectionNumber ? 0 : sectionNumber)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setUseTemplate(false)
        setSelectLater(false)
        setImageTransform({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setUseTemplate(false)
        setSelectLater(false)
        setImageTransform({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle info icon click
  const handleInfoClick = (e: React.MouseEvent, fragranceId: string) => {
    e.stopPropagation()
    e.preventDefault()

    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    setInfoPosition({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width + 10 + window.scrollX,
    })

    setActiveInfoId(activeInfoId === fragranceId ? null : fragranceId)
  }

  const handleEditImage = () => {
    if (uploadedImage) {
      setEditingImage(uploadedImage)
      setIsEditorOpen(true)
    }
  }

  const handleSaveEdit = (editedImageUrl: string) => {
    setUploadedImage(editedImageUrl)
    setEditingImage(null)
    setIsEditorOpen(false)
  }

  // リセット処理
  const handleReset = () => {
    setUploadedImage(defaultLabelImage)
    setImageTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    })
  }

  // 選択中のラベルサイズを取得
  const selectedLabelDimensions = labelSizes.find((s) => s.id === selectedLabelSize)?.size || { width: 5, height: 7 }

  const handleSave = (imageUrl: string) => {
    console.log('Saved image:', imageUrl)
    setShowEditor(false)
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Fragrance Selection Section */}
            <div className="mb-4 border rounded">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 1 ? "bg-gray-100" : "bg-white",
                )}
                onClick={() => toggleSection(1)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">1</div>
                  <h3 className="font-medium">香りを選ぶ</h3>
                </div>
                {selectedFragrance && (
                  <div className="text-sm text-gray-600 mr-2">
                    {fragrances.find((f) => f.id === selectedFragrance)?.name}
                  </div>
                )}
                {expandedSection === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 1 && (
                <div className="p-3">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {fragrances.map((fragrance) => (
                      <div key={fragrance.id} className="relative">
                        <div
                          className={cn(
                            "border p-2 flex items-center cursor-pointer",
                            selectedFragrance === fragrance.id ? "border-red-600" : "",
                          )}
                          onClick={() => setSelectedFragrance(fragrance.id)}
                        >
                          <div className="flex items-center mr-3">
                            {selectedFragrance === fragrance.id && (
                              <div className="bg-red-600 text-white rounded-full p-1 mr-2">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{fragrance.name}</h4>
                            <p className="text-xs text-gray-600">{fragrance.description}</p>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <Info className="h-5 w-5" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">トップノート</h4>
                                  <p className="text-sm">{fragrance.notes.top.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">ミドルノート</h4>
                                  <p className="text-sm">{fragrance.notes.middle.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">ラストノート</h4>
                                  <p className="text-sm">{fragrance.notes.last.join("、")}</p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottle Selection Section */}
            <div className="mb-4 border rounded">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 2 ? "bg-gray-100" : "bg-white",
                )}
                onClick={() => toggleSection(2)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">2</div>
                  <h3 className="font-medium">ボトルを選ぶ</h3>
                </div>
                {selectedBottle && (
                  <div className="text-sm text-gray-600 mr-2">
                    {bottles.find((b) => b.id === selectedBottle)?.name}
                  </div>
                )}
                {expandedSection === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 2 && (
                <div className="p-3">
                  <div className="space-y-2">
                    {bottles.map((bottle) => (
                      <div
                        key={bottle.id}
                        className={cn(
                          "border p-2 flex items-center cursor-pointer",
                          selectedBottle === bottle.id ? "border-red-600" : "",
                        )}
                        onClick={() => setSelectedBottle(bottle.id as 'black' | 'clear')}
                      >
                        <div className="flex items-center mr-3">
                          {selectedBottle === bottle.id && (
                            <div className="bg-red-600 text-white rounded-full p-1 mr-2">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                            <img src={bottle.image} alt={bottle.name} className="h-8 object-contain" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{bottle.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Label Size Selection Section */}
            <div className="mb-4 border rounded">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 3 ? "bg-gray-100" : "bg-white",
                )}
                onClick={() => toggleSection(3)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">3</div>
                  <h3 className="font-medium">ラベルサイズを選ぶ</h3>
                </div>
                {selectedLabelSize && (
                  <div className="text-sm text-gray-600 mr-2">
                    {labelSizes.find((s) => s.id === selectedLabelSize)?.name}
                  </div>
                )}
                {expandedSection === 3 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 3 && (
                <div className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">ラベルサイズを選ぶ</h3>
                      <span className="text-sm text-gray-500">{selectedLabelSize}</span>
                    </div>
                    <div className="space-y-2">
                      {labelSizes.map((size) => (
                        <div
                          key={size.id}
                          className={cn(
                            "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                            selectedLabelSize === size.id
                              ? "border-red-600 bg-red-50"
                              : "border-gray-200 hover:border-red-600"
                          )}
                          onClick={() => setSelectedLabelSize(size.id)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{size.name}</div>
                            <div className="text-sm text-gray-500">{size.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="mb-4 border rounded">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 4 ? "bg-gray-100" : "bg-white",
                )}
                onClick={() => toggleSection(4)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">4</div>
                  <h3 className="font-medium">ラベル画像をアップロード</h3>
                </div>
                {uploadedImage && (
                  <div className="text-sm text-gray-600 mr-2">
                    画像がアップロードされています
                  </div>
                )}
                {expandedSection === 4 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 4 && (
                <div className="p-3">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 transition-colors mb-4",
                      isDragging ? "border-primary bg-primary/5" : "border-gray-300",
                      "hover:border-primary hover:bg-primary/5",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        ここにファイルをドラッグ＆ドロップ
                        <br />
                        または
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="w-40"
                      >
                        ファイルを選択
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mb-8">
                    <Button variant="outline" className="flex-1">
                      テンプレートを選択
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setSelectLater(true)}>
                      後でアップロードする
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      className="w-full sm:w-64 py-4 sm:py-6 text-lg rounded-full bg-primary hover:bg-primary/90 text-white"
                      disabled={!selectedFragrance || !selectedBottle || !selectedLabelSize}
                    >
                      注文する
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-lg font-medium">プレビュー</h2>
                {(uploadedImage || defaultLabelImage) && (
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditImage}
                      className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">画像を編集</span>
                      <span className="sm:hidden">編集</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">デフォルトに戻す</span>
                      <span className="sm:hidden">リセット</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedImage(null)}
                      className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="hidden sm:inline">削除</span>
                      <span className="sm:hidden">削除</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="aspect-[4/3] bg-gray-50 rounded-lg relative overflow-hidden">
                {/* ボトル背景 */}
                {selectedBottle && (
                  <div className="absolute inset-0 p-4 sm:p-8">
                    <img
                      src={bottles.find((b) => b.id === selectedBottle)?.image}
                      alt="ボトルプレビュー"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* ラベル枠とラベル画像 */}
                {selectedLabelSize && (
                  <div 
                    className="absolute"
                    style={{
                      width: `${labelSizes.find((s) => s.id === selectedLabelSize)?.width}cm`,
                      height: `${labelSizes.find((s) => s.id === selectedLabelSize)?.height}cm`,
                      left: '50%',
                      top: '60%',
                      transform: `translate(-50%, -50%) scale(${screenWidth > 0 && screenWidth < 640 ? 0.8 : 1})`
                    }}
                  >
                    {/* ラベル枠 */}
                    <div className="absolute inset-0 border-2 border-gray-300 rounded"></div>

                    {/* ラベル画像 */}
                    {(uploadedImage || defaultLabelImage) && (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg)`,
                        }}
                      >
                        <img
                          src={uploadedImage || defaultLabelImage}
                          alt="ラベル画像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Editor Modal */}
      {isEditorOpen && uploadedImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">画像を編集</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingImage(null)
                  setIsEditorOpen(false)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-auto">
              <ImageEditorComponent
                imageUrl={editingImage || uploadedImage}
                onSave={handleSaveEdit}
                onClose={() => {
                  setEditingImage(null)
                  setIsEditorOpen(false)
                }}
                labelSize={selectedLabelDimensions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

