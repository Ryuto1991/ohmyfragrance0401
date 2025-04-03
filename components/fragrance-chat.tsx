'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FragranceChatProps {
  initialQuery?: string;
}

export function FragranceChat({ initialQuery }: FragranceChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！今日はどんな香りをつくりますか？',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // localStorageの初期化とチャット履歴の復元
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const saved = localStorage.getItem('fragrance_chat_history');
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        setMessages(parsedMessages);
      }

      const lastVisit = localStorage.getItem('last_fragrance_chat_visit');
      const now = new Date().getTime();
      
      if (lastVisit) {
        const timeDiff = now - parseInt(lastVisit);
        // 30分以上経過していたら新規セッション
        if (timeDiff > 30 * 60 * 1000) {
          localStorage.removeItem('fragrance_chat_history');
          setMessages([
            {
              role: 'assistant',
              content: 'おかえりなさい！久しぶりですね。今日はどんな香りを一緒に作りましょうか？',
            },
          ]);
        } else {
          // 30分以内の再訪
          setIsReturningUser(true);
          if (!saved || JSON.parse(saved).length <= 1) { // 初期メッセージのみの場合
            setMessages([
              {
                role: 'assistant',
                content: 'また来てくれたんですね！続きから香りを一緒に考えていきましょう。',
              },
            ]);
          }
        }
      }
      
      localStorage.setItem('last_fragrance_chat_visit', now.toString());
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // チャット履歴を保存
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && messages.length > 1) {
      localStorage.setItem('fragrance_chat_history', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  // スクロール制御
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 初期クエリの処理
  useEffect(() => {
    const processInitialQuery = async () => {
      if (initialQuery && !hasProcessedInitialQuery && isInitialized) {
        setHasProcessedInitialQuery(true);
        setIsLoading(true);
        try {
          let newMessages = [...messages];
          
          // 既存の会話がある場合は、つなぎのメッセージを追加
          if (messages.length > 1) {
            newMessages = [
              ...messages,
              {
                role: 'assistant',
                content: 'なるほど、新しいアイデアをいただきましたね。それでは、その観点からも考えてみましょう。',
              },
              { role: 'user', content: initialQuery },
            ];
          } else {
            newMessages = [
              ...messages,
              { role: 'user', content: initialQuery },
            ];
          }
          
          setMessages(newMessages);

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages }),
          });

          if (!res.ok) throw new Error('Failed to send message');

          const data = await res.json();
          const aiMessage = { role: 'assistant', content: data.result };
          setMessages([...newMessages, aiMessage]);

          const recipe = extractJsonFromText(data.result);
          if (recipe) {
            localStorage.setItem('fragrance_recipe', JSON.stringify(recipe));
            setTimeout(() => {
              router.push('/custom-order');
            }, 1500);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          setMessages([
            ...messages,
            { role: 'user', content: initialQuery },
            {
              role: 'assistant',
              content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    processInitialQuery();
  }, [initialQuery, messages, isInitialized, hasProcessedInitialQuery]);

  const extractJsonFromText = (text: string): any | null => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      const aiMessage = { role: 'assistant', content: data.result };
      setMessages([...newMessages, aiMessage]);

      const recipe = extractJsonFromText(data.result);
      if (recipe) {
        localStorage.setItem('fragrance_recipe', JSON.stringify(recipe));
        setTimeout(() => {
          router.push('/custom-order');
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    localStorage.removeItem('fragrance_chat_history');
    localStorage.removeItem('last_fragrance_chat_visit');
    setMessages([
      {
        role: 'assistant',
        content: 'こんにちは！今日はどんな香りをつくりますか？',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={resetChat}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          リセット
        </Button>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={isLoading}>
          送信
        </Button>
      </div>
    </div>
  );
} 