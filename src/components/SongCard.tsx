'use client';

import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export default function SongCard({ song, playlist }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavorite, isFavorite } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const isFav = isFavorite(song.id);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlist);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-white/5 shadow-md">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Floating play button like Spotify */}
        <div
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 transform transition-all duration-300 ${
            isCurrent && isPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </div>

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full glass-pill transition-opacity duration-200 ${
            isFav ? 'opacity-100 text-rose-500' : 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      <div>
        <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-rose-400' : 'text-white'}`}>
          {song.title}
        </h4>
        <p className="text-xs text-white/50 truncate mt-0.5 font-medium">
          {song.artist}
        </p>
      </div>
    </div>
  );
}
