'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useStripeCart } from '@/contexts/stripe-cart-context';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { clearCart } = useStripeCart();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // カートをクリア
      clearCart();
      // 非ログインユーザーのセッションIDを削除
      localStorage.removeItem('cartSessionId');
      // ステータスを更新
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, []); // 依存配列を空にして、マウント時に1回だけ実行

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B6B] mx-auto mb-4"></div>
            <p className="text-gray-600">注文を確認中...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">ご注文ありがとうございます</h1>
            <p className="text-gray-600 mb-8">
              ご注文を受け付けました。ご入力いただいたメールアドレスに確認メールをお送りしましたので、ご確認ください。
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full">トップページへ戻る</Button>
              </Link>
              <Link href="/custom-order?mode=custom"> {/* リンク修正 */}
                <Button variant="outline" className="w-full">
                  他の商品を見る
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-8">
              注文の確認中にエラーが発生しました。お手数ですが、もう一度お試しください。
            </p>
            <Link href="/">
              <Button className="w-full">トップページへ戻る</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
