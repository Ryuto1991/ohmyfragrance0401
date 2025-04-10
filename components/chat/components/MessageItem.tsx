"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Message, ChoiceOption } from "@/app/fragrance-lab/chat/types"
import { Button } from "@/components/ui/button"

interface MessageItemProps {
  message: Message
  onChoiceClick?: (choice: ChoiceOption) => void
}

/**
 * メッセージアイテムコンポーネント
 * チャット内の単一メッセージを表示する
 */
export const MessageItem = React.memo(({ message, onChoiceClick }: MessageItemProps) => {
  // 選択肢と本文の分離処理
  const parseContent = () => {
    let textContent = message.content
    const choices = message.choices || []

    return {
      text: textContent,
      choices
    }
  }

  const { text, choices } = parseContent()

  // 選択肢クリックハンドラ
  const handleChoiceClick = (choice: ChoiceOption) => {
    if (onChoiceClick) {
      onChoiceClick(choice)
    }
  }

  return (
    <div
      className={cn(
        "flex items-start",
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role !== 'user' && (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-2 md:mr-3 flex-shrink-0">
          <Image
            src="/images/Fragrance Lab.png"
            alt="AI"
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div
        className={cn(
          "md:max-w-[80%] lg:max-w-[70%] px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base leading-relaxed break-words rounded-2xl",
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-tr-none shadow-sm'
            : 'bg-white rounded-tl-none shadow-sm'
        )}
      >
        {text && <p>{text}</p>}
        
        {choices && choices.length > 0 && (
          <div className="mt-3 space-y-2 grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 lg:gap-2 lg:space-y-0">
            {choices.map((choice, index: number) => {
              // 文字列の場合はオブジェクトに変換
              const normalizedChoice = typeof choice === 'string' 
                ? { name: choice } 
                : choice;
              
              return (
                <ChoiceButton
                  key={index}
                  choice={normalizedChoice}
                  onClick={handleChoiceClick}
                />
              )
            })}
          </div>
        )}
      </div>
      {message.role === 'user' && (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ml-2 md:ml-3 flex-shrink-0">
          <Image
            src="/images/User.png"
            alt="User"
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

/**
 * 選択肢ボタンコンポーネント
 * チャット内の選択肢を表示するボタン
 */
interface ChoiceButtonProps {
  choice: ChoiceOption
  onClick: (choice: ChoiceOption) => void
}

const ChoiceButton = React.memo(({ choice, onClick }: ChoiceButtonProps) => {
  // 文字列か、オブジェクトかを判定
  const isStringChoice = typeof choice === 'string';
  const choiceName = isStringChoice ? choice : choice.name;
  const choiceDescription = !isStringChoice ? choice.description : undefined;

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start text-left py-2 px-3 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
      onClick={() => onClick(choice)}
    >
      <div>
        <div className="font-medium">{choiceName}</div>
        {choiceDescription && (
          <div className="text-xs text-muted-foreground">{choiceDescription}</div>
        )}
      </div>
    </Button>
  )
})

ChoiceButton.displayName = 'ChoiceButton'
