interface SubmissionState {
  isSubmitting: boolean;
  lastSubmissionTime: number;
  submissionId: string;
}

class SubmissionGuard {
  private static instance: SubmissionGuard;
  private states: Map<string, SubmissionState> = new Map();
  private readonly DEBOUNCE_TIME = 2000; // 2秒

  private constructor() {}

  static getInstance(): SubmissionGuard {
    if (!SubmissionGuard.instance) {
      SubmissionGuard.instance = new SubmissionGuard();
    }
    return SubmissionGuard.instance;
  }

  async guardSubmission(
    formId: string,
    submissionFn: () => Promise<void>,
    options: { debounceTime?: number } = {}
  ): Promise<boolean> {
    const { debounceTime = this.DEBOUNCE_TIME } = options;
    const now = Date.now();
    const state = this.states.get(formId);

    // 前回の送信から十分な時間が経過していない場合
    if (state && now - state.lastSubmissionTime < debounceTime) {
      return false;
    }

    // 送信中の場合はブロック
    if (state?.isSubmitting) {
      return false;
    }

    // 送信状態を更新
    this.states.set(formId, {
      isSubmitting: true,
      lastSubmissionTime: now,
      submissionId: Math.random().toString(36).substring(7),
    });

    try {
      await submissionFn();
      return true;
    } catch (error) {
      console.error('送信エラー:', error);
      return false;
    } finally {
      // 送信状態をリセット
      const currentState = this.states.get(formId);
      if (currentState?.submissionId === this.states.get(formId)?.submissionId) {
        this.states.delete(formId);
      }
    }
  }

  isSubmitting(formId: string): boolean {
    return this.states.get(formId)?.isSubmitting ?? false;
  }

  getLastSubmissionTime(formId: string): number {
    return this.states.get(formId)?.lastSubmissionTime ?? 0;
  }

  reset(formId: string): void {
    this.states.delete(formId);
  }

  cleanup(): void {
    this.states.clear();
  }
}

export const submissionGuard = SubmissionGuard.getInstance(); 