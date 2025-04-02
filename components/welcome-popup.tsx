import { useEffect, useState } from "react";
import { X } from "lucide-react";

const WelcomePopup = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn cursor-pointer"
      onClick={() => setShow(false)}
    >
      <div 
        className="bg-white/95 rounded-3xl shadow-xl max-w-2xl w-full mx-6 p-12 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShow(false)}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-primary">オリジナルラベルを作ろう🧴✨</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          お気に入りの画像をアップロードして、<br />
          あなただけの香水ボトルをデザインできます。<br />
          プレビューを見ながら調整してね！
        </p>
      </div>
    </div>
  );
};

export default WelcomePopup; 