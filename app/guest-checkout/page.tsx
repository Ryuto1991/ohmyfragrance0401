"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { useStripeCart } from "@/contexts/stripe-cart-context"

export default function GuestCheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cart, clearCart } = useStripeCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    postalCode: "",
    address: "",
    phone: "",
    notes: "",
  })

  // Form validation state
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    postalCode: false,
    address: false,
    phone: false,
  })

  // Calculate cart total
  const calculateTotal = () => {
    if (!cart || !cart.length) return 0
    return cart.reduce((total, item) => {
      return total + Number.parseInt(item.price.replace(/,/g, ""), 10)
    }, 0)
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      postalCode: !formData.postalCode.trim() || !/^\d{3}-?\d{4}$/.test(formData.postalCode.replace(/-/g, "")),
      address: !formData.address.trim(),
      phone: !formData.phone.trim() || !/^0\d{1,4}-?\d{1,4}-?\d{4}$/.test(formData.phone.replace(/-/g, "")),
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "入力エラー",
        description: "必須項目をすべて正しく入力してください。",
        variant: "destructive",
      })
      return
    }

    if (!cart || cart.length === 0) {
      toast({
        title: "カートが空です",
        description: "商品をカートに追加してから購入手続きを行ってください。",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Here you would implement the actual checkout logic
      // For example, sending the order to your backend API
      // const response = await fetch('/api/guest-checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ formData, cart }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success
      toast({
        title: "注文を受け付けました",
        description: "ご入力いただいたメールアドレスに確認メールをお送りしました。",
      })

      // Clear cart and redirect to success page
      clearCart()
      router.push("/checkout-success")
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "もう一度お試しいただくか、カスタマーサポートにお問い合わせください。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format postal code with hyphen
  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/-/g, "")
    if (cleaned.length > 3) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`
    }
    return cleaned
  }

  // Handle postal code input
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value)
    setFormData((prev) => ({
      ...prev,
      postalCode: formatted,
    }))

    if (errors.postalCode) {
      setErrors((prev) => ({
        ...prev,
        postalCode: false,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <SiteHeader />

      <main className="pt-28 pb-20">
        {/* ヘッダーセクション */}
        <section className="bg-white py-6 mb-6">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-4">
              <Link href="/select-fragrance-order">
                <Button variant="outline" className="rounded-full border-gray-400 text-gray-700 hover:bg-gray-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  注文内容の確認に戻る
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-medium text-secondary-foreground font-zen mb-2">会員登録せずに購入する</h1>
              <p className="text-secondary-foreground/70 font-zen">以下の情報を入力して、香水を購入できます。</p>
            </div>
          </div>
        </section>

        {/* フォームセクション */}
        <section className="bg-white rounded-lg shadow-sm mb-6">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-blue-700 font-zen">
                    後で会員登録すると、注文履歴の確認や再注文が簡単に行えます。メールアドレスを使って会員登録すると、今回の注文も履歴に表示されます。
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* お客様情報 */}
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-secondary-foreground font-zen border-b pb-2">お客様情報</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-zen flex items-center">
                        お名前
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">必須</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="山田 フレグランス"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">お名前を入力してください</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-zen flex items-center">
                        メールアドレス
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">必須</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">有効なメールアドレスを入力してください</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* お届け先情報 */}
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-secondary-foreground font-zen border-b pb-2">お届け先情報</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="font-zen flex items-center">
                        郵便番号
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">必須</span>
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="123-4567"
                        value={formData.postalCode}
                        onChange={handlePostalCodeChange}
                        maxLength={8}
                        className={`w-full md:w-1/3 ${errors.postalCode ? "border-red-500" : ""}`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">正しい郵便番号を入力してください（例：123-4567）</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-zen flex items-center">
                        ご住所
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">必須</span>
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="東京都新宿区1-2-3"
                        value={formData.address}
                        onChange={handleChange}
                        className={errors.address ? "border-red-500" : ""}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">住所を入力してください</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-zen flex items-center">
                        電話番号
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">必須</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="080-1234-5678"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full md:w-1/2 ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          正しい電話番号を入力してください（例：080-1234-5678）
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* その他情報 */}
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-secondary-foreground font-zen border-b pb-2">その他</h2>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-zen flex items-center">
                      ご要望・備考
                      <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded">任意</span>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="配達希望日時などがあればご記入ください"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 注文ボタン */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-zen text-lg relative overflow-hidden group"
                  disabled={isSubmitting || !cart || cart.length === 0}
                >
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                  <CreditCard className="mr-2 h-5 w-5" />
                  <span className="relative">{isSubmitting ? "処理中..." : "注文を確定する"}</span>
                </Button>

                <p className="text-center text-sm text-secondary-foreground/70 font-zen">
                  ※注文確定後、決済画面に移動します
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

