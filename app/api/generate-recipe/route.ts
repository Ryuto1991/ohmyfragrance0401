// app/api/generate-recipe/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sendChatMessage } from '@/lib/chat' // Re-use the existing chat function
import { Message } from '@/app/fragrance-lab/chat/types'
import essentialOilsData from '@/components/chat/essential-oils.json' // Import the allowed scents

// Use type alias for individual notes with amount
type RecipeNote = {
  name: string;
  amount: number;
};

// Type definition for the expected recipe structure using type alias
type GeneratedRecipe = {
  title: string;
  description: string;
  top: RecipeNote[];
  middle: RecipeNote[];
  base: RecipeNote[];
};

// Type definition for the expected AI response structure using type alias
type AIResponseFormat = {
  recipe: GeneratedRecipe;
};

// Generate the list of allowed ingredients for the prompt
const allowedIngredientsList = JSON.stringify(essentialOilsData.perfumeNotes, null, 2);

// System prompt for the recipe generation AI (AI ②)
const recipeGenerationPrompt = `あなたは優秀な調香師AIです。以下のユーザーとAIアシスタントの会話履歴全体を分析し、ユーザーの好みやイメージに最も合うルームフレグランスのレシピを提案してください。

会話履歴:
{conversation_history}

ルール:
1. 会話全体から、ユーザーがどのような香り、雰囲気、気分、シーンを求めているかを深く理解してください。
2. レシピにふさわしい、創造的で魅力的な「タイトル」と、その香りのイメージやコンセプトを説明する短い「説明文」を考えてください。
3. 以下のリストにある香り成分のみを使用して、トップノート、ミドルノート、ベースノートをそれぞれ1〜2種類ずつ選んでください。リストにない成分は絶対に使用しないでください。
4. 各ノートについて、香料名(\`name\`)とその配合量(\`amount\`)を1から10の整数値で指定してください。全体のバランスを考慮し、合計量が多すぎないように調整してください（例: 合計10〜20程度）。
   利用可能な香り成分リスト:
   ${allowedIngredientsList}
5. 最終的なレシピは、以下の厳密なJSON形式のみで応答してください。他のテキストは一切含めないでください。
   \`\`\`json
   {
     "recipe": {
       "title": "生成されたレシピ名",
       "description": "生成されたレシピの説明文",
       "top": [{ "name": "選んだトップノート1", "amount": 5 }, { "name": "選んだトップノート2", "amount": 3 }],
       "middle": [{ "name": "選んだミドルノート1", "amount": 6 }],
       "base": [{ "name": "選んだベースノート1", "amount": 4 }, { "name": "選んだベースノート2", "amount": 2 }]
     }
   }
   \`\`\`
   (各ノートは1つでも2つでも構いません。amountは1-10の整数です。)`;

// Helper function to format conversation history for the prompt
const formatConversationHistory = (messages: Message[]): string => {
  return messages.map(msg => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`).join('\n');
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '会話履歴は必須です', details: '有効なメッセージ配列を指定してください' },
        { status: 400 }
      );
    }

    // Format the conversation history for the prompt
    const formattedHistory = formatConversationHistory(messages);
    const finalSystemPrompt = recipeGenerationPrompt.replace('{conversation_history}', formattedHistory);

    console.log('レシピ生成API: 会話履歴のメッセージ数:', messages.length);

    // Call the chat function with the recipe generation prompt
    // We expect the AI to return *only* the JSON structure defined in the prompt.
    // We pass an empty message array to sendChatMessage as the 'user' messages,
    // because the actual conversation is embedded within the system prompt.
    // We also need to tell sendChatMessage to expect a JSON object.
    const aiResponse = await sendChatMessage(
      [], // No user messages needed here, history is in the prompt
      finalSystemPrompt,
      { response_format: { type: "json_object" } } // Ensure JSON mode is requested
    );

    console.log('レシピ生成API: AIからの応答受信:', aiResponse.content);

    // Attempt to parse the AI's response content as JSON
    let parsedRecipe: AIResponseFormat;
    try {
      // The actual content should be the JSON string
      if (!aiResponse.content) {
        throw new Error("AIからの応答が空です。");
      }
      parsedRecipe = JSON.parse(aiResponse.content);

      // Validate the structure and types more thoroughly
      // Update validation function signature to use the RecipeNote type alias
      const validateNotes = (notes: any): notes is RecipeNote[] =>
        Array.isArray(notes) &&
        notes.every(
          (note: any) => // Keep 'any' here for the runtime check logic
            typeof note === 'object' &&
            note !== null &&
            typeof note.name === 'string' &&
            typeof note.amount === 'number' &&
            Number.isInteger(note.amount) &&
            note.amount >= 1 &&
            note.amount <= 10
        );

      if (
        !parsedRecipe.recipe ||
        typeof parsedRecipe.recipe.title !== 'string' ||
        typeof parsedRecipe.recipe.description !== 'string' ||
        !validateNotes(parsedRecipe.recipe.top) ||
        !validateNotes(parsedRecipe.recipe.middle) ||
        !validateNotes(parsedRecipe.recipe.base)
      ) {
        console.error("AI Response Validation Failed. Structure or types are invalid.", parsedRecipe);
        throw new Error("AIからの応答形式が無効です (recipe構造、型、またはamount範囲が不正)。");
      }

    } catch (parseError) {
      console.error('レシピ生成API: AI応答のJSON解析エラー:', parseError, '応答内容:', aiResponse.content);
      return NextResponse.json(
        { error: 'AIからのレシピ生成に失敗しました', details: '応答の解析に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('レシピ生成API: 生成されたレシピ:', parsedRecipe.recipe);

    // Return the successfully generated recipe
    return NextResponse.json(parsedRecipe); // Return the whole structure { recipe: { ... } }

  } catch (error) {
    console.error('Generate Recipe API Error:', error);
    // Use a generic error message for other potential errors
    return NextResponse.json(
      { error: 'レシピの生成中に予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}
