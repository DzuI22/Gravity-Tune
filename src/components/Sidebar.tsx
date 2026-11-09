'use client';

import React from 'react';
import { Home, Users, Search, Heart, Music, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'favorites', label: 'Liked Songs', icon: Heart },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen p-5 fixed left-0 top-0 z-20 glass-panel border-r border-white/5">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Gravity<span className="text-rose-400">Tune</span>
          </h1>
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">
            Audiophile Client
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-400' : 'text-white/60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Playlists section */}
      <div className="mt-8 pt-6 border-t border-white/10 flex-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Your Library
        </p>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentTab('favorites')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="truncate">Favorites</span>
          </button>

          <button
            onClick={() => setCurrentTab('artists')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">All Artists Catalog</span>
          </button>

          <button
            onClick={() => setCurrentTab('home')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Music className="w-3.5 h-3.5 text-white/80" />
            </div>
            <span className="truncate">Global Top 50</span>
          </button>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="pt-4 border-t border-white/5 px-2">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/50 flex items-center justify-between">
          <span>Background Audio</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}
