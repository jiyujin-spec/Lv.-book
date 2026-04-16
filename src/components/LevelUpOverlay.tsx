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
          {/* DQ double-border window */}
          <div style={{ background: '#07121f', border: '2px solid #f0c030', borderRadius: 3, padding: 3 }}>
            <div style={{ border: '1px solid #f0c030', borderRadius: 1, padding: 28 }}>
              {/* Sparkle corners */}
              {['top-2 left-3', 'top-2 right-3', 'bottom-2 left-3', 'bottom-2 right-3'].map(pos => (
                <span key={pos} className={`absolute ${pos} animate-sparkle`} style={{ color: '#f0c030', fontSize: 10 }}>✦</span>
              ))}

              <p className="font-cinzel text-xs tracking-[0.4em] mb-3" style={{ color: '#4a6080' }}>
                ✦ LEVEL UP ✦
              </p>

              <div
                className="font-cinzel text-7xl font-bold my-2"
                style={{
                  background: 'linear-gradient(180deg, #ffd700 0%, #c89010 60%, #f0c030 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 14px #f0c03080)',
                }}
              >
                {newLevel}
              </div>

              <div className="h-px my-3" style={{ background: 'linear-gradient(90deg,transparent,#f0c030,transparent)' }} />

              <p className="text-sm mb-1" style={{ color: '#b8cce0' }}>新たな力が目覚めた</p>
              <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.2em' }}>
                A NEW POWER AWAKENS
              </p>

              <p className="font-cinzel text-xs mt-5 animate-pulse" style={{ color: '#f0c030' }}>
                ▼ タップして続ける
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
