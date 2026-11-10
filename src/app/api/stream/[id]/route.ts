import { NextRequest, NextResponse } from 'next/server';
import { Ytdl } from '@distube/ytdl-core';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const ytdlClient = new Ytdl();

// List of public Invidious and Piped instances for datacenter IP fallback
const FALLBACK_ENDPOINTS = [
  'https://invidious.nerdvpn.de/api/v1/videos/',
  'https://inv.nadeko.net/api/v1/videos/',
  'https://invidious.private.coffee/api/v1/videos/',
  'https://pipedapi.kavin.rocks/streams/',
  'https://pipedapi.adminforge.de/streams/',
];

async function tryFallbackStream(id: string): Promise<string | null> {
  // 1. Try Cobalt API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${id}`,
        downloadMode: 'audio',
        audioFormat: 'best',
      }),
    });
    clearTimeout(timeout);
    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data.url) return data.url;
    }
  } catch (_) {}

  // 2. Try Invidious and Piped endpoints
  for (const endpoint of FALLBACK_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${endpoint}${id}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();

      // Piped format
      if (data.audioStreams && Array.isArray(data.audioStreams) && data.audioStreams.length > 0) {
        const audio = data.audioStreams.find((s: any) => s.mimeType?.includes('webm') || s.mimeType?.includes('mp4')) || data.audioStreams[0];
        if (audio?.url) return audio.url;
      }

      // Invidious format
      if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
        const audio = data.adaptiveFormats.find((f: any) => f.type?.startsWith('audio/'));
        if (audio?.url) return audio.url;
      }
    } catch (_) {
      // Continue to next endpoint
    }
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  // 1. Primary: Try direct distube stream download
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
  } catch (primaryErr: any) {
    console.warn(`[STREAM API] Primary YTDL stream failed for ${id} (${primaryErr.message}), trying cloud fallback...`);

    // 2. Secondary Fallback: Try Piped/Invidious proxy redirect
    try {
      const fallbackUrl = await tryFallbackStream(id);
      if (fallbackUrl) {
        return NextResponse.redirect(fallbackUrl, 307);
      }
    } catch (fallbackErr: any) {
      console.error(`[STREAM API] Fallback failed for ${id}:`, fallbackErr.message);
    }

    return NextResponse.json(
      { error: primaryErr.message || 'Streaming failed' },
      { status: 500 }
    );
  }
}
