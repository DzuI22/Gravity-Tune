'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Mic2,
  ListMusic,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration, getHdThumbnail } from '@/lib/utils';

export default function MiniPlayer() {
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
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
  } = usePlayer();

  if (!currentSong || isFullPlayerOpen) return null;

  const isFav = isFavorite(currentSong.id);
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      {/* ========================================================
          MOBILE MINI PLAYER (< md / Layar HP)
          Posisinya di bottom-[68px], tepat 8px di atas kapsul navigasi bawah (bottom-2)
          Sama sekali TIDAK menutupi tombol Home, Search, dan Library!
          ======================================================== */}
      <div className="md:hidden fixed bottom-[68px] left-3 right-3 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-300">
        <div
          onClick={() => setIsFullPlayerOpen(true)}
          className="bg-[#131211] border border-white/10 rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.98)] flex flex-col cursor-pointer hover:border-[#d1e289]/50 transition-all duration-300 active:scale-[0.99] group overflow-hidden"
        >
          {/* Main Row */}
          <div className="flex items-center justify-between gap-3 p-2.5">
            {/* Left: Artwork & Song Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 shadow-md">
                <img
                  src={getHdThumbnail(currentSong.thumbnail, currentSong.id)}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 pr-1">
                <h4 className="text-sm font-extrabold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors leading-tight">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Right: Controls (Prev, Big Lime Play/Pause, Next) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 flex-shrink-0"
            >
              <button
                onClick={prevSong}
                className="w-9 h-9 rounded-full text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#d1e289]/20"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="w-9 h-9 rounded-full text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mx-3 mb-2">
            <div
              className="h-full bg-[#d1e289] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP / PC BOTTOM PLAYER BAR (>= md)
          Tampil di bawah layar PC dengan kontrol lengkap.
          Navigasi Home/Search/Library di PC ada di Header atas,
          sehingga bagian bawah 100% bebas tumpang tindih!
          ======================================================== */}
      <div className="hidden md:block fixed bottom-3 left-6 right-6 max-w-5xl mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-[#131211] border border-white/10 rounded-3xl p-3 shadow-[0_12px_45px_rgba(0,0,0,0.98)] flex items-center justify-between gap-6">
          {/* Sisi Kiri: Thumbnail, Info Lagu, Tombol Favorite & Expand */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4">
            <div
              onClick={() => setIsFullPlayerOpen(true)}
              className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 shadow-lg cursor-pointer group"
              title="Buka Layar Penuh"
            >
              <img
                src={getHdThumbnail(currentSong.thumbnail, currentSong.id)}
                alt={currentSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4
                onClick={() => setIsFullPlayerOpen(true)}
                className="text-sm font-extrabold text-[#ede9dc] truncate hover:text-[#d1e289] transition-colors cursor-pointer"
              >
                {currentSong.title}
              </h4>
              <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentSong)}
              className={`p-2 rounded-xl transition-colors ${
                isFav ? 'text-rose-500 hover:text-rose-400' : 'text-[#9e9a8f] hover:text-white'
              }`}
              title="Favorit"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Sisi Tengah: Kontrol Utama + Seekbar */}
          <div className="flex flex-col items-center flex-1 max-w-md gap-1.5">
            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-xl transition-colors ${
                  isShuffle ? 'text-[#d1e289]' : 'text-[#9e9a8f] hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle Aktif' : 'Acak Lagu'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevSong}
                className="p-2 text-[#ede9dc] hover:text-white active:scale-95 transition-all"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#d1e289] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#d1e289]/20"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-2 text-[#ede9dc] hover:text-white active:scale-95 transition-all"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-xl transition-colors ${
                  repeatMode !== 'off' ? 'text-[#d1e289]' : 'text-[#9e9a8f] hover:text-white'
                }`}
                title={repeatMode === 'one' ? 'Ulangi 1 Lagu' : repeatMode === 'all' ? 'Ulangi Semua' : 'Repeat Mati'}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Scrubber slider bar */}
            <div className="w-full flex items-center gap-2.5 text-[11px] font-bold text-[#9e9a8f]">
              <span className="w-8 text-right">{formatDuration(currentTime)}</span>
              <div className="relative flex-1 h-2 flex items-center cursor-pointer group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#d1e289] focus:outline-none"
                />
              </div>
              <span className="w-10">
                {duration > currentTime ? `-${formatDuration(duration - currentTime)}` : formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Lirik, Queue, Volume, Fullscreen Expand */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="p-2 text-[#9e9a8f] hover:text-[#d1e289] transition-colors"
              title="Lirik & Full Player"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="p-2 text-[#9e9a8f] hover:text-[#d1e289] transition-colors"
              title="Daftar Putar"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#9e9a8f] hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#d1e289]"
              />
            </div>

            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="p-2 text-[#9e9a8f] hover:text-[#d1e289] transition-colors"
              title="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
