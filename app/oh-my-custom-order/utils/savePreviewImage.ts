import domtoimage from 'dom-to-image-more';
import { toast } from '@/components/ui/use-toast';

export async function savePreviewImage(labelId: string): Promise<string> {
  const node = document.getElementById('label-preview');
  if (!node) throw new Error('label-preview が見つかりません');

  // 処理開始のトースト
  toast({
    title: "プレビュー画像の準備を開始しています",
    description: "しばらくお待ちください...",
  });

  // キャプチャ時のスタイルを設定
  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '0',
    margin: '0'
  };

  try {
    const blob = await domtoimage.toBlob(node, { style });
    console.log('生成されたBlob:', blob);
    console.log('Blobサイズ:', blob.size, 'bytes');
    console.log('Blobタイプ:', blob.type);

    const formData = new FormData();
    formData.append('file', blob, 'preview.png');
    formData.append('label_id', labelId);

    console.log('FormData作成完了:', {
      file: blob,
      label_id: labelId
    });

    const res = await fetch('/api/upload-preview-image', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    console.log('APIレスポンス:', json);

    if (!res.ok) throw new Error(json.error || '保存失敗');

    // 成功時のトースト
    toast({
      title: "保存完了",
      description: `サイズ: ${(blob.size / 1024).toFixed(2)}KB`,
      variant: "default",
    });

    return json.publicUrl;
  } catch (error) {
    console.error('画像保存エラー:', error);
    // エラー時のトースト
    toast({
      title: "保存に失敗しました",
      description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      variant: "destructive",
    });
    throw error;
  }
} 