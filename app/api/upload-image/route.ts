import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // --- Validation (similar to server action) ---
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'ファイルサイズは5MB以下にしてください。' }, { status: 400 });
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Added webp
     if (!allowedTypes.includes(file.type)) {
       return NextResponse.json({ success: false, error: 'JPG、PNG、GIF、WEBP形式の画像のみアップロード可能です' }, { status: 400 });
     }
    // --- End Validation ---

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const path = `temp/${uniqueFileName}`; // Store in temp folder

    const { error: uploadError } = await supabase
      .storage
      .from('custom-perfumes')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('custom-perfumes')
      .getPublicUrl(path);

    return NextResponse.json({ success: true, publicUrl, imageKey: path });

  } catch (error) {
    console.error('Error handling image upload:', error);
    const errorMessage = error instanceof Error ? error.message : '画像のアップロード中に予期せぬエラーが発生しました';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
