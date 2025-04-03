import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // FormDataの取得
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const labelId = formData.get('label_id') as string;

    // バリデーション
    if (!file || !labelId) {
      return NextResponse.json(
        { error: 'ファイルとラベルIDは必須です' },
        { status: 400 }
      );
    }

    // ファイル名の生成
    const fileName = `${labelId}_after.png`;
    const filePath = `tmp/${fileName}`;

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from('custom-perfumes')
      .upload(filePath, file, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました' },
        { status: 500 }
      );
    }

    // アップロードした画像の公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('custom-perfumes')
      .getPublicUrl(filePath);

    // 成功レスポンス
    return NextResponse.json({
      publicUrl,
      label_id: labelId
    });

  } catch (error) {
    console.error('Error in upload-preview-image:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 