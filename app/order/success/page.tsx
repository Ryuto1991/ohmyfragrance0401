'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button'; // 非インタラクティブなボタン用
import ClientButton from '@/components/ui/client-button'; // インタラクティブなボタン用（onClick付き）
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<{
    label_id: string;
    image_url: string;
  } | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          toast({
            title: "エラー",
            description: "セッション情報が見つかりません",
            variant: "destructive",
          });
          return;
        }

        // 注文情報を取得
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('label_id, image_url')
          .eq('stripe_session_id', sessionId)
          .single();

        if (orderError) {
          console.error('Order fetch error:', orderError);
          throw new Error('注文情報の取得に失敗しました');
        }

        if (!order) {
          throw new Error('注文情報が見つかりません');
        }

        setOrderDetails(order);
      } catch (error) {
        console.error('注文詳細の取得に失敗しました', error);
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "注文詳細の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, supabase]);

  const handleDownload = async () => {
    if (!orderDetails) return;

    try {
      const { data, error } = await supabase.storage
        .from('custom-perfumes')
        .download(`orders/${orderDetails.label_id}_after.png`);

      if (error) {
        throw error;
      }

      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-label-${orderDetails.label_id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('画像のダウンロードに失敗しました', error);
      toast({
        title: "エラー",
        description: "画像のダウンロードに失敗しました",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>;
  }

  if (!orderDetails) {
    return <div className="container mx-auto px-4 py-8">注文情報が見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">ご注文ありがとうございます！</h1>
        <p className="text-gray-600 mb-8">
          カスタム香水の注文が完了しました。<br />
          ご登録いただいたメールアドレスに確認メールをお送りしました。
        </p>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">カスタムラベル</h2>
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <Image
              src={orderDetails.image_url}
              alt="カスタムラベル"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-4">
          <ClientButton // Use ClientButton here because it has onClick
            onClick={handleDownload}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            ラベル画像をダウンロード
          </ClientButton>
          <Link href="/custom-order?mode=custom" className="block"> {/* リンク修正 */}
            <Button // Keep original Button here as it has no onClick
              variant="outline"
              className="w-full py-3 rounded-lg"
            >
              新しい香水を作る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
