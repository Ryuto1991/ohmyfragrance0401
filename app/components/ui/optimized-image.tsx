import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  quality?: number;
  sizes?: string;
  loading?: "lazy" | "eager";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
  quality = 75,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // 画像のサイズが指定されていない場合のデフォルト値
  const defaultWidth = 800;
  const defaultHeight = 600;

  // プレースホルダーのぼかし効果用のBase64エンコードされた小さな画像
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIB4gHh4eIB0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  // WebPサポートの検出
  const [supportsWebP, setSupportsWebP] = useState(false);
  useEffect(() => {
    const checkWebPSupport = async () => {
      const webPSupported = await testWebPSupport();
      setSupportsWebP(webPSupported);
    };
    checkWebPSupport();
  }, []);

  // WebPサポートのテスト
  const testWebPSupport = async () => {
    const webP = new Image();
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    return new Promise((resolve) => {
      webP.onload = () => resolve(true);
      webP.onerror = () => resolve(false);
    });
  };

  // エラー時のフォールバック画像
  useEffect(() => {
    if (error && src !== '/images/fallback.jpg') {
      setImageSrc('/images/fallback.jpg');
      setError(false);
    }
  }, [error, src]);

  // パフォーマンス計測
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      if (!isLoading) {
        const loadTime = performance.now() - startTime;
        console.log(`Image load time: ${loadTime}ms`);
      }
    };
  }, [isLoading]);

  return (
    <div className={cn(
      "relative overflow-hidden bg-muted",
      isLoading && "animate-pulse",
      className
    )}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width || defaultWidth}
        height={height || defaultHeight}
        className={cn(
          "duration-700 ease-in-out",
          isLoading
            ? "scale-110 blur-2xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          objectFit === "contain" && "object-contain",
          objectFit === "cover" && "object-cover",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setError(true)}
        priority={priority}
        quality={quality}
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes={sizes}
        loading={loading}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-sm text-muted-foreground">
            画像を読み込めませんでした
          </span>
        </div>
      )}
    </div>
  );
} 