"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { ProfileEditDialog } from "./components/profile-edit-dialog";
import { useToast } from "@/components/ui/use-toast";
import { FavoriteList } from "./components/favorite-list";

interface User {
  name: string;
  email: string;
  image?: string;
}

export default function MyPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (status === "unauthenticated") {
          router.push("/login");
          return;
        }

        if (status === "authenticated" && session.user) {
          setUser({
            name: session.user.name || "ゲスト",
            email: session.user.email || "",
            image: session.user.image,
          });
        }
      } catch (error) {
        console.error("認証エラー:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, session, status]);

  const handleProfileUpdate = async (updatedUser: { name: string; email: string }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました");
      }

      const data = await response.json();
      setUser(data.user);
      
      // NextAuthのセッションも更新
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
        },
      });
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* プロフィールセクション */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image || "/placeholder-avatar.jpg"} alt="プロフィール画像" />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* タブセクション */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">注文履歴</TabsTrigger>
            <TabsTrigger value="favorites">お気に入り</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* 注文履歴タブ */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>注文履歴</CardTitle>
                <CardDescription>過去の注文内容を確認できます</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: 注文履歴リストの実装 */}
                <p>注文履歴がありません</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* お気に入りタブ */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>お気に入り</CardTitle>
                <CardDescription>お気に入りに登録した香水を確認できます</CardDescription>
              </CardHeader>
              <CardContent>
                <FavoriteList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 設定タブ */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
                <CardDescription>プロフィールや通知設定を変更できます</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">基本情報</h3>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsProfileEditOpen(true)}
                  >
                    プロフィールを編集
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium mb-2">セキュリティ</h3>
                  <Button variant="outline" className="w-full">
                    パスワードを変更
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    router.push("/api/auth/signout");
                  }}
                >
                  ログアウト
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* プロフィール編集ダイアログ */}
        {user && (
          <ProfileEditDialog
            open={isProfileEditOpen}
            onOpenChange={setIsProfileEditOpen}
            user={user}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
} 