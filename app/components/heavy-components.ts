import dynamic from 'next/dynamic';
import { LoadingSpinner } from './ui/a11y';

// カート関連

// 商品詳細
export const ProductDetail = dynamic(() => import('./product/product-detail').then(mod => mod.ProductDetail), {
  loading: () => <LoadingSpinner />,
  ssr: true
});

// カスタマイズフォーム
export const CustomizationForm = dynamic(() => import('./forms/customization-form').then(mod => mod.CustomizationForm), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// 画像ギャラリー
export const ImageGallery = dynamic(() => import('./gallery/image-gallery').then(mod => mod.ImageGallery), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// レビューセクション
export const ReviewSection = dynamic(() => import('./review/review-section').then(mod => mod.ReviewSection), {
  loading: () => <LoadingSpinner />,
  ssr: true
});

// 商品リスト
export const ProductGrid = dynamic(() => import('./product/product-grid').then(mod => mod.ProductGrid), {
  loading: () => <LoadingSpinner />,
  ssr: true
});

// チェックアウトフォーム
export const CheckoutForm = dynamic(() => import('./forms/checkout-form').then(mod => mod.CheckoutForm), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// 3Dビューワー
export const ThreeDViewer = dynamic(() => import('./3d/three-d-viewer').then(mod => mod.ThreeDViewer), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// お気に入りリスト
export const FavoriteList = dynamic(() => import('./favorite/favorite-list').then(mod => mod.FavoriteList), {
  loading: () => <LoadingSpinner />,
  ssr: true
}); 