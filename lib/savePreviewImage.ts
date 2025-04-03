import domtoimage from 'dom-to-image-more';
import { showToast } from './toast';

export async function savePreviewImage(labelId: string): Promise<string> {
  const node = document.getElementById('label-preview');
  if (!node) throw new Error('label-preview が見つかりません');

  showToast({ title: 'プレビュー画像の準備を開始しています' });

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

  const blob = await domtoimage.toBlob(node, { style });
  console.log('生成されたBlob:', blob);
  console.log('Blobサイズ:', blob.size, 'bytes');
  console.log('Blobタイプ:', blob.type);

  const formData = new FormData();
  formData.append('file', blob, 'preview.png');
  formData.append('label_id', labelId);

  const res = await fetch('/api/upload-preview-image', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  console.log('APIレスポンス:', json);

  if (!res.ok) {
    showToast({ title: '保存に失敗しました', variant: 'destructive' });
    throw new Error(json.error || '保存失敗');
  }

  showToast({
    title: '保存完了',
    description: `サイズ: ${(blob.size / 1024).toFixed(2)}KB`,
  });

  return json.publicUrl;
}
