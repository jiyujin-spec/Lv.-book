'use client';

import React, { useEffect, useState } from 'react';
import { GoldBurst } from './ParticleEffect';

interface LevelUpOverlayProps {
  newLevel: number;
  onDismiss: () => void;
}

export default function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  const [phase, setPhase] = useState<'burst' | 'show'>('burst');

  useEffect(() => {
    const t = setTimeout(() => setPhase('show'), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={phase === 'show' ? onDismiss : undefined}
      />

      <GoldBurst active={phase === 'burst'} onComplete={() => setPhase('show')} />

      {phase === 'show' && (
        <div
          className="relative z-10 text-center cursor-pointer animate-level-up px-5 w-full max-w-sm"
          onClick={onDismiss}
        >
          {/* Grimoire double-border window */}
          <div style={{ background: '#1a1610', border: '2px solid #6b5d3f', borderRadius: 3, padding: 3 }}>
            <div className="relative" style={{ border: '1px solid #3a3428', borderRadius: 1, padding: 28 }}>
              {/* Corner ornaments */}
              {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map(cls => (
                <span key={cls} className={`absolute ${cls} w-3 h-3 pointer-events-none`} style={{ borderColor: '#6b5d3f', opacity: 0.7 }} />
              ))}

              {/* Sparkle corners */}
              {['top-2 left-3', 'top-2 right-3', 'bottom-2 left-3', 'bottom-2 right-3'].map(pos => (
                <span key={pos} className={`absolute ${pos} animate-sparkle`} style={{ color: '#c4a35a', fontSize: 10 }}>✦</span>
              ))}

              <p className="font-cinzel text-xs tracking-[0.4em] mb-3" style={{ color: '#6a6050' }}>
                ✦ LEVEL UP ✦
              </p>

              <div
                className="font-cinzel text-7xl font-bold my-2"
                style={{
                  background: 'linear-gradient(180deg, #d4a854 0%, #8b7a50 60%, #c4a35a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 12px rgba(196,163,90,0.6))',
                }}
              >
                {newLevel}
              </div>

              <div className="h-px my-3" style={{ background: 'linear-gradient(90deg,transparent,#6b5d3f,transparent)' }} />

              <p className="text-sm mb-1" style={{ color: '#d4cfc0' }}>新たな力が目覚めた</p>
              <p className="font-cinzel text-xs" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>
                A NEW POWER AWAKENS
              </p>

              <p className="font-cinzel text-xs mt-5 animate-pulse" style={{ color: '#c4a35a' }}>
                ▼ タップして続ける
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
