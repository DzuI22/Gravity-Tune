'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

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
    setIsFullPlayerOpen,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed bottom-18 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30 pointer-events-none">
      <div
        onClick={() => setIsFullPlayerOpen(true)}
        className="pointer-events-auto bg-[#1b1917]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/90 flex flex-col cursor-pointer hover:border-[#d1e289]/40 transition-all duration-300 active:scale-[0.99] group overflow-hidden"
      >
        {/* Main row */}
        <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3">
          {/* Left: Thumbnail & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 shadow-md">
              <img
                src={currentSong.thumbnail}
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
            className="flex items-center gap-2 flex-shrink-0"
          >
            {/* Previous */}
            <button
              onClick={prevSong}
              className="w-9 h-9 rounded-full text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Big Round Lime Play/Pause (Matches ArchiveTune) */}
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

            {/* Next */}
            <button
              onClick={nextSong}
              className="w-9 h-9 rounded-full text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              title="Lagu Selanjutnya"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mx-3 mb-2">
          <div
            className="h-full bg-[#d1e289] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
