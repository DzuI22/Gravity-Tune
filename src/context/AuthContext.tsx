'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song } from '@/types/music';

export type UserMode = 'guest' | 'google';

export interface UserAccount {
  id: string;
  mode: UserMode;
  displayName: string;
  email?: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile extends UserAccount {
  recentSongs: Song[];
}

const DEFAULT_GUEST: UserProfile = {
  id: 'guest_default',
  mode: 'guest',
  displayName: 'Guest User',
  email: '',
  createdAt: new Date().toISOString(),
  recentSongs: [],
};

interface RecordLoginPayload {
  type: 'guest' | 'google';
  username: string;
  email?: string;
}

interface AuthContextType {
  user: UserProfile;
  accounts: UserAccount[];
  isGuest: boolean;
  loginAsGuest: (name?: string) => Promise<void>;
  loginWithGoogle: (email: string, name: string, avatar?: string) => Promise<void>;
  switchAccount: (accountId: string) => void;
  removeAccount: (accountId: string) => void;
  logout: () => void;
  addRecentSong: (song: Song) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  recordStatus: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to record login to Google Spreadsheet
async function recordLoginToSheet(payload: RecordLoginPayload) {
  try {
    const res = await fetch('/api/auth/record-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to record login to Google Sheet:', err);
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_GUEST);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [recordStatus, setRecordStatus] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount (Default directly to Guest, NO FORCED MODAL ON STARTUP!)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gravitytune_current_user');
      const savedAccounts = localStorage.getItem('gravitytune_accounts');

      let currentAccList: UserAccount[] = [];
      if (savedAccounts) {
        currentAccList = JSON.parse(savedAccounts);
        setAccounts(currentAccList);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default to Guest silently without popup
        const defaultGuestAcc: UserAccount = {
          id: 'guest_' + Date.now(),
          mode: 'guest',
          displayName: 'Guest User',
          createdAt: new Date().toISOString(),
        };
        const initialProfile: UserProfile = {
          ...defaultGuestAcc,
          recentSongs: [],
        };
        setUser(initialProfile);
        setAccounts([defaultGuestAcc]);
        localStorage.setItem('gravitytune_current_user', JSON.stringify(initialProfile));
        localStorage.setItem('gravitytune_accounts', JSON.stringify([defaultGuestAcc]));
      }
    } catch (_) {}
    setInitialized(true);
  }, []);

  const saveState = (newProfile: UserProfile, newAccounts?: UserAccount[]) => {
    setUser(newProfile);
    try {
      localStorage.setItem('gravitytune_current_user', JSON.stringify(newProfile));
      if (newAccounts) {
        setAccounts(newAccounts);
        localStorage.setItem('gravitytune_accounts', JSON.stringify(newAccounts));
      }
    } catch (_) {}
  };

  const loginAsGuest = async (name?: string) => {
    const guestName = (name && name.trim()) || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const newGuestAcc: UserAccount = {
      id: 'guest_' + Date.now(),
      mode: 'guest',
      displayName: guestName,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts.filter(a => a.displayName.toLowerCase() !== guestName.toLowerCase()),
      newGuestAcc,
    ];

    const updatedProfile: UserProfile = {
      ...newGuestAcc,
      recentSongs: user.recentSongs,
    };

    saveState(updatedProfile, updatedAccounts);
    setShowAuthModal(false);

    // Record login to Google Sheet Column A
    setRecordStatus('Menyimpan ke Google Sheets...');
    const ok = await recordLoginToSheet({
      type: 'guest',
      username: guestName,
    });
    setRecordStatus(ok ? 'Tersimpan di Google Sheets!' : 'Gagal sinkron Google Sheets');
    setTimeout(() => setRecordStatus(null), 3000);
  };

  const loginWithGoogle = async (email: string, name: string, avatar?: string) => {
    const googleName = name.trim() || email.split('@')[0];
    const newGoogleAcc: UserAccount = {
      id: 'google_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      mode: 'google',
      displayName: googleName,
      email: email.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts.filter(a => a.email?.toLowerCase() !== email.toLowerCase()),
      newGoogleAcc,
    ];

    const updatedProfile: UserProfile = {
      ...newGoogleAcc,
      recentSongs: user.recentSongs,
    };

    saveState(updatedProfile, updatedAccounts);
    setShowAuthModal(false);

    // Record login to Google Sheet Column C (Email) & Column D (Username)
    setRecordStatus('Menyimpan ke Google Sheets...');
    const ok = await recordLoginToSheet({
      type: 'google',
      email: email.trim(),
      username: googleName,
    });
    setRecordStatus(ok ? 'Tersimpan di Google Sheets!' : 'Gagal sinkron Google Sheets');
    setTimeout(() => setRecordStatus(null), 3000);
  };

  const switchAccount = (accountId: string) => {
    const target = accounts.find(a => a.id === accountId);
    if (!target) return;
    const updatedProfile: UserProfile = {
      ...target,
      recentSongs: user.recentSongs,
    };
    saveState(updatedProfile);
  };

  const removeAccount = (accountId: string) => {
    const filtered = accounts.filter(a => a.id !== accountId);
    let nextAccList = filtered;
    if (nextAccList.length === 0) {
      nextAccList = [DEFAULT_GUEST];
    }
    const nextUser = (user.id === accountId) ? { ...nextAccList[0], recentSongs: user.recentSongs } : user;
    saveState(nextUser, nextAccList);
  };

  const logout = () => {
    // Revert back to guest mode
    const defaultGuest: UserProfile = {
      id: 'guest_' + Date.now(),
      mode: 'guest',
      displayName: 'Guest User',
      createdAt: new Date().toISOString(),
      recentSongs: user.recentSongs,
    };
    saveState(defaultGuest);
  };

  const addRecentSong = (song: Song) => {
    setUser(prev => {
      const filtered = prev.recentSongs.filter(s => s.id !== song.id);
      const updated = { ...prev, recentSongs: [song, ...filtered].slice(0, 30) };
      try {
        localStorage.setItem('gravitytune_current_user', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  if (!initialized) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        isGuest: user.mode === 'guest',
        loginAsGuest,
        loginWithGoogle,
        switchAccount,
        removeAccount,
        logout,
        addRecentSong,
        showAuthModal,
        setShowAuthModal,
        recordStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
