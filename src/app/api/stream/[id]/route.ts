import { NextRequest, NextResponse } from 'next/server';
import { Ytdl } from '@distube/ytdl-core';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const ytdlClient = new Ytdl();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  try {
    const rangeHeader = request.headers.get('range');
    let rangeOption: { start?: number; end?: number } | undefined = undefined;

    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const parts = rangeHeader.replace('bytes=', '').split('-');
      const start = parts[0] ? parseInt(parts[0], 10) : undefined;
      const end = parts[1] ? parseInt(parts[1], 10) : undefined;
      if (start !== undefined || end !== undefined) {
        rangeOption = {};
        if (start !== undefined) rangeOption.start = start;
        if (end !== undefined) rangeOption.end = end;
      }
    }

    const stream = await ytdlClient.download(id, {
      filter: { hasAudio: true, hasVideo: false },
      ...(rangeOption && { range: rangeOption }),
      highWaterMark: 1 << 25,
    });

    const webStream = Readable.toWeb(stream);

    const headers = new Headers();
    headers.set('Content-Type', 'audio/webm');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=7200');

    return new Response(webStream as any, {
      status: rangeOption?.start ? 206 : 200,
      headers,
    });
  } catch (error: any) {
    console.error(`Stream error for id ${id}:`, error);
    return NextResponse.json({ error: error.message || 'Streaming failed' }, { status: 500 });
  }
}
