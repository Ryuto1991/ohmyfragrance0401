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

    // OpenAI API呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは香水の専門家です。ユーザーが入力したキーワードに基づいて、オリジナルの香水レシピを生成してください。
          以下の香り成分のみを使用してください：
          ${JSON.stringify(essentialOilsData.perfumeNotes, null, 2)}

          以下のJSON形式**のみ**で応答してください。説明や前置き、\`\`\`json \`\`\` のようなマークダウンは**絶対に含めないでください**。
          {
            "title": "生成されたユニークな香水のタイトル",
            "description": "生成された香水の説明文（トップ・ミドル・ベースの流れを含む）",
            "notes": {
              "top": ["トップノート成分名1", "トップノート成分名2"],
              "middle": ["ミドルノート成分名1", "ミドルノート成分名2"],
              "base": ["ベースノート成分名1", "ベースノート成分名2"]
            }
          }
          **重要:** 必ず上記のJSON形式を守ってください。`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      // response_format を追加してJSONモードを有効化
      response_format: { type: "json_object" },
    }); // ここで閉じ括弧

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("AIからの応答がありませんでした。");
    }

    // try...catch ブロックを修正
    let recipeJsonString = response;
    try {
      // 応答からJSON部分を抽出する試み
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
          recipeJsonString = jsonMatch[1];
      } else {
          const firstBrace = response.indexOf('{');
          const lastBrace = response.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              recipeJsonString = response.substring(firstBrace, lastBrace + 1);
          }
      }

      const recipe = JSON.parse(recipeJsonString); // 抽出した文字列をパース

      // より厳密なレスポンスのバリデーション
      if (typeof recipe !== 'object' || recipe === null) {
          throw new Error("AI応答が有効なオブジェクトではありません。");
      }
      if (typeof recipe.title !== 'string' || typeof recipe.description !== 'string' || typeof recipe.notes !== 'object' || recipe.notes === null) {
        throw new Error("生成されたレシピに必要なフィールド (title, description, notes) がありません。");
      }
      if (!Array.isArray(recipe.notes.top) || !Array.isArray(recipe.notes.middle) || !Array.isArray(recipe.notes.base)) {
        throw new Error("レシピの notes フィールド (top, middle, base) が配列ではありません。");
      }

      // ノートの形式を変換
      const formattedRecipe = {
        ...recipe,
        notes: {
          top: recipe.notes.top.map((name: string) => ({ name, amount: 1 })),
          middle: recipe.notes.middle.map((name: string) => ({ name, amount: 1 })),
          base: recipe.notes.base.map((name: string) => ({ name, amount: 1 }))
        }
      };

      return NextResponse.json(formattedRecipe);
    } catch (parseError: any) {
      // パース失敗時のログに、パースしようとした文字列も追加
      console.error("JSON parse error:", parseError, "Raw response:", response, "Attempted to parse:", recipeJsonString); 
      // パース失敗時のエラーメッセージを具体的にする
      let errorMessage = "AIからの応答形式が不正でした。";
      if (recipeJsonString?.includes("{") && recipeJsonString?.includes("}")) { // チェック対象を recipeJsonString に変更
        errorMessage += " JSON構造が壊れている可能性があります。";
      } else {
        errorMessage += " 予期しないテキストが含まれている可能性があります。";
      }
      errorMessage += " キーワードを変えて再度お試しください。";

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    } // catch ブロックの閉じ括弧
  } catch (error) { // メインの try に対する catch
    console.error("Generator API error:", error);

    // エラーメッセージの改善
    let errorMessage = "香りの生成中にエラーが発生しました。もう一度お試しください。";

    // OpenAIのcontent filteringによるエラーを検出
    if (error instanceof Error &&
        (error.message.includes("content_filter") ||
         error.message.includes("content policy") ||
         error.message.includes("moderation"))) {
      errorMessage = "不適切なワードが含まれている可能性があります。他のキーワードをお試しください。";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } // catch ブロックの閉じ括弧
} // POST 関数の閉じ括弧
