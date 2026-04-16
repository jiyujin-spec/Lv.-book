'use client';

import React from 'react';
import { useGame } from '@/contexts/GameContext';
import PrologueScreen     from './screens/PrologueScreen';
import MainScreen         from './screens/MainScreen';
import TavernScreen       from './screens/TavernScreen';
import QuestCreationScreen from './screens/QuestCreationScreen';
import TimerScreen        from './screens/TimerScreen';
import ResultScreen       from './screens/ResultScreen';
import TimelineScreen     from './screens/TimelineScreen';
import SettingsScreen     from './screens/SettingsScreen';

export default function GameApp() {
  const { state } = useGame();

  if (!state.isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#04091a' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float" style={{ filter: 'drop-shadow(0 0 16px #4080e0)' }}>
            📖
          </div>
          <p className="font-cinzel text-xs tracking-[0.4em] animate-pulse" style={{ color: '#1e3050' }}>
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  const { screen } = state;
  return (
    <>
      {screen === 'prologue'    && <PrologueScreen />}
      {screen === 'main'        && <MainScreen />}
      {screen === 'tavern'      && <TavernScreen />}
      {screen === 'questCreate' && <QuestCreationScreen />}
      {screen === 'timer'       && <TimerScreen />}
      {screen === 'result'      && <ResultScreen />}
      {screen === 'timeline'    && <TimelineScreen />}
      {screen === 'settings'    && <SettingsScreen />}
    </>
  );
}
