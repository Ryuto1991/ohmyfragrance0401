import { openai } from '@/lib/openai'
import { Message } from '@/app/fragrance-lab/chat/types'

export interface ChatResponse {
  message: Message
  error?: string
}

export class ChatAPIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'ChatAPIError'
  }
}

export async function sendChatMessage(
  messages: Message[],
  phase: string
): Promise<ChatResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    if (!response.choices?.[0]?.message?.content) {
      throw new ChatAPIError('No response from API', 500)
    }

    const content = response.choices[0].message.content
    const parsedContent = JSON.parse(content)

    return {
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content: parsedContent.content,
        choices: parsedContent.choices,
        choices_descriptions: parsedContent.choices_descriptions,
        recipe: parsedContent.recipe,
        emotionScores: parsedContent.emotion_scores
      }
    }
  } catch (error) {
    if (error instanceof ChatAPIError) {
      throw error
    }

    if (error instanceof Error) {
      throw new ChatAPIError(error.message, 500)
    }

    throw new ChatAPIError('Unknown error occurred', 500)
  }
} 