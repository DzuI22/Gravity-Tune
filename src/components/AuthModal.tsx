'use client';

import React, { useState } from 'react';
import { Sparkles, User, ArrowRight, X, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginAsGuest, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<'choose' | 'google' | 'guest'>('choose');
  const [guestName, setGuestName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const handleGuestSubmit = async () => {
    setIsSubmitting(true);
    await loginAsGuest(guestName);
    setIsSubmitting(false);
  };

  const handleGoogleSubmit = async () => {
    if (!googleEmail.trim()) return;
    setIsSubmitting(true);
    await loginWithGoogle(googleEmail, googleName);
    setIsSubmitting(false);
  };

  const handleSkip = () => {
    loginAsGuest();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={handleSkip} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[#161413] rounded-3xl p-7 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Skip / Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-600 flex items-center justify-center shadow-xl shadow-teal-500/20 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Masuk ke Gravity<span className="text-teal-400">Tune</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">Pilih mode akun untuk melanjutkan</p>
        </div>

        {/* Step 1: Choose mode */}
        {step === 'choose' && (
          <div className="space-y-3.5">
            {/* Google Option */}
            <button
              onClick={() => setStep('google')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-200 hover:scale-[1.01] group text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm">Masuk dengan Akun Google</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Tersinkronisasi & tercatat ke Google Sheets
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 ml-auto group-hover:text-white transition-colors" />
            </button>

            {/* Guest Option */}
            <button
              onClick={() => setStep('guest')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-200 hover:scale-[1.01] group text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm">Lanjut sebagai Akun Guest</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Tanpa Google login · Favorit tersimpan di perangkat
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 ml-auto group-hover:text-white transition-colors" />
            </button>

            <p className="text-[11px] text-white/30 text-center pt-2">
              Tidak wajib login untuk mendengarkan musik
            </p>
          </div>
        )}

        {/* Step 2: Google Sign-in Info */}
        {step === 'google' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-white/10">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Login Akun Google</h2>
              <p className="text-xs text-white/40 mt-0.5">
                Data akan tersimpan otomatis ke Google Sheets
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Email Google</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-teal-400">
                  <Mail className="w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="namaanda@gmail.com"
                    className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Nama Tampilan (Opsional)</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 focus-within:border-teal-400">
                  <User className="w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="Nama Anda"
                    className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/60 text-xs font-semibold hover:bg-white/5"
              >
                Kembali
              </button>
              <button
                onClick={handleGoogleSubmit}
                disabled={!googleEmail.trim() || isSubmitting}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40"
              >
                {isSubmitting ? 'Menyimpan...' : 'Masuk & Sinkron →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Name */}
        {step === 'guest' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-white/10">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <h2 className="text-base font-bold text-white">Profil Guest</h2>
              <p className="text-xs text-white/40 mt-0.5">
                Username akan dicatat ke kolom Akun Guest di Google Sheets
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">Nama Guest</label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Contoh: Guest 1, Dzul Guest..."
                maxLength={30}
                className="w-full bg-white/5 text-sm text-white placeholder-white/30 rounded-xl px-4 py-3 border border-white/15 focus:border-emerald-400 outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/60 text-xs font-semibold hover:bg-white/5"
              >
                Kembali
              </button>
              <button
                onClick={handleGuestSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40"
              >
                {isSubmitting ? 'Menyimpan...' : 'Mulai Mendengarkan →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
