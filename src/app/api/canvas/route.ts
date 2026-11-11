import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Canvas API: retrieves vertical canvas looping video or animated backdrop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const title = searchParams.get('title') || '';
    const artist = searchParams.get('artist') || '';

    if (!id) {
      return NextResponse.json({ error: 'Missing song id' }, { status: 400 });
    }

    // High-aesthetic motion backdrops matching popular music moods
    const sampleCanvases: Record<string, string> = {
      default: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-42867-large.mp4',
      chill: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      neon: 'https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-at-a-calm-lake-time-lapse-42525-large.mp4',
    };

    return NextResponse.json({
      success: true,
      hasCanvas: true,
      canvasType: 'video',
      canvasUrl: sampleCanvases.default,
      artistAvatar: `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop`,
    });
  } catch (err: any) {
    return NextResponse.json({ hasCanvas: false, error: err.message }, { status: 500 });
  }
}
