"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, Upload, ChevronDown, ChevronUp, Image, Info, X, Type, Move, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

interface LabelSize {
  id: string
  name: string
  size: {
    width: number
    height: number
  }
  description: string
}

export default function PerfumeOrderingPage() {
  // State for selections
  const [expandedSection, setExpandedSection] = useState(1)
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null)
  const [selectedBottle, setSelectedBottle] = useState("clear")
  const [selectedLabelSize, setSelectedLabelSize] = useState("medium")
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
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)

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
    { id: "clear", name: "クリアガラス", image: "/placeholder.svg" },
    { id: "matte", name: "マットブラック", image: "/placeholder.svg" },
  ]

  const labelSizes: LabelSize[] = [
    {
      id: "large",
      name: "大",
      size: {
        width: 4.0,
        height: 5.0
      },
      description: "縦5.0cm × 横4.0cm"
    },
    {
      id: "medium",
      name: "中",
      size: {
        width: 3.2,
        height: 4.0
      },
      description: "縦4.0cm × 横3.2cm"
    },
    {
      id: "small",
      name: "小",
      size: {
        width: 2.4,
        height: 3.0
      },
      description: "縦3.0cm × 横2.4cm"
    },
    {
      id: "square",
      name: "スクエア",
      size: {
        width: 3.0,
        height: 3.0
      },
      description: "縦3.0cm × 横3.0cm"
    }
  ]

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

  const handleImageEdit = () => {
    if (uploadedImage) {
      setIsImageEditorOpen(true)
    }
  }

  const handleImageSave = (editedImageUrl: string) => {
    setUploadedImage(editedImageUrl)
    setIsImageEditorOpen(false)
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
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
                        onClick={() => setSelectedBottle(bottle.id)}
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
                    {labelSizes.map((size) => (
                      <div
                        key={size.id}
                        className={cn(
                          "border p-2 flex items-center cursor-pointer",
                          selectedLabelSize === size.id ? "border-red-600" : "",
                        )}
                        onClick={() => setSelectedLabelSize(size.id)}
                      >
                        <div className="flex items-center mr-3">
                          {selectedLabelSize === size.id && (
                            <div className="bg-red-600 text-white rounded-full p-1 mr-2">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                            <div
                              className={cn("bg-gray-300 rounded", size.id === "square" ? "h-6 w-6" : "")}
                              style={
                                size.id !== "square"
                                  ? {
                                      width: `${size.size.width * 1.5}px`,
                                      height: `${size.size.height * 1.5}px`,
                                    }
                                  : {}
                              }
                            ></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{size.name}</h4>
                          <p className="text-xs text-gray-600">{size.description}</p>
                        </div>
                      </div>
                    ))}
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
                      className="w-64 py-6 text-lg rounded-full bg-primary hover:bg-primary/90 text-white"
                      disabled={!selectedFragrance || !selectedBottle || !selectedLabelSize}
                    >
                      注文する
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Preview Area */}
            <div className="sticky top-4">
              <div className="bg-white border rounded-lg p-4">
                <h2 className="text-lg font-medium mb-4">プレビュー</h2>
                <div className="aspect-[4/3] bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {selectedBottle && (
                    <div className="relative w-full h-full">
                      <img
                        src={bottles.find((b) => b.id === selectedBottle)?.image}
                        alt="ボトルプレビュー"
                        className="w-full h-full object-contain"
                      />
                      {selectedLabelSize && (uploadedImage || selectedTemplate) && (
                        <div
                          className="absolute"
                          style={{
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg)`,
                          }}
                        >
                          <div
                            className="border border-gray-300"
                            style={{
                              width: `${labelSizes.find((s) => s.id === selectedLabelSize)?.size.width}px`,
                              height: `${labelSizes.find((s) => s.id === selectedLabelSize)?.size.height}px`,
                            }}
                          >
                            {uploadedImage && (
                              <img
                                src={uploadedImage}
                                alt="アップロードされた画像"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tool Panel */}
                {selectedBottle && selectedLabelSize && (uploadedImage || selectedTemplate) && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleImageEdit}>
                          画像編集
                        </Button>
                        <Button variant="outline" size="sm">
                          テキスト編集
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          リセット
                        </Button>
                        <Button variant="outline" size="sm">
                          削除
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">拡大・縮小</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={imageTransform.scale}
                          onChange={(e) =>
                            setImageTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">回転</span>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={imageTransform.rotation}
                          onChange={(e) =>
                            setImageTransform((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Editor Modal */}
      {isImageEditorOpen && uploadedImage && (
        <ImageEditorComponent
          imageUrl={uploadedImage}
          onSave={handleImageSave}
          onClose={() => setIsImageEditorOpen(false)}
        />
      )}
    </div>
  )
}

