'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, User, Loader2, ChevronLeft } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';
import SongRow from './SongRow';

interface ArtistViewProps {
  artistId: string;
  artistName: string;
  artistThumbnail?: string;
  onBack: () => void;
}

export default function ArtistView({ artistId, artistName, artistThumbnail, onBack }: ArtistViewProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState(artistName);
  const { playSong } = usePlayer();

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

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Search
      </button>

      {/* Artist Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        {artistThumbnail ? (
          <img src={artistThumbnail} alt={resolvedName} className="w-full h-64 object-cover object-center" />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-indigo-900 to-rose-900 flex items-center justify-center">
            <User className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Artist</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">{resolvedName}</h2>
          {songs.length > 0 && (
            <button
              onClick={() => playSong(songs[0], songs)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-rose-500/30"
            >
              <Play className="w-4 h-4 fill-white" /> Play All Songs
            </button>
          )}
        </div>
      </div>

      {/* Songs list */}
      {loading ? (
        <div className="py-16 flex items-center justify-center gap-3 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-sm">Loading songs...</span>
        </div>
      ) : songs.length > 0 ? (
        <div className="glass-panel rounded-2xl p-2 border border-white/5">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} playlist={songs} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-white/40 text-sm">No songs found for this artist.</div>
      )}
    </div>
  );
}
