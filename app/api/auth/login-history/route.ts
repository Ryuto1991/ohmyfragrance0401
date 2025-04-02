import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { ipAddress, userAgent, status, location, device } = await request.json();

    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId: session.user.id,
        ipAddress,
        userAgent,
        status,
        location,
        device,
      },
    });

    return NextResponse.json({ loginHistory });
  } catch (error) {
    console.error("ログイン履歴の記録エラー:", error);
    return NextResponse.json(
      { error: "ログイン履歴の記録に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const loginHistory = await prisma.loginHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.loginHistory.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      loginHistory,
      total,
      hasMore: total > offset + limit,
    });
  } catch (error) {
    console.error("ログイン履歴の取得エラー:", error);
    return NextResponse.json(
      { error: "ログイン履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
} 