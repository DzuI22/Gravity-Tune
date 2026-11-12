'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Heart,
  Loader2,
  Share2,
  MoreHorizontal,
  MoreVertical,
  Shuffle,
  Repeat,
  Repeat1,
  Moon,
  Check,
  X,
  Lock,
  Trash2,
  Infinity as InfinityIcon,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useVersion } from '@/context/VersionContext';
import { formatDuration, getHdThumbnail } from '@/lib/utils';
import SleepLockOverlay from './SleepLockOverlay';

export default function FullPlayer() {
  const { isV7 } = useVersion();
  const {
    currentSong,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isFavorite,
    toggleFavorite,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    sleepTimer,
    sleepTimerRemaining,
    setSleepTimer,
    queue,
    playSong,
    ambientColor,
    lyrics,
    currentLyricIndex,
  } = usePlayer();

  // Mode UI: 'player' (Foto 1), 'lyrics' (Foto 2), 'queue' (Foto 3)
  const [viewMode, setViewMode] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [showShareToast, setShowShareToast] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isSleepLockOpen, setIsSleepLockOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(true);

  // Auto scroll lyric
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewMode === 'lyrics' && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLyricIndex, viewMode]);

  if (!isFullPlayerOpen || !currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const hdThumb = getHdThumbnail(currentSong.thumbnail, currentSong.id);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?song=${currentSong.id}` : '';
    const shareText = `Dengarkan lagu "${currentSong.title}" dari ${currentSong.artist} di GravityTune!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      } catch (_) {}
    }
  };

  // Format total queue duration
  const totalQueueSeconds = queue.reduce((acc, s) => acc + (s.duration || 210), 0);
  const queueHours = Math.floor(totalQueueSeconds / 3600);
  const queueMins = Math.floor((totalQueueSeconds % 3600) / 60);
  const queueSecs = totalQueueSeconds % 60;
  const queueDurationStr = queueHours > 0 
    ? `${queueHours}h ${queueMins}m ${queueSecs}s`
    : `${queueMins}m ${queueSecs}s`;

  const sleepTimerMinutes = [15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0d0c] text-[#ede9dc] overflow-hidden font-sans select-none animate-in fade-in duration-300">
      
      {/* Dynamic Ambient Background Glow & Canvas Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 mix-blend-screen transition-all duration-1000"
          style={{ backgroundColor: '#d1e289' }}
        />
        <div 
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 mix-blend-screen transition-all duration-1000"
          style={{ backgroundColor: '#22c55e' }}
        />
      </div>

      {/* ========================================================
          MODE 1: PLAYER BAR UI (PERSIS FOTO 1 DENGAN GLASS TOUCH)
          ======================================================== */}
      {viewMode === 'player' && (
        <div className="relative z-10 flex flex-col justify-between h-full max-w-lg mx-auto w-full px-6 py-4 pb-8 animate-in zoom-in-95 duration-200">
          {/* Top Header: ChevronDown & Now Playing Title */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsFullPlayerOpen(false)}
              className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] backdrop-blur-xl border border-white/10 text-[#ede9dc]/80 hover:text-white transition-all active:scale-95 shadow-lg"
              title="Tutup / Minimize"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center min-w-0 flex-1 px-4">
              <p className="text-xs font-semibold text-[#ede9dc]/60">
                Now Playing
              </p>
              <p className="text-sm font-bold text-[#ede9dc] truncate mt-0.5">
                {currentSong.album || `${currentSong.artist} Mix`}
              </p>
            </div>

            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Big Album Artwork with Glass Frame */}
          <div className="my-auto py-2 flex justify-center">
            <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[380px] rounded-[36px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] border border-white/15 group">
              <img
                src={hdThumb}
                alt={currentSong.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 flex justify-between text-xs font-black text-white/90 drop-shadow-md">
                <span className="uppercase tracking-wider">{currentSong.artist}</span>
                <span className="tracking-wide">{currentSong.title}</span>
              </div>
            </div>
          </div>

          {/* Bottom Control Section */}
          <div className="space-y-4">
            {/* Title & 3 Squircle Buttons Row (Foto 1) */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 pr-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ede9dc] tracking-tight truncate leading-tight">
                  {currentSong.title}
                </h2>
                <p className="text-sm sm:text-base text-[#a39f93] font-semibold truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>

              {/* 3 Squircle Buttons: Share, Heart, More */}
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-11 h-11 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                  title="Bagikan Lagu"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* Heart / Favorite */}
                <button
                  onClick={() => toggleFavorite(currentSong)}
                  className="w-11 h-11 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                  title="Favorit"
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* More Menu */}
                <button
                  onClick={() => setIsMoreMenuOpen(prev => !prev)}
                  className="w-11 h-11 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                  title="Lainnya"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {/* More Menu Popup */}
                {isMoreMenuOpen && (
                  <div className="absolute right-0 bottom-14 w-48 bg-[#181614] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        handleShare();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-white"
                    >
                      <Share2 className="w-4 h-4 text-[#d1e289]" />
                      <span>Salin Link Lagu</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsSleepModalOpen(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-white"
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Timer Tidur</span>
                    </button>
                    {isV7 && (
                      <button
                        onClick={() => {
                          setIsSleepLockOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-white"
                      >
                        <Lock className="w-4 h-4 text-[#d1e289]" />
                        <span>Mode Layar Tidur (OLED)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scrubber Seekbar (Foto 1) */}
            <div className="space-y-1.5 pt-1">
              <div className="relative w-full h-3 flex items-center cursor-pointer group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#ede9dc] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#a39f93]">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration || 212)}</span>
              </div>
            </div>

            {/* 5 Controller Row: Shuffle, Prev, Big Round Play, Next, Repeat (Foto 1) */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all border border-white/5 active:scale-95 ${
                  isShuffle ? 'bg-white/25 text-[#d1e289] shadow-md' : 'bg-white/[0.08] text-[#ede9dc]/70 hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle Aktif' : 'Acak Lagu'}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              {/* Prev */}
              <button
                onClick={prevSong}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 active:scale-95"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              {/* Big Round Play / Pause Button in Center (Foto 1) */}
              <button
                onClick={togglePlay}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#ede9dc] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/80"
                title={isBuffering ? 'Buffering...' : isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 fill-black" />
                ) : (
                  <Play className="w-8 h-8 fill-black ml-1" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextSong}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 active:scale-95"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all border border-white/5 active:scale-95 ${
                  repeatMode !== 'off' ? 'bg-white/25 text-[#d1e289] shadow-md' : 'bg-white/[0.08] text-[#ede9dc]/70 hover:text-white'
                }`}
                title={repeatMode === 'one' ? 'Ulangi 1 Lagu' : repeatMode === 'all' ? 'Ulangi Semua' : 'Repeat Mati'}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Bottom 3 Pills: Queue, Moon, Lyrics (Foto 1) */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {/* Queue Pill -> Membuka Foto 3 */}
              <button
                onClick={() => setViewMode('queue')}
                className="flex-1 py-3.5 px-4 rounded-3xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center gap-2 text-sm font-extrabold transition-all border border-white/5 active:scale-95 shadow-md"
              >
                <ListMusic className="w-4 h-4" />
                <span>Queue</span>
              </button>

              {/* Moon Sleep Timer */}
              <button
                onClick={() => setIsSleepModalOpen(true)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border border-white/5 relative active:scale-95 ${
                  sleepTimerRemaining ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/[0.08] text-[#ede9dc] hover:bg-white/[0.15]'
                }`}
                title="Timer Tidur"
              >
                <Moon className="w-5 h-5" />
                {sleepTimerRemaining && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                    {Math.ceil(sleepTimerRemaining / 60)}m
                  </span>
                )}
              </button>

              {/* Lyrics Pill -> Membuka Foto 2 */}
              <button
                onClick={() => setViewMode('lyrics')}
                className="flex-1 py-3.5 px-4 rounded-3xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center gap-2 text-sm font-extrabold transition-all border border-white/5 active:scale-95 shadow-md"
              >
                <Mic2 className="w-4 h-4" />
                <span>Lyrics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: LYRICS UI (PERSIS FOTO 2)
          ======================================================== */}
      {viewMode === 'lyrics' && (
        <div
          className="relative flex flex-col justify-between h-full max-w-lg mx-auto w-full px-6 py-4 pb-6 animate-in slide-in-from-bottom-5 duration-300"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${ambientColor || '#3d3f18'} 0%, #15160e 55%, #0e0d0c 100%)`,
          }}
        >
          {/* Header Lyrics (Foto 2): Thumbnail + Title + Close (X) & More */}
          <div className="flex items-center justify-between pt-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <img
                src={hdThumb}
                alt={currentSong.title}
                className="w-11 h-11 rounded-xl object-cover shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-[#ede9dc] truncate leading-tight">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-[#ede9dc]/70 font-semibold truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setViewMode('player')}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all"
                title="Tutup Lirik"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMoreMenuOpen(prev => !prev)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Karaoke Synced Lyrics Flow (Foto 2) */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-2 py-8 space-y-6 scroll-smooth select-none scrollbar-none"
          >
            {lyrics && lyrics.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = idx === currentLyricIndex;
                const isPast = currentLyricIndex !== -1 && idx < currentLyricIndex;

                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => {
                      if (lyrics.synced) seek(line.time);
                    }}
                    className={`transition-all duration-300 cursor-pointer text-left leading-relaxed ${
                      isActive
                        ? 'text-2xl sm:text-3xl font-extrabold text-white filter-none scale-[1.03] origin-left drop-shadow-md py-1'
                        : isPast
                        ? 'text-xl sm:text-2xl font-bold text-white/40 filter blur-[0.8px] hover:text-white/70 hover:filter-none'
                        : 'text-xl sm:text-2xl font-bold text-white/30 filter blur-[1.2px] hover:text-white/60 hover:filter-none'
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/50 space-y-2 py-20">
                <Sparkles className="w-8 h-8 opacity-40 text-[#d1e289]" />
                <p className="text-base font-bold text-[#ede9dc]">Memuat Lirik...</p>
                <p className="text-xs text-white/40 max-w-xs">
                  Lirik untuk lagu ini sedang dicari dari database musik.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Lyrics Controls (Foto 2) */}
          <div className="pt-3 space-y-3">
            {/* Scrubber Seekbar Mini */}
            <div className="space-y-1">
              <div className="relative w-full h-2 flex items-center cursor-pointer group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-white/60">
                <span>{formatDuration(currentTime)}</span>
                <span>-{formatDuration(Math.max(0, (duration || 212) - currentTime))}</span>
              </div>
            </div>

            {/* Play Controls Row (Prev, Play, Next) */}
            <div className="flex items-center justify-center gap-8 py-1">
              <button
                onClick={prevSong}
                className="text-white/80 hover:text-white active:scale-95 transition-all p-2"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="text-white hover:scale-105 active:scale-95 transition-all p-2"
              >
                {isBuffering ? (
                  <Loader2 className="w-9 h-9 animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause className="w-9 h-9 fill-current" />
                ) : (
                  <Play className="w-9 h-9 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-white/80 hover:text-white active:scale-95 transition-all p-2"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>
            </div>

            {/* Bottom Speaker Row: Mute & Volume (Foto 2) */}
            <div className="flex items-center justify-between pt-1 text-white/60">
              <button
                onClick={toggleMute}
                className="p-2 hover:text-white transition-colors"
                title="Mute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="w-36 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 3: QUEUE UI (PERSIS FOTO 3)
          ======================================================== */}
      {viewMode === 'queue' && (
        <div className="relative flex flex-col justify-between h-full max-w-lg mx-auto w-full px-5 py-3 pb-6 bg-[#121110] animate-in slide-in-from-bottom-5 duration-300">
          {/* Sheet Handle */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-1.5 cursor-pointer" onClick={() => setViewMode('player')} />

          {/* Queue Header: Thumbnail, Title, Heart, Close X (Foto 3) */}
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <img
                src={hdThumb}
                alt={currentSong.title}
                className="w-12 h-12 rounded-2xl object-cover shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-[#ede9dc] truncate">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(currentSong)}
                className={`p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] transition-colors ${
                  isFav ? 'text-rose-500' : 'text-white/70'
                }`}
                title="Favorit"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setViewMode('player')}
                className="p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white/70 hover:text-white transition-colors"
                title="Tutup Antrean"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Queue Info Bar (Foto 3): Lock, More, Trash, "51 songs • 3h 11m 15s" */}
          <div className="flex items-center justify-between py-3 text-xs text-[#9e9a8f] font-semibold">
            <div className="flex items-center gap-3">
              <button className="hover:text-white transition-colors" title="Lock queue">
                <Lock className="w-4 h-4" />
              </button>
              <button className="hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Keep only current song in queue
                  playSong(currentSong, [currentSong]);
                }}
                className="hover:text-rose-400 transition-colors"
                title="Bersihkan Antrean"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <span>
              {queue.length} songs • {queueDurationStr}
            </span>
          </div>

          {/* 3 Action Buttons (Foto 3): Shuffle, Repeat, Infinity Autoplay Pill */}
          <div className="grid grid-cols-3 gap-2.5 pb-3">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-white/5 ${
                isShuffle ? 'bg-white/20 text-[#d1e289]' : 'bg-[#1e1c1a] text-white/70 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-white/5 ${
                repeatMode !== 'off' ? 'bg-white/20 text-[#d1e289]' : 'bg-[#1e1c1a] text-white/70 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>

            {/* Infinity / Autoplay Pill (Foto 3) */}
            <button
              onClick={() => setAutoplayActive(prev => !prev)}
              className={`h-11 rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 font-bold text-xs ${
                autoplayActive
                  ? 'bg-[#d1e289] text-black shadow-lg shadow-[#d1e289]/20'
                  : 'bg-[#1e1c1a] text-white/60 hover:text-white'
              }`}
            >
              <InfinityIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Section Header: Continue Playing */}
          <div className="pb-2">
            <h4 className="text-sm font-extrabold text-[#ede9dc]">Continue Playing</h4>
            <p className="text-[11px] text-[#9e9a8f] mt-0.5">Autoplaying similar music</p>
          </div>

          {/* Queue Song List (Foto 3) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {/* Active Current Song Card (Highlighted olive card in Foto 3) */}
            <div className="p-2.5 rounded-2xl bg-[#434614] border border-[#d1e289]/30 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src={hdThumb} alt={currentSong.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#ede9dc] truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-xs text-[#ede9dc]/70 truncate mt-0.5">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
              <button className="p-2 text-white/80 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Next Songs in Queue */}
            {queue
              .filter((s, i) => s.id !== currentSong.id || queue.findIndex(x => x.id === s.id) !== i)
              .map((song, idx) => (
                <div
                  key={song.id + idx}
                  onClick={() => playSong(song, queue)}
                  className="p-2.5 rounded-2xl bg-[#181614] hover:bg-[#22201d] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={getHdThumbnail(song.thumbnail, song.id)}
                      alt={song.title}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
                        {song.title}
                      </p>
                      <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                        {song.artist} • {formatDuration(song.duration || 210)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 text-[#9e9a8f] hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sleep Timer Modal */}
      {isSleepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#181715] border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Timer Tidur</h3>
              </div>
              <button
                onClick={() => setIsSleepModalOpen(false)}
                className="text-xs font-bold text-white/50 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-white/60">
              Pilih waktu pemutaran lagu otomatis berhenti saat Anda tertidur:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {sleepTimerMinutes.map(min => (
                <button
                  key={min}
                  onClick={() => {
                    setSleepTimer(min);
                    setIsSleepModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl text-xs font-bold border transition-all ${
                    sleepTimer === min
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/5'
                  }`}
                >
                  {min} Menit
                </button>
              ))}
            </div>

            {sleepTimerRemaining && (
              <button
                onClick={() => {
                  setSleepTimer(null);
                  setIsSleepModalOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all border border-rose-500/30"
              >
                Matikan Timer Tidur
              </button>
            )}
          </div>
        </div>
      )}

      <SleepLockOverlay isOpen={isSleepLockOpen} onClose={() => setIsSleepLockOpen(false)} />

      {/* Share Copied Toast */}
      {showShareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#ede9dc] text-black px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Tautan lagu berhasil disalin ke clipboard!</span>
        </div>
      )}
    </div>
  );
}
