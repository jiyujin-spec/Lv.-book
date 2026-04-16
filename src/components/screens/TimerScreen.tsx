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

  const [elapsed,     setElapsed]     = useState(0);       // seconds
  const [showStop,    setShowStop]    = useState(false);   // "stop and go to result" confirm
  const [showAbandon, setShowAbandon] = useState(false);   // "abandon" confirm
  const [stopping,    setStopping]    = useState(false);   // fade-out before navigate
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

  // Arc: 1 full rotation per hour (3600 s)
  const R      = 110;
  const circ   = 2 * Math.PI * R;
  const arcProgress = (elapsed % 3600) / 3600;
  const offset = circ * (1 - arcProgress);

  // Elapsed display
  const timeDisplay = formatElapsedTime(elapsed);

  function handleStopClick() {
    if (!showStop) { setShowStop(true); return; }
    // Commit stop: record stoppedAt, then fade-out → result
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

  // Motivational text based on elapsed time
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
        background: '#04091a',
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
            <h2 className="text-lg font-bold" style={{ color: '#e8f0f8', fontFamily: 'serif', lineHeight: 1.3 }}>
              {activeQuest.questName}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 mt-1">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-sm"
              style={{ background: `${stat?.color ?? '#4080e0'}15`, border: `1px solid ${stat?.color ?? '#4080e0'}40` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: stat?.color ?? '#4080e0', boxShadow: `0 0 5px ${stat?.color ?? '#4080e0'}` }}
              />
              <span className="font-cinzel text-xs font-bold" style={{ color: stat?.color ?? '#4080e0' }}>
                {activeQuest.statEnglishName}
              </span>
            </div>
            <span className="text-xs" style={{ color: '#4a6080' }}>ストップウォッチ</span>
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
            boxShadow: `0 0 50px ${diffColor}12`,
          }} />

          {/* Outer ring */}
          <div className="absolute rounded-full" style={{
            width: 250, height: 250,
            border: '2px solid rgba(184,204,224,0.15)',
          }} />

          {/* Arc SVG — rotates 1× per hour */}
          <svg width={260} height={260} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={130} cy={130} r={R}
              fill="none" stroke="rgba(30,48,80,0.6)" strokeWidth={8} />
            <circle cx={130} cy={130} r={R}
              fill="none"
              stroke={diffColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              filter={`drop-shadow(0 0 5px ${diffColor})`}
            />
          </svg>

          {/* Elapsed time display */}
          <div className="relative z-10 text-center">
            <p
              className="font-cinzel font-bold tabular-nums"
              style={{
                fontSize: elapsed >= 3600 ? 36 : 48,
                color: '#e8f0f8',
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
          <p className="text-xs italic" style={{ color: '#1e3050' }}>
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Action section ── */}
      <div className="relative z-10 w-full px-5 pb-safe pb-10 space-y-3">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,204,224,0.15), transparent)' }} />

        {/* Stop confirm */}
        {showStop ? (
          <DQWindow>
            <p className="text-sm text-center mb-3" style={{ color: '#b8cce0', fontFamily: 'serif' }}>
              {timeDisplay} の冒険を記録しますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStop(false)}
                className="flex-1 py-3 rounded font-cinzel text-sm"
                style={{ background: 'rgba(1,8,16,0.5)', border: '1px solid rgba(184,204,224,0.2)', color: '#7090b0' }}
              >
                続ける
              </button>
              <button
                onClick={handleStopClick}
                className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                style={{ background: `rgba(64,128,224,0.2)`, border: `1px solid #4080e080`, color: '#4080e0' }}
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
              background: `${diffColor}18`,
              border: `2px solid ${diffColor}70`,
              color: diffColor,
              boxShadow: `0 0 18px ${diffColor}30`,
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
                <AlertCircle size={15} style={{ color: '#ef4444' }} />
                <p className="text-sm" style={{ color: '#ef4444' }}>クエストを諦めますか？XPは得られません。</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandon(false)}
                  className="flex-1 py-3 rounded font-cinzel text-sm"
                  style={{ background: 'rgba(1,8,16,0.5)', border: '1px solid rgba(184,204,224,0.2)', color: '#7090b0' }}
                >
                  戻る
                </button>
                <button
                  onClick={handleAbandonClick}
                  className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                  style={{ background: 'rgba(180,40,40,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
                >
                  諦める
                </button>
              </div>
            </DQWindow>
          ) : (
            <button
              onClick={handleAbandonClick}
              className="w-full py-2 rounded font-cinzel text-xs tracking-widest transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(30,48,80,0.5)', color: '#1e3050' }}
            >
              クエストを諦める
            </button>
          )
        )}
      </div>
    </div>
  );
}
