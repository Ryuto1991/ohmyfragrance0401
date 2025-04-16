"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { SheetClose } from "@/components/ui/sheet" // Import SheetClose for mobile

interface LogoutButtonProps {
  isMobile?: boolean // Prop to differentiate mobile usage
}

export default function LogoutButton({ isMobile = false }: LogoutButtonProps) {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Optionally redirect or show toast after sign out
    } catch (error) {
      console.error("ログアウトエラー:", error)
      // Optionally show error toast
    }
  }

  const buttonContent = (
    <Button
      variant="outline"
      className={`rounded-full border-secondary-foreground hover:bg-secondary-foreground hover:text-white font-montserrat ${isMobile ? 'w-full' : ''}`}
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      ログアウト
    </Button>
  )

  // If mobile, wrap with SheetClose
  if (isMobile) {
    return <SheetClose asChild>{buttonContent}</SheetClose>
  }

  // Otherwise, return the button directly
  return buttonContent
}
