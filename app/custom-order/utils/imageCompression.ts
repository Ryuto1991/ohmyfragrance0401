import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType: string;
}

export async function compressImage(file: File): Promise<File> {
  const options: CompressionOptions = {
    maxSizeMB: 1,              // 最大1MB
    maxWidthOrHeight: 1200,    // 最大1200px
    useWebWorker: true,        // WebWorkerを使用して非同期処理
    fileType: 'image/jpeg',    // JPEG形式で出力
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
}

// 画像のメタデータを取得する関数
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ファイルタイプの検証
export function validateImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

// ファイルサイズの検証（5MB以下）
export function validateFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  return file.size <= maxSize;
} 