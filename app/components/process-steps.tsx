"use client"

import { motion } from "framer-motion"
import { MessageSquareText, Package2, Truck } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    title: "AIと香りを決める",
    description: "AIがあなたとの会話を通じて香りの好みや気分を読み取り、あなただけの香りのレシピを一緒に作ります。",
    icon: MessageSquareText,
    color: "bg-[#FFF5F7]",
    iconColor: "text-primary",
    delay: 0.2,
    additionalContent: (
      <div className="mt-2 space-y-1">
        <Link href="/fragrance-lab" className="block text-xs text-primary hover:text-primary/80 transition-colors">
          ※AIと香りを作るFragrance Labはこちらから
        </Link>
        <Link href="/oh-my-custom" className="block text-xs text-primary hover:text-primary/80 transition-colors">
          ※人気の香りを選ぶOh my customはこちらから
        </Link>
      </div>
    ),
  },
  {
    title: "パッケージの選択",
    description: "お好みのボトルデザインとパッケージを選択いただけます。あなただけの特別な一本をつくりましょう。",
    icon: Package2,
    color: "bg-[#F7F9FF]",
    iconColor: "text-primary",
    delay: 0.4,
  },
  {
    title: "お手元にお届け",
    description: "丁寧に調合されたフレグランスを美しいパッケージに入れて、大切にお届けいたします。",
    icon: Truck,
    color: "bg-[#F5FFF7]",
    iconColor: "text-primary",
    delay: 0.6,
  },
]

export function ProcessSteps() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium mb-4">香水作りのプロセス</h2>
          <p className="text-gray-600">
            あなたの好みに合わせて、AIが最適な香りを提案します
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: step.delay }}
              className="relative"
            >
              <div className={`rounded-2xl ${step.color} p-8 h-full`}>
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="absolute -inset-3">
                      <div className="w-full h-full rotate-6 rounded-lg bg-primary/10"></div>
                    </div>
                    <div className="relative w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-primary text-sm font-medium">
                      ステップ {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
                {step.additionalContent}
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-[2px] bg-primary/20"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 