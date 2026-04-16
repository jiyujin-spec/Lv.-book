'use client';

import React, { useEffect, useState } from 'react';
import { GoldBurst } from './ParticleEffect';

interface LevelUpOverlayProps {
  newLevel: number;
  onDismiss: () => void;
}

export default function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  const [phase, setPhase] = useState<'burst' | 'show' | 'fade'>('burst');

  useEffect(() => {
    // After burst, show level-up panel
    const t1 = setTimeout(() => setPhase('show'), 400);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={phase === 'show' ? onDismiss : undefined}
      />

      {/* Gold particle burst */}
      <GoldBurst active={phase === 'burst'} onComplete={() => setPhase('show')} />

      {/* Level-up card */}
      {phase === 'show' && (
        <div
          className="relative z-10 text-center animate-level-up cursor-pointer"
          onClick={onDismiss}
        >
          {/* Outer glow ring */}
          <div className="relative mx-auto w-72">
            {/* Decorative outer border */}
            <div
              className="animate-glow-pulse rounded-lg p-1"
              style={{ background: 'linear-gradient(135deg, #d4a017, #ffd700, #d4a017)' }}
            >
              <div
                className="rounded-lg p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a0f3a 0%, #2d1b4e 50%, #1a0f3a 100%)' }}
              >
                {/* Corner runes */}
                <span className="absolute top-2 left-3 text-gold text-xs opacity-50">✦</span>
                <span className="absolute top-2 right-3 text-gold text-xs opacity-50">✦</span>
                <span className="absolute bottom-2 left-3 text-gold text-xs opacity-50">✦</span>
                <span className="absolute bottom-2 right-3 text-gold text-xs opacity-50">✦</span>

                {/* Level Up text */}
                <p
                  className="text-sm tracking-[0.4em] mb-2 font-cinzel"
                  style={{ color: '#c084fc' }}
                >
                  ✨ LEVEL UP ✨
                </p>

                {/* Level number */}
                <div
                  className="text-7xl font-bold my-3 font-cinzel"
                  style={{
                    background: 'linear-gradient(180deg, #ffd700 0%, #d4a017 50%, #f0c040 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 0 12px #ffd700)',
                  }}
                >
                  {newLevel}
                </div>

                {/* Divider */}
                <div
                  className="h-px w-3/4 mx-auto my-3"
                  style={{ background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }}
                />

                <p className="text-sm" style={{ color: '#f4e4bc' }}>
                  新たな力が目覚めた
                </p>
                <p className="text-xs mt-1 opacity-60 font-cinzel tracking-widest" style={{ color: '#d4c49c' }}>
                  A new power awakens
                </p>

                {/* Tap to continue */}
                <p className="text-xs mt-6 animate-pulse" style={{ color: '#d4a017' }}>
                  タップして続ける
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
