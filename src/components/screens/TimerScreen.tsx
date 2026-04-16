'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { DIFFICULTY_COLORS, formatElapsedTime } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import ParticleEffect from '../ParticleEffect';
import DQWindow from '../DQWindow';

export default function TimerScreen() {
  const { state, navigate, stopTimer } = useGame();
  const { activeQuest } = state;

  const [elapsed,     setElapsed]     = useState(0);
  const [showStop,    setShowStop]    = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [stopping,    setStopping]    = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeQuest) return;

    function tick() {
      const now = Date.now();
      setElapsed(Math.floor((now - activeQuest!.startedAt) / 1000));
    }

    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeQuest]);

  if (!activeQuest) return null;

  const diffColor = DIFFICULTY_COLORS[activeQuest.difficulty];
  const stat      = state.data.stats.find(s => s.id === activeQuest.statId);

  const R      = 110;
  const circ   = 2 * Math.PI * R;
  const arcProgress = (elapsed % 3600) / 3600;
  const offset = circ * (1 - arcProgress);

  const timeDisplay = formatElapsedTime(elapsed);

  function handleStopClick() {
    if (!showStop) { setShowStop(true); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopTimer();
    setStopping(true);
    setTimeout(() => navigate('result'), 600);
  }

  function handleAbandonClick() {
    if (!showAbandon) { setShowAbandon(true); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate('tavern');
  }

  const quote = elapsed < 5 * 60
    ? '一歩ずつ進む者の足跡は、永遠に刻まれる'
    : elapsed < 20 * 60
    ? '集中の炎が燃え上がっている'
    : elapsed < 60 * 60
    ? '素晴らしい。止まるな、勇者よ'
    : '伝説の冒険者…！';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: '#0d0b08',
        opacity: stopping ? 0 : 1,
        transition: stopping ? 'opacity 0.5s ease' : 'none',
      }}
    >
      <ParticleEffect count={15} />

      {/* ── Quest info (top) ── */}
      <div className="relative z-10 w-full px-5 pt-safe pt-8">
        <DQWindow>
          <div className="text-center mb-2">
            <p className="font-cinzel text-xs mb-1" style={{ color: diffColor, letterSpacing: '0.3em' }}>
              ✦ {activeQuest.difficulty.toUpperCase()} QUEST · 時間形式 ✦
            </p>
            <h2 className="text-lg font-bold" style={{ color: '#d4cfc0', fontFamily: 'serif', lineHeight: 1.3 }}>
              {activeQuest.questName}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 mt-1">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-sm"
              style={{ background: `${stat?.color ?? '#a88040'}15`, border: `1px solid ${stat?.color ?? '#a88040'}40` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: stat?.color ?? '#a88040', boxShadow: `0 0 4px ${stat?.color ?? '#a88040'}` }}
              />
              <span className="font-cinzel text-xs font-bold" style={{ color: stat?.color ?? '#a88040' }}>
                {activeQuest.statEnglishName}
              </span>
            </div>
            <span className="text-xs" style={{ color: '#6a6050' }}>ストップウォッチ</span>
          </div>
        </DQWindow>
      </div>

      {/* ── Stopwatch circle ── */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
          {/* Glow bg */}
          <div className="absolute rounded-full" style={{
            width: 240, height: 240,
            background: `radial-gradient(circle, ${diffColor}06 0%, transparent 70%)`,
            boxShadow: `0 0 40px ${diffColor}08`,
          }} />

          {/* Outer ring */}
          <div className="absolute rounded-full" style={{
            width: 250, height: 250,
            border: '2px solid rgba(107,93,63,0.2)',
          }} />

          {/* Arc SVG */}
          <svg width={260} height={260} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={130} cy={130} r={R}
              fill="none" stroke="rgba(58,52,40,0.5)" strokeWidth={8} />
            <circle cx={130} cy={130} r={R}
              fill="none"
              stroke={diffColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              filter={`drop-shadow(0 0 4px ${diffColor})`}
            />
          </svg>

          {/* Elapsed time display */}
          <div className="relative z-10 text-center">
            <p
              className="font-cinzel font-bold tabular-nums"
              style={{
                fontSize: elapsed >= 3600 ? 36 : 48,
                color: '#d4cfc0',
                letterSpacing: '0.04em',
              }}
            >
              {timeDisplay}
            </p>
            <p className="font-cinzel text-xs mt-1" style={{ color: diffColor, letterSpacing: '0.25em' }}>
              ELAPSED
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-3 px-8 text-center">
          <p className="text-xs italic" style={{ color: '#3a3428' }}>
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Action section ── */}
      <div className="relative z-10 w-full px-5 pb-safe pb-10 space-y-3">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(107,93,63,0.2), transparent)' }} />

        {/* Stop confirm */}
        {showStop ? (
          <DQWindow>
            <p className="text-sm text-center mb-3" style={{ color: '#b8a88a', fontFamily: 'serif' }}>
              {timeDisplay} の冒険を記録しますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStop(false)}
                className="flex-1 py-3 rounded font-cinzel text-sm"
                style={{ background: 'rgba(26,22,16,0.6)', border: '1px solid rgba(107,93,63,0.3)', color: '#8a7e6b' }}
              >
                続ける
              </button>
              <button
                onClick={handleStopClick}
                className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                style={{ background: `rgba(196,163,90,0.15)`, border: `1px solid rgba(196,163,90,0.5)`, color: '#c4a35a' }}
              >
                記録へ →
              </button>
            </div>
          </DQWindow>
        ) : (
          <button
            onClick={handleStopClick}
            className="w-full py-4 rounded font-cinzel text-sm font-bold tracking-widest transition-all active:scale-97"
            style={{
              background: `${diffColor}15`,
              border: `2px solid ${diffColor}60`,
              color: diffColor,
              boxShadow: `0 0 14px ${diffColor}20`,
            }}
          >
            冒険を切り上げる
          </button>
        )}

        {/* Abandon */}
        {!showStop && (
          showAbandon ? (
            <DQWindow>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} style={{ color: '#c45050' }} />
                <p className="text-sm" style={{ color: '#c45050' }}>クエストを諦めますか？XPは得られません。</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandon(false)}
                  className="flex-1 py-3 rounded font-cinzel text-sm"
                  style={{ background: 'rgba(26,22,16,0.6)', border: '1px solid rgba(107,93,63,0.3)', color: '#8a7e6b' }}
                >
                  戻る
                </button>
                <button
                  onClick={handleAbandonClick}
                  className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                  style={{ background: 'rgba(139,32,32,0.2)', border: '1px solid rgba(139,32,32,0.4)', color: '#c45050' }}
                >
                  諦める
                </button>
              </div>
            </DQWindow>
          ) : (
            <button
              onClick={handleAbandonClick}
              className="w-full py-2 rounded font-cinzel text-xs tracking-widest transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(107,93,63,0.2)', color: '#3a3428' }}
            >
              クエストを諦める
            </button>
          )
        )}
      </div>
    </div>
  );
}
