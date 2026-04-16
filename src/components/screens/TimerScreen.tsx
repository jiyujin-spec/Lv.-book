'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { DIFFICULTY_COLORS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import ParticleEffect from '../ParticleEffect';

export default function TimerScreen() {
  const { state, navigate } = useGame();
  const { activeQuest } = state;

  const [remaining, setRemaining] = useState<number>(0); // seconds
  const [elapsed, setElapsed] = useState<number>(0); // seconds
  const [showAbandon, setShowAbandon] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = (activeQuest?.durationMinutes ?? 0) * 60;

  // Initialize timer from stored start time (so it survives re-renders)
  useEffect(() => {
    if (!activeQuest) return;

    function tick() {
      const now = Date.now();
      const elapsedMs = now - activeQuest!.startedAt;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const rem = Math.max(0, totalSeconds - elapsedSec);
      setElapsed(elapsedSec);
      setRemaining(rem);

      if (rem === 0) {
        clearInterval(intervalRef.current!);
        setIsComplete(true);
      }
    }

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeQuest, totalSeconds]);

  // Auto-navigate to result when timer hits 0 (focus rate chosen on result screen)
  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => {
        navigate('result');
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isComplete, navigate]);

  if (!activeQuest) return null;

  const progress = Math.min(1, elapsed / totalSeconds);
  const remainingMins = Math.floor(remaining / 60);
  const remainingSecs = remaining % 60;
  const diffColor = DIFFICULTY_COLORS[activeQuest.difficulty];

  // SVG arc progress
  const R = 120;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progress);

  function handleAbandon() {
    if (!showAbandon) {
      setShowAbandon(true);
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate('quest');
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0820 0%, #070412 70%)' }}
    >
      <ParticleEffect count={20} />

      {/* ── Top: Quest Info ── */}
      <div className="relative z-10 w-full text-center px-6 pt-safe-top pt-8">
        <p
          className="text-xs font-cinzel tracking-[0.4em] mb-2"
          style={{ color: diffColor, opacity: 0.9 }}
        >
          ✦ {activeQuest.difficulty.toUpperCase()} QUEST ✦
        </p>
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: '#f4e4bc', fontFamily: 'Georgia, serif' }}
        >
          {activeQuest.questName}
        </h2>
        <p className="text-sm" style={{ color: '#4a3870' }}>
          {activeQuest.statEnglishName} · {activeQuest.durationMinutes}分
        </p>
      </div>

      {/* ── Center: Timer Circle ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          {/* Background glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: `radial-gradient(circle, ${diffColor}08 0%, transparent 70%)`,
              boxShadow: `0 0 60px ${diffColor}15`,
            }}
          />

          {/* SVG circle progress */}
          <svg
            width={280}
            height={280}
            className="absolute"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle
              cx={140} cy={140} r={R}
              fill="none"
              stroke="rgba(74,56,112,0.3)"
              strokeWidth={8}
            />
            {/* Progress arc */}
            <circle
              cx={140} cy={140} r={R}
              fill="none"
              stroke={isComplete ? '#ffd700' : diffColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
              filter={`drop-shadow(0 0 6px ${isComplete ? '#ffd700' : diffColor})`}
            />
          </svg>

          {/* Timer display */}
          <div className="relative z-10 text-center">
            {isComplete ? (
              <div className="animate-level-up">
                <p
                  className="text-5xl font-bold font-cinzel"
                  style={{ color: '#ffd700', filter: 'drop-shadow(0 0 12px #ffd700)' }}
                >
                  完了
                </p>
                <p className="text-xs mt-2 font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.3em' }}>
                  COMPLETE
                </p>
              </div>
            ) : (
              <>
                <p
                  className="text-6xl font-bold font-cinzel tabular-nums"
                  style={{
                    color: remaining < 60 ? diffColor : '#f4e4bc',
                    filter: remaining < 60 ? `drop-shadow(0 0 10px ${diffColor})` : undefined,
                    letterSpacing: '0.05em',
                  }}
                >
                  {String(remainingMins).padStart(2, '0')}
                  <span
                    className="animate-pulse"
                    style={{ color: '#4a3870', fontSize: '0.8em' }}
                  >
                    :
                  </span>
                  {String(remainingSecs).padStart(2, '0')}
                </p>
                <p className="text-xs mt-2" style={{ color: '#4a3870', letterSpacing: '0.2em' }}>
                  REMAINING
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress text */}
        <p className="text-sm mt-2" style={{ color: '#4a3870' }}>
          {Math.round(progress * 100)}% 完了
        </p>

        {/* Motivational text */}
        {!isComplete && (
          <div className="mt-6 text-center px-8">
            {remaining > totalSeconds * 0.5 ? (
              <p className="text-xs italic" style={{ color: '#3a2a60' }}>
                &ldquo;一歩ずつ進む勇者の足跡は、永遠に刻まれる&rdquo;
              </p>
            ) : remaining > 60 ? (
              <p className="text-xs italic" style={{ color: '#5a3a70', fontFamily: 'serif' }}>
                &ldquo;もう少し。諦めるな、勇者よ&rdquo;
              </p>
            ) : (
              <p
                className="text-xs italic animate-pulse"
                style={{ color: diffColor }}
              >
                &ldquo;ラストスパート！終わりが近い！&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom: Abandon Button ── */}
      {!isComplete && (
        <div className="relative z-10 w-full px-6 pb-safe-bottom pb-10">
          <div
            className="h-px mb-6"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(74,56,112,0.4), transparent)' }}
          />

          {showAbandon ? (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle size={16} style={{ color: '#ef4444' }} />
                <p className="text-sm" style={{ color: '#ef4444' }}>
                  クエストを諦めますか？XPは得られません。
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbandon(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-cinzel"
                  style={{
                    background: 'rgba(26,15,58,0.8)',
                    border: '1px solid rgba(74,56,112,0.5)',
                    color: '#c084fc',
                  }}
                >
                  戻る
                </button>
                <button
                  onClick={handleAbandon}
                  className="flex-1 py-3 rounded-xl text-sm font-cinzel font-bold"
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid rgba(239,68,68,0.5)',
                    color: '#ef4444',
                  }}
                >
                  諦める
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAbandon}
              className="w-full py-3 rounded-xl text-xs font-cinzel tracking-widest transition-all"
              style={{
                background: 'transparent',
                border: '1px solid rgba(74,56,112,0.3)',
                color: '#2d1b4e',
                letterSpacing: '0.2em',
              }}
            >
              クエストを諦める
            </button>
          )}
        </div>
      )}
    </div>
  );
}
