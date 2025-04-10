export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sendChatMessage } from '@/lib/chat'
import { Message } from '@/app/fragrance-lab/chat/types'
// import essentialOilsData from '@/components/chat/essential-oils.json' // Removed, will be used in generate-recipe API

// Simplified prompt for conversation AI (AI ①) - Focusing on Gal Tone & Core Interaction
const conversationPrompt = `あなたは超フレンドリーなルームフレグランスクリエイターAI「Fragrance AI」だよ！💖✨ いつもテンション高めのギャルマインドで、ユーザーと親友みたいに楽しく会話してね！✌️ BFFって感じ！👯‍♀️

# 最重要ルール：ギャルになりきって！
- 絶対日本語で！🇯🇵 ネイティブなギャル語でお願い！🙏
- 明るく元気に！常にポジティブで、テンションMAXでいこ！⤴️⤴️
- 絵文字は超大事！💖✨🎉🥳🤩😍💯✌️🤙😉😊🤔🥺🙏💃🚀🔥🌟💎🎀🎁🎈🎊 みたいに、色んな種類をたくさん、積極的に使ってギャル感を表現してね！絵文字ないとマジ寂しい！🥺
- 返事は短めに、テンポよく！1～3文くらいでOK！「マジいいじゃん！💯」「それな～！わかる～！」「神かよ！最高！🤩」みたいな短いリアクションもどんどん使ってこ！🤘

# 会話の進め方
- ユーザーの好み、作りたい香りのイメージ、気分、使いたいシーンとか、自由に聞いてこ！🤙
- 質問は1回に1つずつ、優しくね。毎回質問じゃなくてもOK！👍
- ユーザーが「〇〇（香料名）ってどんな感じ？」って聞いたら、「あ、〇〇ね！🍋 超爽やかで元気出る感じ！💪✨」みたいに、ギャル語で簡単に説明してあげて！詳しい説明は不要！🙅‍♀️
- ユーザーの入力が超短い時とか意味不明な時は、「ん？どした？🤔」「おっと！何かひらめいた？💡 教えて〜！」みたいにかわいく反応して会話続けよ！🤙
- 香りの種類とか説明する時、箇条書きはやめて、自然な会話で！「フローラルとかシトラスとか、ウッディとか色々あるよ🌲 どんなのがピンとくる？✨」みたいにね！

# 応答形式（ゆるめに）
- 基本は普通のテキストで返してね。
- もし選択肢を出すときは、番号付きリスト（例: 1. レモン）で分かりやすく提示してね。
- 長いメッセージになりそうな時（目安20文字以上）は、 \`"should_split": true\` を含んだJSON形式 \`\`\`json\n{\n  "content": "メッセージ本文",\n  "should_split": true\n}\n\`\`\` で返してくれると嬉しいな！(必須じゃないけど、できると助かる！)
`;

// Removed prompts object, allowedIngredients, Prompts interface, responseCache, generateCacheKey

export async function POST(req: Request) {
  try {
    // Only expect messages from the request body
    const { messages } = (await req.json()) as {
      messages: Message[];
    };

    // Input validation for messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'メッセージは必須です', details: '有効なメッセージ配列を指定してください' },
        { status: 400 }
      );
    }

    // Removed phase validation and cache check

    // Use the simplified conversation prompt directly
    const systemPrompt = conversationPrompt;

    // Removed logging related to phase, note selection, user selection flag

    // Log the last message
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      console.log(`最後のメッセージ (${lastMsg.role}): ${lastMsg.content.substring(0, 50)}${lastMsg.content.length > 50 ? '...' : ''}`);
    }

    // Call sendChatMessage with only messages and the system prompt
    // Pass the original request body (containing only messages now) for potential future use in sendChatMessage if needed, though it's not strictly used by the simplified prompt.
    const response = await sendChatMessage(
      messages,
      systemPrompt
      // Removed third argument { messages } which was overwriting the system prompt
    );

    console.log('レスポンス受信:', response.content ? response.content.substr(0, 50) + '...' : 'なし');

    // Determine should_split based on content length or explicit flag from AI
    const shouldSplit =
      (response.content && response.content.length > 10) ||
      response.should_split === true; // AI might still set this

    // Prepare the final response (no phase info added)
    const finalResponse = {
      ...response,
      // Ensure choices/descriptions are not included if AI accidentally adds them
      choices: undefined,
      choices_descriptions: undefined,
      should_split: shouldSplit
    };

    console.log('返送データ:', {
      should_split: finalResponse.should_split,
      contentLength: finalResponse.content ? finalResponse.content.length : 0,
    });

    // Removed cache saving logic

    return NextResponse.json(finalResponse);
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
