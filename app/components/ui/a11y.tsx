import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// スクリーンリーダー専用のテキスト
export const VisuallyHidden = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] border-0",
        className
      )}
      {...props}
    />
  );
});
VisuallyHidden.displayName = "VisuallyHidden";

// スキップリンク（キーボードナビゲーション用）
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="fixed top-0 left-0 p-2 -translate-y-full focus:translate-y-0 bg-background z-50 transition-transform"
    >
      メインコンテンツへスキップ
    </a>
  );
};

// アクセシブルなアイコンボタン
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          className
        )}
        aria-label={label}
        {...props}
      >
        {children}
        <VisuallyHidden>{label}</VisuallyHidden>
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

// アクセシブルなローディングスピナー
interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", label = "読み込み中...", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-8 h-8",
      lg: "w-12 h-12",
    };

    return (
      <div
        ref={ref}
        role="status"
        className={cn("relative", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-primary border-r-transparent",
            sizeClasses[size]
          )}
        />
        <VisuallyHidden>{label}</VisuallyHidden>
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

// アクセシブルなアラート
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, type = "info", title, children, ...props }, ref) => {
    const roleMap = {
      info: "status",
      success: "status",
      warning: "alert",
      error: "alert",
    };

    const colorMap = {
      info: "border-blue-200 bg-blue-50 text-blue-800",
      success: "border-green-200 bg-green-50 text-green-800",
      warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
      error: "border-red-200 bg-red-50 text-red-800",
    };

    return (
      <div
        ref={ref}
        role={roleMap[type]}
        className={cn(
          "rounded-lg border p-4",
          colorMap[type],
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="text-sm font-medium mb-2">{title}</h3>
        )}
        <div className="text-sm">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert"; 