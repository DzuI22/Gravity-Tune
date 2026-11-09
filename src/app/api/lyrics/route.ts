import { NextRequest, NextResponse } from 'next/server';
import { LyricLine, LyricsData } from '@/types/music';

export const dynamic = 'force-dynamic';

function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{0,3})\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Reset regex index
    timeRegex.lastIndex = 0;
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = timeRegex.exec(trimmed)) !== null) {
      matches.push(match);
    }
    if (matches.length === 0) continue;

    // Extract text after timestamp tags
    const text = trimmed.replace(timeRegex, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msStr = match[3] || '0';
      const milliseconds = parseFloat('0.' + msStr);
      const totalSeconds = minutes * 60 + seconds + milliseconds;

      result.push({
        time: totalSeconds,
        text,
      });
    }
  }

  // Sort by time
  return result.sort((a, b) => a.time - b.time);
}

// Clean title of typical suffixes like "(Official Music Video)", "[Audio]", "feat. X", etc.
function cleanTitle(title: string): string {
  return title
    .replace(/[\(\[\{](?:official|music|video|audio|lyric|hd|4k|remastered|live|visualizer|mv|m\/v)[\)\]\}]/gi, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';
  const duration = searchParams.get('duration') ? parseInt(searchParams.get('duration')!, 10) : undefined;

  if (!title) {
    return NextResponse.json({ synced: false, lines: [] });
  }

  const cleanedTitle = cleanTitle(title);
  const userAgent = 'GravityTune/1.0.0 (https://github.com/gravity-tune; contact@gravitytune.app)';

  try {
    // 1. Try exact match from LRCLIB
    const queryParams = new URLSearchParams({
      track_name: cleanedTitle,
      artist_name: artist,
    });
    if (duration) {
      queryParams.append('duration', duration.toString());
    }

    let response = await fetch(`https://lrclib.net/api/get?${queryParams.toString()}`, {
      headers: {
        'User-Agent': userAgent,
        'Lrclib-Client': 'GravityTune v1.0',
      },
    });

    let data = response.ok ? await response.json() : null;

    // 2. Fallback to search query if exact match not found
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanedTitle} ${artist}`)}`, {
        headers: {
          'User-Agent': userAgent,
          'Lrclib-Client': 'GravityTune v1.0',
        },
      });

      if (searchRes.ok) {
        const searchList = await searchRes.json();
        if (Array.isArray(searchList) && searchList.length > 0) {
          // Prefer one with syncedLyrics
          data = searchList.find((item: any) => item.syncedLyrics) || searchList[0];
        }
      }
    }

    if (data && data.syncedLyrics) {
      const parsedLines = parseLrc(data.syncedLyrics);
      return NextResponse.json<LyricsData>({
        synced: true,
        lines: parsedLines,
        plain: data.plainLyrics || undefined,
      });
    }

    if (data && data.plainLyrics) {
      const plainLines: LyricLine[] = data.plainLyrics
        .split('\n')
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((text: string, idx: number) => ({ time: idx * 5, text }));

      return NextResponse.json<LyricsData>({
        synced: false,
        lines: plainLines,
        plain: data.plainLyrics,
      });
    }

    return NextResponse.json<LyricsData>({ synced: false, lines: [] });
  } catch (error: any) {
    console.error('Lyrics error:', error);
    return NextResponse.json({ synced: false, lines: [] });
  }
}
