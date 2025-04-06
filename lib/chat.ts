import { Message } from '@/app/fragrance-lab/chat/types'
import { ChatAPIError } from '@/lib/errors'

export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string
): Promise<{
  id: string;
  role: 'assistant';
  content: string;
  timestamp: number;
  choices?: string[];
  choices_descriptions?: string[];
  should_split?: boolean;
}> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('OpenAI応答:', content ? content.substring(0, 50) + '...' : 'なし');

    // レスポンスのパース
    try {
      // APIからの応答が正しいJSONかどうかをチェック
      // 時々JSONが壊れた状態で返ってくるので修正を試みる
      let contentToProcess = content;
      
      // JSONが途中で切れている場合の処理
      if (content.includes('{ "content": "') && !content.endsWith('"}')) {
        console.log('JSONが不完全: 修正を試みます');
        // 不完全なJSONを修正して完全なJSONにする
        contentToProcess = content.replace(/\{ "content": "(.*?)$/, '{"content": "$1"}');
        contentToProcess = contentToProcess.replace(/\n/g, '\\n'); // 改行をエスケープ
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(contentToProcess);
      } catch (parseError) {
        console.log('最初のJSON解析に失敗、代替形式を試行');
        
        // コンテンツからJSONっぽい部分を抽出
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // マッチしたJSON部分を解析
            const extractedJson = jsonMatch[0].replace(/\n/g, '\\n');
            parsedContent = JSON.parse(extractedJson);
            console.log('抽出したJSONを解析に成功');
          } catch (extractError) {
            console.log('JSON抽出にも失敗');
            throw parseError; // 元のエラーをスロー
          }
        } else {
          throw parseError; // 元のエラーをスロー
        }
      }

      // should_splitフラグの設定ロジックを改善
      // 1. コンテンツが20文字以上ある場合は分割
      // 2. 選択肢がある場合も分割
      // 3. parsedContent内にshould_splitが既に指定されている場合はそれを尊重
      const shouldSplit = 
        (parsedContent.content && parsedContent.content.length > 20) || 
        (parsedContent.choices && parsedContent.choices.length > 0) ||
        parsedContent.should_split === true;

      // デバッグログ
      console.log(`メッセージを分割: ${shouldSplit} (長さ: ${parsedContent.content ? parsedContent.content.length : 0}, 選択肢: ${parsedContent.choices ? parsedContent.choices.length : 0})`);

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: parsedContent.content || '',
        choices: parsedContent.choices || [],
        choices_descriptions: parsedContent.choices_descriptions || [],
        should_split: shouldSplit
      };
    } catch (error) {
      console.log('JSON解析に失敗しました。通常のテキストとして処理します:', error);
      
      // JSONとして解析できない場合は、そのままのテキストを返す
      // 選択肢をテキストから抽出してみる
      const choices: string[] = [];
      const choicesMatch = content.match(/\d+\.\s*(.*?)(:|\n|$)/g);
      if (choicesMatch) {
        choicesMatch.forEach((match: string) => {
          const choice = match.replace(/\d+\.\s*/, '').replace(/[:：].*$/, '').trim();
          if (choice) choices.push(choice);
        });
      }
      
      // 通常テキストでも長さが20文字を超える場合は分割
      const shouldSplit = content.length > 20 || choices.length > 0;
      
      console.log(`テキストメッセージを分割: ${shouldSplit} (長さ: ${content.length}, 選択肢: ${choices.length})`);
      
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: content,
        choices: choices.length > 0 ? choices : undefined,
        should_split: shouldSplit
      };
    }
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
} 