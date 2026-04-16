'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { DIFFICULTY_COLORS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import ParticleEffect from '../ParticleEffect';
import DQWindow from '../DQWindow';

export default function TimerScreen() {
  const { state, navigate } = useGame();
  const { activeQuest } = state;

  const [remaining, setRemaining] = useState(0);
  const [elapsed,   setElapsed]   = useState(0);
  const [showAbandon, setShowAbandon] = useState(false);
  const [isComplete,  setIsComplete]  = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = (activeQuest?.durationMinutes ?? 0) * 60;

  useEffect(() => {
    if (!activeQuest) return;

    function tick() {
      const now = Date.now();
      const elapsedSec = Math.floor((now - activeQuest!.startedAt) / 1000);
      const rem = Math.max(0, totalSeconds - elapsedSec);
      setElapsed(elapsedSec);
      setRemaining(rem);
      if (rem === 0) {
        clearInterval(intervalRef.current!);
        setIsComplete(true);
      }
    }

    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeQuest, totalSeconds]);

  // Smooth transition to result after completion
  useEffect(() => {
    if (!isComplete) return;
    const t1 = setTimeout(() => setTransitioning(true), 1000);
    const t2 = setTimeout(() => navigate('result'), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isComplete, navigate]);

  if (!activeQuest) return null;

  const progress    = Math.min(1, elapsed / totalSeconds);
  const remMins     = Math.floor(remaining / 60);
  const remSecs     = remaining % 60;
  const diffColor   = DIFFICULTY_COLORS[activeQuest.difficulty];
  const stat        = state.data.stats.find(s => s.id === activeQuest.statId);

  // SVG arc
  const R      = 110;
  const circ   = 2 * Math.PI * R;
  const offset = circ * (1 - progress);

  function handleAbandonClick() {
    if (!showAbandon) { setShowAbandon(true); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate('tavern');
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: '#04091a',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <ParticleEffect count={15} />

      {/* ── Quest info (top) ── */}
      <div className="relative z-10 w-full px-5 pt-safe pt-8">
        <DQWindow>
          {/* Quest name */}
          <div className="text-center mb-2">
            <p className="font-cinzel text-xs mb-1" style={{ color: diffColor, letterSpacing: '0.3em' }}>
              ✦ {activeQuest.difficulty.toUpperCase()} QUEST ✦
            </p>
            <h2 className="text-lg font-bold" style={{ color: '#e8f0f8', fontFamily: 'serif', lineHeight: 1.3 }}>
              {activeQuest.questName}
            </h2>
          </div>

          {/* Stat badge */}
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="flex items-center gap-2 px-3 py-1 rounded-sm"
              style={{ background: `${stat?.color ?? '#4080e0'}15`, border: `1px solid ${stat?.color ?? '#4080e0'}40` }}>
              <div className="w-2 h-2 rounded-full"
                style={{ background: stat?.color ?? '#4080e0', boxShadow: `0 0 5px ${stat?.color ?? '#4080e0'}` }}
              />
              <span className="font-cinzel text-xs font-bold" style={{ color: stat?.color ?? '#4080e0' }}>
                {activeQuest.statEnglishName}
              </span>
            </div>
            <span className="text-xs" style={{ color: '#4a6080' }}>
              {activeQuest.durationMinutes}分の試練
            </span>
          </div>
        </DQWindow>
      </div>

      {/* ── Timer circle ── */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
          {/* Glow bg */}
          <div className="absolute rounded-full" style={{
            width: 240, height: 240,
            background: `radial-gradient(circle, ${diffColor}06 0%, transparent 70%)`,
            boxShadow: `0 0 50px ${diffColor}12`,
          }} />

          {/* DQ-style window ring */}
          <div className="absolute rounded-full" style={{
            width: 250, height: 250,
            border: '2px solid rgba(184,204,224,0.15)',
          }} />

          {/* Arc SVG */}
          <svg width={260} height={260} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={130} cy={130} r={R}
              fill="none" stroke="rgba(30,48,80,0.6)" strokeWidth={8} />
            <circle cx={130} cy={130} r={R}
              fill="none"
              stroke={isComplete ? '#f0c030' : diffColor}
              strokeWidth={8} strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s' }}
              filter={`drop-shadow(0 0 5px ${isComplete ? '#f0c030' : diffColor})`}
            />
          </svg>

          {/* Time display */}
          <div className="relative z-10 text-center">
            {isComplete ? (
              <div className="animate-level-up">
                <p className="font-cinzel text-4xl font-bold" style={{ color: '#f0c030', filter: 'drop-shadow(0 0 10px #f0c030)' }}>
                  完了！
                </p>
              </div>
            ) : (
              <>
                <p className="font-cinzel text-5xl font-bold tabular-nums"
                  style={{
                    color: remaining < 60 ? diffColor : '#e8f0f8',
                    filter: remaining < 60 ? `drop-shadow(0 0 8px ${diffColor})` : undefined,
                    letterSpacing: '0.04em',
                  }}>
                  {String(remMins).padStart(2,'0')}
                  <span className="animate-dq-cursor" style={{ color: '#2a3a50', fontSize: '0.75em' }}>:</span>
                  {String(remSecs).padStart(2,'0')}
                </p>
                <p className="font-cinzel text-xs mt-1" style={{ color: '#2a3a50', letterSpacing: '0.25em' }}>
                  REMAINING
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress % */}
        <p className="text-sm mt-1" style={{ color: '#2a3a50' }}>
          {Math.round(progress * 100)}% 完了
        </p>

        {/* Motivational quote */}
        {!isComplete && (
          <div className="mt-4 px-8 text-center">
            {remaining > totalSeconds * 0.5
              ? <p className="text-xs italic" style={{ color: '#1e3050' }}>&ldquo;一歩ずつ進む者の足跡は、永遠に刻まれる&rdquo;</p>
              : remaining > 60
              ? <p className="text-xs italic" style={{ color: '#2a3a50' }}>&ldquo;もう少し。諦めるな、勇者よ&rdquo;</p>
              : <p className="text-xs italic animate-pulse" style={{ color: diffColor }}>&ldquo;ラストスパート！&rdquo;</p>
            }
          </div>
        )}
      </div>

      {/* ── Abandon section ── */}
      {!isComplete && (
        <div className="relative z-10 w-full px-5 pb-safe pb-10">
          <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,204,224,0.15), transparent)' }} />

          {showAbandon ? (
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
              className="w-full py-3 rounded font-cinzel text-xs tracking-widest transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(30,48,80,0.5)', color: '#1e3050' }}
            >
              クエストを諦める
            </button>
          )}
        </div>
      )}
    </div>
  );
}
