import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration } from '@/lib/utils';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { artistId: string } }) {
  const { artistId } = params;
  if (!artistId) return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });

  try {
    const yt = await getYtClient();
    const songs: Song[] = [];
    let artistName = '';
    let artistThumbnail = '';

    // 1. Try to fetch artist via official YouTube Music Artist Page
    try {
      const artistInfo: any = await yt.music.getArtist(artistId);
      artistName = artistInfo.header?.title?.text || artistInfo.name || '';

      // Extract high resolution artist banner/thumbnail
      if (artistInfo.header?.thumbnails && artistInfo.header.thumbnails.length > 0) {
        artistThumbnail = artistInfo.header.thumbnails[artistInfo.header.thumbnails.length - 1].url;
      } else if (artistInfo.header?.thumbnail?.contents && artistInfo.header.thumbnail.contents.length > 0) {
        artistThumbnail = artistInfo.header.thumbnail.contents[artistInfo.header.thumbnail.contents.length - 1].url;
      }

      // Priority A: artist.getAllSongs() - gives full 50-100+ discography strictly by this artist
      if (typeof artistInfo.getAllSongs === 'function') {
        const allSongs = await artistInfo.getAllSongs().catch(() => null);
        if (allSongs && allSongs.contents && allSongs.contents.length > 0) {
          for (const item of allSongs.contents) {
            const id = item.id || item.video_id;
            if (!id) continue;
            const title = item.title?.text || item.title || 'Unknown Title';
            const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || artistName;
            const album = item.album?.name || '';
            const durationSec = item.duration?.seconds || 0;
            const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url
              || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
              || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

            songs.push({
              id,
              title,
              artist,
              album,
              duration: durationSec,
              durationFormatted: formatDuration(durationSec),
              thumbnail,
            });
          }
        }
      }

      // Priority B: artist.sections 'Top songs' or 'MusicShelf'
      if (songs.length === 0 && artistInfo.sections) {
        const songsShelf = artistInfo.sections.find(
          (s: any) => (s.title?.text || '').toLowerCase().includes('song') || s.type === 'MusicShelf'
        );
        if (songsShelf && songsShelf.contents) {
          for (const item of songsShelf.contents) {
            const id = item.id || item.video_id;
            if (!id) continue;
            const title = item.title?.text || item.title || 'Unknown Title';
            const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || artistName;
            const album = item.album?.name || '';
            const durationSec = item.duration?.seconds || 0;
            const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url
              || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
              || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

            songs.push({
              id,
              title,
              artist,
              album,
              duration: durationSec,
              durationFormatted: formatDuration(durationSec),
              thumbnail,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn(`[ARTIST API] getArtist(${artistId}) failed:`, err.message);
    }

    // 2. Fallback: If artistId was an artist name or getArtist was empty, search strictly for songs by this artist
    const targetQuery = artistName || (decodeURIComponent(artistId).startsWith('UC') ? '' : decodeURIComponent(artistId));
    if (songs.length === 0 && targetQuery) {
      const res: any = await yt.music.search(targetQuery, { type: 'song' }).catch(() => null);
      const contents = res?.songs?.contents || res?.contents || [];
      const queryLower = targetQuery.toLowerCase();

      for (const item of contents) {
        const id = item.id || item.video_id;
        if (!id) continue;
        const title = item.title?.text || item.title || '';
        const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || '';
        
        // Strict filter: The song's artist MUST match the artist name
        if (!artist.toLowerCase().includes(queryLower) && !queryLower.includes(artist.toLowerCase())) {
          continue;
        }

        const album = item.album?.name || '';
        const durationSec = item.duration?.seconds || 0;
        const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

        if (!artistName) artistName = artist;
        if (!artistThumbnail && thumbnail) artistThumbnail = thumbnail;

        songs.push({
          id,
          title,
          artist,
          album,
          duration: durationSec,
          durationFormatted: formatDuration(durationSec),
          thumbnail,
        });
      }
    }

    return NextResponse.json({
      artistName: artistName || 'Artist',
      artistThumbnail,
      songs,
    });
  } catch (error: any) {
    console.error('Artist route fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
