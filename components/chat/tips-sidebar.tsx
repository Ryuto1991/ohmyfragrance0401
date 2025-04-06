import { useState } from "react"
import { Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type TipsSidebarProps = {
  currentStep: "intro" | "top" | "middle" | "base" | "bottle" | "complete"
  selectedScents: {
    top: string | null
    middle: string | null
    base: string | null
  }
}

export function TipsSidebar({ currentStep, selectedScents }: TipsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // ノートの説明
  const noteDescriptions = {
    top: "トップノートは最初に感じる香りで、約15分〜2時間持続します。フレッシュで爽やかな印象を与えます。",
    middle: "ミドルノートは香りの中心となり、2〜4時間持続します。フローラルやスパイシーな香りが特徴です。",
    base: "ラストノートは最も長く持続する香りで、4〜24時間続きます。深みと温かみのある香りが特徴です。",
  }

  // 香料の説明
  const scentDescriptions: Record<string, string> = {
    // トップノート
    レモン: "シャープで爽やかな柑橘系の香り。明るく前向きな気分にしてくれます。",
    ベルガモット: "フルーティーでフローラルな柑橘系の香り。エレガントで洗練された印象を与えます。",
    グレープフルーツ: "少し苦味のあるフレッシュな柑橘系の香り。活力と元気を与えてくれます。",

    // ミドルノート
    ジャスミン: "甘く華やかな花の香り。官能的で魅惑的な印象を与えます。",
    ローズ: "エレガントで優雅な花の香り。女性らしさと上品さを演出します。",
    ラベンダー: "穏やかで落ち着く花の香り。リラックス効果があり、心を落ち着かせます。",

    // ベースノート
    サンダルウッド: "温かくウッディな香り。深みと安定感のある印象を与えます。",
    バニラ: "甘く優しい香り。温かみと安心感を与え、親しみやすい印象を作ります。",
    オークモス: "しっかりとした木の香り。大地を思わせる自然な印象を与えます。",
  }

  // 現在のステップに応じた説明を表示
  const getStepContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div>
            <h3 className="font-medium mb-2">香水の基本</h3>
            <p className="text-xs text-secondary-foreground/70">
              香水は「トップノート」「ミドルノート」「ラストノート」の3層構造になっています。
              それぞれのノートが時間の経過とともに変化し、香りの物語を紡ぎます。
            </p>
          </div>
        )
      case "top":
        return (
          <div>
            <h3 className="font-medium mb-2">トップノート</h3>
            <p className="text-xs text-secondary-foreground/70">{noteDescriptions.top}</p>
            {selectedScents.top && (
              <div className="mt-3 p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">{selectedScents.top}</h4>
                <p className="text-xs text-secondary-foreground/70">{scentDescriptions[selectedScents.top]}</p>
              </div>
            )}
          </div>
        )
      case "middle":
        return (
          <div>
            <h3 className="font-medium mb-2">ミドルノート</h3>
            <p className="text-xs text-secondary-foreground/70">{noteDescriptions.middle}</p>
            {selectedScents.middle && (
              <div className="mt-3 p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">{selectedScents.middle}</h4>
                <p className="text-xs text-secondary-foreground/70">{scentDescriptions[selectedScents.middle]}</p>
              </div>
            )}
          </div>
        )
      case "base":
        return (
          <div>
            <h3 className="font-medium mb-2">ラストノート</h3>
            <p className="text-xs text-secondary-foreground/70">{noteDescriptions.base}</p>
            {selectedScents.base && (
              <div className="mt-3 p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">{selectedScents.base}</h4>
                <p className="text-xs text-secondary-foreground/70">{scentDescriptions[selectedScents.base]}</p>
              </div>
            )}
          </div>
        )
      case "bottle":
        return (
          <div>
            <h3 className="font-medium mb-2">選んだ香り</h3>
            <div className="space-y-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">トップノート: {selectedScents.top}</h4>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">ミドルノート: {selectedScents.middle}</h4>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <h4 className="text-xs font-medium">ラストノート: {selectedScents.base}</h4>
              </div>
            </div>
          </div>
        )
      case "complete":
        return (
          <div>
            <h3 className="font-medium mb-2">完成した香り</h3>
            <p className="text-xs text-secondary-foreground/70">
              あなただけのオリジナル香水が完成しました。 この香りがあなたの特別な瞬間を彩りますように。
            </p>
          </div>
        )
      default:
        return null
    }
  }

  // タブ切り替え型のTIPS内容
  const getTipsContent = (tabValue: string) => {
    switch (tabValue) {
      case "about":
        return (
          <div>
            <h3 className="font-medium mb-2">香水作成ガイド</h3>
            <p className="text-xs text-secondary-foreground/70">
              AIとチャットして香水レシピを作成できます。好みや気分を伝えると、AIがトップノート、ミドルノート、ベースノートを提案します。完成したレシピは、好きな写真とボトルを選んで注文可能です。
            </p>
          </div>
        )
      case "top":
        return (
          <div>
            <h3 className="font-medium mb-2">トップノートとは</h3>
            <p className="text-xs text-secondary-foreground/70">
              トップノートは最初に感じる香りで、香水をつけた直後から約15分〜2時間持続します。レモンやベルガモットなどのフレッシュで爽やかな印象の香りが多く使われます。
            </p>
          </div>
        )
      case "middle":
        return (
          <div>
            <h3 className="font-medium mb-2">ミドルノートとは</h3>
            <p className="text-xs text-secondary-foreground/70">
              ミドルノートは香りの中心となり、トップノートが消えた後に現れ、2〜4時間持続します。ローズやジャスミンなどのフローラルやスパイシーな香りが特徴で、香水の「心」と呼ばれます。
            </p>
          </div>
        )
      case "note":
        return (
          <div>
            <h3 className="font-medium mb-2">ノートとは</h3>
            <p className="text-xs text-secondary-foreground/70">
              ノートとは香水の構成要素で、時間とともに変化する香りの層を表します。香水は「トップノート」「ミドルノート」「ベースノート（ラストノート）」の3層構造になっており、それぞれが時間の経過とともに変化し、香りの物語を紡ぎます。
            </p>
          </div>
        )
      default:
        return getStepContent()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 flex items-center justify-center bg-primary text-primary-foreground rounded-full w-10 h-10 shadow-md z-20 hover:bg-primary/90 transition-colors"
        aria-label="香水作成ガイドを表示"
      >
        <Info className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 w-72 bg-white p-4 rounded-lg shadow-md z-20 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Info className="h-4 w-4 text-primary mr-2" />
          <h2 className="text-sm font-medium">香水作成ガイド</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-2">
          <TabsTrigger value="about" className="text-xs py-1">使い方</TabsTrigger>
          <TabsTrigger value="top" className="text-xs py-1">トップ</TabsTrigger>
          <TabsTrigger value="middle" className="text-xs py-1">ミドル</TabsTrigger>
          <TabsTrigger value="note" className="text-xs py-1">ノート</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          {getTipsContent("about")}
        </TabsContent>
        <TabsContent value="top">
          {getTipsContent("top")}
        </TabsContent>
        <TabsContent value="middle">
          {getTipsContent("middle")}
        </TabsContent>
        <TabsContent value="note">
          {getTipsContent("note")}
        </TabsContent>
      </Tabs>
    </div>
  )
}

