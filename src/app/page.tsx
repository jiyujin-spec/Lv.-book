'use client';

import { useSession } from 'next-auth/react';
import { GameProvider } from '@/contexts/GameContext';
import GameApp from '@/components/GameApp';
import LoginScreen from '@/components/screens/LoginScreen';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0d0b08' }}>
        <p className="font-cinzel text-xs tracking-[0.4em] animate-pulse" style={{ color: '#3a3428' }}>
          LOADING...
        </p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <GameProvider userId={session.user.id}>
      <GameApp />
    </GameProvider>
  );
}
