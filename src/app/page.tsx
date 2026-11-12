'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Search,
  LayoutGrid,
  Clock,
  Newspaper,
  Settings,
  Play,
  Pause,
  Sparkles,
  Heart,
  Download,
  FolderOpen,
  TrendingUp,
  RefreshCw,
  Star,
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  Loader2,
  X,
  Globe,
  Bell,
  Radio,
  Check,
  Shuffle,
  Headphones
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { useVersion } from '@/context/VersionContext';
import { Song, PlaylistCard, PodcastEpisode, PodcastShow } from '@/types/music';
import { CURATED_ARTISTS, CuratedArtist } from '@/data/curatedArtists';
import { formatDuration, getHdThumbnail } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import StatsModal from '@/components/StatsModal';
import SettingsModal from '@/components/SettingsModal';
import NewsModal from '@/components/NewsModal';
import ArtistView from '@/components/ArtistView';
import SpotifyImportModal from '@/components/SpotifyImportModal';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'library'>('home');
  const [searchSubTab, setSearchSubTab] = useState<'explore' | 'suggestions'>('explore');
  const [librarySubTab, setLibrarySubTab] = useState<'library' | 'playlists' | 'podcast' | 'songs' | 'artists'>('library');
  const [activeLibrarySection, setActiveLibrarySection] = useState<'liked' | 'offline' | 'cached' | 'top50' | null>(null);

  // Data states
  const [trending, setTrending] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<PlaylistCard[]>([]);
  const [communityPlaylists, setCommunityPlaylists] = useState<PlaylistCard[]>([]);
  const [podcastShows, setPodcastShows] = useState<PodcastShow[]>([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('Feel good');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string; thumbnail?: string } | null>(null);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [showSupportToast, setShowSupportToast] = useState(false);
  const [isSpotifyImportOpen, setIsSpotifyImportOpen] = useState(false);

  const localFileInputRef = useRef<HTMLInputElement | null>(null);

  const { favorites, playSong, isPlaying, currentSong, togglePlay } = usePlayer();
  const { addRecentSong, user } = useAuth();
  const { version, setVersion, isV5, isV7, versionName } = useVersion();

  const playSongWithTracking = (song: Song, playlist?: Song[]) => {
    playSong(song, playlist);
    addRecentSong(song);
    try {
      const plays = parseInt(localStorage.getItem('gravity_total_plays') || '12', 10);
      localStorage.setItem('gravity_total_plays', (plays + 1).toString());
    } catch (_) {}
  };

  // Fetch Initial Charts
  useEffect(() => {
    const fetchCharts = async () => {
      setIsLoading(true);
      try {
        const [chartsRes, commRes, podRes] = await Promise.allSettled([
          fetch('/api/charts').then(r => r.json()),
          fetch('/api/community').then(r => r.json()),
          fetch('/api/podcasts').then(r => r.json()),
        ]);

        if (chartsRes.status === 'fulfilled') {
          setTrending(chartsRes.value.trending || []);
          setQuickPicks(chartsRes.value.quickPicks || []);
        }

        if (commRes.status === 'fulfilled') {
          setFeaturedPlaylists(commRes.value.featured || []);
          setCommunityPlaylists(commRes.value.community || []);
        }

        if (podRes.status === 'fulfilled') {
          setPodcastShows(podRes.value.shows || []);
          setPodcastEpisodes(podRes.value.episodes || []);
        }
      } catch (err) {
        console.error('Failed to load charts and community', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();

    // Auto-play from shared song URL parameter ?song=ID
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const songId = params.get('song');
      if (songId) {
        fetch(`/api/search?q=${encodeURIComponent(songId)}&type=song`)
          .then(r => r.json())
          .then(d => {
            if (d.songs && d.songs.length > 0) {
              const matched = d.songs.find((s: Song) => s.id === songId) || d.songs[0];
              playSongWithTracking(matched);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=song`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.songs || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Mood filter query
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setIsSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(mood + ' songs')}&type=song`)
      .then(r => r.json())
      .then(d => {
        if (d.songs && d.songs.length > 0) {
          setQuickPicks(d.songs);
        }
      })
      .catch(() => {})
      .finally(() => setIsSearching(false));
  };

  // Local file upload handler
  const handleLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    const localSong: Song = {
      id: 'local_' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Device Audio',
      duration: 180,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    };
    playSongWithTracking(localSong);
  };

  const moodPills = ['Feel good', 'Relax', 'Energize', 'Commute', 'Sad', 'Romance', 'Focus', 'Party'];

  const moodGenres = [
    { name: 'Chill', color: 'from-[#41628d] to-[#263e5c]', bg: '#41628d', query: 'Chill Lo-Fi' },
    {
      name: 'Commute',
      color: 'from-[#b38524] to-[#735313]',
      bg: '#b38524',
      query: 'Hip Hop and R&B',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop'
    },
    { name: 'Energize', color: 'from-[#a18a38] to-[#69581f]', bg: '#a18a38', query: 'Workout Energetic Hits' },
    {
      name: 'Feel good',
      color: 'from-[#3b8c56] to-[#235735]',
      bg: '#3b8c56',
      query: 'Sunshine Indie Feel Good',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
    },
    { name: 'Focus', color: 'from-[#4c545b] to-[#2d3238]', bg: '#4c545b', query: 'Deep Focus Instrumental' },
    { name: 'Gaming', color: 'from-[#2b2d30] to-[#17181a]', bg: '#2b2d30', query: 'Electronic Gaming EDM' },
    { name: 'Party', color: 'from-[#674ea7] to-[#3e2d6b]', bg: '#674ea7', query: 'Party Dance Hits' },
    {
      name: 'Romance',
      color: 'from-[#8e2b2b] to-[#591616]',
      bg: '#8e2b2b',
      query: 'Romantic Love Pop',
      img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=200&fit=crop'
    },
  ];

  const heroSong = quickPicks[0] || trending[0] || {
    id: 'hero_1',
    title: 'Tipu Daya',
    artist: 'The Panturas',
    album: 'Ombak Banyu Asmara',
    duration: 215,
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&h=400&fit=crop',
  };

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-[#ede9dc] font-sans pb-44 sm:pb-36 transition-colors duration-500">
      {/* Top Header (Matches Photos 1, 2, 3) */}
      <header className="sticky top-0 z-30 bg-[#0e0d0c]/90 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-6xl mx-auto">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setSelectedArtist(null);
            setCurrentTab('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-[#d1e289]/20 group-hover:scale-105 transition-transform flex-shrink-0 border border-white/10">
            <img src="/logo.png" alt="GravityTune" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-[#ede9dc]">
              Gravity<span className="text-[#d1e289]">Tune</span>
            </span>
            {/* Version Badge Switcher */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVersion(version === '7.5.3' ? '5.1.0' : version === '5.1.0' ? '2.5.0' : '7.5.3');
              }}
              title={`Klik untuk berganti versi (Aktif: v${version}). Klik untuk pindah ke v${isV5 ? '2.5.0' : '5.1.0'}`}
              className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase transition-all active:scale-90 border shadow-sm flex items-center gap-1 bg-[#1a1816] hover:bg-white/10 text-[#d1e289] border-[#d1e289]/40 hover:border-[#d1e289]"
            >
              <span>v{version}</span>
              <span className="text-[8px] text-white/50 lowercase">({isV5 ? 'v5' : 'v2'})</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Home, Search, Library) - Hanya tampil di PC/Laptop */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#1a1816] border border-white/10 rounded-full p-1 shadow-inner">
          {[
            { id: 'home', label: 'Home', icon: Compass },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'library', label: 'Library', icon: LayoutGrid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id && !selectedArtist;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedArtist(null);
                  setCurrentTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 active:scale-95 ${
                  isActive
                    ? 'bg-[#d1e289] text-black shadow-md shadow-[#d1e289]/20'
                    : 'text-[#9e9a8f] hover:text-[#ede9dc] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Stats Clock Icon */}
          <button
            onClick={() => setIsStatsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 text-[#ede9dc]/80 hover:text-white flex items-center justify-center transition-all"
            title="Listening Stats & 2026 Recap"
          >
            <Clock className="w-5 h-5" />
          </button>

          {/* Newspaper News Icon */}
          <button
            onClick={() => setIsNewsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 text-[#ede9dc]/80 hover:text-white flex items-center justify-center transition-all"
            title="What's New"
          >
            <Newspaper className="w-5 h-5" />
          </button>

          {/* Alert / Notice Icon */}
          <button
            onClick={() => setIsNewsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 text-[#ede9dc]/80 hover:text-white flex items-center justify-center transition-all relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#d1e289]" />
          </button>

          {/* Settings Gear Icon */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 text-[#ede9dc]/80 hover:text-white flex items-center justify-center transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-4">
        {/* If Artist View is Active */}
        {selectedArtist ? (
          <ArtistView
            artistId={selectedArtist.id}
            artistName={selectedArtist.name}
            artistThumbnail={selectedArtist.thumbnail}
            onBack={() => setSelectedArtist(null)}
          />
        ) : currentTab === 'home' ? (
          /* ========================================================
             HOME TAB (Matches Photos 3 & 4)
             ======================================================== */
          <div className="space-y-7 animate-in fade-in duration-300">
            {/* Mood Pills Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {moodPills.map(mood => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
                    selectedMood === mood
                      ? 'bg-[#d1e289] text-black border-[#d1e289] shadow-md shadow-[#d1e289]/20'
                      : 'bg-[#1b1917] text-[#ede9dc]/70 hover:text-white border-white/5 hover:bg-white/10'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>

            {/* Quick Picks Hero Card (Matches Tipu Daya in Photo 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#ede9dc] tracking-tight">Quick picks</h3>
              </div>

              <div
                onClick={() => playSongWithTracking(heroSong, quickPicks)}
                className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-[#1a1917] border border-white/10 shadow-2xl cursor-pointer group"
              >
                <img
                  src={getHdThumbnail(heroSong.thumbnail, heroSong.id)}
                  alt={heroSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-7">
                  <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#d1e289] mb-1">
                    {heroSong.album || 'FEATURED TRACK'}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-white truncate leading-tight">
                    {heroSong.title}
                  </h2>
                  <p className="text-sm sm:text-base font-semibold text-white/70 truncate mt-0.5">
                    {heroSong.artist}
                  </p>
                </div>

                {/* Big Floating Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSongWithTracking(heroSong, quickPicks);
                  }}
                  className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-[#d1e289] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/80"
                >
                  {currentSong?.id === heroSong.id && isPlaying ? (
                    <Pause className="w-6 h-6 fill-black" />
                  ) : (
                    <Play className="w-6 h-6 fill-black ml-1" />
                  )}
                </button>
              </div>

              {/* Quick Picks 8-Song List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {quickPicks.slice(1, 9).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSongWithTracking(song, quickPicks)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 cursor-pointer transition-all active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img src={getHdThumbnail(song.thumbnail, song.id)} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
                          {song.title}
                        </p>
                        <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-[#9e9a8f] hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* New Releases & Trending Carousel */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#ede9dc] tracking-tight">New releases & Trending</h3>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f]" />
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {trending.slice(0, 16).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSongWithTracking(song, trending)}
                    className="w-36 sm:w-44 flex-shrink-0 cursor-pointer group"
                  >
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#1b1917]/80 backdrop-blur-xl border border-white/10 shadow-lg mb-2">
                      <img
                        src={getHdThumbnail(song.thumbnail, song.id)}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#d1e289] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289] transition-colors">
                      {song.title}
                    </p>
                    <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Playlists Cards (Hanya Tampil di Mode v5.1.0) */}
            {(isV5 || isV7) && featuredPlaylists.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#ede9dc] tracking-tight">Featured Playlists</h3>
                  <span className="text-xs font-semibold text-[#9e9a8f]">Curated by YouTube Music</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {featuredPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSearch(pl.title)}
                      className="w-48 sm:w-56 flex-shrink-0 p-3.5 rounded-3xl bg-[#1b1917]/80 backdrop-blur-2xl border border-white/10 hover:border-[#d1e289]/40 transition-all cursor-pointer group shadow-xl active:scale-95"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-black/40">
                        <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d1e289] text-black inline-block">
                            Featured
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc] group-hover:text-[#d1e289] truncate">
                        {pl.title}
                      </h4>
                      <p className="text-xs text-[#9e9a8f] truncate mt-0.5 font-medium">
                        {pl.description || pl.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Section Feed (Hanya Tampil di Mode v5.1.0) */}
            {(isV5 || isV7) && communityPlaylists.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#ede9dc] tracking-tight">From the Community</h3>
                  <span className="text-xs font-semibold text-[#d1e289]">Komunitas & Creator</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {communityPlaylists.map((comm) => (
                    <div
                      key={comm.id}
                      onClick={() => handleSearch(comm.title)}
                      className="p-3 rounded-2xl bg-[#1b1917]/75 backdrop-blur-xl border border-white/10 hover:border-white/20 flex items-center gap-3.5 cursor-pointer group transition-all active:scale-[0.99]"
                    >
                      <img src={comm.thumbnail} alt={comm.title} className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] truncate">
                          {comm.title}
                        </h4>
                        <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                          {comm.author} • {comm.songCount} lagu
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#d1e289] group-hover:text-black text-white/50 flex items-center justify-center transition-all flex-shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keep Listening Circular Artist Avatars (Semua 35+ Artis Lengkap!) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#ede9dc] tracking-tight">Keep listening (Top Artists)</h3>
                <span className="text-xs font-semibold text-[#9e9a8f]">{CURATED_ARTISTS.length} Artis</span>
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
                {CURATED_ARTISTS.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => setSelectedArtist({ id: artist.id, name: artist.name, thumbnail: artist.thumbnail })}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/10 group-hover:border-[#d1e289] transition-all shadow-xl group-hover:scale-105">
                      <img src={getHdThumbnail(artist.thumbnail)} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-[#ede9dc] mt-2 truncate max-w-[84px] text-center group-hover:text-[#d1e289]">
                      {artist.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : currentTab === 'search' ? (
          /* ========================================================
             SEARCH & EXPLORE TAB (Matches Photos 2 & 4)
             ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Bar with Globe Icon & Clear Button */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search YouTube Music"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full py-3.5 pl-12 pr-20 rounded-full bg-[#1b1917] border border-white/10 text-sm font-semibold text-[#ede9dc] placeholder-[#9e9a8f] focus:outline-none focus:border-[#d1e289] transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-[#9e9a8f] absolute left-4 top-1/2 -translate-y-1/2" />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-[#9e9a8f] hover:text-white transition-all active:scale-90"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch('Top Global Music')}
                  className="p-1 text-[#9e9a8f] hover:text-white transition-colors"
                  title="Global"
                >
                  <Globe className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subtabs: Explore & Suggestions (Photo 2) */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-2">
              <button
                onClick={() => setSearchSubTab('explore')}
                className={`flex items-center gap-2 pb-2 text-sm font-extrabold transition-all relative ${
                  searchSubTab === 'explore' ? 'text-[#d1e289]' : 'text-[#9e9a8f] hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
                {searchSubTab === 'explore' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d1e289] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setSearchSubTab('suggestions')}
                className={`flex items-center gap-2 pb-2 text-sm font-extrabold transition-all relative ${
                  searchSubTab === 'suggestions' ? 'text-[#d1e289]' : 'text-[#9e9a8f] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Suggestions</span>
                {searchSubTab === 'suggestions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d1e289] rounded-full" />
                )}
              </button>
            </div>

            {/* Search Results if user searched */}
            {searchResults.length > 0 && searchQuery ? (
              <div className="space-y-3">
                <h3 className="text-lg font-extrabold text-[#ede9dc]">
                  Hasil Pencarian untuk "{searchQuery}"
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {searchResults.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSongWithTracking(song, searchResults)}
                      className="p-3 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <img src={getHdThumbnail(song.thumbnail, song.id)} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289]">
                          {song.title}
                        </p>
                        <p className="text-xs text-[#9e9a8f] truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs font-bold text-[#9e9a8f]">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchSubTab === 'explore' ? (
              /* Mood & Genres 8 Colorful Grid Cards (Photo 2) */
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-[#ede9dc]">Mood & Genres</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {moodGenres.map((genre) => (
                    <div
                      key={genre.name}
                      onClick={() => handleSearch(genre.query)}
                      className="relative h-24 sm:h-28 rounded-3xl p-4 overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-all group border border-white/10"
                      style={{ backgroundColor: genre.bg }}
                    >
                      <h4 className="text-base sm:text-lg font-black text-white relative z-10">
                        {genre.name}
                      </h4>
                      {genre.img ? (
                        <img
                          src={genre.img}
                          alt={genre.name}
                          className="absolute right-2 bottom-2 w-14 h-14 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="absolute right-2 bottom-2 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Suggestions Tab: "Unique Songs" Ranked List (Photo 4 Right) */
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-[#ede9dc]">Unique Songs</h3>
                <div className="space-y-2">
                  {(trending.length > 0 ? trending : quickPicks).slice(0, 10).map((song, i) => (
                    <div
                      key={song.id + i}
                      onClick={() => playSongWithTracking(song, trending)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-sm font-extrabold text-[#9e9a8f] w-5 text-center">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-[#ede9dc] truncate group-hover:text-[#d1e289]">
                            {song.title}
                          </p>
                          <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                            {song.artist} • {formatDuration(song.duration)}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-[#9e9a8f] hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             LIBRARY TAB (Matches Photos 1 & 6)
             ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Filter Pills: Library, Playlists, Podcast, Songs, Artists */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {((!isV5 && !isV7) ? ['library', 'playlists', 'songs', 'artists'] : ['library', 'playlists', 'podcast', 'songs', 'artists']).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setLibrarySubTab(tab as any);
                    setActiveLibrarySection(null);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize whitespace-nowrap transition-all active:scale-95 border ${
                    librarySubTab === tab && !activeLibrarySection
                      ? 'bg-[#d1e289] text-black border-[#d1e289] shadow-md shadow-[#d1e289]/20'
                      : 'bg-[#1b1917] text-[#ede9dc]/70 hover:text-white border-white/5 hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* If user clicked a specific library section (e.g. Liked songs) */}
            {activeLibrarySection ? (
              <div className="space-y-4">
                <button
                  onClick={() => setActiveLibrarySection(null)}
                  className="flex items-center gap-2 text-xs font-bold text-[#d1e289] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Library
                </button>
                <h3 className="text-2xl font-black text-[#ede9dc]">
                  {activeLibrarySection === 'liked' ? 'Liked songs' : 'Top 50 All Time'}
                </h3>
                <div className="space-y-2">
                  {(activeLibrarySection === 'liked' ? favorites : trending).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSongWithTracking(song)}
                      className="p-3 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <img src={getHdThumbnail(song.thumbnail, song.id)} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289]">
                          {song.title}
                        </p>
                        <p className="text-xs text-[#9e9a8f] truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs font-bold text-[#9e9a8f]">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : librarySubTab === 'playlists' ? (
              /* Playlists View (Photo 6) */
              <div className="space-y-4">
                {/* Most Played Card */}
                <div className="p-4 rounded-3xl bg-[#1f1d1a] border border-white/5 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={quickPicks[0]?.thumbnail || heroSong.thumbnail}
                      alt={quickPicks[0]?.title || heroSong.title}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md"
                    />
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#9e9a8f] mb-0.5">
                        <Star className="w-3 h-3 fill-[#d1e289] text-[#d1e289]" />
                        <span>MOST PLAYED</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#ede9dc] truncate">
                        {quickPicks[0]?.title || heroSong.title}
                      </h4>
                      <p className="text-xs text-[#9e9a8f] font-semibold mt-0.5">
                        {favorites.length > 0 ? `${favorites.length} songs` : '1 song'}
                      </p>
                      <button
                        onClick={() => playSongWithTracking(quickPicks[0] || heroSong, quickPicks)}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ede9dc] text-black text-xs font-black hover:bg-[#d1e289] transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play all</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => playSongWithTracking(quickPicks[0] || heroSong, quickPicks)}
                    className="w-11 h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                    title="Shuffle"
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-extrabold text-[#9e9a8f] uppercase tracking-wider">Your Playlists</h4>
                    {isV7 && (
                      <button
                        onClick={() => setIsSpotifyImportOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] text-xs font-bold border border-[#1DB954]/30 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Import Spotify</span>
                      </button>
                    )}
                  </div>
                  <div
                    onClick={() => setActiveLibrarySection('liked')}
                    className="p-3.5 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <Heart className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289]">Liked Songs Playlist</h5>
                        <p className="text-xs text-[#9e9a8f]">{favorites.length} tracks</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#9e9a8f]" />
                  </div>

                  <div
                    onClick={() => setActiveLibrarySection('top50')}
                    className="p-3.5 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#d1e289]/20 text-[#d1e289] flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289]">Top 50 All Time</h5>
                        <p className="text-xs text-[#9e9a8f]">Auto-generated • 50 tracks</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#9e9a8f]" />
                  </div>
                </div>
              </div>
            ) : librarySubTab === 'podcast' ? (
              /* Podcast View (v5.1.0 Full Dedicated Podcast Experience) */
              <div className="space-y-6">
                {/* Popular Podcast Shows Carousel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#9e9a8f] uppercase tracking-wider px-1">Top Podcast Shows</h4>
                    <span className="text-xs font-semibold text-[#d1e289]">YouTube Podcasts</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {podcastShows.map((show) => (
                      <div
                        key={show.id}
                        onClick={() => handleSearch(show.title)}
                        className="w-40 sm:w-48 flex-shrink-0 p-3 rounded-3xl bg-[#1b1917]/80 backdrop-blur-xl border border-white/10 hover:border-[#d1e289]/40 cursor-pointer group transition-all"
                      >
                        <img src={show.thumbnail} alt={show.title} className="w-full aspect-square rounded-2xl object-cover mb-2.5 shadow-md group-hover:scale-105 transition-transform" />
                        <h5 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] truncate">{show.title}</h5>
                        <p className="text-xs text-[#9e9a8f] truncate mt-0.5">{show.author}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Podcast Episodes Stream with Resume/Duration */}
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-[#9e9a8f] uppercase tracking-wider px-1">Latest Podcast Episodes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {podcastEpisodes.map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => playSongWithTracking({
                          id: ep.id,
                          title: ep.title,
                          artist: ep.author,
                          thumbnail: ep.thumbnail,
                          duration: ep.duration,
                          durationFormatted: ep.durationFormatted,
                        })}
                        className="p-3.5 rounded-2xl bg-[#1b1917]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 flex items-center gap-3.5 cursor-pointer group transition-all active:scale-[0.99]"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/40">
                          <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 fill-white text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] line-clamp-1">{ep.title}</h5>
                          <p className="text-xs text-[#9e9a8f] truncate mt-0.5">{ep.author}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#d1e289]">
                              {ep.durationFormatted}
                            </span>
                            <span className="text-[10px] text-[#9e9a8f] font-medium">Full Episode</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : librarySubTab === 'artists' ? (
              /* Artists View */
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#9e9a8f] uppercase tracking-wider px-1">Followed Artists</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CURATED_ARTISTS.map(artist => (
                    <div
                      key={artist.id}
                      onClick={() => setSelectedArtist({ id: artist.id, name: artist.name, thumbnail: artist.thumbnail })}
                      className="p-4 rounded-3xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex flex-col items-center text-center cursor-pointer group transition-all"
                    >
                      <img src={artist.thumbnail} alt={artist.name} className="w-20 h-20 rounded-full object-cover mb-2.5 border-2 border-white/10 group-hover:border-[#d1e289] transition-all" />
                      <h5 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] truncate max-w-full">{artist.name}</h5>
                      <p className="text-xs text-[#9e9a8f] mt-0.5">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : librarySubTab === 'songs' ? (
              /* All Songs / Liked Songs View */
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#9e9a8f] uppercase tracking-wider px-1">All Songs ({favorites.length || trending.length})</h4>
                <div className="space-y-2">
                  {(favorites.length > 0 ? favorites : trending).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSongWithTracking(song)}
                      className="p-3 rounded-2xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <img src={getHdThumbnail(song.thumbnail, song.id)} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289]">
                          {song.title}
                        </p>
                        <p className="text-xs text-[#9e9a8f] truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs font-bold text-[#9e9a8f]">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Most Played Card on Library home (Photo 6) */}
                <div className="p-4 rounded-3xl bg-[#1f1d1a] border border-white/5 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={quickPicks[0]?.thumbnail || heroSong.thumbnail}
                      alt={quickPicks[0]?.title || heroSong.title}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md"
                    />
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#9e9a8f] mb-0.5">
                        <Star className="w-3 h-3 fill-[#d1e289] text-[#d1e289]" />
                        <span>MOST PLAYED</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#ede9dc] truncate">
                        {quickPicks[0]?.title || heroSong.title}
                      </h4>
                      <p className="text-xs text-[#9e9a8f] font-semibold mt-0.5">
                        1 song
                      </p>
                      <button
                        onClick={() => playSongWithTracking(quickPicks[0] || heroSong, quickPicks)}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ede9dc] text-black text-xs font-black hover:bg-[#d1e289] transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play all</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => playSongWithTracking(quickPicks[0] || heroSong, quickPicks)}
                    className="w-11 h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#ede9dc]/70 hover:text-white flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                    title="Shuffle"
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                </div>

                {/* 5 Quick Access Cards (Photo 1) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Liked songs */}
                  <div
                    onClick={() => setActiveLibrarySection('liked')}
                    className="p-4 rounded-3xl bg-[#251f1f] hover:bg-[#302727] border border-rose-500/10 cursor-pointer transition-all active:scale-95 space-y-2 shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc]">Liked songs</h4>
                      <p className="text-xs text-[#9e9a8f]">{favorites.length} tracks</p>
                    </div>
                  </div>

                  {/* Offline */}
                  <div className="p-4 rounded-3xl bg-[#1f221f] hover:bg-[#272c27] border border-emerald-500/10 cursor-pointer transition-all active:scale-95 space-y-2 shadow-lg">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc]">Offline</h4>
                      <p className="text-xs text-[#9e9a8f]">Downloaded</p>
                    </div>
                  </div>

                  {/* Cached */}
                  <div className="p-4 rounded-3xl bg-[#1f2123] hover:bg-[#262a2d] border border-sky-500/10 cursor-pointer transition-all active:scale-95 space-y-2 shadow-lg">
                    <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc]">Cached</h4>
                      <p className="text-xs text-[#9e9a8f]">Instant playback</p>
                    </div>
                  </div>

                  {/* Local Files */}
                  <div
                    onClick={() => localFileInputRef.current?.click()}
                    className="p-4 rounded-3xl bg-[#23211d] hover:bg-[#2d2923] border border-amber-500/10 cursor-pointer transition-all active:scale-95 space-y-2 shadow-lg"
                  >
                    <input
                      ref={localFileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleLocalFiles}
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc]">Local Files</h4>
                      <p className="text-xs text-[#9e9a8f]">On device</p>
                    </div>
                  </div>

                  {/* My top 50 (Full width on mobile grid) */}
                  <div
                    onClick={() => setActiveLibrarySection('top50')}
                    className="col-span-2 p-4 rounded-3xl bg-[#1b1917] hover:bg-[#252220] border border-white/5 cursor-pointer transition-all active:scale-95 space-y-2 shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#d1e289]/20 text-[#d1e289] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#ede9dc]">My top 50</h4>
                      <p className="text-xs text-[#9e9a8f]">All time</p>
                    </div>
                  </div>
                </div>

                {/* Support GravityTune Banner */}
                <div
                  onClick={() => {
                    setShowSupportToast(true);
                    setTimeout(() => setShowSupportToast(false), 3000);
                  }}
                  className="p-5 rounded-3xl bg-[#525516] hover:bg-[#5f631a] border border-[#d1e289]/30 text-white cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-4 shadow-xl"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 fill-white text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      Support GravityTune ❤️
                    </h4>
                    <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                      Suka dengan aplikasi ini? Ketuk untuk mendukung pengembangan GravityTune.
                    </p>
                  </div>
                  <Play className="w-5 h-5 fill-white flex-shrink-0" />
                </div>

                {/* Recently Played */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xl font-extrabold text-[#ede9dc]">Recently Played</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {(favorites.length > 0 ? favorites : trending).slice(0, 6).map((song) => (
                      <div
                        key={song.id}
                        onClick={() => playSongWithTracking(song)}
                        className="w-32 sm:w-40 flex-shrink-0 cursor-pointer group"
                      >
                        <img
                          src={song.thumbnail}
                          className="w-full aspect-square rounded-2xl object-cover mb-2 group-hover:scale-105 transition-transform"
                        />
                        <p className="text-xs font-bold text-[#ede9dc] truncate group-hover:text-[#d1e289]">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-[#9e9a8f] truncate">{song.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Support Toast */}
      {showSupportToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#d1e289] text-black font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
          Terima kasih atas dukungan Anda terhadap GravityTune! ❤️
        </div>
      )}

      {/* Floating Bottom Navigation Bar (Photos 1, 2, 3) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedArtist(null);
          setCurrentTab(tab);
        }}
      />

      {/* Modals */}
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenStats={() => setIsStatsOpen(true)}
      />
      <NewsModal isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
    </div>
  );
}
