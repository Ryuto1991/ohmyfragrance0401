"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteFooter from "@/components/site-footer"
import SiteHeader from "@/components/site-header"
import { FragranceAIChat } from "@/components/chat/fragrance-ai-chat"

export default function FragranceLabPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setInitialQuery(query)
    }
    setIsFirstRender(false)
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
    // ページ遷移時の処理
    const handleRouteChange = () => {
      setIsLoading(true)
    }

    router.events?.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      <div className="min-h-screen bg-secondary flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  戻る
                </Button>
              </Link>
            </div>
            <div className="bg-background rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold mb-6">Fragrance Lab</h1>
              <FragranceAIChat initialQuery={initialQuery} />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  )
} 