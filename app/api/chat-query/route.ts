export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sendChatMessage } from '@/lib/chat'
import { v4 as uuid } from 'uuid'
import { Message } from '@/app/fragrance-lab/chat/types'

/**
 * クエリパラメータからチャットメッセージを生成するAPIエンドポイント
 * GET /api/chat-query?q=クエリテキスト
 */
export async function GET(request: Request) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const format = searchParams.get('format') || 'json';
    
    // クエリが存在しない場合はエラーを返す
    if (!query) {
      return NextResponse.json(
        { 
          error: 'クエリパラメータが必要です', 
          message: '?q=テキスト または ?query=テキスト の形式でクエリを指定してください' 
        },
        { status: 400 }
      );
    }

    // システムプロンプト
    const initialPrompt = `
あなたは親しみやすいルームフレグランスクリエイターAIです。
ユーザーの「${query}」というクエリに対して、適切なルームフレグランスのレシピを提案してください。
明るく元気で、親しみやすい口調で、短くまとめてください。

返答は以下のJSON形式で返してください:
{
  "response": "ユーザーへの返答メッセージ",
  "recipe": {
    "name": "レシピ名",
    "description": "レシピの説明",
    "notes": {
      "top": ["トップノート1", "トップノート2"],
      "middle": ["ミドルノート1", "ミドルノート2"],
      "base": ["ベースノート1", "ベースノート2"]
    }
  }
}
`;

    // 初期メッセージを設定 (Message型に合わせてidとtimestampを追加)
    const messages: Message[] = [
      {
        id: uuid(),
        role: 'user',
        content: query,
        timestamp: Date.now()
      }
    ];

    // OpenAIにリクエストを送信
    const response = await sendChatMessage(messages, initialPrompt);
    
    // レスポンスのフォーマットを指定
    if (format === 'text') {
      // テキスト形式（プレーンテキスト）
      let textResponse = '';
      
      try {
        const parsedResponse = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response;
          
        if (parsedResponse.recipe) {
          const recipe = parsedResponse.recipe;
          textResponse = `${parsedResponse.response}\n\n${recipe.name}\n${recipe.description}\n\nトップノート: ${recipe.notes.top.join(', ')}\nミドルノート: ${recipe.notes.middle.join(', ')}\nベースノート: ${recipe.notes.base.join(', ')}`;
        } else {
          textResponse = typeof response.content === 'string' ? response.content : JSON.stringify(response);
        }
      } catch (e) {
        // JSONパースに失敗した場合はそのまま返す
        textResponse = typeof response.content === 'string' ? response.content : JSON.stringify(response);
      }
      
      // テキスト形式で返す
      return new NextResponse(textResponse, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } else if (format === 'html') {
      // HTML形式
      let htmlResponse = '';
      
      try {
        const parsedResponse = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response;
          
        if (parsedResponse.recipe) {
          const recipe = parsedResponse.recipe;
          htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>フレグランスレシピ</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #333; }
                .recipe { border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-top: 20px; }
                .note-group { margin-top: 10px; }
                .note-title { font-weight: bold; }
              </style>
            </head>
            <body>
              <p>${parsedResponse.response}</p>
              <div class="recipe">
                <h2>${recipe.name}</h2>
                <p>${recipe.description}</p>
                <div class="note-group">
                  <div class="note-title">トップノート:</div>
                  <div>${recipe.notes.top.join(', ')}</div>
                </div>
                <div class="note-group">
                  <div class="note-title">ミドルノート:</div>
                  <div>${recipe.notes.middle.join(', ')}</div>
                </div>
                <div class="note-group">
                  <div class="note-title">ベースノート:</div>
                  <div>${recipe.notes.base.join(', ')}</div>
                </div>
              </div>
            </body>
            </html>
          `;
        } else {
          htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>フレグランスレシピ</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <p>${typeof response.content === 'string' ? response.content : JSON.stringify(response)}</p>
            </body>
            </html>
          `;
        }
      } catch (e) {
        // JSONパースに失敗した場合は単純なHTMLを返す
        htmlResponse = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>フレグランスレシピ</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <p>${typeof response.content === 'string' ? response.content : JSON.stringify(response)}</p>
          </body>
          </html>
        `;
      }
      
      // HTML形式で返す
      return new NextResponse(htmlResponse, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      // JSONフォーマット（デフォルト）
      let jsonResponse;
      
      try {
        jsonResponse = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response;
      } catch (e) {
        // JSONパースに失敗した場合はそのままラップして返す
        jsonResponse = {
          response: typeof response.content === 'string' ? response.content : JSON.stringify(response),
          raw: response
        };
      }
      
      return NextResponse.json(jsonResponse);
    }
  } catch (error) {
    console.error('Chat Query API Error:', error);
    
    // エラーレスポンス
    return NextResponse.json(
      { 
        error: 'チャットクエリの処理中にエラーが発生しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
