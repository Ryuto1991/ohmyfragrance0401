"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

// クライアントサイドでのみ動作するボタンコンポーネント
// サーバーコンポーネントからのonClickなどのイベントハンドラー渡しエラーを回避するために使用
const ClientButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <Button ref={ref} {...props} />
})

ClientButton.displayName = "ClientButton"

export default ClientButton
