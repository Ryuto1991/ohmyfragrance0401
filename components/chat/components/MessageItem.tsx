"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image";
import { Message, RecipeNoteWithAmount, FragranceRecipe } from "@/app/fragrance-lab/chat/types"; // Import FragranceRecipe
import { Button } from "@/components/ui/button";
// Remove ChoiceButton import
// import { ChoiceButton } from "../choice-button";
import { Separator } from "@/components/ui/separator";
import { FragranceRadarChart } from "@/app/components/FragranceRadarChart"; // Import Radar Chart
import { calculateFragranceScore } from "@/app/lib/fragrance-score"; // Import score calculation function

// Remove unused props: onChoiceClick, selectedScents, currentNoteSelection
interface MessageItemProps {
  message: Message;
  // isLoading might still be useful for message-specific loading state
  isLoading?: boolean;
  onRegenerateClick?: () => void; // Add callback for re-generate button
  onOrderClick?: (recipe: FragranceRecipe) => void; // Add callback for order button, passing the recipe
  scentNames?: string[]; // Add list of known scent names
  onScentClick?: (scentName: string) => void; // Add callback for scent button clicks
}

/**
 * メッセージアイテムコンポーネント
 * チャット内の単一メッセージを表示する
 */
export const MessageItem = React.memo(({
  message,
  isLoading, // Keep isLoading if needed
  onRegenerateClick, // Get the regenerate handler
  onOrderClick, // Get the order handler
  scentNames = [], // Default to empty array
  onScentClick // Get the scent click handler
}: MessageItemProps) => {

  // Remove parsing logic related to choices
  // const parseContent = () => { ... };
  // const { text, choices } = parseContent();
  const text = message.content; // Use content directly

  // Remove choice click handler
  // const handleChoiceClick = (choice: ChoiceOption) => { ... };

  // Function to parse content and replace scent names with buttons
  const renderContentWithScentButtons = (content: string, role: 'user' | 'assistant' | 'system' | 'function') => {
    if (!scentNames || scentNames.length === 0 || !onScentClick) {
      return <p className="mb-3">{content}</p>; // Return plain text if no scents or handler
    }

    // Create a regex to find all known scent names (case-insensitive for robustness)
    // Escape special regex characters in scent names if necessary
    const escapedScentNames = scentNames.map(name =>
      name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedScentNames.join('|')})`, 'gi');

    const parts = content.split(regex);

    // Determine the color class based on the message role
    const textColorClass = role === 'user' ? 'text-blue-600' : 'text-primary-medium';

    return (
      <p className="mb-3 leading-relaxed">
        {parts.map((part, index) => {
          const lowerPart = part.toLowerCase();
          const matchedScent = scentNames.find(name => name.toLowerCase() === lowerPart);

          if (matchedScent) {
            return (
              <Button
                key={index}
                variant="link"
                size="sm"
                className={cn("p-0 h-auto text-sm md:text-base hover:underline inline", textColorClass)}
                onClick={() => onScentClick(matchedScent)}
                disabled={isLoading}
              >
                {part} {/* Display original casing */}
              </Button>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
      </p>
    );
  };


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
        {/* Display message text content with scent buttons, passing the role */}
        {text && renderContentWithScentButtons(text, message.role)}

        {/* Display recipe details if available */}
        {message.recipe && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h3 className="text-base font-semibold mb-2">
              <span className="text-primary">🌿</span> レシピ: {message.recipe.name || "AI提案レシピ"}
            </h3>
            {message.recipe.description && (
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{message.recipe.description}"
              </p>
            )}
            <ul className="text-sm space-y-1 list-none pl-1"> {/* Changed list-disc to list-none */}
              <li className="flex items-center flex-wrap"> {/* Use flex for inline display */}
                <strong className="mr-1">トップ:</strong>{" "}
                {message.recipe?.topNotes?.length > 0 // Add optional chaining here
                  ? message.recipe.topNotes.map((note, index) => (
                      <React.Fragment key={`top-${index}`}>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-sm md:text-base text-primary-medium hover:underline inline" // Use darker red for AI recipe notes
                          onClick={() => onScentClick?.(note.name)}
                          disabled={isLoading}
                        >
                          {note.name}
                        </Button>
                        {index < (message.recipe?.topNotes?.length ?? 0) - 1 && <span className="mx-1">,</span>} {/* Add optional chaining and nullish coalescing */}
                      </React.Fragment>
                    ))
                  : "なし"}
              </li>
              <li className="flex items-center flex-wrap"> {/* Use flex for inline display */}
                <strong className="mr-1">ミドル:</strong>{" "}
                {message.recipe?.middleNotes?.length > 0 // Add optional chaining here
                  ? message.recipe.middleNotes.map((note, index) => (
                      <React.Fragment key={`middle-${index}`}>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-sm md:text-base text-primary-medium hover:underline inline" // Use darker red for AI recipe notes
                          onClick={() => onScentClick?.(note.name)}
                          disabled={isLoading}
                        >
                          {note.name}
                        </Button>
                        {index < (message.recipe?.middleNotes?.length ?? 0) - 1 && <span className="mx-1">,</span>} {/* Add optional chaining and nullish coalescing */}
                      </React.Fragment>
                    ))
                  : "なし"}
              </li>
              <li className="flex items-center flex-wrap"> {/* Use flex for inline display */}
                <strong className="mr-1">ベース:</strong>{" "}
                {message.recipe?.baseNotes?.length > 0 // Add optional chaining here
                  ? message.recipe.baseNotes.map((note, index) => (
                      <React.Fragment key={`base-${index}`}>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-sm md:text-base text-primary-medium hover:underline inline" // Use darker red for AI recipe notes
                          onClick={() => onScentClick?.(note.name)}
                          disabled={isLoading}
                        >
                          {note.name}
                        </Button>
                        {index < (message.recipe?.baseNotes?.length ?? 0) - 1 && <span className="mx-1">,</span>} {/* Add optional chaining and nullish coalescing */}
                      </React.Fragment>
                    ))
                  : "なし"}
              </li>
            </ul>
            {/* Render Radar Chart */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">香りの特徴:</h4>
              <FragranceRadarChart
                scores={calculateFragranceScore([
                  ...(message.recipe.topNotes || []),
                  ...(message.recipe.middleNotes || []),
                  ...(message.recipe.baseNotes || []),
                ] as RecipeNoteWithAmount[])} // Combine notes and pass to calculator
              />
            </div>
            {/* Add Re-generate and Order buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerateClick}
                disabled={isLoading} // Disable if any loading is happening
                className="flex-1"
              >
                🔁 別パターンで再生成
              </Button>
              <Button
                size="sm"
                onClick={() => message.recipe && onOrderClick?.(message.recipe)} // Pass recipe to handler
                disabled={isLoading} // Disable if any loading is happening
                className="flex-1"
              >
                🛒 この香りにする
              </Button>
            </div>
          </div>
        )}

        {/* Remove choice button rendering logic */}
        {/* {choices && choices.length > 0 && ( ... )} */}
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

MessageItem.displayName = 'MessageItem';

// Remove the internal ChoiceButton definition
/*
interface ChoiceButtonProps { ... }
const ChoiceButton = React.memo(({ choice, onClick }: ChoiceButtonProps) => { ... });
ChoiceButton.displayName = 'ChoiceButton';
*/
