'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AvatarButton } from './UserMenu';
import UserMenu from './UserMenu';

interface TopBarProps {
  onSearch: (query: string, type: 'song' | 'artist' | 'all') => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function TopBar({ onSearch, currentTab, setCurrentTab }: TopBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'song' | 'artist'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user.displayName === 'Guest' ? '' : `, ${user.displayName.split(' ')[0]}`;
    if (hour < 12) return `Good Morning${name} ☀️`;
    if (hour < 15) return `Good Afternoon${name} 🌤`;
    if (hour < 18) return `Good Evening${name} 🌇`;
    return `Good Night${name} 🌙`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim(), searchType);
      setCurrentTab('search');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-10 w-full glass-panel border-b border-white/5 px-5 py-3 flex items-center justify-between gap-4">
      {/* Search + Type Toggle */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              searchType === 'artist'
                ? 'Search by artist name...'
                : searchType === 'song'
                ? 'Search songs, albums...'
                : 'Search songs, artists, albums...'
            }
            className="w-full bg-white/10 hover:bg-white/14 focus:bg-white/18 text-white placeholder-white/40 text-sm rounded-full pl-10 pr-4 py-2.5 border border-white/10 focus:border-rose-400/50 outline-none transition-all"
          />
        </div>

        {/* Search Type Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 flex-shrink-0">
          {(['all', 'song', 'artist'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSearchType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                searchType === t ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : t === 'song' ? 'Songs' : 'Artists'}
            </button>
          ))}
        </div>
      </form>

      {/* Right Side: Greeting + User Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{getGreeting()}</span>
        </div>

        {/* User Avatar Button + Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <AvatarButton onClick={() => setShowUserMenu(prev => !prev)} />
          {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
        </div>
      </div>
    </header>
  );
}
