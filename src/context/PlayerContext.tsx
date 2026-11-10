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

  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingSongRef = useRef<Song | null>(null);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio Keep-Alive for Mobile: Plays a silent HTML5 audio loop to keep Android Audio Channel open
  const initSilentKeepAlive = () => {
    if (typeof window === 'undefined') return;
    if (!silentAudioRef.current) {
      try {
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const audio = new Audio(silentWav);
        audio.loop = true;
        audio.volume = 0.001;
        silentAudioRef.current = audio;
      } catch (_) {}
    }
    silentAudioRef.current?.play().catch(() => {});
  };

  const pauseSilentKeepAlive = () => {
    silentAudioRef.current?.pause();
  };

  // Avoid stale closures in background callbacks and MediaSession
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

  // Acquire WakeLock when playing
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

  // 1. Initialize Client-Side Native YouTube Player (100% Works on Vercel without datacenter IP blocks)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const createPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      try {
        new (window as any).YT.Player('gravity-yt-iframe-player', {
          height: '10',
          width: '10',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              ytPlayerRef.current = event.target;
              isYtReadyRef.current = true;
              event.target.setVolume(volume * 100);

              if (pendingSongRef.current) {
                const s = pendingSongRef.current;
                pendingSongRef.current = null;
                event.target.loadVideoById(s.id);
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
              const state = event.data;
              if (state === 1) { // PLAYING
                setIsPlaying(true);
                setIsBuffering(false);
                initSilentKeepAlive();
                if ('mediaSession' in navigator) {
                  navigator.mediaSession.playbackState = 'playing';
                }
                requestWakeLock();
              } else if (state === 2) { // PAUSED
                setIsPlaying(false);
                setIsBuffering(false);
                pauseSilentKeepAlive();
                if ('mediaSession' in navigator) {
                  navigator.mediaSession.playbackState = 'paused';
                }
                releaseWakeLock();
              } else if (state === 3) { // BUFFERING
                setIsBuffering(true);
              } else if (state === 0) { // ENDED
                setIsPlaying(false);
                setIsBuffering(false);
                pauseSilentKeepAlive();
                handleNextSong();
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player Event Error:', event.data);
              setIsPlaying(false);
              setIsBuffering(false);
              pauseSilentKeepAlive();
            },
          },
        });
      } catch (err) {
        console.error('Error initializing YouTube iframe player:', err);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden && isPlayingRef.current && ytPlayerRef.current) {
        initSilentKeepAlive();
        setTimeout(() => {
          try {
            ytPlayerRef.current?.playVideo();
          } catch (_) {}
        }, 150);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    if (!(window as any).YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        (window as any).onYouTubeIframeAPIReady = createPlayer;
        document.body.appendChild(tag);
      } else {
        (window as any).onYouTubeIframeAPIReady = createPlayer;
      }
    } else {
      createPlayer();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      pauseSilentKeepAlive();
      releaseWakeLock();
    };
  }, []);

  // 2. High-precision Time & Duration ticker (every 250ms while playing)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const cur = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || currentSongRef.current?.duration || 0;
          setCurrentTime(cur);
          if (dur > 0 && !isNaN(dur)) {
            setDuration(dur);
          }

          // Keep MediaSession lockscreen slider in sync
          if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && dur > 0) {
            try {
              navigator.mediaSession.setPositionState({
                duration: dur,
                playbackRate: 1,
                position: Math.min(cur, dur),
              });
            } catch (_) {}
          }
        } catch (_) {}
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3. Update current lyric index based on currentTime
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

  // 4. Extract ambient color when current song changes
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

  // 5. Fetch lyrics when song changes
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

  // 6. MediaSession Integration for OS Lock Screen & Notifications
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

    navigator.mediaSession.setActionHandler('play', () => {
      ytPlayerRef.current?.playVideo();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      ytPlayerRef.current?.pauseVideo();
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
      const cur = ytPlayerRef.current?.getCurrentTime() || 0;
      seek(Math.min(cur + (details.seekOffset || 10), duration));
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const cur = ytPlayerRef.current?.getCurrentTime() || 0;
      seek(Math.max(cur - (details.seekOffset || 10), 0));
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      ytPlayerRef.current?.pauseVideo();
    });
  }, [currentSong, duration]);

  // 7. Player Control Functions
  const playSong = (song: Song, newQueue?: Song[]) => {
    // If user clicked the same song that is already active
    if (currentSongRef.current?.id === song.id && ytPlayerRef.current) {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // Playing
          ytPlayerRef.current.pauseVideo();
        } else {
          ytPlayerRef.current.playVideo();
        }
      } catch (_) {
        ytPlayerRef.current.playVideo();
      }
      return;
    }

    setCurrentSong(song);
    currentSongRef.current = song;
    setCurrentTime(0);
    setDuration(song.duration || 0);
    setIsBuffering(true);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    } else if (!queueRef.current.some(s => s.id === song.id)) {
      const updated = [...queueRef.current, song];
      setQueue(updated);
      queueRef.current = updated;
    }

    if (isYtReadyRef.current && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(song.id);
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn('Error calling loadVideoById:', err);
      }
    } else {
      pendingSongRef.current = song;
    }
  };

  const togglePlay = () => {
    if (!ytPlayerRef.current || !currentSong) return;
    try {
      const state = ytPlayerRef.current.getPlayerState();
      if (state === 1) { // Playing -> Pause
        ytPlayerRef.current.pauseVideo();
      } else { // Paused -> Play
        ytPlayerRef.current.playVideo();
      }
    } catch (_) {
      ytPlayerRef.current.playVideo();
    }
  };

  const seek = (seconds: number) => {
    if (!ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (_) {}
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

    if (currentTime > 3) {
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
    setVolumeState(val);
    setIsMuted(val === 0);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(val * 100);
      if (val > 0) ytPlayerRef.current.unMute();
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return;
    if (isMuted) {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume((volume || 0.8) * 100);
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
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
      {/* Hidden Native YouTube Audio Engine (100% Works on Vercel without datacenter blocking) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: -500,
          left: -500,
          width: 10,
          height: 10,
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
      >
        <div id="gravity-yt-iframe-player" />
      </div>
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
