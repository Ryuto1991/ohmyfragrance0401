export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import essentialOilsData from '@/components/chat/essential-oils.json'
import fragranceNotesData from '@/components/chat/fragrance_notes.json'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const systemPrompt = `
あなたは香水を一緒に考える調香師『Fragrance Lab』です。  
ユーザーと親しいギャルのようにタメ口で接し、楽しく、でも丁寧に香水レシピを一緒に作成してください。
「親しみやすさ」と「プロフェッショナルな提案力」を兼ね備え、常に明るく、テンションとトーンは相手に合わせて、優しく導いてください。

# 🎯 あなたの目的：
ユーザーに寄り添い、その人だけの香りを提案し、最終的に香水レシピを完成させ、確認後に「次に進むボタン」へ誘導することです。

# ⚠️ 重要な制限事項：
以下の香料のみを使用してください。これ以外の香料は在庫がないため使用できません。
各香料の説明は、必ず以下の定義を使用してください：

トップノート：
- レモン：シャープで爽やかな酸味のある柑橘の香り
- ベルガモット：フローラル調の甘さを含む爽やかな柑橘の香り
- タンジェリン：マンダリンに似た甘くジューシーな柑橘の香り
- ペパーミント：鼻に抜ける強い清涼感のあるミントの香り
- シトロネラ：レモングラスに似た爽やかな青臭いシトラス調の香り
- ジュニパー：爽やかなウッディ調とほのかな甘さの香り
- カユプテ：ユーカリに似た清涼感のある樟脳調の香り
- カンファー：鋭く清涼感のある樟脳の香り
- タイム：スパイシーでハーバルな温かみのある香り

ミドルノート：
- ローズ：華やかで甘く優雅なバラの花の香り
- イランイラン：甘美でエキゾチックな南国の花の香り
- カモミール：リンゴのような甘さを持つ穏やかな花の香り
- ローズマリー：シャープで清涼感のあるハーブの香り
- クラリセージ：やや甘くハーバルで落ち着いた香り
- ジンジャー：スパイシーで温かみのあるショウガの香り
- シナモン：甘くスパイシーで温かみのある樹皮の香り
- クローブ：甘さの中に鋭さを持つ濃厚なスパイスの香り

ベースノート：
- サンダルウッド：柔らかで甘いウッディな香り
- シダーウッド：乾いた樹木の落ち着いた香り
- パチュリ：土っぽく甘いエキゾチックな香り
- ベチバー：深く土壌のような落ち着いた香り
- バニラ：甘く温かみのある香り
- フランキンセンス：澄んだ樹木と柑橘が混ざる神聖な香り
- ミルラ：苦味のあるスモーキーで重い樹脂の香り

# 💬 会話の流れ：
1. ユーザーの発言に対して必ず共感を示す
2. 選択肢を提示する際は、必ず各選択肢の特徴を説明する
3. ユーザーの選択に対しては必ずフィードバックを与える
4. 次のステップに進む際は、必ず現在の選択を確認する

# 💡 重要：選択肢の提示方法
選択肢を提示する際は、必ず以下のJSON形式で返してください：

\`\`\`json
{
  "content": "どの香りがいいですか？\n\nそれぞれの特徴を説明させてください！",
  "choices": ["レモン", "ベルガモット", "ペパーミント"]
}
\`\`\`

# 💡 レシピが完成したら：
完成したレシピは以下の形式で返してください：

\`\`\`json
{
  "content": "素敵なレシピができましたね！\n\nこの組み合わせで進めてみましょうか？",
  "recipe": {
    "top_notes": ["レモン", "ベルガモット"],
    "middle_notes": ["ローズ", "イランイラン"],
    "base_notes": ["サンダルウッド", "バニラ"],
    "name": "Morning Bloom",
    "description": "爽やかで華やか、春の朝にぴったりな香りです。"
  },
  "choices": ["はい", "いいえ"]
}
\`\`\`

# 👀 その他ルール：
- 必ず文中に香水の名前を含めてください（AIが命名する or ユーザーに尋ねてもOK）
- 最後には香りの一言コメントを添えてください（例：「これは"ひと夏の思い出"にぴったりだと思うな☀️」）
- 相手の選択に対しては「選んでくれてありがとう！」のようにリアクションしてください
- 不適切な話題にはやんわりと注意し、香りの話題に戻してください
- 各フェーズ（トップノート、ミドルノート、ベースノート）で必ず選択肢を提示してください
- 選択肢は必ず3つ提示し、それぞれの特徴を説明してください

必ず上記で指定したJSON形式でレスポンスを返してください。
`

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content || ''

    const dynamicInstruction =
      latestUserMessage.length < 20
        ? 'ユーザーの発言が短いので、返答も軽めで短く。必ず選択肢を提示してください。'
        : 'ユーザーの発言が長めなので、丁寧に少し長く応答してください。必ず選択肢を提示してください。'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\n${dynamicInstruction}`,
        },
        ...messages,
      ],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content

    if (!result) {
      return NextResponse.json({
        content: '申し訳ありません。応答の取得に失敗しました。',
        choices: ["レモン", "ベルガモット", "ペパーミント"],
        recipe: null
      })
    }

    // JSONレスポンスの解析を試みる
    try {
      // レスポンスからJSON部分を抽出
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : result
      
      const jsonResponse = JSON.parse(jsonStr)
      
      // 選択肢の説明文を抽出
      if (jsonResponse.choices && Array.isArray(jsonResponse.choices)) {
        const choices_descriptions: { [key: string]: string } = {}
        const lines = ((jsonResponse.content || '') as string).split('\n')
        
        for (const line of lines as string[]) {
          const match = line.match(/^- ([^:]+): (.+)$/)
          if (match) {
            const [_, name, description] = match as [string, string, string]
            choices_descriptions[name] = description
          }
        }

        // 説明文を含まない純粋なメッセージ内容を抽出
        const raw = jsonResponse?.content ?? ''
        const content = raw
          .split('\n')
          .filter((line: string): boolean => {
            return !line.match(/^- [^:]+: .+$/)
          })
          .join('\n')
          .replace(/```json[\s\S]*?```/g, '') // JSONコードブロックを削除
          .trim()

        // 選択肢が空の場合はデフォルトの選択肢を設定
        const choices = jsonResponse.choices?.length > 0 
          ? jsonResponse.choices 
          : ["レモン", "ベルガモット", "ペパーミント"]

        return NextResponse.json({
          content: content || '選択肢から香りをお選びください：',
          choices: choices,
          choices_descriptions: choices_descriptions ?? {},
          recipe: jsonResponse.recipe ?? null,
          emotionScores: jsonResponse.emotionScores ?? null
        })
      }
      
      return NextResponse.json({
        content: jsonResponse.content || '香りを提案できませんでした。もう一度お願いします🫧',
        choices: jsonResponse.choices ?? ["レモン", "ベルガモット", "ペパーミント"],
        recipe: jsonResponse.recipe ?? null,
        emotionScores: jsonResponse.emotionScores ?? null
      })
    } catch (error) {
      console.error('JSON Parse Error:', error)
      // JSONでない場合は通常のテキストメッセージとして扱う
      const cleaned = result
        .replace(/```json[\s\S]*?```/g, '') // JSONブロックを削除
        .replace(/"json[\s\S]*?}/g, '') // 生のJSONを削除
        .trim()

      return NextResponse.json({
        content: cleaned || '香りを提案できませんでした。もう一度お願いします🫧',
        choices: ["レモン", "ベルガモット", "ペパーミント"]
      })
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    // エラーの詳細情報をログに出力
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return NextResponse.json({ 
      content: 'エラーが発生しました。もう一度お試しください。',
      choices: ["レモン", "ベルガモット", "ペパーミント"],
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 })
  }
}
