'use client';

import { GameProvider } from '@/contexts/GameContext';
import GameApp from '@/components/GameApp';

export default function Home() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
