// lib/chat.ts に対するパッチ
// OpenAI APIとの通信およびレスポンス処理を改善

import OpenAI from 'openai'; // Import the OpenAI library
import { Message } from '@/app/fragrance-lab/chat/types'
import { ChatAPIError } from '@/lib/errors'
import { processMessage } from '@/lib/chat-utils'

// リトライ処理をラップした関数
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeout = 30000): Promise<Response> {
  // APIリクエストのデバッグ情報を追加
  console.log('API呼び出し開始:', url);
  console.log('API呼び出しオプション:', {
    method: options.method,
    headersKeys: options.headers ? Object.keys(options.headers) : [],
    bodyLength: options.body ? String(options.body).length : 0
  });
  
  // AbortControllerを使用してタイムアウトを実装
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // 元のオプションにsignalを追加
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    // レスポンスステータスの詳細ログを追加
    console.log('APIレスポンスステータス:', response.status);
    
    // HTTPエラーをより明示的に処理
    if (!response.ok) {
      console.error(`API HTTP エラー: ${response.status} ${response.statusText}`);
      
      // エラーレスポンスの内容を取得してログに出力
      try {
        const errorBody = await response.text();
        console.error('エラーレスポンス内容:', errorBody);
      } catch (textError) {
        console.error('エラーレスポンス取得失敗:', textError);
      }
      
      // 具体的なエラーメッセージを生成
      let errorMessage = `OpenAI API エラー: HTTP ${response.status}`;
      
      // 一般的なHTTPエラーコードに意味のあるメッセージを追加
      if (response.status === 401) {
        errorMessage = 'APIキー認証エラー (401): APIキーが無効または期限切れです';
      } else if (response.status === 403) {
        errorMessage = 'アクセス権限エラー (403): APIへのアクセス権限がありません';
      } else if (response.status === 429) {
        errorMessage = 'レート制限エラー (429): APIリクエスト数の上限に達しました。しばらく待ってから再試行してください';
      } else if (response.status >= 500) {
        errorMessage = 'サーバーエラー: OpenAI APIサーバーに問題が発生しています。しばらく待ってから再試行してください';
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    if (retries <= 1) {
      console.error('リトライ回数上限に達しました', error);
      throw error;
    }
    
    // エラーの種類に応じてリトライするかどうかを判断
    if (error instanceof TypeError || 
        error instanceof Error && error.name === 'AbortError') {
      // ネットワークエラーやタイムアウトの場合は待機してリトライ
      console.log(`API呼び出しエラー、リトライします (残り${retries - 1}回)...`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
      return fetchWithRetry(url, options, retries - 1, timeout);
    }
    
    // その他のエラーはより詳細なログを出力
    console.error('API呼び出し失敗:', error);
    
    // その他のエラーはそのまま投げる
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// レスポンス処理用のキャッシュ
const responseCache = new Map<string, any>();

// 空の応答やエラー時のフォールバックコンテンツ
const fallbackContent = {
  content: "申し訳ありません。一時的に応答が生成できませんでした。もう一度お試しください。",
  choices: [] as string[],
  should_split: true
};

// APIレスポンスの型定義
interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: number;
  choices?: string[];
  choices_descriptions?: string[];
  should_split?: boolean;
  followUp?: string;
}

export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string,
  // Allow passing additional OpenAI request options like response_format
  requestOptions?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming> 
): Promise<ChatResponse> {
  // グローバルタイムアウト処理（すべてのAPIリクエストおよび処理に対するタイムアウト）
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('リクエストがタイムアウトしました。もう一度お試しください。')), 30000);
  });
  
  try {
    // キャッシュキーの生成（ユーザーの最後のメッセージのみを使用して軽量に）
    let cacheKey = '';
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      cacheKey = `${lastMessage.role}:${lastMessage.content.substring(0, 100)}:${systemPrompt.substring(0, 50)}`;
      
      // キャッシュにある場合はそれを返す
      if (responseCache.has(cacheKey)) {
        console.log('キャッシュからレスポンスを使用');
        return responseCache.get(cacheKey);
      }
    }
    
    // APIリクエスト実行とタイムアウト処理を競合させる
    const apiRequestPromise = (async () => {
      // Construct the base request body
      const baseRequestBody = {
        model: 'gpt-4o-mini', // Consider making model configurable if needed
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7, // Default temperature
        max_tokens: 512, // Increase max tokens for recipe generation
      };

      // Merge base body with any provided requestOptions
      // requestOptions will override defaults if provided (e.g., response_format)
      const finalRequestBody = {
        ...baseRequestBody,
        ...requestOptions // Apply overrides like response_format: { type: 'json_object' }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('OpenAI APIリクエスト:', JSON.stringify(finalRequestBody, null, 2));
      } else {
        console.log('OpenAI APIリクエスト: メッセージ数', messages.length, 'システムプロンプト長', systemPrompt.length);
      }
      
      // タイムアウト付きのfetch
      const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(finalRequestBody)
      });

      // レスポンスJSONの取得（エラーハンドリングを強化）
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('OpenAI APIレスポンスのJSON解析エラー:', jsonError);
        
        // レスポンスの生のテキストを取得して調査
        try {
          const rawText = await response.text();
          console.error('レスポンス生テキスト:', rawText.substring(0, 200));
        } catch (textError) {
          console.error('レスポンステキスト取得エラー:', textError);
        }
        
        throw new Error('レスポンスの解析に失敗しました');
      }
      
      // データの検証
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('不正なAPIレスポンス形式:', data);
        throw new Error('APIから不正な形式のレスポンスを受信しました');
      }
      
      const content = data.choices[0].message.content;
      console.log('OpenAI応答:', content ? content.substring(0, 100) + '...' : 'なし');
      
      if (!content || content.trim() === '') {
        console.error('OpenAI APIから空の応答を受信');
        throw new Error('空の応答を受信しました');
      }

      let result: ChatResponse;

      // Check if JSON mode was requested
      const isJsonMode = finalRequestBody.response_format?.type === 'json_object';

      if (isJsonMode) {
        // JSON mode: Return the raw content directly, do not process it further.
        console.log('JSONモード応答: processMessageをスキップします');
        result = {
          id: crypto.randomUUID(),
          role: 'assistant',
          timestamp: Date.now(),
          content: content, // Use the raw JSON string
          choices: undefined, // No choices expected in this mode
          choices_descriptions: undefined,
          should_split: false, // JSON should not be split
          followUp: undefined // No follow-up expected in this mode
        };
      } else {
        // Standard text mode: Process the message using processMessage
        console.log('テキストモード応答: processMessageを実行します');
        const processedMessage = processMessage(content);
        console.log('処理済みメッセージ:', {
          contentLength: processedMessage.content?.length || 0,
          hasChoices: processedMessage.choices && processedMessage.choices.length > 0,
          shouldSplit: processedMessage.should_split
        });

        result = {
          id: crypto.randomUUID(),
          role: 'assistant',
          timestamp: Date.now(),
          content: processedMessage.content || fallbackContent.content,
          choices: processedMessage.choices || fallbackContent.choices,
          choices_descriptions: processedMessage.choices_descriptions,
          should_split: processedMessage.should_split !== undefined ? processedMessage.should_split : fallbackContent.should_split,
          followUp: processedMessage.followUp
        };

        // Fallback for empty/short processed content
        if (!result.content || result.content.length < 5) {
          console.warn('空または極端に短い処理済みレスポンスを検出、フォールバックを使用します');
          result.content = fallbackContent.content;
          result.choices = fallbackContent.choices;
          result.should_split = fallbackContent.should_split;
          result.choices_descriptions = undefined;
          result.followUp = undefined;
        }
      }
      
      // 結果をキャッシュに保存 (Only cache non-empty results)
      if (cacheKey && result.content && result.content.length > 10) {
        // キャッシュサイズ管理（100エントリに制限）
        if (responseCache.size >= 100) {
          const firstKey = responseCache.keys().next().value;
          if (firstKey) {
            responseCache.delete(firstKey);
          }
        }
        
        responseCache.set(cacheKey, result);
      }
      
      return result;
    })();
    
    // API処理とタイムアウトを競合
    return await Promise.race([apiRequestPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    
    // エラー種別に応じたカスタムエラーレスポンス
    let errorMessage = '申し訳ありません、エラーが発生しました。もう一度お試しください。';
    
    // エラーメッセージのカスタマイズ
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('タイムアウト')) {
        errorMessage = 'リクエストの処理に時間がかかりすぎています。ネットワーク接続を確認して、もう一度お試しください。';
      } else if (error.message.includes('空の応答')) {
        errorMessage = 'AIからの応答を受信できませんでした。もう一度お試しください。';
      } else if (error.message.includes('429')) {
        errorMessage = 'たくさんのリクエストがあり、一時的に処理できません。少し時間をおいてから再度お試しください。';
      } else if (error.message.includes('認証エラー') || error.message.includes('401')) {
        errorMessage = 'APIへの認証に失敗しました。システム管理者にお問い合わせください。';
      } else {
        // その他の一般的なエラー
        errorMessage = `AIとの通信中にエラーが発生しました: ${error.message.substring(0, 100)}`;
      }
    }
    
    // エラー時のフォールバック応答
    const errorResponse: ChatResponse = {
      id: crypto.randomUUID(),
      role: 'assistant',
      timestamp: Date.now(),
      content: errorMessage,
      choices: [],
      should_split: true
    };
    
    throw new ChatAPIError('チャットAPI呼び出しエラー', errorResponse);
  }
}
