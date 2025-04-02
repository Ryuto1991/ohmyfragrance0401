import { supabase } from '@/lib/supabase'

interface StorageCleanupOptions {
  bucket: string;
  prefix?: string;
  maxAge?: number; // ミリ秒
}

class StorageCleanup {
  private static instance: StorageCleanup;
  private readonly DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24時間

  private constructor() {}

  static getInstance(): StorageCleanup {
    if (!StorageCleanup.instance) {
      StorageCleanup.instance = new StorageCleanup();
    }
    return StorageCleanup.instance;
  }

  async cleanupUnusedFiles(options: StorageCleanupOptions): Promise<void> {
    const { bucket, prefix = '', maxAge = this.DEFAULT_MAX_AGE } = options;

    try {
      // バケット内のファイル一覧を取得
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list(prefix);

      if (listError) throw listError;

      const now = Date.now();
      const deletePromises: Promise<void>[] = [];

      // 各ファイルのメタデータを取得して、不要なファイルを特定
      for (const file of files) {
        const { data: metadata, error: metadataError } = await supabase.storage
          .from(bucket)
          .getPublicUrl(`${prefix}/${file.name}`);

        if (metadataError) {
          console.error(`メタデータ取得エラー: ${file.name}`, metadataError);
          continue;
        }

        // ファイルの作成日時を取得
        const createdAt = new Date(file.created_at).getTime();
        const age = now - createdAt;

        // 指定された期間を超えているファイルを削除
        if (age > maxAge) {
          deletePromises.push(
            supabase.storage
              .from(bucket)
              .remove([`${prefix}/${file.name}`])
              .then(() => {
                console.log(`削除完了: ${file.name}`);
              })
              .catch(error => {
                console.error(`削除エラー: ${file.name}`, error);
              })
          );
        }
      }

      // 削除処理を並列実行
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('ストレージクリーンアップエラー:', error);
      throw error;
    }
  }

  async cleanupTemporaryFiles(bucket: string): Promise<void> {
    // 一時ファイル用のプレフィックス
    const TEMP_PREFIX = 'temp/';
    await this.cleanupUnusedFiles({
      bucket,
      prefix: TEMP_PREFIX,
      maxAge: 1 * 60 * 60 * 1000, // 1時間
    });
  }

  async cleanupOldVersions(bucket: string, prefix: string): Promise<void> {
    // 古いバージョンのファイルを削除
    await this.cleanupUnusedFiles({
      bucket,
      prefix,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日
    });
  }
}

export const storageCleanup = StorageCleanup.getInstance(); 