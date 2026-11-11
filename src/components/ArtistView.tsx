'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  User, 
  Loader2, 
  ChevronLeft, 
  Shuffle, 
  Check, 
  Radio, 
  ChevronRight, 
  MoreVertical,
  Disc3,
  Music2,
  X
} from 'lucide-react';
import { Song, Album } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';

interface ArtistViewProps {
  artistId: string;
  artistName: string;
  artistThumbnail?: string;
  onBack: () => void;
}

const ARTIST_BIOS: Record<string, string> = {
  'yuika': 'Yuika is a Japanese singer-songwriter. Originally from Nara Prefecture, she began uploading cover songs of various artists like Mrs. Green Apple on TikTok. She became known for her unique vocal style and emotional performances.',
  'aimyon': 'Aimyon (あいみょん) is a Japanese singer-songwriter from Nishinomiya, Hyogo. Known for her acoustic folk-pop sound, heartfelt lyrics, and unique guitar playing style that has garnered millions of fans across Japan and Asia.',
  'back number': 'back number is a Japanese rock band from Gunma Prefecture, formed in 2004. The trio is known for their emotional J-pop rock sound and deeply personal lyrics about love and relationships.',
  'eill': 'eill is a Japanese singer-songwriter and rapper known for blending R&B, hip-hop, and pop. She debuted in 2019 and has gained recognition for her smooth vocal style and emotionally resonant music.',
  'the panturas': 'The Panturas adalah band surf rock asal Jatinangor, Indonesia, yang menggabungkan musik surf dengan elemen jazz, disko, dan budaya pop Indonesia. Dikenal dengan visual retro dan lagu-lagu energetik.',
  'tulus': 'Tulus adalah penyanyi dan penulis lagu Indonesia asal Bukittinggi, Sumatera Barat. Dikenal dengan suaranya yang khas dan lagu-lagu bernuansa soul dan pop yang menyentuh hati.',
  'hindia': 'Hindia (Baskara Putra) adalah musisi, penyanyi, dan pencipta lagu asal Jakarta, Indonesia. Dikenal lewat lirik-lirik reflektif dan album seperti Menari Dengan Bayangan dan Lagipula Hidup Akan Berakhir.',
  'bernadya': 'Bernadya Ribka Jayakusuma adalah penyanyi-penulis lagu muda asal Surabaya, Indonesia. Populer lewat lagu-lagu emosional dan album Sialnya, Hidup Harus Tetap Berjalan.'
};

const DEFAULT_BIO = 'A talented artist creating amazing music for fans around the world. Known for unique sound and passionate performances that connect deeply with listeners.';

export default function ArtistView({ artistId, artistName, artistThumbnail, onBack }: ArtistViewProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState(artistName);
  const [resolvedThumb, setResolvedThumb] = useState(artistThumbnail);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);

  // Selected Album Modal/View state
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const [loadingAlbum, setLoadingAlbum] = useState(false);

  const { playSong, currentSong } = usePlayer();

  const bio = ARTIST_BIOS[artistName.toLowerCase()] || ARTIST_BIOS[resolvedName.toLowerCase()] || DEFAULT_BIO;

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/artist/${encodeURIComponent(artistId)}`);
        if (res.ok) {
          const data = await res.json();
          setSongs(data.songs || []);
          setAlbums(data.albums || []);
          setSingles(data.singles || []);
          if (data.artistName) setResolvedName(data.artistName);
          if (data.artistThumbnail) setResolvedThumb(data.artistThumbnail);
        }
      } catch (e) {
        console.error('Failed to fetch artist', e);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [artistId]);

  // Open an album to view and play all tracks inside it
  const handleOpenAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    setLoadingAlbum(true);
    setAlbumSongs([]);
    try {
      const res = await fetch(`/api/album/${encodeURIComponent(album.id)}`);
      if (res.ok) {
        const data = await res.json();
        setAlbumSongs(data.songs || []);
      }
    } catch (e) {
      console.error('Failed to fetch album tracks', e);
    } finally {
      setLoadingAlbum(false);
    }
  };

  const displayedSongs = showAllSongs ? songs : songs.slice(0, 8);
  const latestRelease = songs[0] || null;

  return (
    <div className="space-y-0 pb-12 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#9e9a8f] hover:text-[#ede9dc] transition-colors mb-4 px-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Artist Hero Photo */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-5 aspect-[16/11] sm:aspect-[21/9] max-h-[380px]">
        {resolvedThumb ? (
          <img
            src={resolvedThumb}
            alt={resolvedName}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2c2522] to-[#1a1715] flex items-center justify-center">
            <User className="w-28 h-28 text-white/10" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-[#0e0d0c]/40 to-transparent" />

        {/* Artist name overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {resolvedName}
          </h1>
        </div>
      </div>

      {/* Stats row */}
      <p className="text-xs text-[#9e9a8f] font-semibold px-1 mb-4">
        {songs.length > 0 ? `${songs.length} Songs Available` : 'Streaming catalog'} • {albums.length} Albums • {singles.length} Singles & EPs
      </p>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2.5 mb-6 px-1">
        {/* Shuffle All */}
        <button
          onClick={() => songs.length > 0 && playSong(songs[Math.floor(Math.random() * songs.length)], songs)}
          className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-white/8 flex items-center justify-center text-[#ede9dc]/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Shuffle artist songs"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Play All — big pill */}
        <button
          onClick={() => songs.length > 0 && playSong(songs[0], songs)}
          className="flex-1 h-12 rounded-full bg-[#1b1917] border border-white/10 flex items-center justify-center gap-2 text-sm font-extrabold text-[#ede9dc] hover:bg-[#252220] transition-all active:scale-95 shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play All ({songs.length})</span>
        </button>

        {/* Follow / Check */}
        <button className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-white/8 flex items-center justify-center text-[#ede9dc]/70 hover:text-white hover:bg-white/10 transition-all active:scale-95">
          <Check className="w-5 h-5" />
        </button>

        {/* Radio */}
        <button 
          onClick={() => songs.length > 0 && playSong(songs[0], songs)}
          className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-white/8 flex items-center justify-center text-[#ede9dc]/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Radio"
        >
          <Radio className="w-5 h-5" />
        </button>
      </div>

      {/* Bio */}
      <div className="mb-6 px-1">
        <p className={`text-sm text-[#9e9a8f] leading-relaxed ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
          {bio}
        </p>
        <button
          onClick={() => setIsBioExpanded(prev => !prev)}
          className="text-xs font-bold text-[#ede9dc]/70 hover:text-[#d1e289] mt-1 transition-colors"
        >
          {isBioExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>

      {/* Latest Release */}
      {latestRelease && (
        <div
          onClick={() => playSong(latestRelease, songs)}
          className="mb-6 p-3.5 rounded-2xl bg-[#1b1917] border border-white/5 flex items-center gap-3.5 cursor-pointer hover:bg-[#252220] transition-all active:scale-[0.99] group shadow-md"
        >
          <img
            src={latestRelease.thumbnail}
            alt={latestRelease.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9e9a8f] mb-0.5">LATEST RELEASE</p>
            <h4 className="text-sm font-extrabold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
              {latestRelease.title}
            </h4>
            <p className="text-xs text-[#9e9a8f] mt-0.5">{latestRelease.album || 'Single'} • {formatDuration(latestRelease.duration)}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#d1e289] group-hover:text-black flex items-center justify-center transition-all">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          ALBUMS SECTION (Carousel & Klik Masuk ke Seluruh Lagu Album)
          ======================================================== */}
      {albums.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold text-[#ede9dc] flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-[#d1e289]" />
              <span>Albums ({albums.length})</span>
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => handleOpenAlbum(album)}
                className="flex-shrink-0 w-36 sm:w-44 cursor-pointer group space-y-2"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#d1e289] transition-all shadow-lg group-hover:scale-[1.03]">
                  <img
                    src={album.thumbnail || resolvedThumb}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#d1e289] text-black flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-[11px] text-[#9e9a8f]">{album.year || 'Album'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SINGLES & EPS SECTION
          ======================================================== */}
      {singles.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold text-[#ede9dc] flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#d1e289]" />
              <span>Singles & EPs ({singles.length})</span>
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {singles.map((single) => (
              <div
                key={single.id}
                onClick={() => handleOpenAlbum(single)}
                className="flex-shrink-0 w-32 sm:w-40 cursor-pointer group space-y-2"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#d1e289] transition-all shadow-lg group-hover:scale-[1.03]">
                  <img
                    src={single.thumbnail || resolvedThumb}
                    alt={single.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#d1e289] text-black flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
                    {single.title}
                  </h4>
                  <p className="text-[11px] text-[#9e9a8f]">{single.year || 'Single'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ALL SONGS / TOP SONGS LIST
          ======================================================== */}
      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3 text-[#9e9a8f]">
          <Loader2 className="w-5 h-5 animate-spin text-[#d1e289]" />
          <span className="text-sm">Loading songs...</span>
        </div>
      ) : songs.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-extrabold text-[#ede9dc]">
              {showAllSongs ? `Semua Lagu (${songs.length})` : `Lagu Populer (${Math.min(8, songs.length)})`}
            </h3>
            {songs.length > 8 && (
              <button 
                onClick={() => setShowAllSongs(prev => !prev)}
                className="text-xs font-bold text-[#d1e289] hover:underline flex items-center gap-1"
              >
                <span>{showAllSongs ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${songs.length})`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {displayedSongs.map((song, i) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id + i}
                onClick={() => playSong(song, songs)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group active:scale-[0.99] ${
                  isCurrentSong ? 'bg-[#d1e289]/10 border border-[#d1e289]/20' : 'hover:bg-[#1b1917] border border-transparent'
                }`}
              >
                <span className="text-xs font-bold text-[#9e9a8f] w-5 text-center flex-shrink-0">
                  {i + 1}
                </span>
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isCurrentSong ? 'text-[#d1e289]' : 'text-[#ede9dc] group-hover:text-[#d1e289]'} transition-colors`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                    {song.album ? `${song.album} • ` : ''}{formatDuration(song.duration)}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); }}
                  className="p-2 text-[#9e9a8f] hover:text-white transition-colors flex-shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-[#9e9a8f] text-sm">No songs found for this artist.</div>
      )}

      {/* ========================================================
          ALBUM DETAIL MODAL (Membuka dan Memutar Semua Lagu di Album)
          ======================================================== */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#141312] border border-white/10 rounded-t-[32px] sm:rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedAlbum.thumbnail || resolvedThumb}
                  alt={selectedAlbum.title}
                  className="w-14 h-14 rounded-2xl object-cover shadow-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#ede9dc] truncate">
                    {selectedAlbum.title}
                  </h3>
                  <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                    {resolvedName} • {selectedAlbum.year || selectedAlbum.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {albumSongs.length > 0 && (
                  <button
                    onClick={() => playSong(albumSongs[0], albumSongs)}
                    className="py-2 px-4 rounded-full bg-[#d1e289] text-black text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#ede9dc] flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Track List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-none">
              {loadingAlbum ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-[#9e9a8f]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#d1e289]" />
                  <span className="text-xs font-semibold">Memuat semua lagu album...</span>
                </div>
              ) : albumSongs.length > 0 ? (
                albumSongs.map((track, idx) => {
                  const isCurrent = currentSong?.id === track.id;
                  return (
                    <div
                      key={track.id + idx}
                      onClick={() => playSong(track, albumSongs)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.99] group ${
                        isCurrent ? 'bg-[#d1e289]/10 border border-[#d1e289]/20' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#9e9a8f] w-5 text-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#d1e289]' : 'text-[#ede9dc] group-hover:text-[#d1e289]'}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#9e9a8f]">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-[#9e9a8f]">
                  Tidak ada lagu yang ditemukan dalam album ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
