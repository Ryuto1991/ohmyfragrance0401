"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox をインポート
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // cn をインポート

type ChoiceButtonProps = {
  choice: { name: string, description?: string } | string;
  onClick: (choice: { name: string, description?: string } | string) => void;
  checked?: boolean; // checked プロパティを追加
  disabled?: boolean; // disabled プロパティを追加 (選択上限制御用)
  className?: string; // className を追加
};

/**
 * 選択肢ボタンコンポーネント (チェックボックス付き)
 * 
 * Reactのサーバーコンポーネント対応のため、関数を直接propsとして受け取らず、
 * choiceデータを引数としてコールバックする方式に変更
 */
export const ChoiceButton = ({ choice, onClick, checked = false, disabled = false, className }: ChoiceButtonProps) => {
  // const router = useRouter(); // router は不要になった
  // const [isPending, startTransition] = useTransition(); // transition も不要
  // const [isClicked, setIsClicked] = useState(false); // isClicked も不要 (checked で管理)

  // 選択肢の名前と説明を抽出（文字列の場合とオブジェクトの場合に対応）
  const choiceText = typeof choice === 'string' ? choice : choice.name;
  const description = typeof choice === 'string' ? undefined : choice.description;

  // クリックハンドラー (チェックボックスの状態変更を通知)
  const handleClick = () => {
    // disabled 状態なら何もしない
    if (disabled && !checked) return; // disabled かつ未チェックの場合はクリック不可

    try {
      // 親コンポーネントのコールバックを呼び出し (選択/解除を通知)
      onClick(choice);
    } catch (error) {
      console.error('Choice button click error:', error);
    }
  };

  return (
    // Button を div に変更し、クリックイベントを div に設定
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors",
        "border-primary/30 hover:bg-primary/5",
        checked && "bg-primary/10 border-primary", // チェック時のスタイル
        (disabled && !checked) && "opacity-50 cursor-not-allowed", // disabled時のスタイル
        className
      )}
      title={description || choiceText}
    >
      <Checkbox
        id={`choice-${choiceText}`} // ユニークなID
        checked={checked}
        onCheckedChange={handleClick} // チェックボックス自体のクリックでも発火
        disabled={disabled && !checked} // disabled かつ未チェックの場合は無効
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <label
        htmlFor={`choice-${choiceText}`}
        className="flex flex-col flex-1 cursor-pointer"
      >
        <span className="font-medium text-sm">{choiceText}</span>
        {description && (
          <span className="text-xs text-muted-foreground mt-1">{description}</span>
        )}
      </label>
    </div>
  );
};
