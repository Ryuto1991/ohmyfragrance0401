"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Fragrance {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
}

interface Favorite {
  id: string;
  fragrance: Fragrance;
  createdAt: string;
}

type SortOption = "newest" | "oldest" | "name" | "price-asc" | "price-desc";

export function FavoriteList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        throw new Error("お気に入りの取得に失敗しました");
      }
      const data = await response.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error("お気に入り取得エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "お気に入りの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("お気に入りの削除に失敗しました");
      }

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "お気に入りを削除しました",
        description: "香水をお気に入りから削除しました。",
      });
    } catch (error) {
      console.error("お気に入り削除エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "お気に入りの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.fragrance.name.localeCompare(b.fragrance.name);
      case "price-asc":
        return a.fragrance.price - b.fragrance.price;
      case "price-desc":
        return b.fragrance.price - a.fragrance.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-8">
        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">お気に入りに登録された香水はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">新しい順</SelectItem>
            <SelectItem value="oldest">古い順</SelectItem>
            <SelectItem value="name">名前順</SelectItem>
            <SelectItem value="price-asc">価格が安い順</SelectItem>
            <SelectItem value="price-desc">価格が高い順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sortedFavorites.map((favorite) => (
          <Card key={favorite.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={favorite.fragrance.imageUrl || "/placeholder-fragrance.jpg"}
                alt={favorite.fragrance.name}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{favorite.fragrance.name}</CardTitle>
              <CardDescription>¥{favorite.fragrance.price.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {favorite.fragrance.description || "説明がありません"}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleRemoveFavorite(favorite.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                お気に入りから削除
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}