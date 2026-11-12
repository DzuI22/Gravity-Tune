import { NextRequest, NextResponse } from 'next/server';
import { LyricLine, LyricsData } from '@/types/music';

export const dynamic = 'force-dynamic';

function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{0,3})\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    timeRegex.lastIndex = 0;
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = timeRegex.exec(trimmed)) !== null) {
      matches.push(match);
    }
    if (matches.length === 0) continue;

    const text = trimmed.replace(timeRegex, '').trim();
    if (!text) continue;

    for (const m of matches) {
      const minutes = parseInt(m[1], 10);
      const seconds = parseInt(m[2], 10);
      const msStr = m[3] || '0';
      const milliseconds = parseFloat('0.' + msStr);
      const totalSeconds = minutes * 60 + seconds + milliseconds;

      result.push({
        time: totalSeconds,
        text,
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

// Comprehensive song title cleaner to handle YouTube metadata, video titles, and feat artists
function cleanSongTitle(title: string, artist: string = ''): string {
  let cleaned = (title || '').trim();

  // 1. Remove bracketed / parenthesized noise like (Official Music Video), [Audio], [HD], etc.
  cleaned = cleaned.replace(/[\(\[\{][^\)\]\}]*(?:official|music\s*video|audio|lyric|lyrics|hd|4k|remastered|live|visualizer|mv|m\/v|video|lirik|cover|full\s*album|explicit|clean|ver\.|version)[^\)\]\}]*[\)\]\}]/gi, '');

  // 2. Remove trailing suffix after dash or pipe e.g. " - Official Video", "| Lyrics", " - Lyric Video"
  cleaned = cleaned.replace(/\s*[-–—|]\s*(?:official\s*video|music\s*video|official\s*audio|official|lyric\s*video|lyrics|audio|mv|visualizer).*$/gi, '');

  // 3. Remove "Artist - Song" or "Song - Artist" if separator present
  if (cleaned.includes(' - ') || cleaned.includes(' – ') || cleaned.includes(' — ')) {
    const parts = cleaned.split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      const artLow = artist.toLowerCase().trim();
      if (artLow && parts[0].toLowerCase().includes(artLow)) {
        cleaned = parts.slice(1).join(' ');
      } else if (artLow && parts[parts.length - 1].toLowerCase().includes(artLow)) {
        cleaned = parts.slice(0, -1).join(' ');
      }
    }
  }

  // 4. Remove feat. / ft.
  cleaned = cleaned.replace(/\s*[\(\[]?\s*(?:feat|ft)\.?\s+[^)\]]+[\)\]]?/gi, '');

  // 5. Trim trailing dots, hyphens, and whitespace
  cleaned = cleaned.replace(/^[.\s\-–—:]+|[.\s\-–—:]+$/g, '').trim();

  return cleaned || title;
}

const LRCLIB_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 GravityTune/7.5.3',
  'Accept': 'application/json',
};

async function queryLrclib(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: LRCLIB_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || '';
  const rawArtist = searchParams.get('artist') || '';
  const duration = searchParams.get('duration') ? parseInt(searchParams.get('duration')!, 10) : undefined;

  if (!rawTitle) {
    return NextResponse.json({ synced: false, lines: [] });
  }

  const cleanedTitle = cleanSongTitle(rawTitle, rawArtist);
  const cleanArtist = rawArtist.replace(/\s*[-–—,].*$/g, '').trim(); // e.g., "Lady Gaga & Bruno Mars" -> "Lady Gaga"

  try {
    let lyricItem: any = null;

    // STEP 1: Search LRCLIB via search API with track_name and artist_name (NO strict duration constraint)
    const p1 = new URLSearchParams({
      track_name: cleanedTitle,
    });
    if (rawArtist) p1.append('artist_name', rawArtist);
    
    let searchRes = await queryLrclib(`https://lrclib.net/api/search?${p1.toString()}`);
    if (Array.isArray(searchRes) && searchRes.length > 0) {
      lyricItem = searchRes.find((item: any) => item.syncedLyrics) || searchRes.find((item: any) => item.plainLyrics) || searchRes[0];
    }

    // STEP 2: Fallback query search (q = `${cleanedTitle} ${artist}`)
    if (!lyricItem || (!lyricItem.syncedLyrics && !lyricItem.plainLyrics)) {
      const q = `${cleanedTitle} ${cleanArtist || rawArtist}`.trim();
      const qRes = await queryLrclib(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
      if (Array.isArray(qRes) && qRes.length > 0) {
        lyricItem = qRes.find((item: any) => item.syncedLyrics) || qRes.find((item: any) => item.plainLyrics) || qRes[0];
      }
    }

    // STEP 3: Fallback search with title only
    if (!lyricItem || (!lyricItem.syncedLyrics && !lyricItem.plainLyrics)) {
      const titleOnlyRes = await queryLrclib(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanedTitle)}`);
      if (Array.isArray(titleOnlyRes) && titleOnlyRes.length > 0) {
        lyricItem = titleOnlyRes.find((item: any) => item.syncedLyrics) || titleOnlyRes.find((item: any) => item.plainLyrics) || titleOnlyRes[0];
      }
    }

    // STEP 4: Fallback to exact get endpoint (WITHOUT duration parameter so it doesn't 404 on 1s mismatch)
    if (!lyricItem || (!lyricItem.syncedLyrics && !lyricItem.plainLyrics)) {
      const exactParams = new URLSearchParams({
        track_name: cleanedTitle,
        artist_name: rawArtist || cleanArtist,
      });
      const exactRes = await queryLrclib(`https://lrclib.net/api/get?${exactParams.toString()}`);
      if (exactRes && (exactRes.syncedLyrics || exactRes.plainLyrics)) {
        lyricItem = exactRes;
      }
    }

    // PARSE & RETURN RESULTS
    if (lyricItem && lyricItem.syncedLyrics) {
      const parsedLines = parseLrc(lyricItem.syncedLyrics);
      if (parsedLines.length > 0) {
        return NextResponse.json<LyricsData>({
          synced: true,
          lines: parsedLines,
          plain: lyricItem.plainLyrics || undefined,
        });
      }
    }

    if (lyricItem && lyricItem.plainLyrics) {
      const rawLines = lyricItem.plainLyrics.split('\n');
      const plainLines: LyricLine[] = rawLines
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((text: string, idx: number) => ({ time: idx * 5, text }));

      if (plainLines.length > 0) {
        return NextResponse.json<LyricsData>({
          synced: false,
          lines: plainLines,
          plain: lyricItem.plainLyrics,
        });
      }
    }

    return NextResponse.json<LyricsData>({ synced: false, lines: [] });
  } catch (error: any) {
    console.error('Lyrics API Route error:', error);
    return NextResponse.json<LyricsData>({ synced: false, lines: [] });
  }
}
