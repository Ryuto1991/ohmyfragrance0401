import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, email } = data;

    // 必須フィールドの検証
    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    // ユーザー情報の更新
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name, email },
    });

    return NextResponse.json({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json(
      { error: "プロフィールの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 