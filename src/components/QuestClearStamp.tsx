'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  xpGained?: number;
  onDone?: () => void;
}

/**
 * Heavy red stamp animation — "QUEST CLEAR!" slams down with physical weight.
 * Grimoire-themed: darker crimson, ornate borders, cross-hatch texture.
 * pointer-events: none — never blocks interaction underneath.
 */
export default function QuestClearStamp({ visible, xpGained, onDone }: Props) {
  const [phase, setPhase] = useState<'hidden' | 'impact' | 'show' | 'fade'>('hidden');

  useEffect(() => {
    if (!visible) {
      setPhase('hidden');
      return;
    }
    setPhase('impact');
    const t1 = setTimeout(() => setPhase('show'),  380);
    const t2 = setTimeout(() => setPhase('fade'),  2200);
    const t3 = setTimeout(() => { setPhase('hidden'); onDone?.(); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible, onDone]);

  if (phase === 'hidden') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        opacity: phase === 'fade' ? 0 : 1,
        transition: phase === 'fade' ? 'opacity 0.6s ease' : 'none',
      }}
    >
      <div
        style={{
          transform: phase === 'impact'
            ? 'scale(3.0) rotate(-7deg)'
            : 'scale(1) rotate(-7deg)',
          opacity: phase === 'impact' ? 0 : 1,
          transition: phase === 'impact'
            ? 'none'
            : 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.6), opacity 0.10s',
        }}
      >
        {/* Outer ornate border — deep crimson */}
        <div
          className="relative px-9 py-5"
          style={{
            border: '5px solid #8b2020',
            boxShadow: [
              '0 0 0 2px rgba(139,32,32,0.3)',
              '0 0 50px rgba(139,32,32,0.6)',
              'inset 0 0 30px rgba(139,32,32,0.1)',
            ].join(','),
          }}
        >
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4" style={{ borderColor: '#6a1818' }} />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4" style={{ borderColor: '#6a1818' }} />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4" style={{ borderColor: '#6a1818' }} />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4" style={{ borderColor: '#6a1818' }} />

          {/* Corner dot accents */}
          {[[2,2],[2,-2],[-2,2],[-2,-2]].map(([t,l],i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: '#8b2020',
                top: t > 0 ? t + 6 : undefined,
                bottom: t < 0 ? Math.abs(t) + 6 : undefined,
                left: l > 0 ? l + 6 : undefined,
                right: l < 0 ? Math.abs(l) + 6 : undefined,
              }}
            />
          ))}

          {/* Cross-hatch stamp texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(139,32,32,0.5) 3px, rgba(139,32,32,0.5) 4px)',
            }}
          />

          {/* Inner border ring */}
          <div
            className="absolute inset-2"
            style={{ border: '1px solid rgba(139,32,32,0.35)' }}
          />

          {/* Text */}
          <div className="relative z-10 text-center select-none">
            <p
              className="font-cinzel font-bold"
              style={{
                fontSize: 38,
                lineHeight: 1.0,
                color: '#8b2020',
                textShadow: '0 0 20px rgba(139,32,32,0.7), 2px 2px 0 rgba(0,0,0,0.3)',
                letterSpacing: '0.22em',
              }}
            >
              QUEST
            </p>
            <p
              className="font-cinzel font-bold"
              style={{
                fontSize: 38,
                lineHeight: 1.05,
                color: '#8b2020',
                textShadow: '0 0 20px rgba(139,32,32,0.7), 2px 2px 0 rgba(0,0,0,0.3)',
                letterSpacing: '0.18em',
              }}
            >
              CLEAR!
            </p>
            {xpGained !== undefined && xpGained > 0 && (
              <p
                className="font-cinzel font-bold mt-1.5"
                style={{
                  fontSize: 17,
                  color: '#8b2020',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 10px rgba(139,32,32,0.5)',
                }}
              >
                +{xpGained.toFixed(1)} XP
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
