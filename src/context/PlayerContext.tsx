'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Song, LyricsData } from '@/types/music';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Song[];
  favorites: Song[];
  lyrics: LyricsData | null;
  currentLyricIndex: number;
  isFullPlayerOpen: boolean;
  isLyricsOpen: boolean;
  ambientColor: string;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [ambientColor, setAmbientColor] = useState('#1e1b4b');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Refs to avoid stale closures in background event handlers and MediaSession
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gravity_tune_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }, []);

  // Background audio helper: creates a tiny silent audio loop to keep mobile audio pipeline alive
  const initSilentKeepAlive = () => {
    if (!silentAudioRef.current && typeof window !== 'undefined') {
      try {
        // 1-second base64 silent WAV audio loop
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const silent = new Audio(silentWav);
        silent.loop = true;
        silent.volume = 0.001; // Inaudible
        silentAudioRef.current = silent;
      } catch (_) {}
    }
    silentAudioRef.current?.play().catch(() => {});
  };

  // Acquire WakeLock when playing to prevent aggressive OS throttling
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (_) {}
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (_) {}
    }
  };

  // Initialize Main Audio Element with Background Playback Support
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    // Essential attributes for background playback on mobile / iOS / Android
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Keep MediaSession position state in sync with OS lockscreen
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && audio.duration && !isNaN(audio.duration)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime, audio.duration),
          });
        } catch (_) {}
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentSongRef.current?.duration || 0);
    };

    const onEnded = () => {
      // Auto play next song seamlessly using latest queue ref
      handleNextSong();
    };

    const onPlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      initSilentKeepAlive();
      requestWakeLock();
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      releaseWakeLock();
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onCanPlay = () => {
      setIsBuffering(false);
    };

    const onError = () => {
      console.warn('Audio stream playback error');
      setIsPlaying(false);
      setIsBuffering(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      silentAudioRef.current?.pause();
      releaseWakeLock();
    };
  }, []);

  // Update current lyric index based on currentTime
  useEffect(() => {
    if (!lyrics || !lyrics.synced || lyrics.lines.length === 0) {
      setCurrentLyricIndex(-1);
      return;
    }

    const lines = lyrics.lines;
    let foundIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        foundIndex = i;
      } else {
        break;
      }
    }

    setCurrentLyricIndex(foundIndex);
  }, [currentTime, lyrics]);

  // Extract ambient color when current song changes
  useEffect(() => {
    if (!currentSong) return;

    const colors = ['#312e81', '#1e3a8a', '#1e293b', '#4c1d95', '#14532d', '#701a75', '#831843'];
    const randomPick = colors[Math.abs(currentSong.id.charCodeAt(0)) % colors.length];
    setAmbientColor(randomPick);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentSong.thumbnail;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        const count = data.length / 4;
        r = Math.floor((r / count) * 0.7);
        g = Math.floor((g / count) * 0.7);
        b = Math.floor((b / count) * 0.7);
        setAmbientColor(`rgb(${r}, ${g}, ${b})`);
      };
    } catch (_) {}
  }, [currentSong]);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics(null);
      return;
    }

    const fetchLyrics = async () => {
      try {
        const res = await fetch(`/api/lyrics?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}&duration=${currentSong.duration}`);
        if (res.ok) {
          const data: LyricsData = await res.json();
          setLyrics(data);
        } else {
          setLyrics({ synced: false, lines: [] });
        }
      } catch (err) {
        setLyrics({ synced: false, lines: [] });
      }
    };

    fetchLyrics();
  }, [currentSong]);

  // Update MediaSession API for OS lockscreen, notification shade, and background playback
  useEffect(() => {
    if (!currentSong || typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || 'GravityTune',
      artwork: [
        { src: currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
        { src: currentSong.thumbnail, sizes: '128x128', type: 'image/jpeg' },
        { src: currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
        { src: currentSong.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        { src: currentSong.thumbnail, sizes: '384x384', type: 'image/jpeg' },
        { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = 'playing';

    // Register handlers that work even when phone is locked or screen off
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(console.error);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      handlePrevSong();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      handleNextSong();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      seek(Math.min((audioRef.current?.currentTime || 0) + (details.seekOffset || 10), duration));
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      seek(Math.max((audioRef.current?.currentTime || 0) - (details.seekOffset || 10), 0));
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    });
  }, [currentSong, duration]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    // If user clicked the same song that is already active
    if (currentSongRef.current?.id === song.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => {
          if (err.name !== 'AbortError') console.warn('Play error:', err);
        });
      } else {
        audioRef.current.pause();
      }
      return;
    }

    setCurrentSong(song);
    currentSongRef.current = song;
    setIsBuffering(true);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    } else if (!queueRef.current.some(s => s.id === song.id)) {
      const updated = [...queueRef.current, song];
      setQueue(updated);
      queueRef.current = updated;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = `/api/stream/${song.id}`;
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('Auto-play prevented or stream loading:', err);
        }
      });
    }

    initSilentKeepAlive();
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        if (err.name !== 'AbortError') console.warn('Play error:', err);
      });
    } else {
      audioRef.current.pause();
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const handleNextSong = () => {
    const activeSong = currentSongRef.current;
    const currentQueue = queueRef.current;
    if (!activeSong || currentQueue.length === 0) return;

    const currentIndex = currentQueue.findIndex(s => s.id === activeSong.id);
    if (currentIndex !== -1 && currentIndex < currentQueue.length - 1) {
      playSong(currentQueue[currentIndex + 1]);
    } else if (currentQueue.length > 0) {
      playSong(currentQueue[0]); // Loop back to start
    }
  };

  const handlePrevSong = () => {
    const activeSong = currentSongRef.current;
    const currentQueue = queueRef.current;
    if (!activeSong || currentQueue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }

    const currentIndex = currentQueue.findIndex(s => s.id === activeSong.id);
    if (currentIndex > 0) {
      playSong(currentQueue[currentIndex - 1]);
    } else {
      seek(0);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.id === song.id);
      let updated: Song[];
      if (exists) {
        updated = prev.filter(s => s.id !== song.id);
      } else {
        updated = [song, ...prev];
      }
      try {
        localStorage.setItem('gravity_tune_favorites', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isFavorite = (songId: string) => {
    return favorites.some(s => s.id === songId);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        favorites,
        lyrics,
        currentLyricIndex,
        isFullPlayerOpen,
        isLyricsOpen,
        ambientColor,
        playSong,
        togglePlay,
        seek,
        nextSong: handleNextSong,
        prevSong: handlePrevSong,
        setVolume,
        toggleMute,
        toggleFavorite,
        isFavorite,
        setIsFullPlayerOpen,
        setIsLyricsOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
