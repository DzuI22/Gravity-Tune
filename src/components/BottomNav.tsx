'use client';

import React from 'react';
import { Compass, Search, LayoutGrid } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'search' | 'library';
  onTabChange: (tab: 'home' | 'search' | 'library') => void;
}

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: LayoutGrid },
  ] as const;

  return (
    <div className="fixed bottom-2 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-[#1a1816]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] px-3 py-2 flex items-center gap-2 shadow-2xl shadow-black/80 max-w-sm w-full justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-[#d1e289] text-black font-extrabold shadow-lg shadow-[#d1e289]/20'
                  : 'text-[#9e9a8f] hover:text-[#ede9dc] font-semibold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
