import { useEffect, useRef } from 'react'

export default function DefaultLabel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // キャンバスサイズを設定
        canvas.width = 400
        canvas.height = 300

        // 背景を白に
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // テキストを描画
        ctx.fillStyle = '#666666'
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('ラベルを選択してください', canvas.width / 2, canvas.height / 2)

        // 画像として保存
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = 'default.png'
        link.href = dataUrl
        link.click()
      }
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'none' }} />
} 