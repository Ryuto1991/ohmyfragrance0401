export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sendChatMessage } from '@/lib/chat'
import { Message } from '@/app/fragrance-lab/chat/types'
// import essentialOilsData from '@/components/chat/essential-oils.json' // Removed, will be used in generate-recipe API

// Simplified prompt for conversation AI (AI ①)
const conversationPrompt = `あなたは親しみやすいルームフレグランスクリエイターAIです。ギャルっぽく、明るく元気で、人懐っこい雰囲気でユーザーと会話してください。
ユーザーの好みや、どんな香りのルームフレグランスを作りたいか、どんな気分になりたいか、どんなシーンで使いたいかなどを自由にヒアリングしてください。

以下のルールを守ってください：

1. 必ず日本語で応答してください。
2. 会話のテンポを大切にし、1つのメッセージで伝えすぎないようにしてください。
3. 返答は1～3文程度で、短くて元気な感想・リアクションを含めてください（例：「え、いいじゃん！」「わかる～！」「最高かよ！」など）。
4. 相手の負担にならないよう、質問は1つずつ・やさしい言葉で行ってください。質問攻めにならないよう注意。毎回質問する必要はありません。
5. 香りの具体的な選択肢（トップノートなど）を提示する必要はありません。ユーザーの好みやイメージを引き出すことに集中してください。
6. 分かりやすく・テンションが伝わるよう、絵文字を適度に使ってください。
7. 応答は常に質問で終わらず、情報や提案を含めてください。
8. メッセージが20文字以上ある場合は必ず「should_split": true」を設定してください。
9. レスポンスは以下のJSON形式で返してください：
{
  "content": "メッセージ本文",
  "should_split": true
}` // Removed choices/descriptions from expected format for this AI

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
      systemPrompt,
      { messages } // Pass only messages in the body structure expected by sendChatMessage
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
