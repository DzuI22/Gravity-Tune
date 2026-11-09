'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song } from '@/types/music';

export type UserMode = 'guest' | 'user';
export interface UserProfile {
  mode: UserMode;
  displayName: string;
  avatar?: string;
  recentSongs: Song[];
}

const DEFAULT_GUEST: UserProfile = {
  mode: 'guest',
  displayName: 'Guest',
  recentSongs: [],
};

interface AuthContextType {
  user: UserProfile;
  isGuest: boolean;
  loginAsGuest: (name?: string) => void;
  loginAsUser: (displayName: string, avatar?: string) => void;
  logout: () => void;
  addRecentSong: (song: Song) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_GUEST);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gravity_tune_user');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Show auth modal on first visit
        setShowAuthModal(true);
      }
    } catch (_) {}
    setInitialized(true);
  }, []);

  const save = (profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem('gravity_tune_user', JSON.stringify(profile));
    } catch (_) {}
  };

  const loginAsGuest = (name?: string) => {
    save({ mode: 'guest', displayName: name || 'Guest', recentSongs: user.recentSongs });
    setShowAuthModal(false);
  };

  const loginAsUser = (displayName: string, avatar?: string) => {
    save({ mode: 'user', displayName, avatar, recentSongs: user.recentSongs });
    setShowAuthModal(false);
  };

  const logout = () => {
    save(DEFAULT_GUEST);
    setShowAuthModal(true);
    try { localStorage.removeItem('gravity_tune_user'); } catch (_) {}
  };

  const addRecentSong = (song: Song) => {
    setUser(prev => {
      const filtered = prev.recentSongs.filter(s => s.id !== song.id);
      const updated = { ...prev, recentSongs: [song, ...filtered].slice(0, 20) };
      try { localStorage.setItem('gravity_tune_user', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
  };

  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{
      user, isGuest: user.mode === 'guest',
      loginAsGuest, loginAsUser, logout,
      addRecentSong, showAuthModal, setShowAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
