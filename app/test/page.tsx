"use client";

import { useState } from "react";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTest = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/test-checkout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("テストセッションの作成に失敗しました");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Ship&Co連携テスト
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            このページからテスト用の注文セッションを開始できます。
            以下の手順でテストを実行してください：
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>「テストを開始」ボタンをクリック</li>
            <li>Stripeのチェックアウトページで配送方法を選択</li>
            <li>テスト用のカード情報を入力（4242 4242 4242 4242）</li>
            <li>注文を完了</li>
            <li>webhookのログを確認</li>
          </ol>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={startTest}
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "処理中..." : "テストを開始"}
          </button>
        </div>
      </div>
    </div>
  );
} 