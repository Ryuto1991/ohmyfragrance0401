import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import essentialOilsData from '@/components/chat/essential-oils.json'

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json(
        { error: "キーワードを入力してください。" },
        { status: 400 }
      )
    }

    // 不適切ワードのチェック（シンプルなチェックの例）
    const inappropriateWords = ["セックス", "エロ", "アダルト", "ポルノ", "暴力", "殺人", "麻薬", "ドラッグ"]
    const containsInappropriateWord = inappropriateWords.some(word => 
      query.toLowerCase().includes(word.toLowerCase())
    )

    if (containsInappropriateWord) {
      return NextResponse.json(
        { error: "不適切なワードが含まれています。他のキーワードをお試しください。" },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは香水の専門家です。ユーザーが入力したキーワードに基づいて、オリジナルの香水レシピを生成してください。
          以下の香り成分のみを使用してください：
          ${JSON.stringify(essentialOilsData.perfumeNotes, null, 2)}

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

      // ノートの形式を変換
      const formattedRecipe = {
        ...recipe,
        notes: {
          top: recipe.notes.top.map((name: string) => ({ name, amount: 1 })),
          middle: recipe.notes.middle.map((name: string) => ({ name, amount: 1 })),
          base: recipe.notes.base.map((name: string) => ({ name, amount: 1 }))
        }
      }

      return NextResponse.json(formattedRecipe)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { error: "生成されたレシピの形式が正しくありません。" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Generator API error:", error)
    
    // エラーメッセージの改善
    let errorMessage = "香りの生成中にエラーが発生しました。もう一度お試しください。"
    
    // OpenAIのcontent filteringによるエラーを検出
    if (error instanceof Error && 
        (error.message.includes("content_filter") || 
         error.message.includes("content policy") || 
         error.message.includes("moderation"))) {
      errorMessage = "不適切なワードが含まれている可能性があります。他のキーワードをお試しください。"
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 