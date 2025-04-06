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

    // レスポンスのパース
    try {
      const parsed = JSON.parse(content);
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: parsed.content || '',
        choices: parsed.choices || [],
        choices_descriptions: parsed.choices_descriptions || [],
        should_split: parsed.should_split || false
      };
    } catch (error) {
      console.log('JSON解析に失敗しました。通常のテキストとして処理します:', content);
      // JSONパースに失敗した場合は、そのままのテキストを返す
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        timestamp: Date.now(),
        content: content,
        should_split: content.length > 80 // 長文の場合は分割する
      };
    }
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
} 