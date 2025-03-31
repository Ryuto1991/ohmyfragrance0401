import { Info } from "lucide-react"

type TipsSidebarProps = {
  currentStep: "intro" | "top" | "middle" | "base" | "bottle" | "complete"
  selectedScents: {
    top: string | null
    middle: string | null
    base: string | null
  }
}

export function TipsSidebar({ currentStep, selectedScents }: TipsSidebarProps) {
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
  const renderContent = () => {
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

  return (
    <div className="fixed bottom-4 left-4 w-64 bg-white p-4 rounded-lg shadow-md z-10 animate-fadeIn">
      <div className="flex items-center mb-3">
        <Info className="h-4 w-4 text-primary mr-2" />
        <h2 className="text-sm font-medium">Tips</h2>
      </div>
      {renderContent()}
    </div>
  )
}

