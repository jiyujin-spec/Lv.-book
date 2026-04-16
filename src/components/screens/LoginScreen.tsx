'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

/** Closed-book cover shown to unauthenticated users */
export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0d0b08' }}
    >
      {/* Ambient orbs */}
      <div className="bg-orb" style={{ width: 400, height: 400, background: '#2a1808', top: -120, left: -100 }} />
      <div className="bg-orb" style={{ width: 300, height: 300, background: '#1a1208', bottom: -80, right: -80, animationDelay: '6s' }} />

      <div className="relative z-10 text-center px-6 w-full max-w-xs">

        {/* Book icon */}
        <div
          className="text-8xl mb-6 animate-float inline-block"
          style={{ filter: 'drop-shadow(0 0 20px rgba(196,163,90,0.3))' }}
        >
          📖
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-4xl font-bold tracking-[0.25em] mb-1" style={{ color: '#c4a35a' }}>
          Lv. BOOK
        </h1>
        <p className="font-cinzel text-xs tracking-[0.35em] mb-2" style={{ color: '#6a6050' }}>
          THE MAGIC GRIMOIRE
        </p>

        {/* Ornament divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #6b5d3f)' }} />
          <span style={{ color: '#6b5d3f', fontSize: 12 }}>◆</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #6b5d3f)' }} />
        </div>

        {/* Tagline */}
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: '#8a7e6b', fontFamily: '"IM Fell English", serif' }}
        >
          日々の努力を刻み<br />
          冒険の軌跡を永遠に綴る
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-4 rounded flex items-center justify-center gap-3 font-cinzel font-bold text-sm tracking-[0.15em] transition-all active:scale-97 disabled:opacity-60"
          style={{
            background: loading
              ? 'rgba(139,122,80,0.2)'
              : 'linear-gradient(135deg, #8b7a50 0%, #c4a35a 50%, #8b7a50 100%)',
            color: '#0d0b08',
            border: 'none',
            boxShadow: loading ? 'none' : '0 0 16px rgba(196,163,90,0.35)',
          }}
        >
          {/* Google "G" mark */}
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#0d0b08" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#0d0b08" opacity=".85" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#0d0b08" opacity=".7" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#0d0b08" opacity=".6" />
            </svg>
          )}
          {loading ? '接続中…' : '冒険を始める'}
        </button>

        <p className="font-cinzel text-xs mt-4" style={{ color: '#3a3428', letterSpacing: '0.05em' }}>
          Googleアカウントでログイン
        </p>
      </div>
    </div>
  );
}
