import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          ページが見つかりません
        </h2>
        <p className="text-muted-foreground mb-8">
          申し訳ありません。お探しのページは存在しないか、移動された可能性があります。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              トップページへ
            </Link>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            前のページへ戻る
          </Button>
        </div>
      </div>
    </div>
  );
} 