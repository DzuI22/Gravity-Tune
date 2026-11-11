import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration, getHdThumbnail } from '@/lib/utils';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { albumId: string } }) {
  const { albumId } = params;
  if (!albumId) return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });

  try {
    const yt = await getYtClient();
    const albumData: any = await yt.music.getAlbum(albumId);

    const title = albumData.header?.title?.text || albumData.title || 'Album';
    const artist = albumData.header?.strapline_text_one?.text || albumData.artist || '';
    const year = albumData.header?.subtitle?.text || '';

    // Album thumbnail
    let rawThumb = '';
    const thumbContents = albumData.header?.thumbnail?.contents || albumData.header?.thumbnails || [];
    if (thumbContents.length > 0) {
      rawThumb = thumbContents[0].url || '';
    }
    const thumbnail = getHdThumbnail(rawThumb);

    const songs: Song[] = [];
    for (const track of albumData.contents || []) {
      const id = track.id || track.video_id;
      if (!id) continue;
      const trackTitle = track.title?.text || track.title || 'Unknown Track';
      const durationSec = track.duration?.seconds || (typeof track.duration === 'number' ? track.duration : 0);
      const trackArtist = track.artists?.map((a: any) => a.name).join(', ') || artist;

      songs.push({
        id,
        title: trackTitle,
        artist: trackArtist,
        album: title,
        duration: durationSec,
        durationFormatted: formatDuration(durationSec),
        thumbnail,
      });
    }

    return NextResponse.json({
      title,
      artist,
      year,
      thumbnail,
      songs,
    });
  } catch (error: any) {
    console.error(`[ALBUM API] getAlbum(${albumId}) error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
