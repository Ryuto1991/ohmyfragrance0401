"use client";

import type React from "react";
import { Move, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewControlsProps {
  isMoving: boolean;
  onToggleMove: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export default function PreviewControls({
  isMoving,
  onToggleMove,
  onRotateLeft,
  onRotateRight,
}: PreviewControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleMove}
        className={`flex items-center gap-2 flex-1 sm:flex-none justify-center ${
          isMoving ? "bg-gray-100" : ""
        }`}
      >
        <Move className="h-4 w-4" />
        <span className="hidden sm:inline">移動</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRotateLeft}
        className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">左回転</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRotateRight}
        className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
      >
        <RotateCw className="h-4 w-4" />
        <span className="hidden sm:inline">右回転</span>
      </Button>
    </div>
  );
}
