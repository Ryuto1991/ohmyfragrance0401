"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, Upload, ChevronDown, ChevronUp, Image, Info, X, Move, RotateCcw, ChevronLeft, RotateCw, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LabelSize } from '@/app/types'
import { LABEL_SIZES } from '@/app/utils/size-utils'
import WelcomePopup from '@/components/welcome-popup'
import { useStripeCart } from '@/contexts/stripe-cart-context'
import { useCartDrawer } from '@/contexts/cart-drawer-context'
import StripeCartButton from '@/components/stripe-cart-button'
import StripeCartDrawer from '@/components/stripe-cart-drawer'
import { loadStripe } from '@stripe/stripe-js'
import { uploadImage } from './actions'
import { toast } from "@/components/ui/use-toast"
import { savePreviewImage } from './utils/savePreviewImage'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { compressImage, validateImageType, validateFileSize, getImageDimensions } from './utils/imageCompression'


// --- ImageUploadSection Component Definition ---
interface ImageUploadSectionProps {
  isAgreed: boolean;
  setIsAgreed: (value: boolean) => void;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileUpload: (file: File) => void;
  handleTemplateSelect: () => void;
  uploadedImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  isAgreed,
  setIsAgreed,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileUpload,
  handleTemplateSelect,
  uploadedImage,
  fileInputRef
}) => {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors",
          isDragging ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-300",
          "hover:border-[#FF6B6B] hover:bg-[#FF6B6B]/5",
          !isAgreed && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={(e) => {
          if (!isAgreed) {
            e.preventDefault();
            return;
          }
          handleDragOver(e);
        }}
        onDragLeave={() => {
          if (!isAgreed) return;
          handleDragLeave();
        }}
        onDrop={(e) => {
          if (!isAgreed) {
            e.preventDefault();
            toast({
              title: "画像利用の同意が必要です",
              description: "著作権に関する注意事項に同意してください。",
              variant: "destructive",
            });
            return;
          }
          handleDrop(e);
        }}
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">推奨サイズ: 600 × 480 px以上</p>
            <p className="text-xs mb-2">対応フォーマット: PNG, JPG（300dpi）</p>
            <p className="text-xs mb-2">ファイルサイズ制限: 5MBまで</p>
            <p className="text-xs text-gray-500">
              ここにファイルをドラッグ＆ドロップ
              <br />
              または
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (!isAgreed) {
                  toast({
                    title: "画像利用の同意が必要です",
                    description: "著作権に関する注意事項に同意してください。",
                    variant: "destructive",
                  });
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={!isAgreed}
            >
              {uploadedImage ? '画像を変更' : '画像をアップロード'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              disabled={!isAgreed}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleTemplateSelect}
        >
          テンプレートを選択
        </Button>
      </div>

      {/* 著作権に関する注意書き */}
      <p className="text-xs text-gray-500 mt-2">
        ※ 著作権を侵害する画像（アニメキャラ、芸能人、ブランドロゴ等）の使用は禁止されています。
        <br />
        ※ 利用規約に違反する画像を使った注文は、キャンセルさせていただくことがあります。
      </p>

      {/* 同意チェックボックス */}
      <div className="flex items-start mt-4">
        <input
          type="checkbox"
          id="copyright-agree"
          className="mr-2 mt-1 h-4 w-4 accent-red-500 border-2 border-red-500"
          required
          checked={isAgreed}
          onChange={() => setIsAgreed(!isAgreed)}
        />
        <label htmlFor="copyright-agree" className="text-sm text-red-500 font-medium">
          アップロードする画像が第三者の権利を侵害していないことを確認しました
        </label>
      </div>
    </div>
  );
};
// --- End of ImageUploadSection Component Definition ---


// --- PreviewControls Component Definition ---
interface PreviewControlsProps {
  isMoving: boolean;
  setIsMoving: (value: boolean) => void;
  handleRotateLeft: () => void;
  handleRotateRight: () => void;
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  isMoving,
  setIsMoving,
  handleRotateLeft,
  handleRotateRight,
}) => {
  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMoving(!isMoving)}
        className={`flex items-center gap-2 flex-1 sm:flex-none justify-center ${isMoving ? 'bg-gray-100' : ''}`}
      >
        <Move className="h-4 w-4" />
        <span className="hidden sm:inline">移動</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRotateLeft}
        className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">左回転</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRotateRight}
        className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
      >
        <RotateCw className="h-4 w-4" />
        <span className="hidden sm:inline">右回転</span>
      </Button>
    </div>
  );
};
// --- End of PreviewControls Component Definition ---


interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  shippingMethod: string;
  shippingDate: string;
  giftWrapping: boolean;
  giftMessage: string;
}

interface Fragrance {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  notes: {
    top: string[];
    middle: string[];
    last: string[];
  };
}

interface Bottle {
  id: string
  name: string
  image: string
  price: number
}

type OrderMode = 'lab' | 'custom';

interface Recipe {
  name: string
  description: string
  top_notes: string[]
  middle_notes: string[]
  base_notes: string[]
  mode: OrderMode
}

interface CartItem {
  priceId: string;
  customProductId: string;
  name: string;
  price: number;
  image: string;
  customDetails: {
    fragranceId: string;
    fragranceName: string;
    bottleId: string;
    bottleName: string;
    labelSize: string;
    labelType: 'template' | 'original';
    labelImageUrl: string;
    imageTransform: {
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };
    // 追加: recipe, originalImageUrl, imageKey, finalImageKeyをcustomDetailsに追加
    recipe: string;
    originalImageUrl: string;
    imageKey: string | null;
    finalImageKey: string | null;
  }; // ここが customDetails の閉じ括弧
  quantity?: number;
} // ここが CartItem の閉じ括弧

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const ImageEditorComponent = dynamic(() => import("@/app/components/image-editor"), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

// Supabaseクライアントをグローバルに初期化
const supabase = createClientComponentClient()

export default function PerfumeOrderingPage() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') || 'custom'
  const mode: OrderMode = initialMode === 'lab' ? 'lab' : 'custom'
  const recipeParam = searchParams.get('recipe')
  const [aiGeneratedFragrance, setAiGeneratedFragrance] = useState<Fragrance | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAgreed, setIsAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: '',
    shippingMethod: '',
    shippingDate: '',
    giftWrapping: false,
    giftMessage: ''
  })
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null)
  const [selectedBottle, setSelectedBottle] = useState<string>('clear')
  const [selectedLabelSize, setSelectedLabelSize] = useState<string>('medium')
  const [selectedLabelType, setSelectedLabelType] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [uploadedImage, setUploadedImage] = useState<string>('/labels/Template_label.png')
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('') // オリジナル画像URL用のstateを追加
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('')
  const [useTemplate, setUseTemplate] = useState(true)

  // AIで生成された香りのデータを取得
  useEffect(() => {
    console.log('Current mode:', mode);
    if (mode === 'lab') {
      try {
        const savedRecipe = localStorage.getItem('selected_recipe');
        if (!savedRecipe) {
          console.error('レシピデータがローカルストレージに見つかりません。');
          setError('レシピデータが見つかりません。再度チャットから香りを作成してください。');
          return;
        }
        
        const parsedRecipe = JSON.parse(savedRecipe);
        console.log('Loaded recipe from localStorage:', parsedRecipe);
        
        // レシピデータの検証（フィールド名の変換に対応）
        const hasOldFormat = parsedRecipe.top !== undefined || parsedRecipe.middle !== undefined || parsedRecipe.base !== undefined;
        const hasNewFormat = parsedRecipe.top_notes !== undefined || parsedRecipe.middle_notes !== undefined || parsedRecipe.base_notes !== undefined;
        
        if (!hasOldFormat && !hasNewFormat) {
          console.error('レシピデータの形式が不正です。', parsedRecipe);
          setError('レシピデータの形式が不正です。再度チャットから香りを作成してください。');
          return;
        }
        
        // レシピデータを正規化（古い形式と新しい形式の両方に対応）
        const normalizedRecipe = {
          name: parsedRecipe.name || "カスタムルームフレグランス",
          description: parsedRecipe.description || "あなただけのオリジナルの香り",
          top_notes: parsedRecipe.top_notes || (Array.isArray(parsedRecipe.top) ? parsedRecipe.top : []),
          middle_notes: parsedRecipe.middle_notes || (Array.isArray(parsedRecipe.middle) ? parsedRecipe.middle : []),
          base_notes: parsedRecipe.base_notes || (Array.isArray(parsedRecipe.base) ? parsedRecipe.base : []),
          mode: 'lab' as OrderMode
        };
        
        setRecipe(normalizedRecipe);
        
        // Fragranceオブジェクトの作成
        const labFragrance = {
          id: 'lab-generated',
          name: normalizedRecipe.name || "カスタムルームフレグランス",
          category: 'AIブレンド系',
          emoji: '✨',
          description: normalizedRecipe.description || "あなただけのオリジナルの香り",
          notes: {
            top: normalizedRecipe.top_notes,
            middle: normalizedRecipe.middle_notes,
            last: normalizedRecipe.base_notes
          }
        };
        
        setAiGeneratedFragrance(labFragrance);
        setSelectedFragrance(labFragrance);
        console.log('AIで生成された香りデータをセットしました:', labFragrance);
      } catch (error) {
        console.error('レシピデータの処理中にエラーが発生しました:', error);
        setError('レシピデータの読み込みに失敗しました。再度チャットから香りを作成してください。');
      }
    }
  }, [mode]);

  const saveRecipeToSupabase = async (recipeData: Recipe) => {
    try {
      // レシピデータの検証
      if (!recipeData || !recipeData.top_notes || !recipeData.middle_notes || !recipeData.base_notes) {
        console.error('保存するレシピデータが不完全です:', recipeData);
        return;
      }
      
      const { error } = await supabase
        .from('recipes')
        .insert([
          {
            name: recipeData.name || "カスタムルームフレグランス",
            description: recipeData.description || "あなただけのオリジナルの香り",
            top_notes: recipeData.top_notes,
            middle_notes: recipeData.middle_notes,
            base_notes: recipeData.base_notes,
            mode: recipeData.mode
          }
        ]);

      if (error) {
        console.error('Error saving to Supabase:', error);
        toast({
          title: "レシピの保存に失敗しました",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "レシピを保存しました",
          description: "香りのレシピがデータベースに保存されました",
        });
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      toast({
        title: "エラーが発生しました",
        description: "レシピの保存中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    try {
      // カスタムモードの場合はlocalStorageのチェックをスキップ
      if (mode === 'custom') {
        setRecipe({
          name: '',
          description: '',
          top_notes: [],
          middle_notes: [],
          base_notes: [],
          mode: 'custom'
        })
        return
      }

      const saved = localStorage.getItem('selected_recipe')
      if (saved) {
        const parsed = JSON.parse(saved)
        const recipeData = {
          ...parsed,
          mode: mode as 'generator' | 'chat' | 'custom'
        };
        setRecipe(recipeData);
        // Supabaseにも保存
        saveRecipeToSupabase(recipeData);
      } else {
        setError('レシピデータが見つかりません。')
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
      setError('レシピデータの読み込みに失敗しました。')
    }
  }, [mode])

  const { addToCart } = useStripeCart()
  const { openCart } = useCartDrawer()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems } = useStripeCart()
  // デフォルトのラベル画像をテンプレートラベルに変更
  const defaultLabelImage = "/labels/Template_label.png"

  // State for selections
  const [expandedSection, setExpandedSection] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectLater, setSelectLater] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeInfoId, setActiveInfoId] = useState<string | null>(null)
  const [infoPosition, setInfoPosition] = useState<{ top: number; left: number } | null>(null)
  const [imageTransform, setImageTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  })
  const [screenWidth, setScreenWidth] = useState(0)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [initialImageSize, setInitialImageSize] = useState<{ width: number; height: number } | null>(null)
  const [imageKey, setImageKey] = useState<string | null>(null)
  const [finalImageKey, setFinalImageKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "エラーが発生しました",
        description: "画像のアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsLoading(true);

      // ファイルサイズチェック (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ファイルサイズが大きすぎます",
          description: "5MB以下の画像を選択してください。",
          variant: "destructive",
        })
        return;
      }

      // ファイル形式チェック
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: "対応していないファイル形式です",
          description: "PNG、JPG形式の画像を選択してください。",
          variant: "destructive",
        })
        return;
      }

      const result = await uploadImage(file);
      if (!result.success) {
        throw new Error(result.error || "アップロードに失敗しました");
      }

      setImageKey(result.imageKey!);
      setFinalImageKey(result.finalKey!);
      setUploadedImage(result.publicUrl!);
      setOriginalImageUrl(result.publicUrl!); // オリジナル画像URLをセット
      setUseTemplate(false);
      setSelectLater(false);
      setImageTransform({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "画像のアップロードに失敗しました。時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  const selectedLabelDimensions = LABEL_SIZES[selectedLabelSize as LabelSize] || { width: 500, height: 700 }

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
    if (!isAgreed) {
      toast({
        title: "画像利用の同意が必要です",
        description: "著作権に関する注意事項に同意してください。",
        variant: "destructive",
      })
      return
    }
    setUseTemplate(true)
    setUploadedImage(defaultLabelImage)
    setImageTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    })
    // テンプレート選択時はキーとURLをリセット（または 'template' など特別な値に）
    setImageKey(null); // 実際のStorageキーではないのでnull
    setFinalImageKey(null); // 実際のStorageキーではないのでnull
    setOriginalImageUrl(''); // オリジナルURLもないので空文字
    setUploadedImage(defaultLabelImage); // 表示はテンプレート画像
  }

  // 画像の最小スケールを計算
  const calculateMinScale = (imgWidth: number, imgHeight: number, labelWidth: number, labelHeight: number) => {
    const widthScale = labelWidth / imgWidth
    const heightScale = labelHeight / imgHeight
    return Math.max(widthScale, heightScale)
  }

  // 画像読み込み時のサイズ設定
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    setInitialImageSize({ width: img.naturalWidth, height: img.naturalHeight })
    
    const currentLabel = labelSizes.find(s => s.id === selectedLabelSize)
    if (currentLabel) {
      // ラベルサイズに合わせて画像を自動調整（ピクセル換算）
      const labelWidth = currentLabel.width * 37.795275591 // cmをピクセルに変換
      const labelHeight = currentLabel.height * 37.795275591
      
      // 画像のアスペクト比を維持しながら、ラベルに収まるように調整
      const widthRatio = labelWidth / img.naturalWidth
      const heightRatio = labelHeight / img.naturalHeight
      const scale = Math.min(2, Math.max(1, Math.max(widthRatio, heightRatio) * 1.2)) // 最小1倍、最大2倍、20%大きめに
      
      setImageTransform(prev => ({
        ...prev,
        scale: scale,
        x: 0,
        y: 0
      }))
    }
  }

  // 画像の移動とリサイズの処理
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!isMoving) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStart({
      x: e.clientX - imageTransform.x,
      y: e.clientY - imageTransform.y
    })
  }

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isMoving || !dragStart) return
    e.preventDefault()

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // 移動範囲の制限
    const currentLabel = labelSizes.find(s => s.id === selectedLabelSize)
    if (!currentLabel || !initialImageSize) return

    const labelWidth = currentLabel.width * 37.795275591
    const labelHeight = currentLabel.height * 37.795275591
    const scaledImageWidth = initialImageSize.width * imageTransform.scale
    const scaledImageHeight = initialImageSize.height * imageTransform.scale
    
    // 移動可能な最大範囲を計算
    const maxX = Math.max(0, (scaledImageWidth - labelWidth) / 2)
    const maxY = Math.max(0, (scaledImageHeight - labelHeight) / 2)

    setImageTransform(prev => ({
      ...prev,
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    }))
  }

  const handleImageMouseUp = () => {
    setDragStart(null)
  }

  const handleImageMouseLeave = () => {
    setDragStart(null)
  }

  const handleRotateLeft = () => {
    setImageTransform(prev => ({
      ...prev,
      rotation: (prev.rotation - 90) % 360
    }))
  }

  const handleRotateRight = () => {
    setImageTransform(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }))
  }

  const handleScale = (value: number) => {
    setImageTransform(prev => ({
      ...prev,
      scale: value
    }))
  }

  // カスタム商品のIDを生成する関数
  const generateCustomProductId = (fragranceId: string, bottleId: string) => {
    return `custom_${fragranceId}_${bottleId}_${Date.now()}`;
  };

  const getPriceIdByMode = (mode: OrderMode) => {
    switch (mode) {
      case 'lab':
        return 'price_1R8bHVE0t3PGpOQ5Mbc0MzFd';
      case 'custom':
        return 'price_1R9QuLE0t3PGpOQ5VMQyu3po';
      default:
        return 'price_1R9QuLE0t3PGpOQ5VMQyu3po';
    }
  };

  const handleOrder = async () => {
    try {
      setIsLoading(true);

      if (!selectedFragrance || !selectedBottle) {
        throw new Error('香水とボトルを選択してください');
      }

      if (!uploadedImage) {
        throw new Error('ラベル画像をアップロードしてください');
      }

      const selectedFragranceData = mode === 'lab' ? aiGeneratedFragrance : fragrances.find(f => f.id === selectedFragrance.id);
      const selectedBottleData = bottles.find(b => b.id === selectedBottle);

      if (!selectedFragranceData || !selectedBottleData) {
        throw new Error('選択された商品が見つかりません');
      }

      const customProductId = generateCustomProductId(selectedFragrance.id, selectedBottle);
      await savePreviewImage(customProductId);

      const cartItem: CartItem = {
        priceId: getPriceIdByMode(mode),
        customProductId,
        name: `${selectedFragranceData.name} - ${selectedBottleData.name}`,
        price: selectedBottleData.price,
        image: uploadedImage,
        customDetails: {
          fragranceId: selectedFragrance.id,
          fragranceName: selectedFragranceData.name,
          bottleId: selectedBottle,
          bottleName: selectedBottleData.name,
          labelSize: selectedLabelSize,
          labelType: useTemplate ? 'template' : 'original',
          labelImageUrl: uploadedImage,
          imageTransform: {
            x: imageTransform.x,
            y: imageTransform.y,
            scale: imageTransform.scale,
            rotation: imageTransform.rotation
          },
          // recipe, originalImageUrl, imageKey, finalImageKeyを追加
          recipe: recipe ? JSON.stringify(recipe) : '',
          originalImageUrl: originalImageUrl,
          imageKey: imageKey, // imageKeyを追加
          finalImageKey: finalImageKey, // finalImageKeyを追加
        }
      };

      console.log("Adding to cart:", cartItem); // デバッグ用ログ追加

      addToCart(cartItem);
      setIsCartOpen(true);

    } catch (error) {
      console.error('Error in handleOrder:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "注文処理中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 注文ボタンの条件を更新
  const isOrderButtonDisabled = !selectedFragrance || !selectedBottle || !uploadedImage || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedFragrance) {
        throw new Error('香水を選択してください');
      }

      // 注文データをSupabaseに保存（初期データのみ）
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            product_name: selectedFragrance.name,
            product_description: selectedFragrance.description,
            bottle_type: selectedBottle,
            label_size: selectedLabelSize,
            label_type: selectedLabelType,
            total_amount: totalAmount,
            payment_status: 'pending',
            original_image_url: uploadedImage,
            cropped_image_url: croppedImageUrl,
            mode: mode,
            order_status: 'pending'  // 注文状態を追加
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Stripe Checkoutセッションを作成
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          totalAmount: totalAmount,
          mode: mode,
          priceId: getPriceIdByMode(mode)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('注文の処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto text-center">
            <p>読み込み中...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <WelcomePopup />
      <div className="fixed top-4 right-4 z-50">
        <Link href="/cart" className="relative">
          <ShoppingCart className="h-6 w-6 text-gray-600" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Link>
      </div>
      <StripeCartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => window.location.href = '/'}
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
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs",
                    selectedFragrance ? "bg-green-500 text-white" : "bg-[#FF6B6B] text-white"
                  )}>
                    {selectedFragrance ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <h3 className="font-medium">香りを選ぶ</h3>
                </div>
                {selectedFragrance && (
                  <div className="text-sm text-gray-600 mr-2">
                    {selectedFragrance.name}
                  </div>
                )}
                {expandedSection === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 1 && (
                <div className="p-3">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mode === 'lab' && aiGeneratedFragrance ? (
                      <div className="relative">
                        <div className="border p-2 flex items-center rounded-lg border-[#FF6B6B] bg-[#FF6B6B]/5">
                          <div className="flex items-center mr-3">
                            <div className="bg-[#FF6B6B] text-white rounded-full p-1 mr-2">
                              <Check className="h-3 w-3" />
                            </div>
                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-lg">
                              <span className="text-xl">{aiGeneratedFragrance.emoji}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{aiGeneratedFragrance.name}</h4>
                              <span className="text-xs text-gray-500">({aiGeneratedFragrance.category})</span>
                            </div>
                            <p className="text-xs text-gray-600">{aiGeneratedFragrance.description}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">トップノート：</span>
                                {aiGeneratedFragrance.notes.top.join('、')}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">ミドルノート：</span>
                                {aiGeneratedFragrance.notes.middle.join('、')}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">ラストノート：</span>
                                {aiGeneratedFragrance.notes.last.join('、')}
                              </p>
                            </div>
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
                                  <h4 className="font-medium text-sm text-gray-500">トップノート</h4>
                                  <p className="text-sm">{aiGeneratedFragrance.notes.top.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-gray-500">ミドルノート</h4>
                                  <p className="text-sm">{aiGeneratedFragrance.notes.middle.join("、")}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-gray-500">ラストノート</h4>
                                  <p className="text-sm">{aiGeneratedFragrance.notes.last.join("、")}</p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ) : (
                      fragrances.map((fragrance) => (
                        <div key={fragrance.id} className="relative">
                          <div
                            className={cn(
                              "border p-2 flex items-center cursor-pointer rounded-lg transition-colors",
                              selectedFragrance === fragrance ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-200 hover:border-[#FF6B6B]",
                            )}
                            onClick={() => setSelectedFragrance(fragrance)}
                          >
                            <div className="flex items-center mr-3">
                              {selectedFragrance === fragrance && (
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
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">トップノート：</span>
                                  {fragrance.notes.top.join('、')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">ミドルノート：</span>
                                  {fragrance.notes.middle.join('、')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">ラストノート：</span>
                                  {fragrance.notes.last.join('、')}
                                </p>
                              </div>
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
                      ))
                    )}
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
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs",
                    selectedBottle ? "bg-green-500 text-white" : "bg-[#FF6B6B] text-white"
                  )}>
                    {selectedBottle ? <Check className="h-4 w-4" /> : "2"}
                  </div>
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
                        onClick={() => setSelectedBottle(bottle.id)}
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
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs",
                    selectedLabelSize ? "bg-green-500 text-white" : "bg-[#FF6B6B] text-white"
                  )}>
                    {selectedLabelSize ? <Check className="h-4 w-4" /> : "3"}
                  </div>
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
            <div className="mb-4 bg-white rounded-lg shadow-sm">
              <button
                className={cn(
                  "w-full p-3 flex justify-between items-center border-b",
                  expandedSection === 4 ? "bg-gray-50" : "bg-white",
                )}
                onClick={() => toggleSection(4)}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs",
                    uploadedImage ? "bg-green-500 text-white" : "bg-[#FF6B6B] text-white"
                  )}>
                    {uploadedImage ? <Check className="h-4 w-4" /> : "4"}
                  </div>
                  <h3 className="font-medium">ラベル画像をアップロード</h3>
                </div>
                {uploadedImage && !useTemplate && (
                  <div className="text-sm text-gray-600 mr-2">
                    画像がアップロードされています
                  </div>
                )}
                {uploadedImage && useTemplate && (
                  <div className="text-sm text-gray-600 mr-2">
                    テンプレートが選択されています
                  </div>
                )}
                {expandedSection === 4 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {expandedSection === 4 && (
                <div className="p-3">
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors",
                        isDragging ? "border-[#FF6B6B] bg-[#FF6B6B]/5" : "border-gray-300",
                        "hover:border-[#FF6B6B] hover:bg-[#FF6B6B]/5",
                        !isAgreed && "opacity-50 cursor-not-allowed"
                      )}
                      onDragOver={(e) => {
                        if (!isAgreed) {
                          e.preventDefault()
                          return
                        }
                        handleDragOver(e)
                      }}
                      onDragLeave={() => {
                        if (!isAgreed) return
                        handleDragLeave()
                      }}
                      onDrop={(e) => {
                        if (!isAgreed) {
                          e.preventDefault()
                          toast({
                            title: "画像利用の同意が必要です",
                            description: "著作権に関する注意事項に同意してください。",
                            variant: "destructive",
                          })
                          return
                        }
                        handleDrop(e)
                      }}
                    >
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          <p className="font-medium mb-2">推奨サイズ: 600 × 480 px以上</p>
                          <p className="text-xs mb-2">対応フォーマット: PNG, JPG（300dpi）</p>
                          <p className="text-xs mb-2">ファイルサイズ制限: 5MBまで</p>
                          <p className="text-xs text-gray-500">
                            ここにファイルをドラッグ＆ドロップ
                            <br />
                            または
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              if (!isAgreed) {
                                toast({
                                  title: "画像利用の同意が必要です",
                                  description: "著作権に関する注意事項に同意してください。",
                                  variant: "destructive",
                                })
                                return
                              }
                              fileInputRef.current?.click()
                            }}
                            disabled={!isAgreed}
                          >
                            {uploadedImage ? '画像を変更' : '画像をアップロード'}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                            disabled={!isAgreed}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleTemplateSelect}
                      >
                        テンプレートを選択
                      </Button>
                    </div>

                    {/* 著作権に関する注意書き */}
                    <p className="text-xs text-gray-500 mt-2">
                      ※ 著作権を侵害する画像（アニメキャラ、芸能人、ブランドロゴ等）の使用は禁止されています。
                      <br />
                      ※ 利用規約に違反する画像を使った注文は、キャンセルさせていただくことがあります。
                    </p>

                    {/* 同意チェックボックス */}
                    <div className="flex items-start mt-4">
                      <input
                        type="checkbox"
                        id="copyright-agree"
                        className="mr-2 mt-1 h-4 w-4 accent-red-500 border-2 border-red-500"
                        required
                        checked={isAgreed}
                        onChange={() => setIsAgreed(!isAgreed)}
                      />
                      <label htmlFor="copyright-agree" className="text-sm text-red-500 font-medium">
                        アップロードする画像が第三者の権利を侵害していないことを確認しました
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Button Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Button
                onClick={handleOrder}
                disabled={isOrderButtonDisabled}
                className={cn(
                  "w-full py-6 text-lg font-zen",
                  isOrderButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    処理中...
                  </div>
                ) : (
                  "注文する"
                )}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg p-2 sm:p-6 shadow-sm relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-lg font-medium">プレビュー</h2>
                {/* Render the PreviewControls component */}
                <PreviewControls
                  isMoving={isMoving}
                  setIsMoving={setIsMoving}
                  handleRotateLeft={handleRotateLeft}
                  handleRotateRight={handleRotateRight}
                />
              </div>

              <div
                ref={previewRef}
                className="aspect-[4/3] bg-gray-50 rounded-lg relative overflow-hidden preview-container"
              >
                <div 
                  id="label-preview"
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    padding: '0',
                    margin: '0'
                  }}
                >
                  {selectedBottle && (
                    <div className="absolute inset-0 p-2 sm:p-8">
                      <img
                        src={bottles.find((b) => b.id === selectedBottle)?.image}
                        alt="ボトルプレビュー"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {selectedLabelSize && (
                    <div 
                      className="absolute"
                      style={{
                        width: `${labelSizes.find((s) => s.id === selectedLabelSize)?.width}cm`,
                        height: `${labelSizes.find((s) => s.id === selectedLabelSize)?.height}cm`,
                        left: '50%',
                        top: '60%',
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute',
                        backgroundColor: 'white',
                        borderRadius: '4px'
                      }}
                    >
                      <div className="absolute inset-0 border-2 border-gray-300 rounded overflow-hidden">
                        {uploadedImage && (
                          <div
                            className={`absolute inset-0 ${isMoving ? 'cursor-move' : ''}`}
                            style={{
                              transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg)`,
                              transformOrigin: 'center center',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseDown={handleImageMouseDown}
                            onMouseMove={handleImageMouseMove}
                            onMouseUp={handleImageMouseUp}
                            onMouseLeave={handleImageMouseUp}
                          >
                            <img
                              src={uploadedImage}
                              alt="ラベル画像"
                              className="max-w-full max-h-full object-contain"
                              draggable={false}
                              onLoad={handleImageLoad}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">拡大・縮小</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={imageTransform.scale}
                  onChange={(e) => {
                    const newScale = parseFloat(e.target.value);
                    setImageTransform(prev => ({
                      ...prev,
                      scale: newScale
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Editor Modal */}
      {isEditorOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsEditorOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div className="p-4">
              <ImageEditorComponent
                imageUrl={editingImage || ''}
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
