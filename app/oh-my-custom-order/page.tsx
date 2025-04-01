"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, Upload, ChevronDown, ChevronUp, Image, Info, X, Type, Move, Trash, Edit2, RotateCcw, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LabelSize, TextElement, ImageTransform } from '../types'
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
  category: string
  emoji: string
  description: string
  notes: FragranceNote
}

interface Bottle {
  id: string
  name: string
  image: string
}

export default function PerfumeOrderingPage() {
  // State for selections
  const [expandedSection, setExpandedSection] = useState(1)
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null)
  const [selectedBottle, setSelectedBottle] = useState<'black' | 'clear'>('clear')
  const [selectedLabelSize, setSelectedLabelSize] = useState<LabelSize>('medium')
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectLater, setSelectLater] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeInfoId, setActiveInfoId] = useState<string | null>(null)
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
      id: "rose-blossom",
      name: "ローズブロッサム",
      category: "フローラル系",
      emoji: "🌸",
      description: "華やかで濃厚なフローラルに、甘さと温もりを添えて。ギフトにおすすめです。",
      notes: {
        top: ["ローズ", "ジャスミン"],
        middle: ["イランイラン", "バニラ"],
        last: ["サンダルウッド"]
      }
    },
    {
      id: "citrus-shower",
      name: "シトラスシャワー",
      category: "シトラス系",
      emoji: "🍋",
      description: "朝のシャワーのように清涼感あふれるフレッシュな香り。",
      notes: {
        top: ["レモン", "ベルガモット"],
        middle: ["タンジェリン", "ペパーミント"],
        last: ["シダーウッド"]
      }
    },
    {
      id: "sweet-dream",
      name: "スウィートドリーム",
      category: "スイート系",
      emoji: "🍯",
      description: "甘く優しい眠りを誘う、穏やかで包容力のある香り。",
      notes: {
        top: ["ベルガモット", "ジャスミン"],
        middle: ["バニラ", "イランイラン"],
        last: ["サンダルウッド", "パチュリ"]
      }
    },
    {
      id: "myrrh-night",
      name: "ミルラナイト",
      category: "オリエンタル系",
      emoji: "🕌",
      description: "神秘的な香煙のように、奥深く官能的な香り。",
      notes: {
        top: ["フランキンセンス"],
        middle: ["ミルラ", "カモミール"],
        last: ["バニラ", "パチュリ"]
      }
    },
    {
      id: "deep-forest",
      name: "ディープフォレスト",
      category: "ウッディ系",
      emoji: "🌲",
      description: "静かな森の奥で深呼吸するような、心落ち着く香り。",
      notes: {
        top: ["ジュニパー"],
        middle: ["ローズマリー", "カンファー"],
        last: ["ベチバー", "シダーウッド"]
      }
    },
    {
      id: "blue-wave",
      name: "ブルーウェイブ",
      category: "マリン系",
      emoji: "🌊",
      description: "海辺の風とハーブの清涼感が広がる、爽快マリン系。",
      notes: {
        top: ["ペパーミント", "シトロネラ"],
        middle: ["ジュニパー", "ローズマリー"],
        last: ["ベルガモット"]
      }
    },
    {
      id: "hot-spice",
      name: "ホットスパイス",
      category: "スパイシー系",
      emoji: "🌶",
      description: "心と身体を温める、エネルギッシュなスパイシー系。",
      notes: {
        top: ["シナモン", "クローブ"],
        middle: ["ジンジャー", "バニラ"],
        last: ["サンダルウッド"]
      }
    },
    {
      id: "herbal-green",
      name: "ハーバルグリーン",
      category: "ハーバル系",
      emoji: "🎨",
      description: "ハーブと木の力強さが調和した、爽やかで芯のある香り。",
      notes: {
        top: ["ジンジャー", "ペパーミント"],
        middle: ["ローズマリー", "クラリセージ"],
        last: ["シダーウッド", "ベチバー"]
      }
    },
    {
      id: "eternal-smoke",
      name: "エターナルスモーク",
      category: "スモーキー系",
      emoji: "🪵",
      description: "神聖でスモーキーな香りが長く残る、静謐なブレンド。",
      notes: {
        top: ["ミルラ"],
        middle: ["フランキンセンス", "ベチバー"],
        last: ["パチュリ", "サンダルウッド"]
      }
    },
    {
      id: "fruity-blossom",
      name: "フルーティブロッサム",
      category: "フルーティフローラル系",
      emoji: "💐",
      description: "花と果実のハーモニーが弾ける、明るく軽やかな香り。",
      notes: {
        top: ["レモン", "タンジェリン"],
        middle: ["ジャスミン", "イランイラン"],
        last: ["ローズ"]
      }
    }
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
  const selectedLabelDimensions = LABEL_SIZES[selectedLabelSize] || { width: 500, height: 700 }

  const handleSave = (imageUrl: string) => {
    console.log('Saved image:', imageUrl)
    setShowEditor(false)
  }

  // ラベルサイズのスケーリング係数を計算
  const getLabelScale = () => {
    if (screenWidth === 0) return 1;
    
    // プレビューエリアの実際のサイズを取得
    const previewElement = document.querySelector('.preview-container');
    if (!previewElement) return 1;
    
    const previewWidth = previewElement.clientWidth;
    const previewHeight = previewElement.clientHeight;
    
    // 基準となるサイズ（デスクトップでの表示サイズ）
    const baseWidth = 800; // デスクトップでのプレビュー幅
    
    // スケーリング係数を計算（アスペクト比を維持）
    const scale = previewWidth / baseWidth;
    
    // 最小・最大スケールを設定
    return Math.min(Math.max(scale, 0.5), 1.2);
  };

  // プレビューコンテナのref
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle template selection
  const handleTemplateSelect = () => {
    setUseTemplate(true)
    setUploadedImage(null)
    setImageTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5" />
            前の画面に戻る
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Fragrance Selection Section */}
            <div className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 1 ? "bg-gray-50" : "bg-white",
                )}
                onClick={() => toggleSection(1)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center mr-2 text-xs">1</div>
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
                            "border p-2 flex items-center cursor-pointer rounded-lg transition-colors",
                            selectedFragrance === fragrance.id ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-200 hover:border-[#FF6B6B]",
                          )}
                          onClick={() => setSelectedFragrance(fragrance.id)}
                        >
                          <div className="flex items-center mr-3">
                            {selectedFragrance === fragrance.id && (
                              <div className="bg-[#FF6B6B] text-white rounded-full p-1 mr-2">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-lg">
                              <span className="text-xl">{fragrance.emoji}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{fragrance.name}</h4>
                              <span className="text-xs text-gray-500">({fragrance.category})</span>
                            </div>
                            <p className="text-xs text-gray-600">{fragrance.description}</p>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div 
                                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                                onMouseEnter={(e) => handleInfoClick(e, fragrance.id)}
                              >
                                <Info className="h-5 w-5" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm text-gray-500">トップノート</h4>
                                  <p className="text-sm">{fragrance.notes.top.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-gray-500">ミドルノート</h4>
                                  <p className="text-sm">{fragrance.notes.middle.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-gray-500">ラストノート</h4>
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
            <div className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 2 ? "bg-gray-50" : "bg-white",
                )}
                onClick={() => toggleSection(2)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center mr-2 text-xs">2</div>
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
                          "border p-2 flex items-center cursor-pointer rounded-lg transition-colors",
                          selectedBottle === bottle.id ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-200 hover:border-[#FF6B6B]",
                        )}
                        onClick={() => setSelectedBottle(bottle.id as 'black' | 'clear')}
                      >
                        <div className="flex items-center mr-3">
                          {selectedBottle === bottle.id && (
                            <div className="bg-[#FF6B6B] text-white rounded-full p-1 mr-2">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-lg">
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
            <div className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 3 ? "bg-gray-50" : "bg-white",
                )}
                onClick={() => toggleSection(3)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center mr-2 text-xs">3</div>
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
                    <div className="space-y-2">
                      {labelSizes.map((size) => (
                        <div
                          key={size.id}
                          className={cn(
                            "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                            selectedLabelSize === size.id
                              ? "border-[#FF6B6B] bg-[#FF6B6B]/5"
                              : "border-gray-200 hover:border-[#FF6B6B]"
                          )}
                          onClick={() => setSelectedLabelSize(size.id as LabelSize)}
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
            <div className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 4 ? "bg-gray-50" : "bg-white",
                )}
                onClick={() => toggleSection(4)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center mr-2 text-xs">4</div>
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
                      "border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors mb-4",
                      isDragging ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-300",
                      "hover:border-[#FF6B6B] hover:bg-[#FF6B6B]/5",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto flex items-center justify-center">
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

                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleTemplateSelect}
                    >
                      テンプレートを選択
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      className="w-full sm:w-64 py-4 sm:py-6 text-lg rounded-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white"
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
            <div className="bg-white rounded-lg p-2 sm:p-6 shadow-sm">
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

              <div 
                ref={previewRef}
                className="aspect-[4/3] bg-gray-50 rounded-lg relative overflow-hidden preview-container"
              >
                {/* ボトル背景 */}
                {selectedBottle && (
                  <div className="absolute inset-0 p-2 sm:p-8">
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
                      transform: `translate(-50%, -50%) scale(${getLabelScale()})`
                    }}
                  >
                    {/* ラベル枠 */}
                    <div className="absolute inset-0 border-2 border-gray-300 rounded"></div>

                    {/* ラベル画像 */}
                    {(uploadedImage || (useTemplate && defaultLabelImage)) && (
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

