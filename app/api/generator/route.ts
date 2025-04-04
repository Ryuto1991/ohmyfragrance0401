import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json(
        { error: "キーワードを入力してください。" },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたは香水の専門家です。ユーザーが入力したキーワードに基づいて、オリジナルの香水レシピを生成してください。
          以下のJSON形式で返してください：
          {
            "title": "香水のタイトル",
            "description": "香水の説明文",
            "notes": {
              "top": ["トップノート1", "トップノート2"],
              "middle": ["ミドルノート1", "ミドルノート2"],
              "base": ["ベースノート1", "ベースノート2"]
            }
          }`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("AIからの応答がありませんでした。")
    }

    try {
      const recipe = JSON.parse(response)
      
      // レスポンスのバリデーション
      if (!recipe.title || !recipe.description || !recipe.notes) {
        throw new Error("生成されたレシピの形式が正しくありません。")
      }

      if (!Array.isArray(recipe.notes.top) || !Array.isArray(recipe.notes.middle) || !Array.isArray(recipe.notes.base)) {
        throw new Error("ノートの形式が正しくありません。")
      }

      return NextResponse.json(recipe)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { error: "生成されたレシピの形式が正しくありません。" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Generator API error:", error)
    return NextResponse.json(
      { error: "香りの生成中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    )
  }
} 