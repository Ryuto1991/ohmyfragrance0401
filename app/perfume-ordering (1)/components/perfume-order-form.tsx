"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Check, Upload, ChevronDown, ChevronUp, Image, Info, X, Type, Move, Trash } from "lucide-react"
import { cn } from "@/lib/utils"

// Define types for our selections
type Fragrance = {
  id: number
  name: string
  description: string
  notes: {
    top: string
    middle: string
    base: string
  }
}

type Bottle = {
  id: string
  name: string
  image: string
}

type LabelSize = {
  id: string
  name: string
  size: string
  dimensions: string
  ratio: {
    width: number
    height: number
  }
}

type Font = {
  id: string
  name: string
  value: string
  language: "jp" | "en" | "both"
}

type ImageTransform = {
  x: number
  y: number
  scale: number
  rotation: number
}

type TextElement = {
  id: string
  text: string
  font: string
  size: number
  color: string
  x: number
  y: number
  rotation: number
}

export default function PerfumeOrderForm() {
  // State for selections
  const [selectedFragrance, setSelectedFragrance] = useState<number | null>(null)
  const [selectedBottle, setSelectedBottle] = useState<string>("clear") // Default to clear glass
  const [selectedLabelSize, setSelectedLabelSize] = useState<string>("medium") // Default to medium size
  const [uploadedImage, setUploadedImage] = useState<string | null>("/placeholder.svg?height=150&width=150") // Default template
  const [isDragging, setIsDragging] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true) // Default to template
  const [selectLater, setSelectLater] = useState(false)
  const [activeInfoId, setActiveInfoId] = useState<number | null>(null)
  const [infoPosition, setInfoPosition] = useState({ top: 0, left: 0 })

  // State for text elements
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // State for image transformation
  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  })

  // State for editing mode
  const [editMode, setEditMode] = useState<"text" | "image" | null>("text") // Default to text mode

  // State for expanded sections
  const [expandedSection, setExpandedSection] = useState<number | null>(1)

  // 画像ロック状態の追加
  const [imageIsLocked, setImageIsLocked] = useState(false)

  // Refs
  const infoPopupRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const transformStartRef = useRef<ImageTransform | null>(null)
  const textDragRef = useRef<{ id: string; startX: number; startY: number } | null>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  // Sample data
  const fragrances: Fragrance[] = [
    {
      id: 1,
      name: "ラベンダードリーム",
      description: "落ち着くラベンダーとバニラのヒント",
      notes: {
        top: "ラベンダー、ベルガモット",
        middle: "ジャスミン、イランイラン",
        base: "バニラ、サンダルウッド",
      },
    },
    {
      id: 2,
      name: "オーシャンブリーズ",
      description: "さわやかな海の香り",
      notes: {
        top: "シトラス、海塩",
        middle: "ローズマリー、ジャスミン",
        base: "ムスク、アンバー",
      },
    },
    {
      id: 3,
      name: "シトラスバースト",
      description: "活力を与える柑橘系の香りのブレンド",
      notes: {
        top: "レモン、オレンジ、グレープフルーツ",
        middle: "ネロリ、ペチグレイン",
        base: "ベチバー、シダーウッド",
      },
    },
    {
      id: 4,
      name: "ローズガーデン",
      description: "上品なバラと微妙な花の香り",
      notes: {
        top: "ローズ、ベルガモット",
        middle: "ピオニー、ゼラニウム",
        base: "ムスク、パチョリ",
      },
    },
    {
      id: 5,
      name: "サンダルウッドミスト",
      description: "温かみのある木の香りとアンバーのアクセント",
      notes: {
        top: "カルダモン、ピンクペッパー",
        middle: "サンダルウッド、シダー",
        base: "アンバー、バニラ",
      },
    },
    {
      id: 6,
      name: "ジャスミンナイト",
      description: "エキゾチックなジャスミンと甘い香り",
      notes: {
        top: "ベルガモット、ネロリ",
        middle: "ジャスミン、イランイラン",
        base: "バニラ、ムスク",
      },
    },
    {
      id: 7,
      name: "シダー＆スパイス",
      description: "男性的なシダーとスパイスのブレンド",
      notes: {
        top: "ブラックペッパー、カルダモン",
        middle: "シダー、パチョリ",
        base: "レザー、ベチバー",
      },
    },
    {
      id: 8,
      name: "バニラスカイ",
      description: "甘いバニラとキャラメルの香り",
      notes: {
        top: "バニラ、キャラメル",
        middle: "ココナッツ、トンカビーン",
        base: "ムスク、アンバー",
      },
    },
    {
      id: 9,
      name: "フレッシュリネン",
      description: "クリーンでさわやかな綿の香り",
      notes: {
        top: "アルデヒド、オゾン",
        middle: "リリー、ラベンダー",
        base: "ムスク、シダー",
      },
    },
    {
      id: 10,
      name: "ベリーフュージョン",
      description: "ベリーと軽いムスクの甘いミックス",
      notes: {
        top: "ラズベリー、ブラックベリー",
        middle: "ローズ、ジャスミン",
        base: "バニラ、ムスク",
      },
    },
  ]

  const bottles: Bottle[] = [
    { id: "clear", name: "クリアガラス", image: "/placeholder.svg?height=200&width=100" },
    { id: "matte", name: "マットブラック", image: "/placeholder.svg?height=200&width=100" },
  ]

  const labelSizes: LabelSize[] = [
    {
      id: "large",
      name: "大",
      size: "ボトルの70%をカバー",
      dimensions: "縦5.0cm × 横4.0cm",
      ratio: { width: 4, height: 5 },
    },
    {
      id: "medium",
      name: "中",
      size: "ボトルの50%をカバー",
      dimensions: "縦4.0cm × 横3.2cm",
      ratio: { width: 3.2, height: 4 },
    },
    {
      id: "small",
      name: "小",
      size: "ボトルの30%をカバー",
      dimensions: "縦3.0cm × 横2.4cm",
      ratio: { width: 2.4, height: 3 },
    },
    {
      id: "square",
      name: "スクエア",
      size: "正方形のラベル",
      dimensions: "縦3.0cm × 横3.0cm",
      ratio: { width: 3, height: 3 },
    },
  ]

  const fonts: Font[] = [
    { id: "noto-sans-jp", name: "Noto Sans JP", value: "'Noto Sans JP', sans-serif", language: "jp" },
    { id: "mplus-rounded", name: "M PLUS Rounded 1c", value: "'M PLUS Rounded 1c', sans-serif", language: "jp" },
    { id: "sawarabi-mincho", name: "さわらび明朝", value: "'Sawarabi Mincho', serif", language: "jp" },
    { id: "kosugi-maru", name: "小杉丸ゴシック", value: "'Kosugi Maru', sans-serif", language: "jp" },
    { id: "roboto", name: "Roboto", value: "'Roboto', sans-serif", language: "en" },
    { id: "playfair", name: "Playfair Display", value: "'Playfair Display', serif", language: "en" },
    { id: "montserrat", name: "Montserrat", value: "'Montserrat', sans-serif", language: "en" },
    { id: "lora", name: "Lora", value: "'Lora', serif", language: "en" },
  ]

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setUseTemplate(false)
        setSelectLater(false)
        // Reset image transform when uploading a new image
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
        // Reset image transform when uploading a new image
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
  const handleInfoClick = (e: React.MouseEvent, fragranceId: number) => {
    e.stopPropagation()
    e.preventDefault()

    // Get the position of the clicked element
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    // Set the position for the popup
    setInfoPosition({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width + 10 + window.scrollX,
    })

    // Toggle the active info
    setActiveInfoId(activeInfoId === fragranceId ? null : fragranceId)
  }

  // Image transformation handlers
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (editMode !== "image" || imageIsLocked) return

    e.preventDefault()
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    transformStartRef.current = { ...imageTransform }

    document.addEventListener("mousemove", handleImageMouseMove)
    document.addEventListener("mouseup", handleImageMouseUp)
  }

  const handleImageMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !transformStartRef.current) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    setImageTransform({
      ...imageTransform,
      x: transformStartRef.current.x + dx,
      y: transformStartRef.current.y + dy,
    })
  }

  const handleImageMouseUp = () => {
    dragStartRef.current = null
    transformStartRef.current = null

    document.removeEventListener("mousemove", handleImageMouseMove)
    document.removeEventListener("mouseup", handleImageMouseUp)
  }

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = Number.parseFloat(e.target.value)
    setImageTransform({
      ...imageTransform,
      scale,
    })
  }

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rotation = Number.parseInt(e.target.value)
    setImageTransform({
      ...imageTransform,
      rotation,
    })
  }

  // テキスト要素の初期位置を計算する関数
  const calculateInitialTextPosition = () => {
    // ラベルの上部に配置（y座標をマイナス値に設定）
    return { x: 0, y: -40 }
  }

  // Text element handlers
  const addNewText = () => {
    const newId = `text-${Date.now()}`
    const initialPosition = calculateInitialTextPosition()

    const newText: TextElement = {
      id: newId,
      text: "新しいテキスト",
      font: "noto-sans-jp",
      size: 16,
      color: "#000000",
      x: initialPosition.x,
      y: initialPosition.y,
      rotation: 0,
    }

    setTextElements([...textElements, newText])
    setSelectedTextId(newId)
    setEditMode("text")
  }

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  // テキスト要素を削除する関数を修正
  const handleDeleteText = (e: React.MouseEvent) => {
    e.stopPropagation() // イベントの伝播を停止

    if (!selectedTextId) return

    // 削除前に他のテキスト要素があるか確認
    const newElements = textElements.filter((el) => el.id !== selectedTextId)

    // テキスト要素を削除
    setTextElements(newElements)

    // 削除後の処理
    if (newElements.length > 0) {
      // 他のテキスト要素があれば最初の要素を選択
      setSelectedTextId(newElements[0].id)
    } else {
      // 他のテキスト要素がなければ新しいテキスト要素を作成
      setTimeout(addNewText, 0)
    }
  }

  const handleTextMouseDown = (e: React.MouseEvent, id: string) => {
    if (editMode !== "text") return

    e.stopPropagation()
    const element = textElements.find((el) => el.id === id)
    if (!element) return

    setSelectedTextId(id)

    textDragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
    }

    document.addEventListener("mousemove", handleTextMouseMove)
    document.addEventListener("mouseup", handleTextMouseUp)
  }

  const handleTextMouseMove = (e: MouseEvent) => {
    if (!textDragRef.current) return

    const { id, startX, startY } = textDragRef.current
    const element = textElements.find((el) => el.id === id)
    if (!element) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY

    updateTextElement(id, {
      x: element.x + dx,
      y: element.y + dy,
    })

    textDragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
    }
  }

  const handleTextMouseUp = () => {
    textDragRef.current = null
    document.removeEventListener("mousemove", handleTextMouseMove)
    document.removeEventListener("mouseup", handleTextMouseUp)
  }

  // Reset image transform
  const resetImageTransform = () => {
    setImageTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    })
  }

  // 画像を消去してテンプレートに戻す関数
  const clearImage = () => {
    setUploadedImage("/placeholder.svg?height=150&width=150")
    setUseTemplate(true)
    resetImageTransform()
  }

  // Close info popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoPopupRef.current && !infoPopupRef.current.contains(event.target as Node)) {
        setActiveInfoId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle template selection
  const handleTemplateSelection = () => {
    setUseTemplate(true)
    setSelectLater(false)
    setUploadedImage("/placeholder.svg?height=150&width=150")
    resetImageTransform()
  }

  // Handle select later
  const handleSelectLater = () => {
    setSelectLater(true)
    setUseTemplate(false)
    setUploadedImage(null)
    resetImageTransform()
  }

  // Check if all selections are made
  const isOrderComplete =
    selectedFragrance !== null &&
    selectedBottle !== null &&
    selectedLabelSize !== null &&
    (uploadedImage !== null || selectLater)

  // Toggle section expansion
  const toggleSection = (sectionNumber: number) => {
    if (expandedSection === sectionNumber) {
      setExpandedSection(null)
    } else {
      setExpandedSection(sectionNumber)
    }
  }

  // Calculate label dimensions for preview
  const getLabelPreviewStyle = (sizeId: string | null) => {
    if (!sizeId) return {}

    const size = labelSizes.find((s) => s.id === sizeId)
    if (!size) return {}

    // サイズごとに異なる基本サイズを設定
    let baseWidth = 0
    switch (sizeId) {
      case "large":
        baseWidth = 160
        break
      case "medium":
        baseWidth = 120
        break
      case "small":
        baseWidth = 80
        break
      case "square":
        baseWidth = 100
        break
      default:
        baseWidth = 120
    }

    // 比率に基づいて高さを計算
    const width = baseWidth
    const height = (size.ratio.height / size.ratio.width) * baseWidth

    return {
      width: `${width}px`,
      height: `${height}px`,
    }
  }

  // Get image transform style
  const getImageTransformStyle = () => {
    return {
      transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg)`,
      transition: dragStartRef.current ? "none" : "transform 0.1s ease",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }
  }

  // Get font style for a text element
  const getTextElementStyle = (element: TextElement) => {
    const font = fonts.find((f) => f.id === element.font)
    return {
      fontFamily: font?.value || "'Noto Sans JP', sans-serif",
      fontSize: `${element.size}px`,
      color: element.color,
      transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
      cursor: editMode === "text" ? "move" : "default",
      position: "absolute",
      left: "50%",
      top: "50%",
      transformOrigin: "center",
      userSelect: "none",
      pointerEvents: "auto",
      whiteSpace: "nowrap",
    }
  }

  // Set edit mode
  const setEditModeAndTools = (mode: "text" | "image" | null) => {
    setEditMode(mode)
    if (mode === "text") {
      // テキストモードに切り替えたときに新しいテキストを追加
      addNewText()
    }
  }

  // Get the active fragrance
  const activeFragrance = activeInfoId ? fragrances.find((f) => f.id === activeInfoId) : null

  // Get the selected text element
  const selectedTextElement = selectedTextId ? textElements.find((el) => el.id === selectedTextId) : null

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-medium">加工箇所を選択してデザインしてください。</h2>

        <div className="flex mt-4 border-b">
          <button
            className={cn(
              "px-6 py-2 text-sm",
              "border-t border-l border-r",
              expandedSection === 1 ? "bg-gray-200" : "bg-white",
            )}
            onClick={() => setExpandedSection(1)}
          >
            商品に戻る
          </button>
          <button
            className={cn(
              "px-6 py-2 text-sm",
              "border-t border-l border-r",
              expandedSection === 2 ? "bg-gray-200" : "bg-white",
            )}
            onClick={() => setExpandedSection(2)}
          >
            加工方法に戻る
          </button>
          <button
            className={cn(
              "px-6 py-2 text-sm",
              "border-t border-l border-r",
              expandedSection === 3 || expandedSection === 4 ? "bg-red-600 text-white" : "bg-white",
            )}
            onClick={() => setExpandedSection(3)}
          >
            デザインする
          </button>
        </div>
      </div>

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
              {selectedFragrance !== null && (
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
                        <button
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center ml-2",
                            activeInfoId === fragrance.id ? "bg-red-100" : "hover:bg-gray-100",
                          )}
                          onClick={(e) => handleInfoClick(e, fragrance.id)}
                          aria-label="香りの詳細情報"
                        >
                          <Info
                            className={cn("h-4 w-4", activeInfoId === fragrance.id ? "text-red-500" : "text-gray-500")}
                          />
                        </button>
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
              {selectedBottle !== null && (
                <div className="text-sm text-gray-600 mr-2">{bottles.find((b) => b.id === selectedBottle)?.name}</div>
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
                          <img
                            src={bottle.image || "/placeholder.svg"}
                            alt={bottle.name}
                            className="h-8 object-contain"
                          />
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
              {selectedLabelSize !== null && (
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
                                    width: `${size.ratio.width * 1.5}px`,
                                    height: `${size.ratio.height * 1.5}px`,
                                  }
                                : {}
                            }
                          ></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{size.name}</h4>
                        <p className="text-xs text-gray-600">{size.dimensions}</p>
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
                  {useTemplate ? "テンプレート選択済み" : "画像アップロード済み"}
                </div>
              )}
              {selectLater && <div className="text-sm text-gray-600 mr-2">後から選択</div>}
              {expandedSection === 4 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            {expandedSection === 4 && (
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-3">
                  <p>推奨解像度: 591 × 472 px</p>
                  <p>ファイル形式: PNG, JPG（300dpi）</p>
                </div>
                <div
                  className={cn(
                    "border-2 border-dashed rounded p-4 flex flex-col items-center justify-center h-48",
                    isDragging ? "border-red-600 bg-red-50" : "border-gray-300",
                    "transition-all",
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-center mb-2 text-sm">ここに画像をドラッグ＆ドロップするか、</p>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-red-600 font-medium text-sm">ファイルを参照</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    この画像は後からプロフィールページで変更できます
                  </p>
                </div>

                <div className="flex mt-3 space-x-2">
                  <button
                    className={cn(
                      "flex-1 py-2 text-sm border flex items-center justify-center",
                      useTemplate ? "bg-red-50 border-red-600 text-red-600" : "",
                    )}
                    onClick={handleTemplateSelection}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    テンプレートを選択
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 text-sm border flex items-center justify-center",
                      selectLater ? "bg-red-50 border-red-600 text-red-600" : "",
                    )}
                    onClick={handleSelectLater}
                  >
                    後から選択する
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className={cn("w-full py-3 text-center text-white", isOrderComplete ? "bg-red-600" : "bg-gray-300")}
            disabled={!isOrderComplete}
          >
            注文する
          </button>
        </div>

        <div className="lg:col-span-3 flex flex-col">
          <div className="flex-1 border p-4 relative bg-gray-50 min-h-[500px]">
            {/* プレビューとツールの横並びレイアウト */}
            <div className="flex h-full">
              {/* プレビュー部分 */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <img
                    src={bottles.find((b) => b.id === selectedBottle)?.image || "/placeholder.svg?height=300&width=150"}
                    alt="ボトルプレビュー"
                    className="h-[400px] object-contain"
                  />
                  {selectedLabelSize && (
                    <div
                      ref={labelRef}
                      className={cn(
                        "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-red-300 border-dashed overflow-hidden",
                        editMode === "image" ? "cursor-move" : "",
                      )}
                      style={getLabelPreviewStyle(selectedLabelSize)}
                    >
                      {/* Image Layer */}
                      {uploadedImage && !selectLater ? (
                        <div
                          ref={imageRef}
                          className="absolute inset-0 bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url(${uploadedImage})`,
                            ...getImageTransformStyle(),
                          }}
                          onMouseDown={handleImageMouseDown}
                        />
                      ) : !selectLater ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          <div className="text-xs text-gray-400 text-center">画像をアップロードしてください</div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          後から選択
                        </div>
                      )}

                      {/* Text Elements */}
                      {textElements.map((element) => (
                        <div
                          key={element.id}
                          className={cn(
                            "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
                            selectedTextId === element.id ? "ring-2 ring-blue-500" : "",
                          )}
                          style={getTextElementStyle(element)}
                          onMouseDown={(e) => handleTextMouseDown(e, element.id)}
                          onClick={() => {
                            if (editMode === "text") {
                              setSelectedTextId(element.id)
                            }
                          }}
                        >
                          {element.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 右側の編集ツール */}
              <div className="w-64 border-l p-4">
                <div className="space-y-6">
                  {/* 編集ツールボタン */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm border-b pb-2">編集ツール</h4>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        className={cn(
                          "flex items-center p-2 rounded",
                          editMode === "text" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600",
                        )}
                        onClick={() => setEditModeAndTools("text")}
                      >
                        <Type className="h-5 w-5 mr-2" />
                        <span className="text-sm">テキスト追加</span>
                      </button>
                      <button
                        className={cn(
                          "flex items-center p-2 rounded",
                          editMode === "image" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600",
                        )}
                        onClick={() => setEditModeAndTools("image")}
                      >
                        <Move className="h-5 w-5 mr-2" />
                        <span className="text-sm">画像編集</span>
                      </button>
                    </div>
                  </div>

                  {/* テキスト編集パネル */}
                  {editMode === "text" && selectedTextElement && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm border-b pb-2">テキスト編集</h4>
                        <button className="text-red-600" onClick={handleDeleteText} aria-label="テキストを削除">
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">テキスト</label>
                        <input
                          type="text"
                          value={selectedTextElement.text}
                          onChange={(e) => updateTextElement(selectedTextElement.id, { text: e.target.value })}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="テキストを入力"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">フォント</label>
                        <select
                          value={selectedTextElement.font}
                          onChange={(e) => updateTextElement(selectedTextElement.id, { font: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {fonts.map((font) => (
                            <option key={font.id} value={font.id}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">色</label>
                        <input
                          type="color"
                          value={selectedTextElement.color}
                          onChange={(e) => updateTextElement(selectedTextElement.id, { color: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">サイズ: {selectedTextElement.size}px</label>
                        <input
                          type="range"
                          min="8"
                          max="36"
                          value={selectedTextElement.size}
                          onChange={(e) => updateTextElement(selectedTextElement.id, { size: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          回転: {selectedTextElement.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedTextElement.rotation}
                          onChange={(e) =>
                            updateTextElement(selectedTextElement.id, { rotation: Number(e.target.value) })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* 画像編集パネル */}
                  {editMode === "image" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm border-b pb-2">画像編集</h4>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="lock-image"
                            checked={imageIsLocked}
                            onChange={(e) => setImageIsLocked(e.target.checked)}
                            className="mr-1"
                          />
                          <label htmlFor="lock-image" className="text-xs">
                            画像をロックする
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          拡大・縮小: {Math.round(imageTransform.scale * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={imageTransform.scale}
                          onChange={handleScaleChange}
                          className="w-full"
                          disabled={imageIsLocked}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">回転: {imageTransform.rotation}°</label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={imageTransform.rotation}
                          onChange={handleRotationChange}
                          className="w-full"
                          disabled={imageIsLocked}
                        />
                      </div>

                      <div className="flex justify-between">
                        <button
                          className="px-3 py-1 bg-gray-100 rounded text-sm"
                          onClick={resetImageTransform}
                          disabled={imageIsLocked}
                        >
                          リセット
                        </button>
                        <button
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-sm"
                          onClick={clearImage}
                        >
                          画像を消去
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center space-x-4">
            <button className="border px-4 py-2 text-sm">このデザインを保存する</button>
            <button
              className={cn("px-4 py-2 text-sm text-white", isOrderComplete ? "bg-red-600" : "bg-gray-300")}
              disabled={!isOrderComplete}
            >
              このデザインで注文する
            </button>
          </div>
        </div>
      </div>

      {/* Fixed position info popup */}
      {activeInfoId !== null && activeFragrance && (
        <div
          ref={infoPopupRef}
          className="fixed bg-white border shadow-xl rounded-md p-4 z-50"
          style={{
            top: `${infoPosition.top}px`,
            left: `${infoPosition.left}px`,
            maxWidth: "300px",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-medium text-sm text-red-600">{activeFragrance.name}のノート</h5>
            <button onClick={() => setActiveInfoId(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="border-l-2 border-red-200 pl-2">
              <p className="text-xs font-medium text-gray-700">トップノート</p>
              <p className="text-xs text-gray-600">{activeFragrance.notes.top}</p>
            </div>
            <div className="border-l-2 border-red-200 pl-2">
              <p className="text-xs font-medium text-gray-700">ミドルノート</p>
              <p className="text-xs text-gray-600">{activeFragrance.notes.middle}</p>
            </div>
            <div className="border-l-2 border-red-200 pl-2">
              <p className="text-xs font-medium text-gray-700">ラストノート</p>
              <p className="text-xs text-gray-600">{activeFragrance.notes.base}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

