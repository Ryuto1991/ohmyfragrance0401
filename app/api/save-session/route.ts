import { NextResponse } from 'next/server';
// APIルート内で直接インポート
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Received POST request to /api/save-session');

  try {
    // --- ここで直接 Supabase クライアントを作成 ---
    const cookieStore = cookies(); // ここは await しない

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
    }

    const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
      cookies: {
        // async を追加して await を使う
        async getAll() {
          // await を追加したまま (エラー回避のため)
          return (await cookieStore).getAll();
        },
        // async は維持
        async setAll(cookiesToSet) {
          try {
            // forEach の代わりに for...of ループを使用
            for (const { name, value, options } of cookiesToSet) {
              // await を追加したまま (エラー回避のため)
              (await cookieStore).set(name, value, options);
            }
          } catch (error) {
             // Route Handlers では set に失敗する可能性がある
          }
        },
      },
    });
    // --- ここまで直接 Supabase クライアントを作成 ---

    // 1. リクエストボディからデータを取得
    const body = await request.json();
    console.log('Request body:', body);

    const {
      sessionId,
      phase,
      messageHistory,
      fragranceRecipe,
      characterName,
      inappropriateCount,
    } = body;

    if (!sessionId) {
        throw new Error('sessionId is required');
    }

    // --- Supabase への保存処理 ---
    const { data, error } = await supabase
      .from('fragrance_sessions')
      .upsert({
        id: sessionId,
        phase: phase,
        message_history: messageHistory,
        fragrance_recipe: fragranceRecipe,
        character_name: characterName,
        inappropriate_count: inappropriateCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('Supabase upsert successful:', data);
    return NextResponse.json({ success: true, data: data });
    // --- ここまで ---

  } catch (error) {
    console.error('API Error:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}