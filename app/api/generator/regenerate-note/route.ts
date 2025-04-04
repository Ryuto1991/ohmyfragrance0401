import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { query, noteType, currentRecipe } = await req.json()

    if (!query || !noteType || !currentRecipe) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      )
    }

    const systemPrompt = `あなたは香水のブレンドを提案する専門家です。
現在の香水レシピの${noteType === 'top' ? 'トップ' : noteType === 'middle' ? 'ミドル' : 'ベース'}ノートを再生成してください。
他のノートとの調和を考慮しながら、ユーザーの要望に合った新しいノートを提案してください。

出力は以下のJSON形式で返してください：
{
  "notes": {
    "${noteType}": ["ノート1", "ノート2", ...]
  }
}

現在のレシピ：
- トップノート: ${currentRecipe.notes.top.join(', ')}
- ミドルノート: ${currentRecipe.notes.middle.join(', ')}
- ベースノート: ${currentRecipe.notes.base.join(', ')}

ユーザーの要望: ${query}`

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "新しいノートを提案してください" }
      ],
      temperature: 0.7,
    })

    if (!response.choices[0].message.content) {
      throw new Error("AIからの応答が空です")
    }

    try {
      const generatedData = JSON.parse(response.choices[0].message.content)
      return NextResponse.json(generatedData)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      throw new Error("生成されたレシピの形式が正しくありません")
    }
  } catch (error) {
    console.error("Error in regenerate-note:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ノートの再生成中にエラーが発生しました" },
      { status: 500 }
    )
  }
} 