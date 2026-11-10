import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration, getHdThumbnail } from '@/lib/utils';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const yt = await getYtClient();
    const songs: Song[] = [];
    const indonesianSongs: Song[] = [];
    const globalSongs: Song[] = [];

    // 1. Fetch Indonesian Hits & Trending Populer
    const [indoSearch, globalSearch] = await Promise.allSettled([
      yt.music.search('Hits Indonesia Terpopuler 2026', { type: 'song' }),
      yt.music.search('Top Global Hits 2026', { type: 'song' }),
    ]);

    const parseResults = (searchResult: any, targetList: Song[]) => {
      const contents = searchResult?.songs?.contents || searchResult?.contents || [];
      for (const item of contents) {
        try {
          const id = item.id || item.video_id;
          if (!id) continue;

          const title = item.title?.text || item.title || 'Unknown Title';
          const artist = item.artists?.[0]?.name || item.author?.name || item.artist?.name || 'Unknown Artist';
          const album = item.album?.name || '';
          const durationSec = item.duration?.seconds || 0;

          let rawThumb = '';
          if (item.thumbnails && item.thumbnails.length > 0) {
            rawThumb = item.thumbnails[item.thumbnails.length - 1].url;
          } else if (item.thumbnail?.contents && item.thumbnail.contents.length > 0) {
            rawThumb = item.thumbnail.contents[item.thumbnail.contents.length - 1].url;
          } else {
            rawThumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          }

          // Convert to HD 800x800 crystal clear
          const thumbnail = getHdThumbnail(rawThumb, id);

          targetList.push({
            id,
            title,
            artist,
            album,
            duration: durationSec,
            durationFormatted: formatDuration(durationSec),
            thumbnail,
          });
        } catch (_) {}
      }
    };

    if (indoSearch.status === 'fulfilled' && indoSearch.value) {
      parseResults(indoSearch.value, indonesianSongs);
    }
    if (globalSearch.status === 'fulfilled' && globalSearch.value) {
      parseResults(globalSearch.value, globalSongs);
    }

    // Combine them for varied trending and quickpicks
    const allCombined = [...indonesianSongs, ...globalSongs];

    return NextResponse.json({
      trending: allCombined.length > 0 ? allCombined : [
        {
          id: 'hero_1',
          title: 'Tipu Daya',
          artist: 'The Panturas',
          album: 'Ombak Banyu Asmara',
          duration: 215,
          thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=800&fit=crop',
        }
      ],
      quickPicks: allCombined.slice(0, 16),
      indonesianHits: indonesianSongs.slice(0, 16),
      globalHits: globalSongs.slice(0, 16),
    });
  } catch (error: any) {
    console.error('Charts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch charts' }, { status: 500 });
  }
}
