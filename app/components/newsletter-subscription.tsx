import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('購読に失敗しました');
      }

      toast({
        title: '購読完了',
        description: 'ニュースレターの購読が完了しました。',
      });

      setEmail('');
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ニュースレターの購読に失敗しました。後でもう一度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">ニュースレターを購読する</h3>
        <p className="text-sm text-muted-foreground">
          最新の香水情報やお得な情報をお届けします
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="メールアドレスを入力"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? '送信中...' : '購読する'}
        </Button>
      </form>
    </div>
  );
} 