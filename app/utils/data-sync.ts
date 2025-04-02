interface SyncState {
  lastSync: number;
  isSyncing: boolean;
  error: Error | null;
}

interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class DataSync {
  private static instance: DataSync;
  private syncStates: Map<string, SyncState> = new Map();
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000;

  private constructor() {}

  static getInstance(): DataSync {
    if (!DataSync.instance) {
      DataSync.instance = new DataSync();
    }
    return DataSync.instance;
  }

  async syncData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: SyncOptions = {}
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
      onSuccess,
      onError,
    } = options;

    let retries = 0;
    let lastError: Error | null = null;

    while (retries < maxRetries) {
      try {
        // 同期状態を更新
        this.updateSyncState(key, true, null);

        // データを取得
        const data = await fetchFn();

        // 同期状態を更新
        this.updateSyncState(key, false, null);
        onSuccess?.();

        return data;
      } catch (error) {
        lastError = error as Error;
        this.updateSyncState(key, false, lastError);
        onError?.(lastError);

        if (retries < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        retries++;
      }
    }

    throw lastError;
  }

  private updateSyncState(key: string, isSyncing: boolean, error: Error | null) {
    this.syncStates.set(key, {
      lastSync: Date.now(),
      isSyncing,
      error,
    });
  }

  getSyncState(key: string): SyncState | undefined {
    return this.syncStates.get(key);
  }

  isSyncing(key: string): boolean {
    return this.syncStates.get(key)?.isSyncing ?? false;
  }

  getLastSyncTime(key: string): number {
    return this.syncStates.get(key)?.lastSync ?? 0;
  }

  getError(key: string): Error | null {
    return this.syncStates.get(key)?.error ?? null;
  }

  reset(key: string): void {
    this.syncStates.delete(key);
  }

  cleanup(): void {
    this.syncStates.clear();
  }
}

export const dataSync = DataSync.getInstance(); 