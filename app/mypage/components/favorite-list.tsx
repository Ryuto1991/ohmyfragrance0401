"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"

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

const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

export function FavoriteList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);
  const { toast } = useToast();

  // キャッシュ用のMap
  const cache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5分

  const fetchWithRetry = useCallback(async (url: string, options: RequestInit = {}, retries = RETRY_COUNT) => {
    try {
      const cacheKey = `${url}-${JSON.stringify(options)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Request failed");
      }
      
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWithRetry(`/api/favorites?page=${currentPage}&limit=${itemsPerPage}`);
      setFavorites(data.favorites);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setRetryCount(0);
    } catch (error) {
      console.error("お気に入り取得エラー:", error);
      setError("お気に入りの取得に失敗しました");
      setRetryCount(prev => prev + 1);
      toast({
        title: "エラーが発生しました",
        description: "お気に入りの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, toast, fetchWithRetry]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetchWithRetry(`/api/favorites?id=${favoriteId}`, {
        method: "DELETE",
      });

      if (!response.success) {
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
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span className="text-sm text-gray-500">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center mb-4">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-500">
            {retryCount < RETRY_COUNT ? "再試行中..." : "再試行回数が上限に達しました"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchFavorites}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          再読み込み
        </Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">お気に入りに登録された香水はありません</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          全{totalPages * itemsPerPage}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}件を表示
        </p>
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

      <motion.div
        layout
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {sortedFavorites.map((favorite) => (
            <motion.div
              key={favorite.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-square relative">
                  <img
                    src={favorite.fragrance.imageUrl || "/placeholder-fragrance.jpg"}
                    alt={favorite.fragrance.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{favorite.fragrance.name}</CardTitle>
                  <CardDescription>¥{favorite.fragrance.price.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {favorite.fragrance.description || "説明がありません"}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handleRemoveFavorite(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    お気に入りから削除
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}