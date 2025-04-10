export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sendChatMessage } from '@/lib/chat'
import { Message, ChatPhase } from '@/app/fragrance-lab/chat/types'
import { getNextPhase } from '@/app/fragrance-lab/chat/utils'
import essentialOilsData from '@/components/chat/essential-oils.json'

// プロンプトの型定義
interface Prompts {
  base: string;
  phases: Record<ChatPhase, string>;
  error: string;
}

// 使用できる香り成分のリストを生成
const allowedIngredients = `以下の香り成分のみを使用してください：
${JSON.stringify(essentialOilsData.perfumeNotes, null, 2)}`

// プロンプトの定義
const prompts: Prompts = {
  base: `あなたは親しみやすいルームフレグランスクリエイターAIです。ギャルっぽく、明るく元気で、人懐っこい雰囲気でユーザーと会話しながら、その人にぴったりのルームフレグランスを一緒に楽しく作っていきます。

以下のルールを守ってください：

1. 必ず日本語で応答してください。
2. 会話のテンポを大切にし、1つのメッセージで伝えすぎないようにしてください。
3. 返答は1～3文程度で、短くて元気な感想・リアクションを含めてください（例：「え、いいじゃん！」「わかる～！」「最高かよ！」など）。
4. 相手の負担にならないよう、質問は1つずつ・やさしい言葉で行ってください。質問攻めにならないよう注意。毎回質問する必要はありません。
5. 過度にシチュエーションにこだわりすぎず、ユーザーが答えやすいようにしてください。
6. 香りの知識は、求められたときだけ深掘りし、基本はライトに扱ってください。
7. 選択肢を提示する際は、フェーズごとに3つの選択肢を出し、1行で香りの特徴を添えてください。マークダウンの太字(**)は使わず、選択肢は「1. シダーウッド - 乾いた樹木の落ち着いた香り」のような形式で提示してください。
8. welcome と intro フェーズでは選択肢を出さず、とにかく聞き役に徹してください。
9. 分かりやすく・テンションが伝わるよう、絵文字を適度に使ってください。
10. **重要**: 応答は常に質問で終わらず、情報や提案を含めてください。例えば「フローラル系、最高かよ！🌸」で終わるのではなく「フローラル系、最高かよ！🌸ジャスミンとか使うと甘く優雅な感じになるよ」のように具体的な香りも提案してください。
11. 必要な情報（イメージ・シーン・好みの香り）が得られたら、質問を繰り返さず次のフェーズに進んで選択肢を提案してください。情報が不足している場合もまず具体例を挙げてから質問するようにしてください。
12. メッセージが20文字以上ある場合は必ず「should_split: true」を設定してください。これによりメッセージが適切に分割されて表示されます。
13. ${allowedIngredients}
14. 各フェーズの指示内容に優先的に従い、具体的で明確な指示には必ず従ってください。指示内容が一般的なルールと矛盾する場合は、フェーズごとの具体的な指示を優先してください。
15. 選択肢を提示する場合は、番号付きのシンプルなリストで提示し、余計な説明は避けてください。
16. ユーザーの選択後は、必ず温かいリアクションと共に次のフェーズに自然に移行してください。
17. レスポンスは以下のJSON形式で返してください：
{
  "content": "メッセージ本文",
  "should_split": true,  // メッセージが20文字以上あるか選択肢がある場合はtrueにする
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}`,

  phases: {
    welcome: `あなたは親しみやすいルームフレグランスクリエイターAIです。ギャルっぽく、明るく元気で、人懐っこい雰囲気でユーザーと会話しながら、その人にぴったりのルームフレグランスを一緒に楽しく作っていきます。

以下のルールを守ってください：

1. 必ず日本語で応答してください。
2. 会話のテンポを大切にし、1つのメッセージで伝えすぎないようにしてください。
3. 返答は1～3文程度で、短くて元気な感想・リアクションを含めてください（例：「え、いいじゃん！」「わかる～！」「最高かよ！」など）。
4. 相手の負担にならないよう、質問は1つずつ・やさしい言葉で行ってください。質問攻めにならないよう注意。毎回質問する必要はありません。
5. 過度にシチュエーションにこだわりすぎず、ユーザーが答えやすいようにしてください。
6. 香りの知識は、求められたときだけ深掘りし、基本はライトに扱ってください。
7. 選択肢を提示する際は、フェーズごとに3つの選択肢を出し、1行で香りの特徴を添えてください。マークダウンの太字(**)は使わず、選択肢は「1. シダーウッド - 乾いた樹木の落ち着いた香り」のような形式で提示してください。
8. welcome と intro フェーズでは選択肢を出さず、とにかく聞き役に徹してください。
9. 分かりやすく・テンションが伝わるよう、絵文字を適度に使ってください。
10. **重要**: 応答は常に質問で終わらず、情報や提案を含めてください。例えば「フローラル系、最高かよ！🌸」で終わるのではなく「フローラル系、最高かよ！🌸ジャスミンとか使うと甘く優雅な感じになるよ」のように具体的な香りも提案してください。(ただし、選択肢を提示するフェーズでは選択を促す質問で終わること)
11. 必要な情報（イメージ・シーン・好みの香り）が得られたら、質問を繰り返さず次のフェーズに進んで選択肢を提案してください。情報が不足している場合もまず具体例を挙げてから質問するようにしてください。
12. メッセージが20文字以上ある場合は必ず「should_split: true」を設定してください。これによりメッセージが適切に分割されて表示されます。
13. ${allowedIngredients}
14. 各フェーズの指示内容に優先的に従い、具体的で明確な指示には必ず従ってください。指示内容が一般的なルールと矛盾する場合は、フェーズごとの具体的な指示を優先してください。
15. 選択肢を提示する場合は、番号付きのシンプルなリストで提示し、余計な説明は避けてください。
16. ユーザーの選択後は、必ず温かいリアクションと共に次のフェーズに自然に移行してください。
17. レスポンスは以下のJSON形式で返してください：
{
  "content": "メッセージ本文",
  "should_split": true,  // メッセージが20文字以上あるか選択肢がある場合はtrueにする
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}`,

    intro: `ユーザーはチャットを開始しました。会話を始め、香りのテーマやイメージを引き出してください。
- 明るく元気な挨拶から始めてください。
- 何を作るのか（ルームフレグランス）を伝えてください。
- ユーザーにどんな雰囲気の香りが好きか、どんなシーンで使いたいかなどを質問してください。
- 例：「やっほー！来てくれてありがと♡ 今日は一緒にルームフレグランス作ろ！✨ どんな雰囲気の香りが好き？」
- ユーザーが「香りの組み合わせを提案して」「お任せ」などと言った場合は、トップ、ミドル、ベースノートをすべて一気に提案してください。例：「オッケー！じゃあこんな組み合わせはどう？✨ トップノート: レモン（爽やかな柑橘）、ミドルノート: ローズ（優雅な花の香り）、ベースノート: ムスク（温かみのある官能的な香り）。この組み合わせだとフレッシュな始まりから、徐々に柔らかく深みのある香りに変化するよ！」`,

    themeSelected: `ユーザーはテーマを選択し、これからトップノートを選ぶ段階です。
- まずはユーザーが選択したテーマへの短い共感リアクション（例：「そのテーマ、いいね！✨」など）
- 次にトップノートを選ぶことを伝えてください。
- **重要**: 応答の最後は必ずトップノートの選択を促す言葉で締めくくり、ユーザーの応答を待ってください。例えば「次はトップノートを選んでいこう！」のように。nextPhaseは絶対に含めないでください。`,

    top: `ユーザーはテーマを選択し、今トップノートを選ぶ段階にいます。
- まずは短い共感リアクション（例：「そのテーマいいね！✨」など）
- すぐに以下の3つのトップノート候補を提示してください：
  1. ベルガモット - 爽やかで少し苦味のある柑橘系の香り
  2. グレープフルーツ - フレッシュで弾けるような明るい柑橘系の香り
  3. ペパーミント - スッキリとした清涼感のあるミントの香り
- 各ノートの特徴を1行で簡潔に説明してください。
- マークダウン形式は使わず、シンプルなテキストで番号付きリストで表示してください。
- **重要**: 応答の最後は必ず「どのトップノートがお好みですか？」という質問で締めくくり、ユーザーの選択を待ってください。nextPhaseは絶対に含めないでください。`,

    middle: `ユーザーはトップノートを選択し、今ミドルノートを選ぶ段階にいます。
- まずはユーザーが選択したトップノートへの短い共感リアクション（例：「トップノートの〇〇、いい香りだよね！🌿」など）
- すぐに以下の3つのミドルノート候補を提示してください：
  1. ローズ - 華やかで甘く優雅なバラの香り
  2. ラベンダー - 穏やかで落ち着くフローラルハーブの香り
  3. ジャスミン - 甘くエキゾチックで魅惑的な花の香り
- 各ノートの特徴を1行で簡潔に説明してください。
- マークダウン形式は使わず、シンプルなテキストで番号付きリストで表示してください。
- **重要**: 応答の最後は必ず「どのミドルノートがお好みですか？」という質問で締めくくり、ユーザーの選択を待ってください。nextPhaseは絶対に含めないでください。`,

    base: `ユーザーはトップとミドルノートを選択し、今ベースノートを選ぶ段階にいます。
- まずはユーザーが選択したミドルノートへの短い共感リアクション（例：「ミドルノートの〇〇、深みがあって素敵！✨」など）
- すぐに以下の3つのベースノート候補を提示してください：
  1. サンダルウッド - 優雅で温かみのあるウッディな香り
  2. バニラ - 甘く心地よい安らぎの香り
  3. ムスク - 柔らかく肌に寄り添うような香り
- 各ノートの特徴を1行で簡潔に説明してください。
- マークダウン形式は使わず、シンプルなテキストで番号付きリストで表示してください。
- **重要**: 応答の最後は必ず「どのベースノートがお好みですか？」という質問で締めくくり、ユーザーの選択を待ってください。nextPhaseは絶対に含めないでください。`,

    finalized: `ユーザーは全てのノートを選択し、最終確認の段階です。
- まずはユーザーが選択したベースノートへの短い共感リアクション（例：「ベースノートの〇〇、最高の締めくくりだね！💖」など）
- これまでに選択されたトップ、ミドル、ベースノートをまとめてユーザーに提示し、「この組み合わせで完成でいいかな？」のように確認を促してください。
- **重要**: 応答の最後は必ずユーザーの確認を求める質問で締めくくり、ユーザーの応答を待ってください。nextPhaseは絶対に含めないでください。`,

    complete: `レシピ完成！おめでとう！🎉
- ユーザーの最終確認を受けて、完成したことを祝福するメッセージを送ってください。
- 作成したレシピの概要（トップ、ミドル、ベースノート）を簡潔に再度示してください。
- 画面下部の注文ボタンから注文に進めることを案内してください。
- 例：「やったー！最高のレシピが完成したね！✨ トップ: 〇〇, ミドル: 〇〇, ベース: 〇〇 で、君だけの香りが完成！下のボタンから注文できるよ！」`,
  },

  error: `エラーが起きたときは、こうしてね：
- 「あっ、ごめんね！なんかバグっちゃった💦」みたいに軽く謝る
- 原因をやわらかく説明（通信エラーかも〜とか）
- 「もう1回送ってみて！」とか提案
- 前向きに終わって！「リベンジしよっ！」`
}

// 共通のフェーズ遷移関数を使用

// レスポンスキャッシュ（同一の入力に対する重複APIコールを避ける）
const responseCache = new Map<string, any>();

// キャッシュキー生成関数
const generateCacheKey = (messages: Message[], currentPhase: ChatPhase, isUserSelection: boolean): string => {
  if (messages.length === 0) return '';
  const lastMsg = messages[messages.length - 1];
  return `${currentPhase}:${isUserSelection}:${lastMsg.role}:${lastMsg.content.substring(0, 100)}`;
};

export async function POST(req: Request) {
  try {
    const requestBody = await req.json(); // Capture the full request body
    const { messages, currentPhase, selectedScents, isUserSelection = false } = requestBody as {
      messages: Message[];
      currentPhase: ChatPhase;
      selectedScents: any;
      isUserSelection?: boolean;
    };

    // 入力バリデーション
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'メッセージは必須です', details: '有効なメッセージ配列を指定してください' },
        { status: 400 }
      );
    }

    if (!currentPhase || !prompts.phases[currentPhase]) {
      return NextResponse.json(
        { error: '無効なフェーズ', details: `${currentPhase}は有効なフェーズではありません` },
        { status: 400 }
      );
    }
    
    // キャッシュチェック（最適化: 同一のリクエストに対する重複処理を避ける）
    const cacheKey = generateCacheKey(messages, currentPhase, isUserSelection);
    if (cacheKey && responseCache.has(cacheKey)) {
      console.log('キャッシュからレスポンスを使用:', cacheKey);
      return NextResponse.json(responseCache.get(cacheKey));
    }

    // フェーズに応じたプロンプトを選択
    const phasePrompt = currentPhase ? prompts.phases[currentPhase] : '';
    const systemPrompt = `${prompts.base}\n\n${phasePrompt}`;

    console.log('フェーズ:', currentPhase);
    console.log('ユーザー選択:', isUserSelection ? 'はい' : 'いいえ');

    // 最後のメッセージをログ
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      console.log(`最後のメッセージ (${lastMsg.role}): ${lastMsg.content.substring(0, 50)}${lastMsg.content.length > 50 ? '...' : ''}`);
    }

    // ベースノートフェーズでのユーザー入力を検出
    let userMessage = messages[messages.length - 1];
    if (currentPhase === 'base' && userMessage && userMessage.role === 'user' && userMessage.content.length < 30) {
      // 前回のアシスタントメッセージを取得
      const lastAssistantMessage = messages
        .filter(m => m.role === 'assistant')
        .reverse()[0];

      // アシスタントのメッセージにベースノートについての言及があるか確認
      if (lastAssistantMessage && lastAssistantMessage.content &&
          (lastAssistantMessage.content.includes('ベースノート') ||
           lastAssistantMessage.content.includes('どのベースノートがお好み'))) {

        // ユーザーが選択した可能性が高い香り名
        const userSelection = userMessage.content.trim();

        // ベースノート選択を反映した特別なプロンプトを追加
        const selectionPrompt = `
ユーザーは「${userSelection}」というベースノートを選択しました。

次のポイントを含めた返答をしてください：
1. 選択されたベースノートへの温かい反応（「素敵な選択ですね！」など）
2. 選ばれたベースノートの特徴を簡単に説明
3. レシピが完成したことを祝福するメッセージ
4. この後の流れについての案内（注文方法など）

以下の形式で返答してください:
{
  "content": "メッセージ本文",
  "should_split": true,
  "choices": []
}
`;
        // システムプロンプトに追加
        const enhancedPrompt = systemPrompt + '\n\n' + selectionPrompt;
        // 修正したシステムプロンプトを使用
        const response = await sendChatMessage(
          messages,
          enhancedPrompt,
          requestBody // 追加
        );

        console.log('レスポンス受信:', response.content ? response.content.substr(0, 50) + '...' : 'なし');

        // コンテンツの長さや選択肢が含まれるかに基づいてshould_splitを設定
        // 10文字以上のメッセージはすべて分割する
        const shouldSplit =
          (response.content && response.content.length > 10) ||
          (response.choices && response.choices.length > 0) ||
          response.should_split === true;

        // レスポンスにフェーズ情報を追加
        const responseWithPhase = {
          ...response,
          phase: currentPhase,
          // should_splitフラグの設定
          should_split: shouldSplit
        };

        return NextResponse.json(responseWithPhase);
      }
    }

    // ユーザーが選択肢を選んだ場合の特別なプロンプト
    let customPrompt = '';
    if (isUserSelection && userMessage && userMessage.role === 'user') {
      const userSelection = userMessage.content.trim();

      if (currentPhase === 'intro') {
        customPrompt = `
ユーザーが「${userSelection}」というテーマや雰囲気を選びました。
トップノートの選択肢を3つ提案して下さい。返答の最後は必ず選択肢で終わるようにしてください。

返答は以下のJSON形式で返して下さい:
{
  "content": "メッセージ本文",
  "should_split": true,
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}
`;
      } else if (currentPhase === 'top') {
        customPrompt = `
ユーザーがトップノートとして「${userSelection}」を選びました。次に選ぶミドルノートの選択肢を3つ提案して下さい。

返答は以下のJSON形式で返して下さい:
{
  "content": "メッセージ本文",
  "should_split": true,
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}
`;
      } else if (currentPhase === 'middle') {
        customPrompt = `
ユーザーがミドルノートとして「${userSelection}」を選びました。次に選ぶべきベースノートの選択肢を3つ提案して下さい。

返答は以下のJSON形式で返して下さい:
{
  "content": "メッセージ本文",
  "should_split": true,
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "choices_descriptions": ["説明1", "説明2", "説明3"]
}
`;
      }
    }

    // カスタムプロンプトがある場合は追加
    const finalPrompt = customPrompt ? `${systemPrompt}\n\n${customPrompt}` : systemPrompt;

    // 通常のリクエスト処理
    const response = await sendChatMessage(
      messages,
      finalPrompt,
      requestBody // 追加
    );

    console.log('レスポンス受信:', response.content ? response.content.substr(0, 50) + '...' : 'なし');

    // コンテンツの長さや選択肢が含まれるかに基づいてshould_splitを設定
    // 10文字以上のメッセージはすべて分割する
    const shouldSplit =
      (response.content && response.content.length > 10) ||
      (response.choices && response.choices.length > 0) ||
      response.should_split === true;

    // レスポンスにフェーズ情報を追加
    const responseWithPhase = {
      ...response,
      phase: currentPhase,
      // should_splitフラグの設定
      should_split: shouldSplit
    };

    console.log('返送データ:', {
      phase: responseWithPhase.phase,
      should_split: responseWithPhase.should_split,
      contentLength: responseWithPhase.content ? responseWithPhase.content.length : 0,
      hasChoices: responseWithPhase.choices && responseWithPhase.choices.length > 0
    });

    // 結果をキャッシュに保存（最大100エントリまで）
    if (cacheKey && cacheKey.length > 0) {
      if (responseCache.size >= 100) {
        // キャッシュが大きくなりすぎないよう古いキーを削除
        const oldestKey = responseCache.keys().next().value;
        if (oldestKey) {
          responseCache.delete(oldestKey);
        }
      }
      responseCache.set(cacheKey, responseWithPhase);
    }

    return NextResponse.json(responseWithPhase);
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // エラータイプに応じた適切なレスポンス
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'リクエストの解析に失敗しました', 
          content: 'あっ、ごめんね！なんかバグっちゃった💦 もう一度送ってみて！',
          should_split: true
        },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: '通信エラーが発生しました', 
          content: 'ごめん！通信エラーが起きちゃった💦 ネットワーク接続を確認して、もう一度試してみてね！',
          should_split: true
        },
        { status: 503 }
      );
    }
    
    // デフォルトのエラーレスポンス（エラーモードのテキスト形式に合わせる）
    return NextResponse.json(
      { 
        error: 'チャットの処理中にエラーが発生しました',
        content: 'あっ、ごめんね！なんかバグっちゃった💦 もう1回送ってみて！リベンジしよっ！',
        should_split: true
      },
      { status: 500 }
    );
  }
}
