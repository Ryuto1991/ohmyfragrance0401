import { NextResponse } from 'next/server';
import { cleanupTempImages } from '@/app/oh-my-custom-order/actions';

export async function POST(request: Request) {
  try {
    // 認証チェック（シークレットキーによる）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting cleanup of temporary images...');
    const { success, error } = await cleanupTempImages();

    if (!success) {
      console.error('Cleanup failed:', error);
      return NextResponse.json(
        { error: error || 'Cleanup failed' },
        { status: 500 }
      );
    }

    console.log('Cleanup completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 