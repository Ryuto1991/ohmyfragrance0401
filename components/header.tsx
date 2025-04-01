import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/oh-my-logo.png"
              alt="Oh My Fragrance"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Oh My Fragrance
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/fragrance-lab"
                    className="text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    Fragrance Lab
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-100 animate-fade-in"
                    sideOffset={5}
                    side="bottom"
                  >
                    あなただけの香りを作成
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/showcase"
                    className="text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    Showcase
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-100 animate-fade-in"
                    sideOffset={5}
                    side="bottom"
                  >
                    人気の香りをご紹介
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/oh-my-custom"
                    className="text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    Oh My Custom
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-100 animate-fade-in"
                    sideOffset={5}
                    side="bottom"
                  >
                    セレクト香水を注文
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href="/concept"
                    className="text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    Concept
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-100 animate-fade-in"
                    sideOffset={5}
                    side="bottom"
                  >
                    コンセプトとストーリー
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </nav>

          {/* モバイルメニューボタン */}
          <button className="md:hidden text-gray-600 hover:text-pink-500">
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 