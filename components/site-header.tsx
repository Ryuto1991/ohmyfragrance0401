"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Instagram, Twitter, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import StripeCartButton from "@/components/stripe-cart-button"

// goToHomePageメソッドを追加
export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // トップページに移動してスクロールトップする関数
  const goToHomePage = () => {
    router.push("/")
    // 少し遅延させてからスクロールトップを実行
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      })
    }, 100)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-secondary z-50">
      <div className="container mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Linkコンポーネントをdivに変更し、onClick属性を追加 */}
          <div
            onClick={goToHomePage}
            className="text-2xl font-medium text-secondary-foreground font-zen cursor-pointer select-none"
          >
            <div className="flex flex-col">
              <span className="text-2xl">Oh my</span>
              <span className="text-2xl -mt-1">fragrance</span>
            </div>
          </div>
        </motion.div>

        <motion.nav
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/Fragrance-Lab"
            className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
          >
            Fragrance Lab
          </Link>
          <Link
            href="/showcase"
            className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
          >
            Showcase
          </Link>
          <Link
            href="/oh-my-custom"
            className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
          >
            Oh my custom
          </Link>
          <Link
            href="/concept"
            className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
          >
            Concept
          </Link>
        </motion.nav>

        <motion.div
          className="hidden md:flex items-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StripeCartButton />
          {isMounted &&
            (user ? (
              <>
                <span className="text-sm text-secondary-foreground font-zen">{user.email?.split("@")[0]}さん</span>
                <Button
                  variant="outline"
                  className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                {/* ボタンの順序を入れ替え: 新規登録が左、ログインが右 */}
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat"
                  >
                    新規登録
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full font-montserrat">
                    ログイン
                  </Button>
                </Link>
              </>
            ))}
          <Link href="/instagram" className="text-secondary-foreground hover:opacity-70 transition-opacity">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="/twitter" className="text-secondary-foreground hover:opacity-70 transition-opacity">
            <Twitter className="h-5 w-5" />
          </Link>
        </motion.div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <StripeCartButton />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="text-secondary-foreground hover:opacity-70 transition-opacity"
                aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <div
                    onClick={() => {
                      goToHomePage()
                      setMobileMenuOpen(false)
                    }}
                    className="text-2xl font-medium text-secondary-foreground font-zen cursor-pointer select-none"
                  >
                    <div className="flex flex-col">
                      <span className="text-2xl">Oh my</span>
                      <span className="text-2xl -mt-1">fragrance</span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <SheetClose asChild>
                  <Link
                    href="/Fragrance-Lab"
                    className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
                  >
                    Fragrance Lab
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/showcase"
                    className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
                  >
                    Showcase
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/oh-my-custom"
                    className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
                  >
                    Oh my custom
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/concept"
                    className="text-sm text-secondary-foreground hover:opacity-70 transition-opacity font-montserrat"
                  >
                    Concept
                  </Link>
                </SheetClose>
              </nav>
              <div className="mt-auto pt-8 border-t space-y-4">
                {isMounted &&
                  (user ? (
                    <>
                      <span className="block text-sm text-secondary-foreground font-zen">{user.email?.split("@")[0]}さん</span>
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          className="w-full rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          ログアウト
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/signup">
                          <Button
                            variant="outline"
                            className="w-full rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat"
                          >
                            新規登録
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/login">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-montserrat">
                            ログイン
                          </Button>
                        </Link>
                      </SheetClose>
                    </>
                  ))}
                <div className="flex justify-center space-x-4 mt-4">
                  <Link href="/instagram" className="text-secondary-foreground hover:opacity-70 transition-opacity">
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link href="/twitter" className="text-secondary-foreground hover:opacity-70 transition-opacity">
                    <Twitter className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

