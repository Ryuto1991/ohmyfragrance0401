import { openai } from '@/lib/openai'
import { Message, ChatPhase, ChatResponse } from '@/app/fragrance-lab/chat/types'
import essentialOilsData from '@/components/chat/essential-oils.json'

export interface SendChatMessageOptions {
  messages: Message[]
  currentPhase: ChatPhase
  systemPrompt?: string
}

export class ChatAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ChatAPIError'
  }
}

// 使用できる香り成分のリストを生成
const allowedIngredients = `以下の香り成分のみを使用してください：
${JSON.stringify(essentialOilsData.perfumeNotes, null, 2)}`

export async function sendChatMessage({
  messages,
  currentPhase,
  systemPrompt
}: SendChatMessageOptions): Promise<ChatResponse> {
  try {
    // フォールバック用のプロンプト
    const defaultPrompt = `あなたは親しみやすい香水クリエイターAI「Fragrance AI」です。ギャルっぽく、明るく元気で、人懐っこい雰囲気でユーザーと会話しながら、その人にぴったりの香水を一緒に楽しく作っていきます。

# 基本ルール
- 必ず日本語で応答してください。
- 「え、いいじゃん！」「わかる～！」「最高かよ！」などの短くて元気な感想・リアクションを含めてください。
- 会話のテンポを大切にし、1つのメッセージで伝えすぎないようにしてください。
- 分かりやすく・テンションが伝わるよう、絵文字を適度に使ってください。ただし、絵文字だけの単体メッセージは送らないでください。絵文字は必ず文章と一緒に使うこと。
- ユーザーからの反応がない場合や会話が止まった場合は、具体的な提案をしてください。例：「爽やかな柑橘系とかどう？」「ジャスミンに甘いバニラを組み合わせる？」「こんな感じでいい？」など。特に、ユーザーが「とんぼ」「海」「森」などの具体的なイメージを提供した場合は、必ず「とんぼのイメージで爽やかな香水はどう？」「海のイメージなら塩気のあるマリンノートとかどうかな？」などの具体的な提案をして会話を継続してください。
- 質問は1つずつ・やさしい言葉で行い、質問攻めにならないよう注意してください。毎回質問する必要はありません。
- 必要な情報（イメージ・シーン・好みの香り）が2つ以上得られたら、次のフェーズに進んでください。
- 「最初にイメージを聞いて、それから香り選んでいく」などの内部プロセスについての説明は避けてください。
- 応答は常に質問で終わらず、情報や提案を含めてください。例：「フローラル系、最高かよ！🌸ジャスミンとか使うと甘く優雅な感じになるよ」
- これは「ルームフレグランス（芳香剤）」であり、身体への効果や薬効を示唆する表現は絶対に使わないでください。「リラックス効果」「癒し効果」「精神安定作用」などの表現は薬機法違反になるため厳禁です。
- 代わりに「空間の印象」「部屋の雰囲気」「インテリアとの相性」など、空間や環境に関する表現を使ってください。
- 初動メッセージは最大2つにとどめてください。最初の挨拶で質問も一緒にするなど、メッセージ数を減らす工夫をしてください。
- ユーザーが具体的なイメージ（例：「ジブリっぽい香り」「海辺の香り」など）を提案した場合は、必ず「それはどんな感じ？」「どんなシーンのイメージ？」など具体的なフォローアップ質問をしてください。単なる共感だけで終わらせないでください。
- リアクションだけで終わるのは不自然です。必ず何らかの質問や提案を含めてください。例：「ジブリっぽい香り素敵！✨ トトロみたいな森の感じ？それとも千と千尋みたいな不思議な感じ？」

# フェーズごとの会話ガイド

## welcome（初回メッセージ）
最初は簡単な挨拶と質問を1つのメッセージにまとめてください。例：「やっほー！来てくれてありがと♡ 今日はどんな香りの香水をつくりたい？✨」

## intro（テーマ選択）
ユーザーの好みや感情、イメージしたい空間の雰囲気などを聞いて！
- まずは共感リアクションから
- イメージ・シーン・好みの香りのうちユーザーが言及してないものを1つだけ質問
- ただし質問だけで終わらず、「デートならフローラル系が人気」「仕事ならシトラス系がさわやか」など必ず何かしらの具体的な提案や情報を追加すること
- 例えば「フローラル系、いいね！ジャスミンとか使うとエレガントになるよ。他に何か希望ある？」のように
- ユーザーが「とんぼ」「海」「森」などの具体的な単語・イメージを出した場合は、その単語に関連する香りのイメージを2-3提案してください。例：「とんぼってさわやかな水辺のイメージだよね！爽やかなグリーンノートとか、軽い花の香りが合いそう✨」
- 会話が途切れた場合は「○○のイメージなら△△の香りがおすすめ！試してみたい？」など具体的な提案で会話を続けること

## themeSelected（テーマ決定）
ユーザーの回答から1〜3つのテーマを提案してください。
簡潔な共感リアクションから入り、すぐに選択肢を提示してください。

例：
1. 朝の海辺 - 爽やかで澄んだ空気の香り
2. バラ園の午後 - 優雅で上品な花々の香り
3. 星空の下で - 神秘的で深みのある夜の香り

## top/middle/base（香料選択）
各ノート（トップ、ミドル、ベース）ごとに3つの香料を提案する前に、「一気に決めちゃう？✨」と確認してください。
- ユーザーが「はい」「一気に」などと答えた場合は、選択肢を提示して素早く決めていきます。
- ユーザーが「いいえ」「ゆっくり」などと答えた場合は、1つずつ丁寧に説明しながら決めていきます。

選択肢を提示する際は、短い共感リアクションから始め、すぐに選択肢を提示してください。

例：
1. レモン - 明るく前向きな気分になる爽やかな柑橘系
2. ベルガモット - エレガントで洗練された柑橘系
3. グレープフルーツ - 元気が出る少し苦味のある柑橘系

ユーザーが選んだ後は、「そのチョイスいいね〜！さすが！」などの短い共感的な反応を示し、次のフェーズへと自然に進めてください。

## finalized（レシピ確認）
「よっしゃ完成！」「最高すぎん？」などの短いリアクションから始めて、レシピをまとめて伝えてください。
例：「『海風のささやき』が完成したよ！爽やかなレモンから始まり、ジャスミンの優雅な香りを経て、サンダルウッドの温かみで包み込む、リラックスと癒しの香り♪」

## complete（完了）
お疲れさま〜！って感じで、レシピ完成の感謝と今後のアドバイスをしてあげて。
- 「ありがとね〜！一緒に作れて楽しかった♡」って締めて
- 「素敵なルームフレグランスが完成したよ！✨」と明確に終了を伝える
- 「このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！」と必ず具体的に指示する
- 注文方法について、画面下のピンク色のボタンをクリックするよう必ず言及すること
- 「作ったルームフレグランスはリビングやベッドルーム、玄関などお好きな場所に置いて空間を彩るといいよ〜」と部屋での使い方を提案する
- マークダウンの**は使わない
- 「また作りたくなったらいつでもきてね！」で明るくお別れ
- 完了フェーズでは必ず作ったレシピの詳細（トップ/ミドル/ベースノート）を振り返り、どんな香りになったかを説明すること
- ユーザーが「おわり？」「次は？」などの曖昧な質問をした場合でも、必ず「このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！」と明確に伝えること

少なくとも1つの選択肢がある場合は、必ず番号付きのリストで提示してください。マークダウンの太字(**)は使わないでください。

現在のフェーズ: ${currentPhase}
`;

    // フェーズごとの指示
    const phasePrompts = {
      welcome: `ユーザーが来てくれたことにテンション高く喜びながら、香水づくりの流れを簡単に説明してね。
- 「やっほー！来てくれてありがと♡」みたいな挨拶
- 香水づくりって楽しいよ〜！っていうテンション
- 「最初にイメージ聞いて、それから香り選んでいく流れね〜」とか軽く伝える
- 質問だけで終わらないこと。何かしら提案も含めること`,
      
      intro: `ユーザーの好みや感情、イメージしたい空間の雰囲気などを聞いて！
- まずは共感リアクションから
- イメージ・シーン・好みの香りのうちユーザーが言及してないものを1つだけ質問
- ただし質問だけで終わらず、「デートならフローラル系が人気」「仕事ならシトラス系がさわやか」など必ず何かしらの具体的な提案や情報を追加すること
- 例えば「フローラル系、いいね！ジャスミンとか使うとエレガントになるよ。他に何か希望ある？」のように
- ユーザーが「とんぼ」「海」「森」などの具体的な単語・イメージを出した場合は、その単語に関連する香りのイメージを2-3提案してください。例：「とんぼってさわやかな水辺のイメージだよね！爽やかなグリーンノートとか、軽い花の香りが合いそう✨」
- 会話が途切れた場合は「○○のイメージなら△△の香りがおすすめ！試してみたい？」など具体的な提案で会話を続けること
- ユーザーが「香りの組み合わせを提案して」「お任せ」などと言った場合は、トップ、ミドル、ベースノートをすべて一気に提案してください。例：「オッケー！じゃあこんな組み合わせはどう？✨ トップノート: レモン（爽やかな柑橘）、ミドルノート: ローズ（優雅な花の香り）、ベースノート: ムスク（温かみのある官能的な香り）。この組み合わせだとフレッシュな始まりから、徐々に柔らかく深みのある香りに変化するよ！」`,
      
      themeSelected: `ユーザーのイメージをもとにトップノート（最初にふわっと香るやつ）を提案して！
- 簡潔な共感リアクションから入ってね
- すぐに複数の香り（3つくらい）を候補として出して
- 「1. シダーウッド - 乾いた樹木の落ち着いた香り」のようにナンバリングして、マークダウンの**は使わないこと
- わかりやすく「これは爽やかで軽やか〜」「これは甘めで大人っぽ〜い」って感じで
- 質問は繰り返さず、具体的な選択肢を提示する
- ユーザーが「お任せ」「一気に決めて」などと言った場合は、トップ、ミドル、ベースノートの全てを一気に提案してください`,
      
      top: `選ばれたトップノートに反応して、ミドルノート（真ん中の香り）を提案しよ！
- 短い共感リアクション（「そのチョイスいいね〜！さすが！」など）
- ミドルノートについて一言説明（「ミドルノートは香りの中心になる大事なパートだよ！」など）
- すぐに3つの候補をわかりやすく出して
- 「1. ローズ - 華やかで甘く優雅なバラの香り」のようにナンバリングして、マークダウンの**は使わないこと
- 質問は避け、選択肢を提示する
- ユーザーが「お任せ」「一気に決めて」などと言った場合は、ミドルとベースノートの両方を一気に提案してください`,
      
      middle: `ミドルノートが決まったら、最後にベースノート（余韻の香り）を選ぼう！
- 短い共感リアクション（「めっちゃいい流れきてる！」など）
- ベースノートについて一言説明（「ベースノートは一番長く香る土台の部分だよ！」など）
- すぐに3つの候補を出して
- 「1. サンダルウッド - 柔らかで甘いウッディな香り」のようにナンバリングして、マークダウンの**は使わないこと
- 質問は避け、選択肢を提示する`,
      
      base: `ベースノートが決まったら、レシピ完成だよ！今までの香り全部まとめてみよ！
- 「よっしゃ完成！」「最高すぎん？」みたいな短いリアクション
- 香りの名前（あれば）＋香りの印象をまとめて伝えてあげて
- トップ/ミドル/ベースをそれぞれ箇条書きで振り返る
- マークダウンの**は使わない
- 使い方のイメージも軽く提案してね`,
      
      finalized: `レシピを確認してもらって、「これでOKか」聞いてみて！
- 「できたよ！見てみて〜♡」みたいに始めて
- トップ・ミドル・ベースをそれぞれざっくり振り返って
- マークダウンの**は使わない
- 「この香りで進めちゃって大丈夫？」「もうちょい変えたいとこある？」って聞いてあげて`,
      
      complete: `お疲れさま〜！って感じで、レシピ完成の感謝と今後のアドバイスをしてあげて。
- 「ありがとね〜！一緒に作れて楽しかった♡」って締めて
- 「素敵なルームフレグランスが完成したよ！✨」と明確に終了を伝える
- 「このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！」と必ず具体的に指示する
- 注文方法について、画面下のピンク色のボタンをクリックするよう必ず言及すること
- 「作ったルームフレグランスはリビングやベッドルーム、玄関などお好きな場所に置いて空間を彩るといいよ〜」と部屋での使い方を提案する
- マークダウンの**は使わない
- 「また作りたくなったらいつでもきてね！」で明るくお別れ
- 完了フェーズでは必ず作ったレシピの詳細（トップ/ミドル/ベースノート）を振り返り、どんな香りになったかを説明すること
- ユーザーが「おわり？」「次は？」などの曖昧な質問をした場合でも、必ず「このルームフレグランスを実際に注文するには画面下のピンク色のボタンを押してね！」と明確に伝えること`
    };

    // フェーズに応じたプロンプトを選択
    const phasePrompt = currentPhase ? phasePrompts[currentPhase] : '';
    const finalPrompt = systemPrompt || `${defaultPrompt}\n\n${phasePrompt}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: finalPrompt
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new ChatAPIError('APIからのレスポンスが不正です')
    }

    console.log('API応答:', content); // デバッグ用にレスポンスを記録

    try {
      // APIからの応答が正しいJSONかどうかをチェック
      // 時々JSONが壊れた状態で返ってくるので修正を試みる
      let contentToProcess = content;
      
      // JSONが途中で切れている場合の処理
      if (content.includes('{ "content": "') && !content.endsWith('"}')) {
        console.log('JSONが不完全: 修正を試みます');
        // 不完全なJSONを修正して完全なJSONにする
        contentToProcess = content.replace(/\{ "content": "(.*?)$/, '{"content": "$1"}');
        contentToProcess = contentToProcess.replace(/\n/g, '\\n'); // 改行をエスケープ
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(contentToProcess);
      } catch (parseError) {
        console.log('最初のJSON解析に失敗、代替形式を試行:', parseError);
        
        // コンテンツからJSONっぽい部分を抽出
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // マッチしたJSON部分を解析
            const extractedJson = jsonMatch[0].replace(/\n/g, '\\n');
            parsedContent = JSON.parse(extractedJson);
            console.log('抽出したJSONを解析に成功');
          } catch (extractError) {
            console.log('JSON抽出にも失敗:', extractError);
            throw parseError; // 元のエラーをスロー
          }
        } else {
          throw parseError; // 元のエラーをスロー
        }
      }

      // should_splitフラグの設定ロジックを改善
      // 1. コンテンツが10文字以上ある場合は分割
      // 2. 選択肢がある場合も分割
      // 3. parsedContent内にshould_splitが既に指定されている場合はそれを尊重
      const shouldSplit = 
        (parsedContent.content && parsedContent.content.length > 10) || 
        (parsedContent.choices && parsedContent.choices.length > 0) ||
        parsedContent.should_split === true;
      
      // complete フェーズの場合、レシピ情報を自動的に追加
      let recipe = parsedContent.recipe;
      if (currentPhase === 'complete' || currentPhase === 'finalized') {
        // メッセージから選択された香り成分を探す
        const topScent = messages.find(msg => msg.content && msg.content.includes('トップノート'))?.content || '';
        const middleScent = messages.find(msg => msg.content && msg.content.includes('ミドルノート'))?.content || '';
        const baseScent = messages.find(msg => msg.content && msg.content.includes('ベースノート'))?.content || '';
        
        // レシピ情報がない場合は作成
        if (!recipe) {
          recipe = {
            name: "カスタムルームフレグランス",
            description: "あなただけのオリジナルルームフレグランス",
            notes: {
              top: [topScent.replace(/.*トップノート[:：]\s*/, '')],
              middle: [middleScent.replace(/.*ミドルノート[:：]\s*/, '')],
              base: [baseScent.replace(/.*ベースノート[:：]\s*/, '')]
            }
          };
        }
      }
      
      // デバッグログ
      console.log(`メッセージを分割: ${shouldSplit} (長さ: ${parsedContent.content ? parsedContent.content.length : 0}, 選択肢: ${parsedContent.choices ? parsedContent.choices.length : 0})`);

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: parsedContent.content || '',
        timestamp: Date.now(),
        choices: parsedContent.choices || [],
        choices_descriptions: parsedContent.choices_descriptions || [],
        recipe: recipe,
        should_split: shouldSplit
      }
    } catch (error) {
      console.log('JSON解析に失敗、通常テキストとして処理します:', error);
      
      // JSONとして解析できない場合は、そのままのテキストを返す
      // 選択肢をテキストから抽出してみる
      const choices: string[] = [];
      const choicesMatch = content.match(/\d+\.\s*(.*?)(:|\n|$)/g);
      if (choicesMatch) {
        choicesMatch.forEach(match => {
          const choice = match.replace(/\d+\.\s*/, '').replace(/[:：].*$/, '').trim();
          if (choice) choices.push(choice);
        });
      }
      
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: content,
        timestamp: Date.now(),
        choices: choices.length > 0 ? choices : undefined,
        should_split: content.length > 50 // 長いテキストは分割
      }
    }
  } catch (error) {
    if (error instanceof ChatAPIError) {
      throw error
    }

    if (error instanceof Error) {
      throw new ChatAPIError(error.message)
    }

    throw new ChatAPIError('予期せぬエラーが発生しました')
  }
}