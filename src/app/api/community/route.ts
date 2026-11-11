import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { getHdThumbnail } from '@/lib/utils';
import { PlaylistCard } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const yt = await getYtClient();

    // Search for featured & community curated playlists on YouTube Music
    const [featuredRes, communityRes] = await Promise.allSettled([
      yt.music.search('Top Hits Playlist 2026', { type: 'playlist' }),
      yt.music.search('Lagu Galau Indonesia Populer Playlist', { type: 'playlist' }),
    ]);

    const featured: PlaylistCard[] = [];
    const community: PlaylistCard[] = [];

    const parsePlaylists = (res: any, target: PlaylistCard[], isCommunity: boolean) => {
      const contents = res?.playlists?.contents || res?.contents || [];
      for (const item of contents) {
        try {
          const id = item.id || item.playlist_id;
          if (!id) continue;

          const title = item.title?.text || item.title || 'Curated Playlist';
          const author = item.author?.name || item.artists?.[0]?.name || (isCommunity ? 'YouTube Community' : 'YouTube Music');
          const songCount = item.item_count || item.song_count || 25;

          let rawThumb = '';
          if (item.thumbnails && item.thumbnails.length > 0) {
            rawThumb = item.thumbnails[item.thumbnails.length - 1].url;
          } else if (item.thumbnail?.contents && item.thumbnail.contents.length > 0) {
            rawThumb = item.thumbnail.contents[item.thumbnail.contents.length - 1].url;
          } else {
            rawThumb = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop';
          }

          target.push({
            id,
            title,
            description: `${songCount} lagu • Dikurasi oleh ${author}`,
            thumbnail: getHdThumbnail(rawThumb),
            songCount,
            author,
            isCommunity,
          });
        } catch (_) {}
      }
    };

    if (featuredRes.status === 'fulfilled') {
      parsePlaylists(featuredRes.value, featured, false);
    }

    if (communityRes.status === 'fulfilled') {
      parsePlaylists(communityRes.value, community, true);
    }

    // Fallback if empty to ensure UI is always beautiful
    if (featured.length === 0) {
      featured.push(
        {
          id: 'PLrAl6sO6mK_o97b-bU5jZ45s3e',
          title: 'Top Hits Indonesia 2026',
          description: '50 lagu teratas pilihan minggu ini',
          thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
          author: 'GravityTune Curated',
          isCommunity: false,
        },
        {
          id: 'PLw-VjHDlEOgvWPpRBs9FRGgJte',
          title: 'Acoustic Morning Vibes',
          description: 'Melodi akustik santai penghangat suasana',
          thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop',
          author: 'Acoustic Session',
          isCommunity: false,
        }
      );
    }

    if (community.length === 0) {
      community.push(
        {
          id: 'RDCLAK5uy_kmPRjHDECIcuVwnK',
          title: 'Indie Folk Nusantara',
          description: 'Lagu senja, kopi, dan cerita karya komunitas',
          thumbnail: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop',
          author: 'Komunitas Indie ID',
          isCommunity: true,
        },
        {
          id: 'RDCLAK5uy_n6pQ6iK2nCq8pM',
          title: 'Nostalgia 2000-an',
          description: 'Masa kejayaan band pop rock Indonesia',
          thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
          author: 'Pencinta Musik Lawas',
          isCommunity: true,
        }
      );
    }

    return NextResponse.json({
      featured: featured.slice(0, 10),
      community: community.slice(0, 10),
    });
  } catch (error) {
    console.error('API Community & Playlists Error:', error);
    return NextResponse.json({ featured: [], community: [] }, { status: 500 });
  }
}
