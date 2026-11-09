'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SongCard from '@/components/SongCard';
import SongRow from '@/components/SongRow';
import ArtistView from '@/components/ArtistView';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { Song } from '@/types/music';
import { CURATED_ARTISTS, CuratedArtist } from '@/data/curatedArtists';
import { Play, Sparkles, Flame, Heart, Music, Disc3, Loader2, Users, Clock, Globe, Mic2 } from 'lucide-react';

interface ArtistCard {
  id: string;
  name: string;
  thumbnail: string;
}

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'home' | 'artists' | 'search' | 'favorites'>('home');
  const [artistFilter, setArtistFilter] = useState<'all' | 'indonesia' | 'international' | 'kpop'>('all');
  const [artistQuery, setArtistQuery] = useState('');
  const [trending, setTrending] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [searchSongs, setSearchSongs] = useState<Song[]>([]);
  const [searchArtists, setSearchArtists] = useState<ArtistCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'song' | 'artist'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistCard | null>(null);

  const { favorites, playSong } = usePlayer();
  const { user, addRecentSong } = useAuth();

  const playSongWithHistory = (song: Song, playlist?: Song[]) => {
    playSong(song, playlist);
    addRecentSong(song);
  };

  useEffect(() => {
    const fetchCharts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/charts');
        if (res.ok) {
          const data = await res.json();
          setTrending(data.trending || []);
          setQuickPicks(data.quickPicks || []);
        }
      } catch (err) {
        console.error('Failed to load charts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();
  }, []);

  const handleSearch = async (query: string, type: 'song' | 'artist' | 'all' = 'all') => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setSearchType(type);
    setCurrentTab('search');
    setSelectedArtist(null);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setSearchSongs(data.songs || []);
        setSearchArtists(data.artists || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const quickGenres = ['Lofi Beats', 'Top Indonesia', 'Pop Hits 2026', 'Synthwave', 'Acoustic', 'R&B Chill'];

  const filteredArtists = CURATED_ARTISTS.filter(artist => {
    const matchesCategory = artistFilter === 'all' || artist.category === artistFilter;
    const matchesSearch = !artistQuery.trim() || artist.name.toLowerCase().includes(artistQuery.toLowerCase()) || artist.genre.toLowerCase().includes(artistQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab as any);
          setSelectedArtist(null);
        }}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-36">
        <TopBar
          onSearch={handleSearch}
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab as any);
            setSelectedArtist(null);
          }}
        />

        <main className="flex-1 px-5 sm:px-8 py-7 max-w-7xl mx-auto w-full">

          {/* ACTIVE ARTIST DETAIL VIEW (OVERLAY FOR ANY TAB) */}
          {selectedArtist && (
            <ArtistView
              artistId={selectedArtist.id}
              artistName={selectedArtist.name}
              artistThumbnail={selectedArtist.thumbnail}
              onBack={() => setSelectedArtist(null)}
            />
          )}

          {/* HOME TAB */}
          {currentTab === 'home' && !selectedArtist && (
            <div className="space-y-10">
              {/* Hero Banner */}
              <div className="relative rounded-3xl p-7 sm:p-10 overflow-hidden glass-panel border border-white/10 shadow-2xl">
                <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    For {user.displayName}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Pure Sound. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400">
                      Background Ready.
                    </span>
                  </h2>
                  <p className="text-white/60 text-sm font-normal max-w-md">
                    Stream millions of tracks from top Indonesian & Global artists with live lyrics and nonstop background playback.
                  </p>
                  {trending.length > 0 && (
                    <button
                      onClick={() => playSongWithHistory(trending[0], trending)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-black" /> Play Top Chart
                    </button>
                  )}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none bg-gradient-to-l from-rose-500 to-transparent blur-3xl" />
              </div>

              {/* FEATURED ARTISTS HORIZONTAL CAROUSEL (INDONESIA & LUAR NEGERI) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-rose-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Artis Pilihan Populer</h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab('artists')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
                  >
                    Lihat Semua ({CURATED_ARTISTS.length}) →
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {CURATED_ARTISTS.slice(0, 14).map(artist => (
                    <button
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist)}
                      className="flex-shrink-0 flex flex-col items-center gap-2.5 p-3.5 rounded-2xl glass-panel border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group w-32"
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 shadow-lg group-hover:scale-105 transition-transform">
                        <img
                          src={artist.thumbnail}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="text-center w-full">
                        <p className="text-xs font-bold text-white truncate">{artist.name}</p>
                        <p className="text-[10px] text-white/50 truncate capitalize mt-0.5">{artist.genre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Genre Badges */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {quickGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleSearch(genre, 'all')}
                    className="flex-shrink-0 px-4 py-2 rounded-full glass-pill text-xs font-semibold text-white/80 hover:text-white transition-all hover:scale-105"
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  <p className="text-xs uppercase tracking-widest font-semibold">Tuning catalog...</p>
                </div>
              ) : (
                <>
                  {/* Recently Played */}
                  {user.recentSongs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <Clock className="w-5 h-5 text-white/50" />
                        <h3 className="text-lg font-bold text-white">Recently Played</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {user.recentSongs.slice(0, 6).map(song => (
                          <SongCard key={song.id} song={song} playlist={user.recentSongs} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Hits */}
                  {trending.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-5">
                        <Flame className="w-5 h-5 text-rose-500" />
                        <h3 className="text-xl font-bold text-white">Top Trending Hits</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {trending.slice(0, 10).map(song => (
                          <SongCard key={song.id} song={song} playlist={trending} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Picks */}
                  {quickPicks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-5">
                        <Disc3 className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">Quick Picks</h3>
                      </div>
                      <div className="glass-panel rounded-2xl p-2 border border-white/5">
                        {quickPicks.map((song, i) => (
                          <SongRow key={song.id} song={song} index={i} playlist={quickPicks} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ALL ARTISTS EXPLORER TAB (NEW!) */}
          {currentTab === 'artists' && !selectedArtist && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Users className="w-8 h-8 text-rose-400" />
                    Katalog Artis & Penyanyi
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    Jelajahi lagu lengkap dari musisi terbaik Indonesia dan Dunia.
                  </p>
                </div>

                {/* Filter Category Pills */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 flex-wrap">
                  {(['all', 'indonesia', 'international', 'kpop'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setArtistFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                        artistFilter === cat ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : cat === 'indonesia' ? 'Indonesia' : cat === 'international' ? 'Internasional' : 'K-Pop'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Filter Search Input */}
              <div className="max-w-md">
                <input
                  type="text"
                  value={artistQuery}
                  onChange={(e) => setArtistQuery(e.target.value)}
                  placeholder="Filter nama artis atau genre..."
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-white/40 text-sm rounded-2xl px-4 py-2.5 border border-white/10 focus:border-rose-400/50 outline-none transition-all"
                />
              </div>

              {/* Artists Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredArtists.map(artist => (
                  <button
                    key={artist.id}
                    onClick={() => setSelectedArtist(artist)}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl glass-panel border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group text-center"
                  >
                    <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white/10 shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                        {artist.name}
                      </p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/70">
                        {artist.genre}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH TAB */}
          {currentTab === 'search' && !selectedArtist && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Search Results</h2>
                {searchQuery && (
                  <p className="text-sm text-white/50 mt-1">
                    Showing {searchType !== 'all' ? searchType + ' results' : 'results'} for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>

              {isSearching ? (
                <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  <p className="text-xs font-semibold">Searching YouTube Music...</p>
                </div>
              ) : (
                <>
                  {/* Artists section */}
                  {searchArtists.length > 0 && searchType !== 'song' && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">Artists</h3>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {searchArtists.map(artist => (
                          <button
                            key={artist.id}
                            onClick={() => setSelectedArtist(artist)}
                            className="flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-2xl glass-panel border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group w-36"
                          >
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                              {artist.thumbnail ? (
                                <img src={artist.thumbnail} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              ) : (
                                <Users className="w-10 h-10 text-white/30" />
                              )}
                            </div>
                            <p className="text-xs font-bold text-white text-center leading-tight line-clamp-2">{artist.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Songs section */}
                  {searchSongs.length > 0 && searchType !== 'artist' && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <Music className="w-5 h-5 text-rose-400" />
                        <h3 className="text-lg font-bold text-white">Songs</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {searchSongs.slice(0, 5).map(song => (
                            <SongCard key={song.id} song={song} playlist={searchSongs} />
                          ))}
                        </div>
                        {searchSongs.length > 5 && (
                          <div className="glass-panel rounded-2xl p-2 border border-white/5">
                            {searchSongs.slice(5).map((song, i) => (
                              <SongRow key={song.id} song={song} index={i + 5} playlist={searchSongs} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {searchSongs.length === 0 && searchArtists.length === 0 && searchQuery && (
                    <div className="py-20 text-center text-white/40">
                      <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-semibold">No results found</p>
                      <p className="text-xs mt-1">Try searching for another artist or song title.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* FAVORITES TAB */}
          {currentTab === 'favorites' && !selectedArtist && (
            <div className="space-y-8">
              <div className="flex items-end gap-6 pb-6 border-b border-white/10">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-700 via-rose-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-rose-600/30">
                  <Heart className="w-14 h-14 text-white fill-white" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Playlist</p>
                  <h2 className="text-3xl sm:text-5xl font-black text-white">Liked Songs</h2>
                  <p className="text-sm text-white/50">{favorites.length} tracks • {user.displayName}</p>
                </div>
              </div>

              {favorites.length > 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => playSongWithHistory(favorites[0], favorites)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
                  >
                    <Play className="w-4 h-4 fill-white" /> Play All
                  </button>
                  <div className="glass-panel rounded-2xl p-2 border border-white/5">
                    {favorites.map((song, i) => (
                      <SongRow key={song.id} song={song} index={i} playlist={favorites} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-white/40">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No liked songs yet</p>
                  <p className="text-xs mt-1">Tap the ♥ on any song to save it here.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
