import { useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils"; // Import cn utility

// Update props to include className
type TipsSidebarProps = {
  className?: string; // Add optional className prop
};

export function TipsSidebar({ className }: TipsSidebarProps) { // Destructure className
  const [isOpen, setIsOpen] = useState(true); // State to control visibility

  // Static content for tabs
  const getTipsContent = (tabValue: string) => {
    switch (tabValue) {
      case "about":
        return (
          <div>
            <h3 className="font-medium mb-2">香水作成ガイド</h3>
            <p className="text-xs text-secondary-foreground/70">
              AIとチャットしてルームフレグランスのレシピを作成できます。あなたの好みや気分、イメージしたいシーンなどを伝えると、AIがあなたにぴったりの香りを提案します。完成したレシピは注文できます。
            </p>
          </div>
        );
      case "note":
        return (
          <div>
            <h3 className="font-medium mb-2">香りの構造</h3>
            <p className="text-xs text-secondary-foreground/70">
              香りは「トップノート」「ミドルノート」「ベースノート（ラストノート）」の3層で構成され、時間と共に変化します。これにより香りに奥行きが出ます。
            </p>
          </div>
        );
      case "top":
        return (
          <div>
            <h3 className="font-medium mb-2">トップノート</h3>
            <p className="text-xs text-secondary-foreground/70">
              最初に感じる軽やかな香り（約15分〜2時間持続）。主に柑橘系やハーブ系が使われ、第一印象を決めます。
            </p>
          </div>
        );
      case "middle":
        return (
          <div>
            <h3 className="font-medium mb-2">ミドルノート</h3>
            <p className="text-xs text-secondary-foreground/70">
              香りの中心（2〜4時間持続）。フローラル系やスパイシー系が多く、香水の個性を表現します。
            </p>
          </div>
        );
      case "base":
        return (
          <div>
            <h3 className="font-medium mb-2">ベースノート</h3>
            <p className="text-xs text-secondary-foreground/70">
              香りの土台（4時間以上持続）。ウッディ系やバニラなど深みのある香りが多く、香りを長持ちさせます。
            </p>
          </div>
        );
      default:
        return null; // Should not happen with defined tabs
    }
  };

  // Button to re-open the sidebar if closed
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-20 right-4 z-50 hidden sm:flex" // Keep hidden on small screens
        onClick={() => setIsOpen(true)}
        title="ヒントを表示"
      >
        <Info className="h-4 w-4" />
      </Button>
    );
  }

  // Render the sidebar content
  return (
    // Apply className prop using cn()
    <div
      className={cn(
        "fixed bottom-20 right-4 z-50 w-64 bg-white p-4 rounded-lg shadow-lg border",
        className // Merge passed className
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium">ヒント</h2>
      {/* Also remove responsive classes from the re-open button if needed, or adjust logic */}
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6" // Use simple size classes for the close button itself
        onClick={() => setIsOpen(false)} // Corrected: Set isOpen to false to close
        title="ヒントを閉じる" // Updated title
      >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-2 h-8"> {/* Adjust height */}
          <TabsTrigger value="about" className="text-xs py-1 px-1 h-full"> {/* Adjust padding */}
            使い方
          </TabsTrigger>
          <TabsTrigger value="note" className="text-xs py-1 px-1 h-full"> {/* Adjust padding */}
            ノート
          </TabsTrigger>
          <TabsTrigger value="top" className="text-xs py-1 px-1 h-full"> {/* Adjust padding */}
            トップ
          </TabsTrigger>
          <TabsTrigger value="middle" className="text-xs py-1 px-1 h-full"> {/* Adjust padding */}
            ミドル
          </TabsTrigger>
          <TabsTrigger value="base" className="text-xs py-1 px-1 h-full"> {/* Adjust padding */}
            ベース
          </TabsTrigger>
        </TabsList>
        <TabsContent value="about">{getTipsContent("about")}</TabsContent>
        <TabsContent value="note">{getTipsContent("note")}</TabsContent>
        <TabsContent value="top">{getTipsContent("top")}</TabsContent>
        <TabsContent value="middle">{getTipsContent("middle")}</TabsContent>
        <TabsContent value="base">{getTipsContent("base")}</TabsContent>
      </Tabs>
    </div>
  );
}
