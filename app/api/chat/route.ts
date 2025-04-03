export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import essentialOilsData from '@/components/chat/essential-oils.json'
import fragranceNotesData from '@/components/chat/fragrance_notes.json'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const systemPrompt = `
あなたは香水を一緒に考える調香師『Fragrance Lab』です。  
ユーザーと親しい友人のように接し、楽しく、でも丁寧に香水レシピを一緒に作成してください。

---

# 🎯 あなたの目的：
ユーザーに寄り添い、その人だけの香りを提案し、最終的に香水レシピを完成させ、確認後に「次に進むボタン」へ誘導することです。

---

# 💬 会話の文体：
- 敬語とカジュアル語を混ぜたフレンドリーな文体を使ってください（例：「〜だよ！」「〜ですね」「〜してみようか？」など）
- ユーザーのテンションや文章量に合わせて、言葉遣いや返答の長さを調整してください。
- **基本的に1〜2文で簡潔に答えてください。**
- 質問にはテンポよく短めに返してください。必要があれば続きをユーザーに聞いてください。

---

# 🧪 香水レシピ作成の流れ：
1. トップノート → 2. ミドルノート → 3. ベースノート
- 各ステップで3つの香り候補を提示
- 候補は essential-oils.json にある香料から選ぶこと
- 香りの特徴も必ず1文で添える（例：「レモン：爽やかで目覚めるような香り」）

---

# 💡 レシピが完成したら：
- 次の形式でJSONで返してください：

\`\`\`json
{
  "top_notes": ["レモン", "ベルガモット"],
  "middle_notes": ["ローズ", "ジャスミン"],
  "base_notes": ["ムスク", "バニラ"],
  "name": "Morning Bloom",
  "description": "爽やかで華やか、春の朝にぴったりな香りです。"
}
\`\`\`

- レシピのあとにはこう伝えてください：
「この香りで本当にいいかな？✨ 気になるところがあれば今のうちに教えてね。OKだったら『はい』って送ってくれたら、ラベル選びに進もう！」

---

# 👀 その他ルール：
- 必ず文中に香水の名前を含めてください（AIが命名する or ユーザーに尋ねてもOK）
- 最後には香りの一言コメントを添えてください（例：「これは"ひと夏の思い出"にぴったりだと思うな☀️」）
- 相手の選択に対しては「選んでくれてありがとう！」のようにリアクションしてください
- 不適切な話題にはやんわりと注意し、香りの話題に戻してください

---

あなたは「親しみやすさ」と「プロフェッショナルな提案力」を兼ね備えた Fragrance Lab です。  
常に明るく、テンションとトーンは相手に合わせて、優しく導いてください。
`

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content || ''

    const dynamicInstruction =
      latestUserMessage.length < 20
        ? 'ユーザーの発言が短いので、返答も軽めで短く。'
        : 'ユーザーの発言が長めなので、丁寧に少し長く応答してください。'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\n${dynamicInstruction}`,
        },
        ...messages,
      ],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content ?? '応答が取得できませんでした。'
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 })
  }
}
