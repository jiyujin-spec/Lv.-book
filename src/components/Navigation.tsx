'use client';

import React from 'react';
import { BookOpen, Sword, ScrollText, Settings } from 'lucide-react';
import type { Screen } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import soundEngine from '@/lib/soundEngine';

interface NavItem {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { screen: 'main',     label: '冒険の書', icon: <BookOpen  size={21} /> },
  { screen: 'tavern',   label: '酒場',     icon: <Sword     size={21} /> },
  { screen: 'timeline', label: '詩人の書', icon: <ScrollText size={21} /> },
  { screen: 'settings', label: '内省の儀', icon: <Settings  size={21} /> },
];

export default function Navigation() {
  const { state, navigate } = useGame();
  const current = state.screen;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: '#0d0b08',
        borderTop: '2px solid rgba(107,93,63,0.4)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Inner double-border line */}
      <div style={{ borderTop: '1px solid rgba(107,93,63,0.15)', display: 'flex' }}>
        {NAV_ITEMS.map(item => {
          const isActive = current === item.screen ||
            (item.screen === 'tavern' && current === 'questCreate');
          return (
            <button
              key={item.screen}
              onClick={() => {
                soundEngine.playSelect();
                navigate(item.screen);
              }}
              className="flex-1 flex flex-col items-center justify-center py-2.5 relative transition-all"
              style={{ minHeight: 58 }}
            >
              {/* Active top bar */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{
                    width: 32,
                    background: 'linear-gradient(90deg, transparent, #c4a35a, transparent)',
                    boxShadow: '0 0 6px rgba(196,163,90,0.5)',
                  }}
                />
              )}

              {/* Icon */}
              <span style={{
                color: isActive ? '#c4a35a' : '#3a3428',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(196,163,90,0.5))' : undefined,
                transition: 'color 0.2s, filter 0.2s',
              }}>
                {item.icon}
              </span>

              {/* Label */}
              <span
                className="font-cinzel mt-0.5"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  color: isActive ? '#c4a35a' : '#3a3428',
                  transition: 'color 0.2s',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
