import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { getHdThumbnail, formatDuration } from '@/lib/utils';
import { PodcastEpisode, PodcastShow } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'Podcast Indonesia terpopuler';

    const yt = await getYtClient();

    // Search for podcasts & episodes on YouTube
    const searchRes = await yt.music.search(query, { type: 'video' });
    const episodes: PodcastEpisode[] = [];
    const shows: PodcastShow[] = [];

    const contents = (searchRes as any)?.contents || (searchRes as any)?.videos?.contents || [];

    for (const item of contents) {
      try {
        const id = item.id || item.video_id;
        if (!id) continue;

        const title = item.title?.text || item.title || 'Untitled Episode';
        const author = item.author?.name || item.artists?.[0]?.name || 'Creator';
        const durationSec = item.duration?.seconds || 1800; // default 30 min if unknown
        const rawThumb = item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

        episodes.push({
          id,
          title,
          podcastTitle: author,
          author,
          description: `Episode podcast berdurasi ${formatDuration(durationSec)} • Oleh ${author}`,
          duration: durationSec,
          durationFormatted: formatDuration(durationSec),
          thumbnail: getHdThumbnail(rawThumb, id),
          publishedAt: 'Terbaru',
        });
      } catch (_) {}
    }

    // Curated Popular Shows
    shows.push(
      {
        id: 'pod-deddy',
        title: 'Close The Door',
        author: 'Deddy Corbuzier',
        description: 'Obrolan mendalam tentang isu hangat, tokoh nasional, dan hiburan.',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop',
        episodeCount: 120,
      },
      {
        id: 'pod-agaklaen',
        title: 'Agak Laen Official',
        author: 'Boris, Indra, Oki, Bene',
        description: 'Komedi segar penuh tawa cerita kehidupan sehari-hari.',
        thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop',
        episodeCount: 85,
      },
      {
        id: 'pod-makna',
        title: 'Makna Talks',
        author: 'Iyas Lawrence',
        description: 'Wawancara inspiratif bersama para kreator, seniman, dan inovator.',
        thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&auto=format&fit=crop',
        episodeCount: 95,
      }
    );

    return NextResponse.json({
      shows,
      episodes: episodes.slice(0, 15),
    });
  } catch (error) {
    console.error('API Podcasts Error:', error);
    return NextResponse.json({ shows: [], episodes: [] }, { status: 500 });
  }
}
