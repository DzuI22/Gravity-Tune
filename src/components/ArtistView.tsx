'use client';

import React, { useState, useEffect } from 'react';
import { Play, User, Loader2, ChevronLeft, Shuffle, Check, Radio, ChevronRight, MoreVertical } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';

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
};

const DEFAULT_BIO = 'A talented artist creating amazing music for fans around the world. Known for unique sound and passionate performances that connect deeply with listeners.';

export default function ArtistView({ artistId, artistName, artistThumbnail, onBack }: ArtistViewProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState(artistName);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const { playSong, currentSong } = usePlayer();

  const bio = ARTIST_BIOS[artistName.toLowerCase()] || DEFAULT_BIO;

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/artist/${encodeURIComponent(artistId)}`);
        if (res.ok) {
          const data = await res.json();
          setSongs(data.songs || []);
          if (data.artistName) setResolvedName(data.artistName);
        }
      } catch (e) {
        console.error('Failed to fetch artist', e);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [artistId]);

  const latestRelease = songs[0] || null;
  const topSongs = songs.slice(0, 6);

  return (
    <div className="space-y-0 pb-6 animate-in fade-in duration-300">
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
        {artistThumbnail ? (
          <img
            src={artistThumbnail}
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
        7.87M Monthly listeners • 1.02M Subscribers • 25+ Songs • 11+ Albums
      </p>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2.5 mb-6 px-1">
        {/* Shuffle */}
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
          <span>Play</span>
        </button>

        {/* Follow / Check */}
        <button className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-white/8 flex items-center justify-center text-[#ede9dc]/70 hover:text-white hover:bg-white/10 transition-all active:scale-95">
          <Check className="w-5 h-5" />
        </button>

        {/* Radio */}
        <button className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-white/8 flex items-center justify-center text-[#ede9dc]/70 hover:text-white hover:bg-white/10 transition-all active:scale-95">
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
          className="mb-6 p-3.5 rounded-2xl bg-[#1b1917] border border-white/5 flex items-center gap-3.5 cursor-pointer hover:bg-[#252220] transition-all active:scale-[0.99] group"
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
            <p className="text-xs text-[#9e9a8f] mt-0.5">Album • 2026</p>
          </div>
        </div>
      )}

      {/* Top Songs */}
      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3 text-[#9e9a8f]">
          <Loader2 className="w-5 h-5 animate-spin text-[#d1e289]" />
          <span className="text-sm">Loading songs...</span>
        </div>
      ) : topSongs.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-extrabold text-[#ede9dc]">Top songs</h3>
            <button className="text-[#9e9a8f] hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {topSongs.map((song, i) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id + i}
                onClick={() => playSong(song, songs)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group active:scale-[0.99] ${
                  isCurrentSong ? 'bg-[#d1e289]/10 border border-[#d1e289]/20' : 'hover:bg-[#1b1917] border border-transparent'
                }`}
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isCurrentSong ? 'text-[#d1e289]' : 'text-[#ede9dc] group-hover:text-[#d1e289]'} transition-colors`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-[#9e9a8f] truncate mt-0.5">{song.artist}</p>
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
    </div>
  );
}
