'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // ここで注文の確認処理を行う
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams]);

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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">ご注文ありがとうございます</h1>
            <p className="text-gray-600 mb-8">
              ご注文の確認メールをお送りしました。<br />
              メールの内容をご確認ください。
            </p>
            <div className="space-y-4">
              <Link href="/" className="block">
                <Button className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90">
                  トップページに戻る
                </Button>
              </Link>
              <Link href="/oh-my-custom-order" className="block">
                <Button variant="outline" className="w-full">
                  もう1つ注文する
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-8">
              申し訳ありませんが、注文の確認中にエラーが発生しました。<br />
              もう一度お試しください。
            </p>
            <Link href="/oh-my-custom-order" className="block">
              <Button className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90">
                注文ページに戻る
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 