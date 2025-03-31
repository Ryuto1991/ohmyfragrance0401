"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function OhMyCustomPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white">
          <div className="container relative mx-auto px-4 py-16 md:px-8 md:py-24">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl"
                >
                  あなただけの
                  <br />
                  オリジナル香水
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8 text-lg text-gray-600"
                >
                  香り、ボトル、ラベルを選んで
                  <br />
                  世界にひとつだけの香水を作りましょう
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link href="/oh-my-custom-order">
                    <Button size="lg" className="group">
                      カスタマイズを始める
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-square"
                >
                  <Image
                    src="/images/oh-my-custom-bottles.png"
                    alt="カスタム香水のボトル"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              カスタマイズの特徴
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-pink-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  香りの選択
                </h3>
                <p className="text-gray-600">
                  5種類の香りからお好みの香りを選べます。
                  フローラル系、シトラス系、スイート系など、
                  様々な香りをご用意しています。
                </p>
              </div>
              <div className="rounded-lg bg-pink-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  ボトルの選択
                </h3>
                <p className="text-gray-600">
                  3種類のボトルからお好みのボトルを選べます。
                  それぞれのボトルには特徴的なデザインがあり、
                  お好みのスタイルに合わせて選べます。
                </p>
              </div>
              <div className="rounded-lg bg-pink-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  ラベルのカスタマイズ
                </h3>
                <p className="text-gray-600">
                  オリジナルのラベルをデザインできます。
                  画像のアップロードやテキストの追加など、
                  様々なカスタマイズオプションをご用意しています。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ギフトオプションセクション */}
        <section className="bg-pink-50 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              ギフトオプション
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  ギフトボックス
                </h3>
                <p className="mb-4 text-gray-600">
                  プレゼントに最適なギフトボックスをご用意しています。
                  リボンの色も選べます。
                </p>
                <p className="text-sm text-gray-500">+500円（税込）</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  メッセージカード
                </h3>
                <p className="mb-4 text-gray-600">
                  お気持ちを伝えるメッセージカードを添えることができます。
                  オリジナルのメッセージを印刷します。
                </p>
                <p className="text-sm text-gray-500">+200円（税込）</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 