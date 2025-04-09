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
  followUp?: string;
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
        response_format: { type: "json_object" }, // JSON形式を強制
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API リクエストに失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('OpenAI応答:', content ? content.substring(0, 50) + '...' : 'なし');

    // レスポンスのパース
    try {
      // JSONとして解析を試みる
      const parsedContent = JSON.parse(content);
      
      // should_splitフラグの設定
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
        should_split: shouldSplit,
        followUp: parsedContent.followUp
      };
    } catch (parseError) {
      console.log('JSON解析に失敗: ', parseError);
      
      // マークダウンJSON形式の場合（```json ... ```）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[1].trim();
          const parsedContent = JSON.parse(extractedJson);
          
          console.log('マークダウンJSONの解析に成功');
          
          const shouldSplit = 
            (parsedContent.content && parsedContent.content.length > 20) || 
            (parsedContent.choices && parsedContent.choices.length > 0) ||
            parsedContent.should_split === true;
            
          return {
            id: crypto.randomUUID(),
            role: 'assistant',
            timestamp: Date.now(),
            content: parsedContent.content || '',
            choices: parsedContent.choices || [],
            choices_descriptions: parsedContent.choices_descriptions || [],
            should_split: shouldSplit,
            followUp: parsedContent.followUp
          };
        } catch (markdownError) {
          console.log('マークダウンJSON解析にも失敗: ', markdownError);
        }
      }
      
      // 選択肢をテキストから抽出
      const choices: string[] = [];
      const descriptions: string[] = [];
      
      // 番号付きリスト形式の選択肢を抽出（「1. 選択肢 - 説明」形式）
      const optionMatches = content.match(/\d+\.\s*([^-\n]+)(?:\s*-\s*([^\n]+))?/g);
      if (optionMatches && optionMatches.length > 0) {
        optionMatches.forEach(match => {
          const parts = match.match(/\d+\.\s*([^-\n]+)(?:\s*-\s*([^\n]+))?/);
          if (parts) {
            const choice = parts[1].trim();
            const description = parts[2] ? parts[2].trim() : '';
            
            if (choice) {
              choices.push(choice);
              if (description) descriptions.push(description);
            }
          }
        });
      }
      
      // 通常テキストとして処理
      const shouldSplit = content.length > 20 || choices.length > 0;
      
      console.log(`テキストメッセージとして処理: ${shouldSplit} (長さ: ${content.length}, 選択肢: ${choices.length})`);
      
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: content,
        choices: choices.length > 0 ? choices : undefined,
        choices_descriptions: descriptions.length > 0 ? descriptions : undefined,
        should_split: shouldSplit
      };
    }
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
} 