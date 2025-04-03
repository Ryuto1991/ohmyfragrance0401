import domtoimage from 'dom-to-image-more';

export async function savePreviewImage(labelId: string): Promise<string> {
  const node = document.getElementById('label-preview');
  if (!node) throw new Error('label-preview が見つかりません');

  console.log('DOM要素を取得:', node);
  alert('画像生成を開始します');

  const blob = await domtoimage.toBlob(node);
  console.log('生成されたBlob:', blob);
  console.log('Blobサイズ:', blob.size, 'bytes');
  console.log('Blobタイプ:', blob.type);
  alert(`画像生成完了\nサイズ: ${(blob.size / 1024).toFixed(2)}KB\nタイプ: ${blob.type}`);

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

  alert('画像の保存が完了しました');
  return json.publicUrl;
} 