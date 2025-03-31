import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // MastraのAPIエンドポイント
    const MASTRA_API_URL = process.env.MASTRA_API_URL
    const MASTRA_API_KEY = process.env.MASTRA_API_KEY

    if (!MASTRA_API_URL || !MASTRA_API_KEY) {
      throw new Error("Mastra API credentials are not configured")
    }

    // MastraのAPIにリクエストを送信
    const response = await fetch(MASTRA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MASTRA_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send request to Mastra API")
    }

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in fragrance-lab API route:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 