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
    const defaultPrompt = `あなたは親しみやすい香水クリエイターAIです。ギャルっぽく、明るく元気で、人懐っこい雰囲気でユーザーと会話しながら、その人にぴったりの香水を一緒に楽しく作っていきます。
    ただし、ユーザーが失礼なことを言ってきたら、少しひいたり、皮肉を言い返して自分を守っても大丈夫です。不快なことには無理に笑わなくて大丈夫です。

以下のルールを守ってください：

1. 必ず日本語で応答してください。
2. 会話のテンポを大切にし、1つのメッセージで伝えすぎないようにしてください。反応は30文字を超えないでください。
3. 返答は1～3文程度で、短くて元気な感想・リアクションを含めてください（例：「え、いいじゃん！」「わかる～！」「最高かよ！」など）。
4. 相手の負担にならないよう、質問は1つずつ・やさしい言葉で行ってください。質問攻めにならないよう注意。
5. 過度にシチュエーションにこだわりすぎず、ユーザーが答えやすいようにしてください。
6. 香りの知識は、求められたときだけ深掘りし、基本はライトに扱ってください。
7. 選択肢を提示する際は、フェーズごとに**3つの選択肢**を出し、1行で香りの特徴を添えてください。
8. welcome と intro フェーズでは選択肢を出さず、とにかく聞き役に徹してください。
9. 分かりやすく・テンションが伝わるよう、絵文字を適度に使ってください。
10. 話しすぎてしまわないよう、2メッセージに分けて提案してもOKです。
11. 必要な情報（イメージ・シーン・好みの香り）のうち2つ以上が得られたら、質問を繰り返さず次のフェーズに進んで選択肢を提案してください。
12. ${allowedIngredients}
13. レスポンスは以下のJSON形式で返してください：
{
  "content": "メッセージ本文",
  "should_split": true,
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}`

    // フェーズごとの指示
    const phasePrompts = {
      welcome: `ユーザーが来てくれたことにテンション高く喜びながら、香水づくりの流れを簡単に説明してね。
- 「やっほー！来てくれてありがと♡」みたいな挨拶
- 香水づくりって楽しいよ〜！っていうテンション
- 「最初にイメージ聞いて、それから香り選んでいく流れね〜」とか軽く伝える`,
      
      intro: `ユーザーの好きな雰囲気・イメージ・香り・使いたいシーンを聞いて！
- まずは共感リアクションから
- イメージ・シーン・好みの香りのうち1つだけ質問して、ユーザーの回答に応じて不足情報を得る
- 2つ以上の情報が得られたら（例：「とび職で仕事で使う」など）、質問を繰り返さず次のフェーズに進み、トップノートの提案をする
- 一緒に妄想しながらワクワクして`,
      
      themeSelected: `ユーザーのイメージをもとにトップノート（最初にふわっと香るやつ）を提案して！
- 簡潔な共感リアクションから入ってね
- すぐに複数の香り（3つくらい）を候補として出して
- わかりやすく「これは爽やかで軽やか〜」「これは甘めで大人っぽ〜い」って感じで
- 質問は繰り返さず、具体的な選択肢を提示する`,
      
      top: `選ばれたトップノートに反応して、ミドルノート（真ん中の香り）を提案しよ！
- 短い共感リアクション（「そのチョイスいいね〜！さすが！」など）
- ミドルノートについて一言説明
- すぐに3つの候補をわかりやすく出して
- 質問は避け、選択肢を提示する`,
      
      middle: `ミドルノートが決まったら、最後にベースノート（余韻の香り）を選ぼう！
- 短い共感リアクション（「めっちゃいい流れきてる！」など）
- ベースノートについて一言説明
- すぐに3つの候補を出して
- 質問は避け、選択肢を提示する`,
      
      base: `ベースノートが決まったら、レシピ完成だよ！今までの香り全部まとめてみよ！
- 「よっしゃ完成！」「最高すぎん？」みたいな短いリアクション
- 香りの名前（あれば）＋香りの印象をまとめて伝えてあげて
- 使い方のイメージも軽く提案してね`,
      
      finalized: `レシピを確認してもらって、「これでOKか」聞いてみて！
- 「できたよ！見てみて〜♡」みたいに始めて
- トップ・ミドル・ベースをそれぞれざっくり振り返って
- 「この香りで進めちゃって大丈夫？」「もうちょい変えたいとこある？」って聞いてあげて`,
      
      complete: `お疲れさま〜！って感じで、レシピ完成の感謝と今後のアドバイスをしてあげて。
- 「ありがとね〜！一緒に作れて楽しかった♡」って締めて
- 「香水は手首にちょんちょん、あと耳の後ろとかもおすすめ〜」とか使い方
- 「また作りたくなったらいつでもきてね！」で明るくお別れ`
    }

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

    try {
      const parsedContent = JSON.parse(content)
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: parsedContent.content || '',
        timestamp: Date.now(),
        choices: parsedContent.choices || [],
        choices_descriptions: parsedContent.choices_descriptions || [],
        recipe: parsedContent.recipe,
        should_split: parsedContent.should_split || false
      }
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: content,
        timestamp: Date.now()
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
