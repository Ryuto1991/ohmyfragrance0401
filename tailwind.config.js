/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        zen: ['var(--font-zen)'],
        montserrat: ['var(--font-montserrat)'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ffadad", // primary-100 - メインボタンの色に変更
          light: "#e0a3ad", // primary-200 - ホバー状態に
          medium: "#99616c", // primary-300 - アクセント要素に
          foreground: "#333333", // text-100 - ボタンテキスト色（視認性向上のため）
        },
        secondary: {
          DEFAULT: "#fffcf8", // bg-100 - メイン背景色
          foreground: "#333333", // text-100 - メインテキスト色
        },
        muted: {
          DEFAULT: "#ccc9c5", // bg-300 - 非アクティブ要素や区切り線に
          foreground: "#5c5c5c", // text-200 - セカンダリーテキスト色
        },
        accent: {
          DEFAULT: "#930058", // accent-200 - 強調要素に
          light: "#ff69b4", // accent-100 - 特別な強調やアクセントに
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 追加のユーティリティカラー
        text: {
          primary: "#333333", // text-100
          secondary: "#5c5c5c", // text-200
        },
        bg: {
          primary: "#fffcf8", // bg-100
          secondary: "#f5f2ee", // bg-200
          tertiary: "#ccc9c5", // bg-300
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    {
      pattern: /^(bg|text|border)-(primary|secondary|accent|muted|destructive|popover|card)$/,
      variants: ['hover', 'focus', 'active'],
    },
  ],
}

