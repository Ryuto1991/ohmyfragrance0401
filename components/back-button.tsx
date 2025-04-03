'use client';

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton() {
  return (
    <Link href="/">
      <Button variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        戻る
      </Button>
    </Link>
  );
} 