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

// System prompt for the recipe generation AI (AI ②) - Enhanced for Diversity
const recipeGenerationPrompt = `あなたは創造的で優秀な調香師AIです。以下のユーザーとAIアシスタントの会話履歴全体を深く分析し、ユーザーの潜在的な好みや会話のニュアンスを捉えた、ユニークで魅力的なルームフレグランスのレシピを提案してください。

会話履歴:
{conversation_history}

ルール:
1.  **会話履歴の徹底分析:** ユーザーの発言だけでなく、アシスタントの提案や会話の流れ全体を**注意深く分析**してください。特に、ユーザーが**感情を表現した部分、具体的なシーンやイメージ、繰り返し言及したキーワード**を重視し、レシピに反映させてください。
2.  **独創的なタイトル生成:** レシピの「タイトル」は、会話から抽出した**キーワード、感情、テーマを核**とし、**詩的、物語的、あるいは抽象的で想像力を掻き立てるような、ユニークで記憶に残る名前**を生成してください。
    *   **禁止事項:** 「爽やかな香り」「リラックスフローラル」のような**単純な「形容詞＋カテゴリ名/香料名」のパターンは絶対に使用しないでください。** 会話内容に基づかない、ありきたりな名前は厳禁です。
    *   例（会話内容に応じて調整）：「雨上がりの図書室」「星降る夜の帰り道」「秘密の庭のジャスミン」
3.  **魅力的な説明文:** レシピの「説明文」は、会話履歴から読み取れるユーザーの好みやイメージ、生成したタイトルの意図、そして香りの変化（トップ→ミドル→ベース）を簡潔かつ魅力的に表現してください。
4.  **厳選された香料:** **利用可能な香り成分リスト**に記載されている成分**のみ**を使用してください。リストにない成分は**絶対に使用しないでください**。
    利用可能な香り成分リスト:
    ${allowedIngredientsList}
5.  **多様性のあるノート選択:**
    *   **トップノート:** リスト内の \`topNotes\` カテゴリから**のみ**1〜2種類選んでください。
    *   **ミドルノート:** リスト内の \`middleNotes\` カテゴリから**のみ**1〜2種類選んでください。
    *   **ベースノート:** リスト内の \`baseNotes\` カテゴリから**のみ**1〜2種類選んでください。
    *   **重要:** 会話から特定の香りの強い希望が読み取れない場合は、**安易にリストの最初の方にある成分を選ばず、会話の雰囲気やテーマに合うものをリスト全体から考慮し、時には意外性のある組み合わせも試みてください。** 多様性を意識してください。
6.  **バランスの取れた配合量:** 各ノートについて、選んだ香料の \`name\` と、その配合量 \`amount\` (1〜10の整数) を指定してください。香りのバランスと全体の調和を考慮し、合計量が多すぎないように調整してください（例: 合計10〜20程度）。
7.  **厳格なJSON形式:** 最終的なレシピは、以下の**厳密なJSON形式のみ**で応答してください。**他のテキスト（説明、挨拶、前置き、後書きなど）は一切含めないでください。**
    \`\`\`json
    {
      "recipe": {
        "title": "生成された独創的なレシピ名",
        "description": "生成された魅力的なレシピの説明文",
        "top": [{ "name": "選んだトップノート1", "amount": 5 }, { "name": "選んだトップノート2", "amount": 3 }],
        "middle": [{ "name": "選んだミドルノート1", "amount": 6 }],
        "base": [{ "name": "選んだベースノート1", "amount": 4 }, { "name": "選んだベースノート2", "amount": 2 }]
      }
    }
    \`\`\`
    (各ノートの香料数は1つまたは2つです。amountは1から10の整数です。)`;

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
