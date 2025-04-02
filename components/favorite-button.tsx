"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  fragranceId: string;
  initialIsFavorited?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function FavoriteButton({
  fragranceId,
  initialIsFavorited = false,
  variant = "outline",
  size = "default",
  className = "",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { status } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        // お気に入りから削除
        const response = await fetch(`/api/favorites?fragranceId=${fragranceId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("お気に入りの削除に失敗しました");

        setIsFavorited(false);
        toast({
          title: "お気に入りから削除しました",
          description: "香水をお気に入りから削除しました。",
        });
      } else {
        // お気に入りに追加
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fragranceId }),
        });

        if (!response.ok) throw new Error("お気に入りの追加に失敗しました");

        setIsFavorited(true);
        toast({
          title: "お気に入りに追加しました",
          description: "香水をお気に入りに追加しました。",
        });
      }
    } catch (error) {
      console.error("お気に入り操作エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "操作に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${isFavorited ? "text-pink-500 hover:text-pink-600" : ""}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      )}
      <span className="ml-2">
        {isFavorited ? "お気に入り済み" : "お気に入りに追加"}
      </span>
    </Button>
  );
} 