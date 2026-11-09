import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration } from '@/lib/utils';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') || 'all'; // 'song' | 'artist' | 'all'

  if (!q || !q.trim()) {
    return NextResponse.json({ songs: [], artists: [] });
  }

  try {
    const yt = await getYtClient();
    const songs: Song[] = [];
    const artists: { id: string; name: string; thumbnail: string; subscribers?: string }[] = [];

    // --- Search for SONGS ---
    if (type === 'song' || type === 'all') {
      const songSearch = await yt.music.search(q, { type: 'song' }).catch(() => null);
      const songContents = (songSearch as any)?.songs?.contents || (songSearch as any)?.contents || [];

      for (const item of songContents) {
        try {
          const id = item.id || item.video_id;
          if (!id) continue;
          const title = item.title?.text || item.title || 'Unknown Title';
          const artist = item.artists?.[0]?.name || item.author?.name || item.artist?.name || 'Unknown Artist';
          const album = item.album?.name || '';
          const durationSec = item.duration?.seconds || 0;
          let thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url
            || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
            || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          songs.push({ id, title, artist, album, duration: durationSec, durationFormatted: formatDuration(durationSec), thumbnail });
        } catch (_) {}
      }
    }

    // --- Search for ARTISTS ---
    if (type === 'artist' || type === 'all') {
      const artistSearch = await yt.music.search(q, { type: 'artist' }).catch(() => null);
      const artistContents = (artistSearch as any)?.artists?.contents || (artistSearch as any)?.contents || [];

      for (const item of artistContents) {
        try {
          const id = item.id || item.channel_id;
          if (!id) continue;
          const name = item.name?.text || item.name || item.title?.text || 'Unknown Artist';
          const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url
            || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
            || '';
          artists.push({ id, name, thumbnail });
        } catch (_) {}
      }

      // If no artists found via artist search, try to deduce artists from songs
      if (artists.length === 0 && songs.length > 0) {
        const seen = new Set<string>();
        for (const song of songs) {
          if (song.artist && !seen.has(song.artist)) {
            seen.add(song.artist);
            artists.push({ id: song.artist, name: song.artist, thumbnail: song.thumbnail });
          }
        }
      }
    }

    // If no song results yet and type is all, search by artist name to find their songs
    if (type === 'artist' && songs.length === 0) {
      const songsByArtist = await yt.music.search(q, { type: 'song' }).catch(() => null);
      const contents = (songsByArtist as any)?.songs?.contents || (songsByArtist as any)?.contents || [];
      for (const item of contents) {
        try {
          const id = item.id || item.video_id;
          if (!id) continue;
          const title = item.title?.text || item.title || '';
          const artist = item.artists?.[0]?.name || item.author?.name || '';
          const durationSec = item.duration?.seconds || 0;
          const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          songs.push({ id, title, artist, album: '', duration: durationSec, durationFormatted: formatDuration(durationSec), thumbnail });
        } catch (_) {}
      }
    }

    return NextResponse.json({ songs: songs.slice(0, 20), artists: artists.slice(0, 10) });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
