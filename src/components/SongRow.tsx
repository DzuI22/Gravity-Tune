'use client';

import React from 'react';
import { Play, Pause, Heart, MoreVertical, Loader2 } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';

interface SongRowProps {
  song: Song;
  index: number;
  playlist?: Song[];
}

export default function SongRow({ song, index, playlist }: SongRowProps) {
  const { currentSong, isPlaying, isBuffering, playSong, togglePlay, toggleFavorite, isFavorite } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const isFav = isFavorite(song.id);

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlist);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
        isCurrent ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/80'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-6 text-center text-xs font-semibold text-white/40 group-hover:hidden">
          {isCurrent && isBuffering ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400 mx-auto" />
          ) : isCurrent && isPlaying ? (
            <div className="flex items-center justify-center gap-0.5 h-3">
              <span className="w-1 h-3 bg-rose-500 animate-pulse rounded-full" />
              <span className="w-1 h-2 bg-rose-500 animate-pulse delay-75 rounded-full" />
              <span className="w-1 h-3.5 bg-rose-500 animate-pulse delay-150 rounded-full" />
            </div>
          ) : (
            index + 1
          )}
        </div>

        <div className="w-6 hidden group-hover:flex items-center justify-center text-white">
          {isCurrent && isBuffering ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
        </div>

        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
        </div>

        <div className="min-w-0 flex-1 pr-4">
          <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-rose-400' : 'text-white'}`}>
            {song.title}
          </p>
          <p className="text-xs text-white/50 truncate font-medium">
            {song.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-white/40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          className="p-1 text-white/40 hover:text-rose-400 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <span className="w-12 text-right">{song.durationFormatted || '3:30'}</span>
      </div>
    </div>
  );
}
