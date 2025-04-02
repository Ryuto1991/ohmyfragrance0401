import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

const defaultMetadata = {
  title: "Oh My Fragrance | カスタムフレグランス",
  description: "あなただけの香りをカスタマイズ。Oh My Fragranceで、AI技術を活用したオリジナルの香水やルームフレグランスを作りましょう。",
  keywords: [
    "カスタムフレグランス",
    "オリジナル香水",
    "パーソナライズド香水",
    "香水作り",
    "フレグランスデザイン",
    "カスタマイズ香水",
    "オーダーメイド香水",
    "AI香水",
    "AIフレグランス",
    "人工知能香水",
    "パーソナライズAI",
    "香りAI",
    "Fragrance Lab",
    "フレグランスラボ",
    "香水ラボ",
    "調香ラボ",
    "香りの研究所",
    "PxCell",
    "ピクセル",
    "デジタル香水",
    "デジタルフレグランス",
    "ルームフレグランス",
    "室内用フレグランス",
    "空間フレグランス",
    "アロマディフューザー",
    "ホームフレグランス",
    "インテリアフレグランス",
  ],
  ogImage: "/og-image.jpg",
};

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
  noIndex,
}: SEOProps = {}): Metadata {
  const finalTitle = title
    ? `${title} | Oh My Fragrance`
    : defaultMetadata.title;
  
  const finalDescription = description || defaultMetadata.description;
  const finalKeywords = [...(keywords || []), ...defaultMetadata.keywords];
  const finalOgImage = ogImage || defaultMetadata.ogImage;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords.join(", "),
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [finalOgImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: "https://ohmyfragrance.com",
    },
    metadataBase: new URL("https://ohmyfragrance.com"),
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    other: {
      "format-detection": "telephone=no",
    },
  };
} 