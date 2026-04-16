'use client';

import React from 'react';
import { useGame } from '@/contexts/GameContext';
import PrologueScreen from './screens/PrologueScreen';
import MainScreen from './screens/MainScreen';
import QuestScreen from './screens/QuestScreen';
import TimerScreen from './screens/TimerScreen';
import ResultScreen from './screens/ResultScreen';
import TimelineScreen from './screens/TimelineScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function GameApp() {
  const { state } = useGame();

  if (!state.isLoaded) {
    // Loading splash
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0d0820' }}
      >
        <div className="text-center">
          <div
            className="text-5xl mb-4 animate-float"
            style={{ filter: 'drop-shadow(0 0 16px #c084fc)' }}
          >
            📖
          </div>
          <p
            className="text-sm font-cinzel tracking-[0.4em] animate-pulse"
            style={{ color: '#4a3870' }}
          >
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  const { screen } = state;

  return (
    <>
      {screen === 'prologue'  && <PrologueScreen />}
      {screen === 'main'      && <MainScreen />}
      {screen === 'quest'     && <QuestScreen />}
      {screen === 'timer'     && <TimerScreen />}
      {screen === 'result'    && <ResultScreen />}
      {screen === 'timeline'  && <TimelineScreen />}
      {screen === 'settings'  && <SettingsScreen />}
    </>
  );
}
