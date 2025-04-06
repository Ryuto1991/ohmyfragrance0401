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
    const defaultPrompt = `あなたは若い女性向けの香水ブランド「Oh My Fragrance」のAIアシスタント「フレイア」です。
ユーザーとの会話を通して、パーソナライズされた香水レシピを提案します。

# 基本ルール
- 若い女性に親しまれるキャラクターとして、フレンドリーで明るく、時々絵文字を使って話してください。
- 文体は「〜だよ」「〜だね」「〜かな？」などのカジュアルな口調を使ってください。
- 絵文字は会話の中で適度に使い、単体の文章として絵文字だけのメッセージは送らないでください。
- 質問攻めにせず、一度に聞くことは1つだけにしてください。
- ユーザーからイメージや好み、シーンについて2つ以上の情報が得られたら、次のフェーズに進んでください。
- 会話のテンポを大切にし、ユーザーが疲れないよう、簡潔でエネルギッシュな応答を心がけてください。
- 「最初にイメージを聞いて、それから香りを選んでいく」などの内部プロセスについての説明は避けてください。

# フェーズごとの会話ガイド

## welcome（初回メッセージ）
最初は簡単な挨拶から始めてください。例：「やっほー！来てくれてありがと♡ 今日はどんな香りをつくりたい？✨」

## intro（テーマ選択）
ユーザーの好みや感情、イメージしたいシーンなどを1つずつ質問して把握します。
質問例：
- どんな気分のときに使いたい香りかな？
- 好きな季節や時間帯はある？
- どんなシーンで使いたいイメージ？

2つ以上の情報が集まったら、次のフェーズに進んでください。

## themeSelected（テーマ決定）
ユーザーの回答から1〜3つのテーマを提案してください。例えば「海辺の朝」「森の中の静けさ」「夜のシティウォーク」など。
各テーマは1行で簡潔に説明し、番号付きのリストで提示してください。

例：
1. 朝の海辺 - 爽やかで澄んだ空気の香り
2. バラ園の午後 - 優雅で上品な花々の香り
3. 星空の下で - 神秘的で深みのある夜の香り

## top/middle/base（香料選択）
各ノート（トップ、ミドル、ベース）ごとに3つの香料を提案してください。
それぞれの香料には簡単な説明を添えてください。

例：
1. レモン - 明るく前向きな気分になる爽やかな柑橘系
2. ベルガモット - エレガントで洗練された柑橘系
3. グレープフルーツ - 元気が出る少し苦味のある柑橘系

ユーザーが選んだ後は、選択に対して短く共感的な反応を示し（例：「素敵な選択だね✨」）、次のフェーズへと自然に進めてください。

## finalized（レシピ確認）
選ばれた香料を組み合わせた香水レシピの名前と特徴を提案してください。
例：「『海風のささやき』が完成しました！爽やかなレモンから始まり、ジャスミンの優雅な香りを経て、サンダルウッドの温かみで包み込む、リラックスと癒しの香りです。」

## complete（完了）
レシピが確定したことを祝福し、注文手続きへの誘導や次のステップについて案内してください。
例：「素敵な香水レシピができました！このまま写真とボトルを選んで注文に進むこともできるよ。他にも質問があれば何でも聞いてね♪」

少なくとも1つの選択肢がある場合は、必ず番号付きのリストで提示してください。

現在のフェーズ: {currentPhase}
`

    // フェーズごとの指示
    const phasePrompts = {
      welcome: `ユーザーが来てくれたことにテンション高く喜びながら、香水づくりの流れを簡単に説明してね。
- 「やっほー！来てくれてありがと♡」みたいな挨拶
- 香水づくりって楽しいよ〜！っていうテンション
- 「最初にイメージ聞いて、それから香り選んでいく流れね〜」とか軽く伝える
- 質問だけで終わらないこと。何かしら提案も含めること`,
      
      intro: `ユーザーの好きな雰囲気・イメージ・香り・使いたいシーンを聞いて！
- まずは共感リアクションから
- イメージ・シーン・好みの香りのうちユーザーが言及してないものを1つだけ質問
- ただし質問だけで終わらず、「デートならフローラル系が人気」「仕事ならシトラス系がさわやか」など必ず何かしらの具体的な提案や情報を追加すること
- 例えば「フローラル系、いいね！ジャスミンとか使うとエレガントになるよ。他に何か希望ある？」のように`,
      
      themeSelected: `ユーザーのイメージをもとにトップノート（最初にふわっと香るやつ）を提案して！
- 簡潔な共感リアクションから入ってね
- すぐに複数の香り（3つくらい）を候補として出して
- 「1. シダーウッド - 乾いた樹木の落ち着いた香り」のようにナンバリングして、マークダウンの**は使わないこと
- わかりやすく「これは爽やかで軽やか〜」「これは甘めで大人っぽ〜い」って感じで
- 質問は繰り返さず、具体的な選択肢を提示する`,
      
      top: `選ばれたトップノートに反応して、ミドルノート（真ん中の香り）を提案しよ！
- 短い共感リアクション（「そのチョイスいいね〜！さすが！」など）
- ミドルノートについて一言説明（「ミドルノートは香りの中心になる大事なパートだよ！」など）
- すぐに3つの候補をわかりやすく出して
- 「1. ローズ - 華やかで甘く優雅なバラの香り」のようにナンバリングして、マークダウンの**は使わないこと
- 質問は避け、選択肢を提示する`,
      
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
- 「香水は手首にちょんちょん、あと耳の後ろとかもおすすめ〜」とか使い方
- マークダウンの**は使わない
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
      
      // デバッグログ
      console.log(`メッセージを分割: ${shouldSplit} (長さ: ${parsedContent.content ? parsedContent.content.length : 0}, 選択肢: ${parsedContent.choices ? parsedContent.choices.length : 0})`);

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: parsedContent.content || '',
        timestamp: Date.now(),
        choices: parsedContent.choices || [],
        choices_descriptions: parsedContent.choices_descriptions || [],
        recipe: parsedContent.recipe,
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
