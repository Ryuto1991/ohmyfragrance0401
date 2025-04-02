import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        email: session.user?.email,
        name: session.user?.name,
        image: session.user?.image,
      },
    });
  } catch (error) {
    console.error("認証チェックエラー:", error);
    return NextResponse.json(
      { error: "認証チェック中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 