"use client"

import { useEffect, useRef } from "react"
import ImageEditor from "@toast-ui/react-image-editor"

interface ImageEditorProps {
  imageUrl: string
  onSave: (imageUrl: string) => void
  onClose: () => void
}

export default function ImageEditorComponent({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const editorRef = useRef<any>(null)

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getInstance().getCanvas()
      const imageUrl = canvas.toDataURL()
      onSave(imageUrl)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[90vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">画像編集</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              保存
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
        <div className="flex-1">
          <ImageEditor
            ref={editorRef}
            includeUI={{
              loadImage: {
                path: imageUrl,
                name: "SampleImage",
              },
              theme: "white",
              menu: ["crop", "flip", "rotate", "draw", "shape", "icon", "text", "mask", "filter"],
              initMenu: "filter",
              uiSize: {
                width: "100%",
                height: "100%",
              },
              menuBarPosition: "bottom",
              toolbarIcon: "dark",
              popupMenu: ["save", "load", "shape", "filter"],
            }}
          />
        </div>
      </div>
    </div>
  )
} 