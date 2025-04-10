"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type ChoiceButtonProps = {
  choice: { name: string, description?: string } | string;
  onClick: (choice: { name: string, description?: string } | string) => void;
};

/**
 * 選択肢ボタンコンポーネント
 * 
 * Reactのサーバーコンポーネント対応のため、関数を直接propsとして受け取らず、
 * choiceデータを引数としてコールバックする方式に変更
 */
export const ChoiceButton = ({ choice, onClick }: ChoiceButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isClicked, setIsClicked] = useState(false);
  
  // 選択肢の名前と説明を抽出（文字列の場合とオブジェクトの場合に対応）
  const choiceText = typeof choice === 'string' ? choice : choice.name;
  const description = typeof choice === 'string' ? undefined : choice.description;

  // クリックハンドラーをラップして、クライアントサイドでステートを管理
  const handleClick = () => {
    // すでにクリック済みなら何もしない（重複クリック防止）
    if (isClicked) return;
    
    // 状態を更新して視覚的フィードバックを提供
    setIsClicked(true);
    
    // transitionでUIをブロックせずに状態遷移を行う
    startTransition(() => {
      try {
        // 親コンポーネントのコールバックを呼び出し
        onClick(choice);
        
        // ナビゲーションのリフレッシュ（必要に応じて）
        router.refresh();
      } catch (error) {
        console.error('Choice button click error:', error);
        // エラー時はクリック状態をリセット
        setIsClicked(false);
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isPending || isClicked}
      className={`w-full text-sm md:text-base py-2.5 px-4 whitespace-normal text-left h-auto justify-start border-primary/30 
        hover:bg-primary/10 hover:text-primary-foreground/90 transition-all duration-200
        ${isClicked ? 'bg-primary/20 opacity-80' : ''}`}
    >
      <div className="flex flex-col w-full">
        <div className="font-medium">{choiceText}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
    </Button>
  );
};
