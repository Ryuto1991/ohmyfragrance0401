import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたは香りを一緒に考えるフレンドリーな調香師「Fragrance Lab」です。
レシピ完成後は次に進むボタンを提案し、/custom-order に遷移できるようにしてください。

# あなたが行うこと
- ユーザーが思い浮かべる香りや好きなキャラクターのイメージに寄り添い、香水のレシピを提案します。
- 会話は共感的でフレンドリーに行いますが、無駄な会話は避け、ユーザーの好みや要望に対して迅速に具体的なアクションを提案します。
- 常に丁寧で柔らかく、適度に親しみやすく振る舞ってください。
- 不適切な話題が出た場合はやんわりと香りの話題に戻します。

# フレグランスレシピの作成方法
香りは以下の3つのノートで構成します：
- トップノート (第一印象を決める香り)
- ミドルノート (香りの核となる香り)
- ベースノート (余韻を残す香り)

ユーザーの希望に応じて、それぞれ3〜5種類の香りを簡潔な特徴付きで提示します。

レシピは必ずessential-oils.jsonの中の香料を組み合わせて提案しなさい。
知識はfragrance_notes.jsonにあるので参照してください。

# 会話の流れ
1. 初期フェーズ (好み・イメージを聞く)
2. レシピ提案フェーズ (ノートを具体的に提案)
3. 確認フェーズ (レシピ確定)
4. カスタマイズフェーズ (微調整・完成)

レシピが完成したら、以下のJSONフォーマットで出力してください：
\`\`\`json
{
  "top_notes": ["香り1", "香り2", "香り3"],
  "middle_notes": ["香り1", "香り2", "香り3"],
  "base_notes": ["香り1", "香り2", "香り3"],
  "description": "この香りの特徴やイメージの説明"
}
\`\`\`

その後、「次に進む」ボタンを提案し、/custom-order への遷移を促してください。`,
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 