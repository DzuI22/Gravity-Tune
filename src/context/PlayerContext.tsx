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
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
  sleepTimer: number | null;
  sleepTimerRemaining: number | null;
  setSleepTimer: (minutes: number | null) => void;
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
  sponsorBlockEnabled: boolean;
  setSponsorBlockEnabled: (v: boolean) => void;
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

  // Modern Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [sponsorBlockEnabled, setSponsorBlockEnabledState] = useState<boolean>(true);

  const sponsorSegmentsRef = useRef<{ start: number; end: number }[]>([]);
  const lastSkippedSegmentRef = useRef<number>(-1);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingSongRef = useRef<Song | null>(null);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<any>(null);
  const userWantsPlayRef = useRef<boolean>(false);
  const isAutoResumingRef = useRef<boolean>(false);

  // Avoid stale closures in background callbacks and MediaSession
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  const isShuffleRef = useRef<boolean>(false);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);

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

  // Sleep Timer Countdown Ticker
  useEffect(() => {
    if (!sleepTimerRemaining || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          userWantsPlayRef.current = false;
          pauseSilentKeepAlive();
          ytPlayerRef.current?.pauseVideo();
          setIsPlaying(false);
          setSleepTimerState(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerState(minutes);
    if (minutes && minutes > 0) {
      setSleepTimerRemaining(minutes * 60);
    } else {
      setSleepTimerRemaining(null);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Background Audio Keep-Alive for Mobile: Generates inaudible audio to keep Chrome/Android Audio Session alive
  const initSilentKeepAlive = () => {
    if (typeof window === 'undefined') return;
    try {
      if (!silentAudioRef.current) {
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const audio = new Audio(silentWav);
        audio.loop = true;
        audio.volume = 0.01;
        audio.autoplay = true;
        silentAudioRef.current = audio;
      }
      const playP = silentAudioRef.current?.play(); if (playP !== undefined) playP.catch(() => {});

      // WebAudio oscillator keep-alive at inaudible gain
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, ctx.currentTime);
        gain.gain.setValueAtTime(0.00001, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch (_) {}
  };

  const pauseSilentKeepAlive = () => {
    silentAudioRef.current?.pause();
    if (audioCtxRef.current?.state === 'running') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  };

  // Bridge notification to Native Android Service and MediaSession
  const updateMediaBridge = (playingState?: boolean, seekPos?: number) => {
    const song = currentSongRef.current;
    if (!song || typeof window === 'undefined') return;
    const isNowPlaying = playingState !== undefined ? playingState : isPlayingRef.current;
    let curTime = currentTime || 0;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      try {
        const ct = ytPlayerRef.current.getCurrentTime();
        if (typeof ct === 'number' && !isNaN(ct) && ct > 0) curTime = ct;
      } catch (_) {}
    }
    const pos = seekPos !== undefined ? seekPos : curTime;

    // 1. Android Native Foreground Notification Bridge
    if ((window as any).GravityNativeBridge?.updateMedia) {
      try {
        (window as any).GravityNativeBridge.updateMedia(
          song.title || 'GravityTune',
          song.artist || 'Unknown Artist',
          song.thumbnail || '',
          isNowPlaying,
          Math.floor((song.duration || 0) * 1000),
          Math.floor(pos * 1000)
        );
      } catch (_) {}
    }

    // 2. Browser MediaSession API
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = isNowPlaying ? 'playing' : 'paused';
      } catch (_) {}
    }
  };

  // Spoof document visibility so YouTube iframe NEVER pauses when minimized or screen turned off
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      Object.defineProperty(document, 'hidden', {
        get: () => false,
        configurable: true,
      });
      Object.defineProperty(document, 'visibilityState', {
        get: () => 'visible',
        configurable: true,
      });
    } catch (_) {}

    const preventBackgroundPause = (e: Event) => {
      if (userWantsPlayRef.current) {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('visibilitychange', preventBackgroundPause, true);
    document.addEventListener('visibilitychange', preventBackgroundPause, true);

    return () => {
      window.removeEventListener('visibilitychange', preventBackgroundPause, true);
      document.removeEventListener('visibilitychange', preventBackgroundPause, true);
    };
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

  // 1. Initialize Client-Side Native YouTube Player
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const createPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      try {
        new (window as any).YT.Player('gravity-yt-iframe-player', {
          height: '180',
          width: '240',
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
              const state = event.data;
              if (state === 1) { // PLAYING
                setIsPlaying(true);
                setIsBuffering(false);
                initSilentKeepAlive();
                updateMediaBridge(true);
                if ('mediaSession' in navigator) {
                  navigator.mediaSession.playbackState = 'playing';
                }
                requestWakeLock();
              } else if (state === 2) { // PAUSED
                // Distinguish between intentional user pause vs involuntary browser background suspend
                if (userWantsPlayRef.current) {
                  // Involuntary background pause by OS/WebView
                  initSilentKeepAlive();
                  if (!isAutoResumingRef.current) {
                    isAutoResumingRef.current = true;
                    setTimeout(() => {
                      isAutoResumingRef.current = false;
                      if (userWantsPlayRef.current && ytPlayerRef.current) {
                        try {
                          ytPlayerRef.current.playVideo();
                        } catch (_) {}
                      }
                    }, 50);
                  }
                } else {
                  // Intentional pause by user
                  setIsPlaying(false);
                  setIsBuffering(false);
                  pauseSilentKeepAlive();
                  updateMediaBridge(false);
                  if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'paused';
                  }
                  releaseWakeLock();
                }
              } else if (state === 3) { // BUFFERING
                setIsBuffering(true);
              } else if (state === 0) { // ENDED
                setIsPlaying(false);
                setIsBuffering(false);
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
      // If user minimized or switched tab while song was playing, auto-resume playback
      if (userWantsPlayRef.current && ytPlayerRef.current) {
        initSilentKeepAlive();
        setTimeout(() => {
          try {
            ytPlayerRef.current?.playVideo();
          } catch (_) {}
        }, 120);
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

  // ArchiveTune 15.1.0 Feature: SponsorBlock Auto-Skip Non-Music Segments
  useEffect(() => {
    if (!currentSong || typeof window === 'undefined') {
      sponsorSegmentsRef.current = [];
      return;
    }

    const fetchSponsorBlock = async () => {
      try {
        const saved = localStorage.getItem('gravity_sponsorblock_enabled');
        if (saved !== null) {
          setSponsorBlockEnabledState(saved === 'true');
        }

        const res = await fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${currentSong.id}&categories=["music_offtopic","sponsor","selfpromo","intro","outro"]`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            sponsorSegmentsRef.current = data.map((item: any) => ({
              start: item.segment[0],
              end: item.segment[1],
            }));
          }
        } else {
          sponsorSegmentsRef.current = [];
        }
      } catch (_) {
        sponsorSegmentsRef.current = [];
      }
    };

    fetchSponsorBlock();
  }, [currentSong]);

  const setSponsorBlockEnabled = (val: boolean) => {
    setSponsorBlockEnabledState(val);
    try {
      localStorage.setItem('gravity_sponsorblock_enabled', val.toString());
    } catch (_) {}
  };

  // 5. Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics(null);
      return;
    }

    const fetchLyrics = async () => {
      // 1. Try Next.js internal /api/lyrics route
      try {
        const res = await fetch(`/api/lyrics?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}&duration=${currentSong.duration}`);
        if (res.ok) {
          const data: LyricsData = await res.json();
          if (data && data.lines && data.lines.length > 0) {
            setLyrics(data);
            return;
          }
        }
      } catch (_) {}

      // 2. Direct client-side LRCLIB fallback (vital for standalone Android APK where Next server route might be local/static)
      try {
        const cleanTitle = (currentSong.title || '')
          .replace(/[\(\[\{][^\)\]\}]*(?:official|music\s*video|audio|lyric|lyrics|hd|4k|remastered|live|visualizer|mv|m\/v|video|lirik|cover|explicit)[^\)\]\}]*[\)\]\}]/gi, '')
          .replace(/\s*[-–—|]\s*(?:official\s*video|music\s*video|official|lyrics|audio|mv).*$/gi, '')
          .replace(/\s*[\(\[]?\s*(?:feat|ft)\.?\s+[^)\]]+[\)\]]?/gi, '')
          .trim();

        const lrclibRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent((cleanTitle || currentSong.title) + ' ' + (currentSong.artist || ''))}`);
        if (lrclibRes.ok) {
          const items = await lrclibRes.json();
          if (Array.isArray(items) && items.length > 0) {
            const match = items.find((x: any) => x.syncedLyrics) || items.find((x: any) => x.plainLyrics) || items[0];
            if (match?.syncedLyrics) {
              const lines: { time: number; text: string }[] = [];
              const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{0,3})\]/g;
              for (const l of match.syncedLyrics.split('\n')) {
                const tr = l.trim();
                if (!tr) continue;
                timeRegex.lastIndex = 0;
                const m = timeRegex.exec(tr);
                if (m) {
                  const t = tr.replace(/\[\d{2}:\d{2}\.?\d{0,3}\]/g, '').trim();
                  if (t) {
                    const sec = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseFloat('0.' + (m[3] || '0'));
                    lines.push({ time: sec, text: t });
                  }
                }
              }
              if (lines.length > 0) {
                setLyrics({ synced: true, lines: lines.sort((a, b) => a.time - b.time), plain: match.plainLyrics });
                return;
              }
            } else if (match?.plainLyrics) {
              const plines = match.plainLyrics.split('\n').map((t: string) => t.trim()).filter(Boolean).map((t: string, i: number) => ({ time: i * 5, text: t }));
              if (plines.length > 0) {
                setLyrics({ synced: false, lines: plines, plain: match.plainLyrics });
                return;
              }
            }
          }
        }
      } catch (_) {}

      setLyrics({ synced: false, lines: [] });
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

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => {
      userWantsPlayRef.current = true;
      initSilentKeepAlive();
      if (ytPlayerRef.current) {
        ytPlayerRef.current.playVideo();
      }
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      userWantsPlayRef.current = false;
      pauseSilentKeepAlive();
      if (ytPlayerRef.current) {
        ytPlayerRef.current.pauseVideo();
      }
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
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
      userWantsPlayRef.current = false;
      pauseSilentKeepAlive();
      ytPlayerRef.current?.pauseVideo();
    });
  }, [currentSong, duration]);

  // 7. Player Control Functions
  const playSong = (song: Song, newQueue?: Song[]) => {
    userWantsPlayRef.current = true;

    // Auto-open FullPlayer on mobile devices so user immediately sees controls and lyrics!
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsFullPlayerOpen(true);
    }

    // If user clicked the same song that is already active
    if (currentSongRef.current?.id === song.id && ytPlayerRef.current) {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // Playing -> Pause
          userWantsPlayRef.current = false;
          pauseSilentKeepAlive();
          ytPlayerRef.current.pauseVideo();
        } else { // Paused -> Play
          userWantsPlayRef.current = true;
          initSilentKeepAlive();
          ytPlayerRef.current.playVideo();
        }
      } catch (_) {
        userWantsPlayRef.current = true;
        initSilentKeepAlive();
        ytPlayerRef.current.playVideo();
      }
      return;
    }

    setCurrentSong(song);
    currentSongRef.current = song;
    setCurrentTime(0);
    setDuration(song.duration || 0);
    setIsBuffering(true);
    initSilentKeepAlive();

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
        userWantsPlayRef.current = false;
        pauseSilentKeepAlive();
        ytPlayerRef.current.pauseVideo();
      } else { // Paused -> Play
        userWantsPlayRef.current = true;
        initSilentKeepAlive();
        ytPlayerRef.current.playVideo();
      }
    } catch (_) {
      userWantsPlayRef.current = true;
      initSilentKeepAlive();
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

    // 1. Repeat One
    if (repeatModeRef.current === 'one') {
      seek(0);
      ytPlayerRef.current?.playVideo();
      return;
    }

    // 2. Shuffle mode
    if (isShuffleRef.current && currentQueue.length > 1) {
      const otherSongs = currentQueue.filter(s => s.id !== activeSong.id);
      const randomIndex = Math.floor(Math.random() * otherSongs.length);
      playSong(otherSongs[randomIndex]);
      return;
    }

    // 3. Normal queue progression
    const currentIndex = currentQueue.findIndex(s => s.id === activeSong.id);
    if (currentIndex !== -1 && currentIndex < currentQueue.length - 1) {
      playSong(currentQueue[currentIndex + 1]);
    } else if (currentQueue.length > 0 && repeatModeRef.current === 'all') {
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

  // Expose global window hooks for Android Native Notification and Lock Screen controls
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).gravityTuneTogglePlay = () => togglePlay();
    (window as any).gravityTunePlay = () => {
      userWantsPlayRef.current = true;
      initSilentKeepAlive();
      ytPlayerRef.current?.playVideo();
      setIsPlaying(true);
      updateMediaBridge(true);
    };
    (window as any).gravityTunePause = () => {
      userWantsPlayRef.current = false;
      pauseSilentKeepAlive();
      ytPlayerRef.current?.pauseVideo();
      setIsPlaying(false);
      updateMediaBridge(false);
    };
    (window as any).gravityTuneNext = () => handleNextSong();
    (window as any).gravityTunePrev = () => handlePrevSong();
    (window as any).gravityTuneSeek = (sec: number) => seek(sec);
  }, [currentSong, queue, isPlaying]);

  // Sync native notification when currentSong or isPlaying changes
  useEffect(() => {
    updateMediaBridge();
  }, [currentSong, isPlaying]);

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
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        sleepTimer,
        sleepTimerRemaining,
        setSleepTimer,
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
        sponsorBlockEnabled,
        setSponsorBlockEnabled,
      }}
    >
      {children}
      {/* Hidden Native YouTube Audio Engine (100% Works on Vercel without datacenter blocking) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 240,
          height: 180,
          opacity: 0.002,
          pointerEvents: 'none',
          zIndex: 1,
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
