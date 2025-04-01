"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteFooter from "@/components/site-footer"
import SiteHeader from "@/components/site-header"
import { FragranceAIChat } from "@/components/chat/fragrance-ai-chat"

export default function FragranceLabPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined)
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    const query = searchParams.get("query")
    if (query) {
      setInitialQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      })

      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [pathname, isFirstRender])

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />

      <main className="pt-28 pb-20 flex-grow flex flex-col">
        <div className="container mx-auto px-4 md:px-8 py-6 flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-medium text-secondary-foreground font-zen">
              あなただけの香りをつくる
            </h1>
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-zen"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
            </Link>
          </div>

          <div className="flex-grow bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="mt-8 w-full max-w-4xl mx-auto">
              <FragranceAIChat initialQuery={initialQuery} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
} 