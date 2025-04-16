"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/" className="text-primary hover:underline">
        トップページに戻る
      </Link>
    </div>
  )
}
