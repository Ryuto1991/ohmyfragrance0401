import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// お気に入り一覧の取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // 総件数を取得
    const total = await prisma.favorite.count({
      where: {
        userId: session.user.id,
      },
    });

    // ページネーションを適用してお気に入りを取得
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        fragrance: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      favorites,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("お気に入り取得エラー:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// お気に入りの追加
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    const { fragranceId } = await request.json();

    if (!fragranceId) {
      return NextResponse.json(
        { error: "香水IDは必須です" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        fragranceId,
      },
      include: {
        fragrance: true,
      },
    });

    return NextResponse.json({ favorite });
  } catch (error) {
    console.error("お気に入り追加エラー:", error);
    return NextResponse.json(
      { error: "お気に入りの追加中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// お気に入りの削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get("id");

    if (!favoriteId) {
      return NextResponse.json(
        { error: "お気に入りIDは必須です" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        id: favoriteId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("お気に入り削除エラー:", error);
    return NextResponse.json(
      { error: "お気に入りの削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 