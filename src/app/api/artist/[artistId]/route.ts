import { NextRequest, NextResponse } from 'next/server';
import { getYtClient } from '@/lib/youtube';
import { formatDuration, getHdThumbnail } from '@/lib/utils';
import { Song, Album } from '@/types/music';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { artistId: string } }) {
  const { artistId } = params;
  if (!artistId) return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });

  const rawId = decodeURIComponent(artistId).trim();

  try {
    const yt = await getYtClient();
    const songs: Song[] = [];
    const albums: Album[] = [];
    const singles: Album[] = [];
    let artistName = '';
    let artistThumbnail = '';
    let targetChannelId = rawId;

    // 1. If artistId is not a channel id (starts with UC), search for the artist channel first
    if (!targetChannelId.startsWith('UC')) {
      try {
        const searchArtist: any = await yt.music.search(rawId, { type: 'artist' });
        const firstMatch = searchArtist?.contents?.[0]?.contents?.[0];
        if (firstMatch) {
          const foundId = firstMatch.id || firstMatch.endpoint?.payload?.browseId;
          if (foundId) {
            targetChannelId = foundId;
          }
          if (firstMatch.title?.text) {
            artistName = firstMatch.title.text;
          }
          const thumbs = firstMatch.thumbnail?.contents || firstMatch.thumbnails || [];
          if (thumbs.length > 0) {
            artistThumbnail = thumbs[0].url;
          }
        }
      } catch (e: any) {
        console.warn(`[ARTIST API] Search artist channel failed:`, e.message);
      }
    }

    // 2. Fetch artist page via official getArtist
    if (targetChannelId.startsWith('UC')) {
      try {
        const artistInfo: any = await yt.music.getArtist(targetChannelId);
        if (!artistName) {
          artistName = artistInfo.header?.title?.text || artistInfo.name || '';
        }

        if (!artistThumbnail) {
          if (artistInfo.header?.thumbnails && artistInfo.header.thumbnails.length > 0) {
            artistThumbnail = artistInfo.header.thumbnails[artistInfo.header.thumbnails.length - 1].url;
          } else if (artistInfo.header?.thumbnail?.contents && artistInfo.header.thumbnail.contents.length > 0) {
            artistThumbnail = artistInfo.header.thumbnail.contents[artistInfo.header.thumbnail.contents.length - 1].url;
          }
        }

        // Priority A: artist.getAllSongs() for the most complete discography
        if (typeof artistInfo.getAllSongs === 'function') {
          try {
            const allSongs = await artistInfo.getAllSongs();
            if (allSongs && allSongs.contents && allSongs.contents.length > 0) {
              for (const item of allSongs.contents) {
                const id = item.id || item.video_id;
                if (!id) continue;
                const title = item.title?.text || item.title || 'Unknown Title';
                const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || artistName;
                const album = item.album?.name || '';
                const durationSec = item.duration?.seconds || 0;
                const rawThumb = item.thumbnails?.[item.thumbnails.length - 1]?.url
                  || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
                  || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                const thumbnail = getHdThumbnail(rawThumb, id);

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
          } catch (e: any) {
            console.warn(`[ARTIST API] getAllSongs failed:`, e.message);
          }
        }

        // Priority B: Top songs shelf if getAllSongs was empty
        if (songs.length === 0 && artistInfo.sections) {
          const songsShelf = artistInfo.sections.find(
            (s: any) => (s.header?.title?.text || s.title?.text || '').toLowerCase().includes('song') || s.type === 'MusicShelf'
          );
          if (songsShelf && songsShelf.contents) {
            for (const item of songsShelf.contents) {
              const id = item.id || item.video_id;
              if (!id) continue;
              const title = item.title?.text || item.title || 'Unknown Title';
              const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || artistName;
              const album = item.album?.name || '';
              const durationSec = item.duration?.seconds || 0;
              const rawThumb = item.thumbnails?.[item.thumbnails.length - 1]?.url
                || item.thumbnail?.contents?.[item.thumbnail.contents.length - 1]?.url
                || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              const thumbnail = getHdThumbnail(rawThumb, id);

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

        // Extract Albums and Singles & EPs from sections
        if (artistInfo.sections) {
          for (const s of artistInfo.sections) {
            const sectionTitle = (s.header?.title?.text || s.title?.text || '').toLowerCase();
            const isAlbums = sectionTitle.includes('album');
            const isSingles = sectionTitle.includes('single') || sectionTitle.includes('ep');

            if ((isAlbums || isSingles) && s.contents) {
              for (const item of s.contents) {
                const id = item.id || item.endpoint?.payload?.browseId;
                if (!id) continue;
                const albumTitle = item.title?.text || item.title || 'Untitled';
                const year = item.year?.text || item.subtitle?.text || '';
                const rawThumb = item.thumbnail?.[0]?.url 
                  || item.thumbnail?.contents?.[0]?.url 
                  || item.thumbnails?.[0]?.url 
                  || '';
                const albumObj: Album = {
                  id,
                  title: albumTitle,
                  year,
                  type: isAlbums ? 'Album' : 'Single/EP',
                  thumbnail: getHdThumbnail(rawThumb),
                };

                if (isAlbums) {
                  albums.push(albumObj);
                } else {
                  singles.push(albumObj);
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn(`[ARTIST API] getArtist(${targetChannelId}) failed:`, err.message);
      }
    }

    // 3. Fallback search if songs still empty
    const fallbackQuery = artistName || rawId;
    if (songs.length === 0 && fallbackQuery) {
      try {
        const res: any = await yt.music.search(fallbackQuery, { type: 'song' });
        const contents = res?.songs?.contents || res?.contents || [];

        for (const item of contents) {
          const id = item.id || item.video_id;
          if (!id) continue;
          const title = item.title?.text || item.title || '';
          const artist = item.artists?.map((a: any) => a.name).join(', ') || item.author?.name || '';
          const album = item.album?.name || '';
          const durationSec = item.duration?.seconds || 0;
          const rawThumb = item.thumbnails?.[item.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          const thumbnail = getHdThumbnail(rawThumb, id);

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
      } catch (e: any) {
        console.warn(`[ARTIST API] search fallback failed:`, e.message);
      }
    }

    return NextResponse.json({
      artistName: artistName || rawId,
      artistThumbnail: getHdThumbnail(artistThumbnail),
      songs,
      albums,
      singles,
    });
  } catch (error: any) {
    console.error('Artist route fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
