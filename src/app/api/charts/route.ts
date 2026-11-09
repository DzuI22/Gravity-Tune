import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration } from '@/lib/utils';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const yt = await getYtClient();
    
    // We can fetch explore or search top hits
    const explore = await yt.music.getExplore().catch(() => null);
    const songs: Song[] = [];

    // Fallback search if explore structure is empty or changes
    const searchRes = await yt.music.search('Top Hits 2026', { type: 'song' });
    const contents = (searchRes as any).songs?.contents || (searchRes as any).contents || [];

    for (const item of contents) {
      try {
        const id = item.id || item.video_id;
        if (!id) continue;

        const title = item.title?.text || item.title || 'Unknown Title';
        const artist = item.artists?.[0]?.name || item.author?.name || item.artist?.name || 'Unknown Artist';
        const album = item.album?.name || '';
        const durationSec = item.duration?.seconds || 0;
        
        let thumbnail = '';
        if (item.thumbnails && item.thumbnails.length > 0) {
          thumbnail = item.thumbnails[item.thumbnails.length - 1].url;
        } else if (item.thumbnail?.contents && item.thumbnail.contents.length > 0) {
          thumbnail = item.thumbnail.contents[item.thumbnail.contents.length - 1].url;
        } else {
          thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }

        songs.push({
          id,
          title,
          artist,
          album,
          duration: durationSec,
          durationFormatted: formatDuration(durationSec),
          thumbnail,
        });
      } catch (err) {
        // Skip malformed
      }
    }

    return NextResponse.json({
      trending: songs.slice(0, 15),
      quickPicks: songs.slice(5, 15),
    });
  } catch (error: any) {
    console.error('Charts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch charts' }, { status: 500 });
  }
}
