import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Modify to accept Buffer, fileName, fileType
export async function uploadCroppedImage(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<{
  success: boolean;
  publicUrl?: string;
  labelId?: string; // Keep labelId if needed elsewhere, though not used in this func
  imageKey?: string; // Added imageKey to return
  error?: string;
}> {
  try {
    // Use fileName for path generation, ensure unique path with uuid
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    // Keep storing in temp folder initially
    const path = `temp/${uniqueFileName}`;

    // 画像をアップロード - Use buffer and fileType
    const { error } = await supabase
      .storage
      .from('custom-perfumes')
      .upload(path, buffer, { // Pass buffer
        upsert: true, // Keep upsert true if needed
        contentType: fileType, // Use the passed fileType
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // アップロードした画像のURLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('custom-perfumes')
      .getPublicUrl(path);

    // Return success, publicUrl, and the generated path as imageKey
    return {
      success: true,
      publicUrl,
      imageKey: path // Return the path as imageKey
      // labelId is not generated/used here, remove if not needed upstream
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像のアップロードに失敗しました'
    };
  }
}
