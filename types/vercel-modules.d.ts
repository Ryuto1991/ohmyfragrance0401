// Vercelのモジュール用の型定義
declare module '@vercel/analytics/react' {
  export interface AnalyticsProps {
    debug?: boolean;
    beforeSend?: (event: any) => any | null;
    mode?: 'auto' | 'production' | 'development';
  }
  
  export const Analytics: React.FC<AnalyticsProps>;
}

declare module '@vercel/speed-insights/next' {
  export interface SpeedInsightsProps {
    debug?: boolean;
    sampleRate?: number;
  }
  
  export const SpeedInsights: React.FC<SpeedInsightsProps>;
}