'use client';

import React from 'react';
import { BookOpen, Sword, ScrollText, Settings } from 'lucide-react';
import type { Screen } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import soundEngine from '@/lib/soundEngine';

interface NavItem {
  screen: Screen;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    screen: 'main',
    label: '冒険の書',
    labelEn: 'Tome',
    icon: <BookOpen size={22} />,
  },
  {
    screen: 'quest',
    label: 'クエスト',
    labelEn: 'Quest',
    icon: <Sword size={22} />,
  },
  {
    screen: 'timeline',
    label: '詩人の書',
    labelEn: 'Chronicle',
    icon: <ScrollText size={22} />,
  },
  {
    screen: 'settings',
    label: '内省の儀',
    labelEn: 'Oracle',
    icon: <Settings size={22} />,
  },
];

export default function Navigation() {
  const { state, navigate } = useGame();
  const current = state.screen;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: 'linear-gradient(180deg, rgba(13,8,32,0) 0%, rgba(13,8,32,0.97) 20%, #0d0820 100%)',
        borderTop: '1px solid rgba(212,160,23,0.25)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = current === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => {
              soundEngine.playClick();
              navigate(item.screen);
            }}
            className="flex-1 flex flex-col items-center justify-center py-3 relative transition-all"
            style={{ minHeight: 60 }}
          >
            {/* Active indicator */}
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #ffd700, transparent)' }}
              />
            )}

            {/* Icon */}
            <span
              style={{
                color: isActive ? '#ffd700' : '#4a3870',
                filter: isActive ? 'drop-shadow(0 0 6px #d4a017)' : undefined,
                transition: 'color 0.2s, filter 0.2s',
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              className="text-xs mt-0.5 font-cinzel tracking-wider"
              style={{
                color: isActive ? '#f0c040' : '#4a3870',
                fontSize: '9px',
                letterSpacing: '0.08em',
                transition: 'color 0.2s',
              }}
            >
              {item.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
