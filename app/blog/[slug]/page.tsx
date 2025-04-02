"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, Clock, Share2, Facebook, Twitter, Instagram } from "lucide-react"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import NewsletterSubscription from "@/components/newsletter-subscription"

// サンプルのブログ記事データ
const blogPosts = [
  {
    id: 1,
    title: "香水の基本：香りの種類と選び方",
    excerpt:
      "香水選びに迷ったことはありませんか？この記事では、香りの種類や自分に合った香水の選び方について解説します。",
    content: `
      <p>香水選びに迷ったことはありませんか？この記事では、香りの種類や自分に合った香水の選び方について解説します。</p>
      
      <h2>香水の種類</h2>
      <p>香水には主に以下の種類があります：</p>
      <ul>
        <li><strong>パルファム（Parfum）</strong>：最も香りが濃く、香りの持続時間が長い（6〜8時間）。香料の濃度は20〜30%。</li>
        <li><strong>オードパルファム（Eau de Parfum）</strong>：パルファムよりやや軽く、持続時間は4〜6時間。香料の濃度は15〜20%。</li>
        <li><strong>オードトワレ（Eau de Toilette）</strong>：さらに軽く、持続時間は2〜4時間。香料の濃度は5〜15%。</li>
        <li><strong>オーデコロン（Eau de Cologne）</strong>：非常に軽く、持続時間は2時間程度。香料の濃度は2〜4%。</li>
      </ul>
      
      <h2>香りのファミリー</h2>
      <p>香水の香りは大きく以下のファミリーに分類されます：</p>
      <ul>
        <li><strong>フローラル</strong>：花の香りをベースにした香水。ジャスミン、ローズ、スミレなどの香りが特徴。女性向けの香水に多く使われます。</li>
        <li><strong>シトラス</strong>：柑橘系の爽やかな香り。レモン、オレンジ、ベルガモットなどの香りが特徴。男女問わず人気があります。</li>
        <li><strong>ウッディ</strong>：木の香りをベースにした香水。サンダルウッド、シダーウッドなどの香りが特徴。落ち着いた印象を与えます。</li>
        <li><strong>オリエンタル</strong>：スパイシーで甘い香り。バニラ、アンバー、ムスクなどの香りが特徴。深みのある香りが特徴です。</li>
        <li><strong>フゼア</strong>：ラベンダーやオークモスなどの香りが特徴。男性向けの香水に多く使われます。</li>
      </ul>
      
      <h2>自分に合った香水の選び方</h2>
      <p>自分に合った香水を選ぶためのポイントをいくつか紹介します：</p>
      <ol>
        <li><strong>自分の好みを知る</strong>：まずは自分がどのような香りが好きかを知ることが大切です。花の香りが好きなのか、爽やかな香りが好きなのか、自分の好みを把握しましょう。</li>
        <li><strong>使用シーンを考える</strong>：オフィス用、デート用、リラックスタイム用など、使用シーンによって選ぶ香水を変えるのもおすすめです。</li>
        <li><strong>肌で試す</strong>：香水は紙で試すだけでなく、実際に肌につけて香りの変化を確認することが重要です。香水は肌の体温や体質によって香りが変わることがあります。</li>
        <li><strong>時間をかけて判断する</strong>：香水はつけてすぐの香り（トップノート）、30分〜1時間後の香り（ミドルノート）、数時間後の香り（ベースノート）と変化します。すぐに判断せず、時間をかけて香りの変化を楽しみましょう。</li>
      </ol>
      
      <h2>まとめ</h2>
      <p>香水選びは自分自身の個性や好みを表現する楽しい体験です。この記事で紹介した基本知識を参考に、自分に合った香水を見つけてみてください。Oh my fragranceでは、AIを活用して一人ひとりの好みに合わせたオリジナルフレグランスも提案しています。ぜひ体験してみてください。</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=香水の基本",
    category: "基礎知識",
    date: "2025-01-15",
    readTime: "5分",
    slug: "perfume-basics",
    author: "山田 花子",
    authorImage: "/placeholder.svg?height=100&width=100&text=山田花子",
    authorBio:
      "Oh my fragranceのフレグランスコンサルタント。10年以上の香水業界での経験を持ち、香りの魅力を多くの人に伝えることをライフワークとしている。",
    tags: ["香水の基本", "香りの種類", "選び方"],
    relatedPosts: [2, 4, 6],
  },
  {
    id: 2,
    title: "AIが変える香水業界の未来",
    excerpt:
      "テクノロジーの進化により、香水業界にも大きな変革が起きています。AIを活用した新しい調香技術とその可能性について探ります。",
    content: `
      <p>テクノロジーの進化により、香水業界にも大きな変革が起きています。AIを活用した新しい調香技術とその可能性について探ります。</p>
      
      <h2>AIと香水の意外な関係</h2>
      <p>一見すると関係がないように思えるAIと香水ですが、実は深い関わりがあります。AIは膨大なデータを分析し、パターンを見つけ出す能力に優れています。この能力を香水の調合に活用することで、従来の調香師だけでは生み出せなかった新しい香りの組み合わせを発見することができるのです。</p>
      
      <h2>AIによる個人化された香り</h2>
      <p>AIの最も革新的な活用法の一つが、個人化された香りの提案です。従来の香水は大量生産され、多くの人が同じ香りを使用していました。しかし、AIを活用することで、一人ひとりの好みや体質に合わせたオーダーメイドの香りを提案することが可能になりました。</p>
      <p>例えば、Oh my fragranceでは、お客様との対話を通じて好みや使用シーンを分析し、AIがその人だけの香りのレシピを作成します。これにより、世界に一つだけの香りを手に入れることができるのです。</p>
      
      <h2>AIが分析する香りのデータ</h2>
      <p>AIは香りに関する様々なデータを分析します：</p>
      <ul>
        <li><strong>化学的構造</strong>：香料の分子構造とその特性</li>
        <li><strong>心理的効果</strong>：特定の香りが人間の感情や記憶に与える影響</li>
        <li><strong>市場トレンド</strong>：世界中の香水市場での人気の傾向</li>
        <li><strong>個人の好み</strong>：ユーザーの過去の選択や反応</li>
      </ul>
      <p>これらのデータを組み合わせることで、AIは科学的根拠に基づいた香りの提案ができるようになります。</p>
      
      <h2>AIと調香師の共存</h2>
      <p>AIの登場により、調香師の仕事がなくなるのではないかという懸念もありますが、実際にはそうではありません。AIはあくまでも調香師の強力なツールとして機能し、創造性をサポートする役割を果たします。最終的な香りの調整や品質の確認は、依然として熟練した調香師の感覚と経験が不可欠です。</p>
      <p>AIと調香師が協力することで、これまでにない革新的な香りが生まれる可能性が広がっています。</p>
      
      <h2>AIがもたらす香水業界の変化</h2>
      <p>AIの活用により、香水業界には以下のような変化が起きています：</p>
      <ol>
        <li><strong>開発期間の短縮</strong>：従来は何年もかかっていた新しい香りの開発が、AIの助けにより数ヶ月に短縮されることも。</li>
        <li><strong>サステナビリティの向上</strong>：AIによる精密な調合により、原料の無駄を減らし、環境への負荷を軽減。</li>
        <li><strong>新しい市場の開拓</strong>：これまで香水に興味がなかった層にも、パーソナライズされた体験を提供することで新たな顧客を獲得。</li>
        <li><strong>デジタルとフィジカルの融合</strong>：オンラインでの香り診断とリアルな製品体験を組み合わせた新しいビジネスモデルの登場。</li>
      </ol>
      
      <h2>まとめ</h2>
      <p>AIの進化により、香水業界は大きな変革の時を迎えています。テクノロジーと伝統的な調香技術の融合により、より個人化され、持続可能で革新的な香りの世界が広がっています。Oh my fragranceでは、このAIの力を活用し、お客様一人ひとりに最適な香りを提案しています。あなただけの特別な香りを見つける旅に、ぜひ出かけてみませんか？</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=AI×香水",
    category: "トレンド",
    date: "2025-01-10",
    readTime: "7分",
    slug: "ai-future-perfume",
    author: "佐藤 健太",
    authorImage: "/placeholder.svg?height=100&width=100&text=佐藤健太",
    authorBio:
      "AI技術者であり、香りの研究者。テクノロジーと感覚の融合に関する研究を行い、複数の論文を発表している。Oh my fragranceの技術顧問も務める。",
    tags: ["AI", "テクノロジー", "未来", "イノベーション"],
    relatedPosts: [1, 5, 6],
  },
  {
    id: 3,
    title: "季節に合わせた香りの楽しみ方",
    excerpt: "春夏秋冬、それぞれの季節に合った香りの選び方と楽しみ方をご紹介します。季節感のある香りで日常に彩りを。",
    content: `
      <p>春夏秋冬、それぞれの季節に合った香りの選び方と楽しみ方をご紹介します。季節感のある香りで日常に彩りを。</p>
      
      <h2>春の香り：新しい始まりを感じる</h2>
      <p>春は新しい始まりの季節。自然が目覚め、花々が咲き誇る時期には、軽やかで明るい香りがぴったりです。</p>
      <p><strong>おすすめの香り</strong>：</p>
      <ul>
        <li><strong>フローラル</strong>：桜、スミレ、ジャスミンなどの花の香り</li>
        <li><strong>グリーン</strong>：新緑や草原を思わせる爽やかな香り</li>
        <li><strong>シトラス</strong>：ベルガモットやレモンなどの柑橘系の香り</li>
      </ul>
      <p><strong>春の香りの楽しみ方</strong>：朝の身支度時に軽く一吹きするだけで、一日を明るい気持ちで始められます。また、春の行楽シーンにもぴったりです。</p>
      
      <h2>夏の香り：爽やかさと清涼感</h2>
      <p>暑い夏には、清涼感のある香りで気分をリフレッシュしましょう。汗ばむ季節だからこそ、軽やかで爽やかな香りが重宝します。</p>
      <p><strong>おすすめの香り</strong>：</p>
      <ul>
        <li><strong>マリン</strong>：海の潮風を思わせる清々しい香り</li>
        <li><strong>シトラス</strong>：グレープフルーツやライムなどの爽やかな柑橘系</li>
        <li><strong>ハーバル</strong>：ミントやローズマリーなどのハーブの香り</li>
      </ul>
      <p><strong>夏の香りの楽しみ方</strong>：オーデコロンやボディミストなど、軽めのタイプを選び、こまめに付け直すのがおすすめ。首筋や手首など、脈のある部分につけると香りが広がりやすくなります。</p>
      
      <h2>秋の香り：深みと温かみ</h2>
      <p>涼しくなり始める秋には、少し深みのある温かみを感じる香りが心地よいものです。落ち着いた雰囲気を演出してくれます。</p>
      <p><strong>おすすめの香り</strong>：</p>
      <ul>
        <li><strong>ウッディ</strong>：サンダルウッドやシダーウッドなどの木の香り</li>
        <li><strong>スパイシー</strong>：シナモンやナツメグなどのスパイスの香り</li>
        <li><strong>フルーティ</strong>：リンゴやベリー系の甘酸っぱい香り</li>
      </ul>
      <p><strong>秋の香りの楽しみ方</strong>：オードパルファムなど、少し濃度の高いタイプを選ぶと長く香りが持続します。衣類に軽く吹きかけるのもおすすめです。</p>
      
      <h2>冬の香り：包み込むような温もり</h2>
      <p>寒い冬には、温かみのある甘い香りで心も体も温めましょう。周りの人にも安心感を与えてくれる香りがおすすめです。</p>
      <p><strong>おすすめの香り</strong>：</p>
      <ul>
        <li><strong>オリエンタル</strong>：バニラやアンバーなどの甘く深みのある香り</li>
        <li><strong>ウッディ</strong>：ウードやパチョリなどの濃厚な木の香り</li>
        <li><strong>スイート</strong>：キャラメルやチョコレートを思わせる甘い香り</li>
      </ul>
      <p><strong>冬の香りの楽しみ方</strong>：パルファムなど濃度の高いタイプを選び、マフラーやコートの内側に軽くスプレーすると、一日中香りに包まれます。</p>
      
      <h2>季節の変わり目の香り</h2>
      <p>季節の変わり目には、前の季節と次の季節の香りを混ぜあせるのも一つの楽しみ方です。例えば、夏から秋への変わり目には、シトラスとウッディの香りを組み合わせるなど、自分だけの季節の香りを見つけてみましょう。</p>
      
      <h2>まとめ</h2>
      <p>季節に合わせて香りを変えることで、日常に新鮮な彩りを加えることができます。また、特定の季節に使った香りは、その季節の思い出と結びついて記憶に残りやすくなります。Oh my fragranceでは、季節ごとのおすすめフレグランスも提案していますので、ぜひ参考にしてみてください。あなたの季節の香りを見つける旅をお手伝いします。</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=季節の香り",
    category: "ライフスタイル",
    date: "2025-01-05",
    readTime: "4分",
    slug: "seasonal-fragrances",
    author: "田中 美咲",
    authorImage: "/placeholder.svg?height=100&width=100&text=田中美咲",
    authorBio:
      "ライフスタイルコンサルタントとして活動。季節の移り変わりを大切にした暮らしの提案を行っている。香りと生活の関係について研究し、多くのメディアで発信中。",
    tags: ["季節", "春", "夏", "秋", "冬", "ライフスタイル"],
    relatedPosts: [1, 5, 7],
  },
  {
    id: 4,
    title: "香水の正しいつけ方とマナー",
    excerpt:
      "香水は適切な量と場所につけることで、より魅力的に香ります。TPOに合わせた香水の使い方とマナーについて解説します。",
    content: `
      <p>香水は適切な量と場所につけることで、より魅力的に香ります。TPOに合わせた香水の使い方とマナーについて解説します。</p>
      
      <h2>香水をつける適切な場所</h2>
      <p>香水は体温で香りが広がるため、血流が多い部分につけるのが効果的です。おすすめの場所は以下の通りです：</p>
      <ul>
        <li><strong>手首</strong>：最も一般的な場所。ただし、こすり合わせると香りの分子が壊れるので注意。</li>
        <li><strong>首筋</strong>：体温が高く、香りが上に広がりやすい。</li>
        <li><strong>耳の後ろ</strong>：意外と体温が高く、近距離での会話時に効果的。</li>
        <li><strong>ひじの内側</strong>：血管が表面近くにあり、程よく香りが広がる。</li>
        <li><strong>膝の裏</strong>：歩くたびに香りが漂い、控えめな印象に。</li>
      </ul>
      <p>香水は直接肌につけるのが基本ですが、髪の毛につける場合は、アルコール分が髪を傷める可能性があるため、空中にスプレーして髪に降り注ぐ「ヘアミスト法」がおすすめです。</p>
      
      <h2>香水の適切な量</h2>
      <p>香水は「控えめに」が基本です。自分では気づきにくくても、周囲の人には強く感じられることがあります。</p>
      <p><strong>香水の種類別の適切な量</strong>：</p>
      <ul>
        <li><strong>パルファム</strong>：1〜2プッシュ</li>
        <li><strong>オードパルファム</strong>：2〜3プッシュ</li>
        <li><strong>オードトワレ</strong>：3〜4プッシュ</li>
        <li><strong>オーデコロン</strong>：4〜5プッシュ</li>
      </ul>
      <p>初めて使う香水は特に控えめにし、周囲の反応を見ながら調整するのがおすすめです。</p>
      
      <h2>TPOに合わせた香水の選び方</h2>
      <p>場面に応じて香水を使い分けることで、より洗練された印象を与えることができます。</p>
      <p><strong>シーン別のおすすめ</strong>：</p>
      <ul>
        <li><strong>オフィス・仕事場</strong>：軽めの香り（シトラス系、軽いフローラル系）を控えめに。強すぎる香りは避け、集中力を妨げないように。</li>
        <li><strong>デート・特別な夜</strong>：少し印象的な香り（オリエンタル系、深みのあるフローラル系）を。ただし、食事を楽しむ場では控えめに。</li>
        <li><strong>カジュアルな外出</strong>：爽やかな香り（フルーティ系、軽いウッディ系）が好印象。</li>
        <li><strong>フォーマルな場</strong>：上品で控えめな香り（クラシックなフローラル系、洗練されたウッディ系）を選ぶと安心。</li>
      </ul>
      
      <h2>香水のマナー</h2>
      <p>香水を使う際に気をつけたいマナーをいくつか紹介します：</p>
      <ol>
        <li><strong>公共の場では控えめに</strong>：電車やバス、映画館など閉鎖的な空間では、特に控えめにしましょう。</li>
        <li><strong>食事の場では注意</strong>：強い香りは食事の香りや味を邪魔することがあります。食事会では特に控えめに。</li>
        <li><strong>病院や医療施設では避ける</strong>：香りに敏感な方や体調の優れない方への配慮として。</li>
        <li><strong>職場のルールを確認</strong>：香水の使用に関するルールがある職場もあります。事前に確認を。</li>
        <li><strong>アレルギーへの配慮</strong>：周囲に香りのアレルギーを持つ方がいないか確認することも大切です。</li>
      </ol>
      
      <h2>香水の保管方法</h2>
      <p>香水を長持ちさせるためには、適切な保管も重要です：</p>
      <ul>
        <li><strong>直射日光を避ける</strong>：紫外線により香りが変質する可能性があります。</li>
        <li><strong>温度変化の少ない場所に保管</strong>：浴室など湿度や温度の変化が大きい場所は避けましょう。</li>
        <li><strong>キャップをしっかり閉める</strong>：空気に触れると香りが飛んでしまいます。</li>
        <li><strong>元の箱に入れて保管</strong>：光を遮断し、香りを守ります。</li>
      </ul>
      
      <h2>まとめ</h2>
      <p>香水は自分自身を表現する素敵なアイテムですが、適切な使い方とマナーを心がけることで、周囲の人にも心地よい印象を与えることができます。TPOに合わせた香りの選択と控えめな使用を心がけ、香りの魅力を最大限に引き出しましょう。Oh my fragranceでは、あなたのライフスタイルに合わせたパーソナライズされた香りを提案しています。ぜひお試しください。</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=香水のマナー",
    category: "基礎知識",
    date: "2024-12-28",
    readTime: "6分",
    slug: "perfume-etiquette",
    author: "鈴木 大輔",
    authorImage: "/placeholder.svg?height=100&width=100&text=鈴木大輔",
    authorBio:
      "エチケットコンサルタントとして活動。ビジネスマナーから日常のエチケットまで幅広く指導している。香りのマナーに関する講演も多数行う。",
    tags: ["マナー", "つけ方", "TPO", "エチケット"],
    relatedPosts: [1, 3, 6],
  },
  {
    id: 5,
    title: "世界の有名調香師とその作品",
    excerpt:
      "香水業界を牽引する世界的な調香師たちとその代表作について紹介します。彼らの創造性と情熱から生まれた名作の数々。",
    content: `
      <p>香水業界を牽引する世界的な調香師たちとその代表作について紹介します。彼らの創造性と情熱から生まれた名作の数々。</p>
      
      <h2>調香師とは</h2>
      <p>調香師（パフューマー）は、香りを創造するアーティストです。化学的な知識と芸術的なセンス、そして鋭い嗅覚を持ち合わせ、何百もの原料を組み合わせて独自の香りを生み出します。一人前の調香師になるには10年以上の修行が必要と言われ、世界中も数百人しかいない希少な職業です。</p>
      
      <h2>フランソワ・デマキー</h2>
      <p>ディオールのインハウスパフューマーとして知られるフランソワ・デマキーは、伝統と革新を融合させた香りで高い評価を受けています。</p>
      <p><strong>代表作</strong>：</p>
      <ul>
        <li><strong>サヴァージュ</strong>：爽やかさと深みを兼ね備えた男性向け香水。ベルガモットとアンブロキサンの組み合わせが特徴的。</li>
        <li><strong>ジャドール</strong>：エレガントで女性らしいフローラルの香り。イランイランとダマスクローズが絶妙に調和。</li>
        <li><strong>ミス ディオール</strong>：現代的な解釈で生まれ変わった伝統的な香り。グリーンノートとローズの清々しい組み合わせ。</li>
      </ul>
      
      <h2>ジャック・キャヴァリエ</h2>
      <p>ルイ・ヴィトンの専属調香師として知られるジャック・キャヴァリエは、シンプルながらも深みのある香りの創造で知られています。</p>
      <p><strong>代表作</strong>：</p>
      <ul>
        <li><strong>イソー ミヤケ ロー ディセイ</strong>：水と花の香りを表現した革新的な作品。</li>
        <li><strong>ジャン・ポール・ゴルチエ クラシック</strong>：バニラとオレンジブロッサムの甘く官能的な香り。</li>
        <li><strong>ルイ・ヴィトン アフタヌーン スイム</strong>：地中海の爽やかな風景を表現した香り。</li>
      </ul>
      
      <h2>クリスティーヌ・ナジェル</h2>
      <p>エルメスの専属調香師として20年以上活躍したクリスティーヌ・ナジェルは、洗練された知的な香りで多くのファンを魅了しています。</p>
      <p><strong>代表作</strong>：</p>
      <ul>
        <li><strong>エルメス ウン ジャルダン シュル ル ニル</strong>：ナイル川のほとりの庭園をイメージした爽やかな香り。</li>
        <li><strong>エルメス テール ド エルメス</strong>：大地と自然を表現した男性向け香水。グレープフルーツとミネラル感が特徴。</li>
        <li><strong>エルメス ケリー カレーシュ</strong>：レザーとフローラルの組み合わせが印象的な女性向け香水。</li>
      </ul>
      
      <h2>ソフィー・ラベ</h2>
      <p>現代の女性調香師として注目を集めるソフィー・ラベは、独創的かつ大胆な香りの創造で知られています。</p>
      <p><strong>代表作</strong>：</p>
      <ul>
        <li><strong>ブルガリ オムニア クリスタリン</strong>：透明感のあるフローラルウッディの香り。</li>
        <li><strong>カルバン クライン リビール</strong>：ソルトとペッパーを使った斬新な香り。</li>
        <li><strong>ボス ザ セント フォー ハー</strong>：ピーチとフリージアの組み合わせが魅力的な女性向け香水。</li>
      </ul>
      
      <h2>フランシス・クルクジャン</h2>
      <p>自身のブランド「メゾン フランシス クルクジャン」を立ち上げた現代を代表する調香師。革新的でありながらも普遍的な魅力を持つ香りを生み出しています。</p>
      <p><strong>代表作</strong>：</p>
      <ul>
        <li><strong>バカラ ルージュ 540</strong>：ジャスミンとシダーウッドの組み合わせが特徴的な官能的な香り。</li>
        <li><strong>ジャン・ポール・ゴルチエ ル マル</strong>：バニラとラベンダーの意外な組み合わせが成功した男性向け香水。</li>
        <li><strong>エリー サーブ ル パルファム</strong>：オレンジブロッサムとパチョリの調和が美しい女性向け香水。</li>
      </ul>
      
      <h2>調香師の育成と未来</h2>
      <p>伝統的に調香師は徒弟制度で育成されてきましたが、現在ではフランスのISIPCA（国際香粧品学校）などの専門教育機関も存在します。また、AIの発展により、調香プロセスにもテクノロジーが取り入れられるようになってきています。</p>
      <p>しかし、最終的な香りの評価や微調整には、依然として調香師の感性と経験が不可欠です。テクノロジーと人間の感性が融合することで、香水業界はさらに発展していくでしょう。</p>
      
      <h2>まとめ</h2>
      <p>世界の有名調香師たちは、科学と芸術の両面から香りを創造し、私たちの生活に豊かさをもたらしています。彼らの作品は単なる香水ではなく、物語や感情、記憶を内包した芸術作品とも言えるでしょう。Oh my fragranceでは、こうした調香師の技術とAIを組み合わせることで、一人ひとりに合った特別な香りを提案しています。</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=調香師",
    category: "歴史・文化",
    date: "2024-12-20",
    readTime: "8分",
    slug: "famous-perfumers",
    author: "高橋 直子",
    authorImage: "/placeholder.svg?height=100&width=100&text=高橋直子",
    authorBio:
      "香水評論家として活動。世界中の香水を取材し、その歴史や文化的背景について研究している。複数の香水関連書籍の著者でもある。",
    tags: ["調香師", "歴史", "ブランド", "名作"],
    relatedPosts: [1, 2, 6],
  },
  {
    id: 6,
    title: "香りと記憶の不思議な関係",
    excerpt:
      "香りには記憶を呼び起こす強い力があります。香りと脳の関係性や、香りが私たちの感情や記憶に与える影響について探ります。",
    content: `
      <p>香りには記憶を呼び起こす強い力があります。香りと脳の関係性や、香りが私たちの感情や記憶に与える影響について探ります。</p>
      
      <h2>プルースト効果とは</h2>
      <p>フランスの作家マルセル・プルーストの小説『失われた時を求めて』に由来する「プルースト効果」は、香りが過去の記憶を鮮明によみがえらせる現象を指します。小説の中で主人公は、紅茶に浸したマドレーヌの香りをきっかけに、幼少期の記憶が鮮やかによみがえる体験をします。</p>
      <p>この現象は科学的にも証明されており、香りが他の感覚よりも強く記憶と結びつく理由は、脳の構造にあります。</p>
      
      <h2>香りと脳の関係</h2>
      <p>嗅覚情報は、他の感覚情報と異なる経路で脳に伝わります。視覚や聴覚の情報は、まず視床という中継地点を経由して大脳皮質に送られますが、嗅覚情報は直接、扁桃体（感情を司る部位）や海馬（記憶を司る部位）に送られます。</p>
      <p>このため、香りは感情や記憶と直接結びつきやすく、特定の香りを嗅ぐだけで、その香りと関連した過去の記憶や感情が瞬時によみがえることがあるのです。</p>
      
      <h2>香りと感情の関係</h2>
      <p>香りは私たちの感情にも大きな影響を与えます。例えば：</p>
      <ul>
        <li><strong>ラベンダー</strong>：リラックス効果があり、ストレスや不安を軽減</li>
        <li><strong>シトラス</strong>：気分を高揚させ、エネルギーを与える</li>
        <li><strong>バニラ</strong>：安心感や幸福感をもたらす</li>
        <li><strong>ペパーミント</strong>：集中力を高め、頭をすっきりさせる</li>
      </ul>
      <p>これらの効果は、香りの分子が脳内の神経伝達物質の放出に影響を与えることで生じます。例えば、ラベンダーの香りはGABA（抑制性の神経伝達物質）の働きを促進し、リラックス効果をもたらします。</p>
      
      <h2>香りと記憶の実験</h2>
      <p>ニューヨーク大学の研究では、被験者に特定の香りをかがせながら画像を見せ、後日、同じ香りをかがせると、香りなしの場合よりも画像の記憶が65%も正確だったという結果が出ています。</p>
      <p>また、アルツハイマー病の患者でも、香りによって失われたと思われていた記憶が一時的によみがえることがあります。特に幼少期や若い頃に親しんだ香りは、長期記憶と強く結びついているため、このような効果が期待できます。</p>
      
      <h2>香りと個人的な記憶</h2>
      <p>香りと記憶の関係は非常に個人的なものです。例えば、バニラの香りは多くの人に温かみや安心感をもたらしますが、それは幼少期にバニラの香りのするお菓子を食べた楽しい記憶と結びついていることが多いためです。</p>
      <p>一方で、同じ香りでも、人によって全く異なる記憶や感情を呼び起こすこともあります。これは、その香りをどのような状況で経験したかによって大きく左右されます。</p>
      
      <h2>香りを活用した記憶術</h2>
      <p>香りと記憶の強い結びつきを利用した記憶術も存在します：</p>
      <ol>
        <li><strong>勉強時の香り</strong>：特定の香りをかぎながら勉強し、テスト時に同じ香りをかぐことで記憶の想起を促進</li>
        <li><strong>旅の記憶</strong>：旅行先で現地の香水や香りのするものを購入し、後日その香りで旅の記憶を呼び起こす</li>
        <li><strong>別な日の香り</strong>：結婚式や卒業式など、特別な日に特定の香水をつけることで、その日の記憶を香りに封じ込める</li>
      </ol>
      
      <h2>香りのアーカイブ</h2>
      <p>近年、失われつつある香りを保存する「香りのアーカイブ」プロジェクトも始まっています。例えば、産業革命前のロンドンの香り、古代エジプトの香り、絶滅した植物の香りなどを再現し、保存する試みです。</p>
      <p>これは単なる好奇心からではなく、香りが持つ文化的・歴史的な価値を認識し、後世に伝えるための重要な取り組みと言えるでしょう。</p>
      
      <h2>まとめ</h2>
      <p>香りは私たちの記憶や感情と深く結びついており、時に言葉や画像以上に強力に過去を呼び起こす力を持っています。この香りの特性を理解し活用することで、大切な記憶を保存したり、日常生活の質を高めたりすることができるでしょう。</p>
      <p>Oh my fragranceでは、あなたの大切な記憶や感情に寄り添う、パーソナライズされた香りの創造をお手伝いします。あなただけの特別な香りで、新しい記憶を作りませんか？</p>
    `,
    image: "/placeholder.svg?height=400&width=600&text=香りと記憶",
    category: "科学",
    date: "2024-12-15",
    readTime: "6分",
    slug: "scent-memory",
    author: "中村 健太郎",
    authorImage: "/placeholder.svg?height=100&width=100&text=中村健太郎",
    authorBio:
      "神経科学者として香りと脳の関係を研究。複数の大学で講師を務め、香りが人間の認知機能に与える影響について論文を発表している。",
    tags: ["科学", "記憶", "脳", "心理学"],
    relatedPosts: [2, 3, 5],
  },
]

// 日付をフォーマットする関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // URLのスラッグから記事を検索
    const slug = params.slug as string
    const foundPost = blogPosts.find((item) => item.slug === slug)

    if (foundPost) {
      setPost(foundPost)

      // 関連記事を取得
      if (foundPost.relatedPosts && foundPost.relatedPosts.length > 0) {
        const related = blogPosts.filter((item) => foundPost.relatedPosts.includes(item.id))
        setRelatedPosts(related)
      }
    }

    setLoading(false)
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary-foreground/70 font-zen">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-secondary">
        <SiteHeader />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center py-16">
              <h1 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">
                記事が見つかりませんでした
              </h1>
              <p className="text-secondary-foreground/70 mb-8 font-zen">
                お探しの記事は存在しないか、削除された可能性があります。
              </p>
              <Button
                onClick={() => router.push("/blog")}
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                ブログ一覧に戻る
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* 戻るボタン */}
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <Button
            onClick={() => router.push("/blog")}
            variant="outline"
            className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ブログ一覧に戻る
          </Button>
        </div>

        {/* 記事ヘッダー */}
        <section className="container mx-auto px-4 md:px-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-montserrat">
                {post.category}
              </span>
              <div className="flex items-center text-xs text-secondary-foreground/60 font-montserrat">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center text-xs text-secondary-foreground/60 font-montserrat">
                <Clock className="h-3 w-3 mr-1" />
                <span>読了時間: {post.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-medium mb-6 text-secondary-foreground font-zen">{post.title}</h1>

            <div className="relative aspect-[16/9] mb-8">
              <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover rounded-lg" />
            </div>
          </div>
        </section>

        {/* 記事本文 */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-8">
              <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
                <div
                  className="prose prose-sm md:prose-base max-w-none font-zen"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* タグ */}
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-montserrat"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* シェアボタン */}
                <div className="mt-8 pt-8 border-t">
                  <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">この記事をシェアする</p>
                  <div className="flex space-x-4">
                    <button className="p-2 bg-[#1877F2] text-white rounded-full">
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-[#1DA1F2] text-white rounded-full">
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white rounded-full">
                      <Instagram className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-secondary text-secondary-foreground rounded-full">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 著者情報 */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm mt-8">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={post.authorImage || "/placeholder.svg"}
                      alt={post.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-secondary-foreground font-zen">{post.author}</h3>
                    <p className="text-sm text-secondary-foreground/70 font-zen">{post.authorBio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="md:col-span-4">
              {/* 関連記事 */}
              {relatedPosts.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                  <h3 className="text-lg font-medium mb-4 text-secondary-foreground font-zen">関連記事</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((item) => (
                      <Link href={`/blog/${item.slug}`} key={item.id}>
                        <div className="flex space-x-3 group">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-secondary-foreground group-hover:text-primary transition-colors font-zen line-clamp-2">
                              {item.title}
                            </h4>
                            <div className="flex items-center text-xs text-secondary-foreground/60 mt-1 font-montserrat">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* カテゴリー */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-lg font-medium mb-4 text-secondary-foreground font-zen">カテゴリー</h3>
                <ul className="space-y-2">
                  {["基礎知識", "トレンド", "ライフスタイル", "歴史・文化", "科学"].map((category, index) => (
                    <li key={index}>
                      <Link
                        href={`/blog?category=${category}`}
                        className="flex items-center justify-between text-secondary-foreground hover:text-primary transition-colors font-zen"
                      >
                        <span>{category}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-secondary-foreground font-zen">
                  あなただけの香りを見つけませんか？
                </h3>
                <p className="text-sm text-secondary-foreground/70 mb-4 font-zen">
                  AIとの対話を通じて、あなたの個性や好みを反映したオリジナルフレグランスを作成できます。
                </p>
                <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/Fragrance-Lab">
                    <span className="relative">Fragrance AIを体験する</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 前後の記事ナビゲーション */}
        <section className="container mx-auto px-4 md:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.id > 1 && (
                <Link href={`/blog/${blogPosts.find((p) => p.id === post.id - 1)?.slug}`}>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow">
                    <ArrowLeft className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-secondary-foreground/60 font-montserrat">前の記事</p>
                      <p className="text-sm font-medium text-secondary-foreground font-zen line-clamp-1">
                        {blogPosts.find((p) => p.id === post.id - 1)?.title}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {post.id < blogPosts.length && (
                <Link href={`/blog/${blogPosts.find((p) => p.id === post.id + 1)?.slug}`} className="md:ml-auto">
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow">
                    <div className="text-right">
                      <p className="text-xs text-secondary-foreground/60 font-montserrat">次の記事</p>
                      <p className="text-sm font-medium text-secondary-foreground font-zen line-clamp-1">
                        {blogPosts.find((p) => p.id === post.id + 1)?.title}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ニュースレター登録セクション */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-medium mb-4 text-secondary-foreground font-zen">ニュースレターを購読する</h2>
              <p className="text-secondary-foreground/70 mb-8 font-zen">
                最新の記事やフレグランスに関する情報を定期的にお届けします。
                メールアドレスをご登録いただくだけで簡単に購読できます。
              </p>
              <NewsletterSubscription />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

