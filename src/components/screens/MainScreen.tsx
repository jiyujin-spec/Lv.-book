'use client';

import React, { useEffect, useState } from 'react';
import { Sword, Star } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import {
  getXPProgress,
  getHeroTitle,
  formatDuration,
} from '@/lib/gameLogic';
import RadarChart from '../RadarChart';
import ParticleEffect from '../ParticleEffect';
import Navigation from '../Navigation';
import LevelUpOverlay from '../LevelUpOverlay';
import soundEngine from '@/lib/soundEngine';

export default function MainScreen() {
  const { state, navigate, dismissLevelUp } = useGame();
  const { data, showLevelUp, lastResult } = state;
  const [animateXP, setAnimateXP] = useState(false);

  const progress = getXPProgress(data.totalXP);
  const title = getHeroTitle(data.level);

  useEffect(() => {
    // Trigger XP bar animation on mount
    const t = setTimeout(() => setAnimateXP(true), 200);
    return () => clearTimeout(t);
  }, []);

  const recentQuests = data.questHistory.slice(0, 3);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0f3a 0%, #0d0820 70%)' }}
    >
      <ParticleEffect count={25} />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        {/* ── Header ── */}
        <div
          className="pt-safe-top px-4 pt-6 pb-4 text-center"
        >
          <h1
            className="text-lg font-bold font-cinzel tracking-[0.3em]"
            style={{
              background: 'linear-gradient(180deg, #ffd700 0%, #d4a017 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Lv. BOOK
          </h1>
          <p
            className="text-xs font-cinzel tracking-widest mt-0.5"
            style={{ color: '#c084fc' }}
          >
            冒険の書
          </p>
        </div>

        {/* ── Book Spread ── */}
        <div className="px-4 mb-4">
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(160deg, #f5e6c8 0%, #ede0b4 40%, #e8d5a3 60%, #f0e4be 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
              border: '1px solid rgba(212,160,23,0.5)',
            }}
          >
            {/* Book spine */}
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
              style={{ background: 'linear-gradient(180deg, transparent, #c9a227, #c9a227, transparent)' }}
            />

            <div className="flex">
              {/* ── Left Page ── */}
              <div
                className="flex-1 p-4 pr-3"
                style={{ borderRight: '1px solid rgba(139,115,85,0.3)' }}
              >
                {/* Page ornament */}
                <div className="text-center mb-2">
                  <span style={{ color: '#c9a227', fontSize: 10 }}>✦ ✦ ✦</span>
                </div>

                {/* User name & title */}
                <div className="text-center mb-3">
                  <h2
                    className="text-base font-bold"
                    style={{ color: '#2c1810', fontFamily: 'Georgia, serif' }}
                  >
                    {data.userName}
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: '#8b7355', fontFamily: 'serif' }}
                  >
                    {title.subtitle}
                  </p>
                </div>

                {/* Level badge */}
                <div className="flex justify-center mb-3">
                  <div
                    className="relative flex flex-col items-center justify-center w-20 h-20 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #2c1810 0%, #1a0a08 100%)',
                      border: '3px solid #c9a227',
                      boxShadow: '0 0 12px rgba(201,162,39,0.5)',
                    }}
                  >
                    <span
                      className="text-xs font-cinzel tracking-widest"
                      style={{ color: '#c9a227' }}
                    >
                      Lv.
                    </span>
                    <span
                      className="text-3xl font-bold leading-none font-cinzel"
                      style={{ color: '#ffd700' }}
                    >
                      {data.level}
                    </span>
                  </div>
                </div>

                {/* Title label */}
                <div className="text-center mb-3">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: 'rgba(44,24,16,0.08)',
                      color: '#5a3a2a',
                      border: '1px solid rgba(139,115,85,0.4)',
                      fontFamily: 'serif',
                      fontSize: 10,
                    }}
                  >
                    {title.title}
                  </span>
                </div>

                {/* XP bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#8b7355' }}>
                    <span style={{ fontFamily: 'serif' }}>経験値</span>
                    <span style={{ fontFamily: 'serif' }}>
                      {progress.currentLevelXP.toFixed(1)} / {progress.requiredXP}
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full overflow-hidden relative"
                    style={{ background: 'rgba(44,24,16,0.15)', border: '1px solid rgba(139,115,85,0.4)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: animateXP ? `${progress.percentage}%` : '0%',
                        background: 'linear-gradient(90deg, #8b6914, #c9a227, #ffd700)',
                        boxShadow: '0 0 8px rgba(201,162,39,0.6)',
                      }}
                    />
                  </div>
                </div>

                {/* Total XP */}
                <div
                  className="text-center py-1 px-2 rounded text-xs"
                  style={{
                    background: 'rgba(44,24,16,0.06)',
                    color: '#8b7355',
                    fontFamily: 'serif',
                  }}
                >
                  累計 {data.totalXP.toFixed(1)} XP
                </div>

                {/* Divider */}
                <div
                  className="h-px my-3"
                  style={{ background: 'linear-gradient(90deg, transparent, #8b7355, transparent)' }}
                />

                {/* Recent quests mini-log */}
                <div>
                  <p className="text-xs mb-2 text-center" style={{ color: '#8b7355', fontFamily: 'serif' }}>
                    ― 最近の軌跡 ―
                  </p>
                  {recentQuests.length === 0 ? (
                    <p className="text-xs text-center" style={{ color: '#c0a870', fontFamily: 'serif' }}>
                      まだ記録がない
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {recentQuests.map(q => (
                        <div
                          key={q.id}
                          className="text-xs flex justify-between"
                          style={{ color: '#5a3a2a', fontFamily: 'serif' }}
                        >
                          <span className="truncate flex-1 mr-1">{q.questName}</span>
                          <span style={{ color: '#8b6914', whiteSpace: 'nowrap' }}>
                            +{q.xpGained.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right Page ── */}
              <div className="flex-1 p-4 pl-3 flex flex-col items-center">
                {/* Page ornament */}
                <div className="text-center mb-2">
                  <span style={{ color: '#c9a227', fontSize: 10 }}>✦ ✦ ✦</span>
                </div>

                <p
                  className="text-center text-xs mb-3"
                  style={{ color: '#8b7355', fontFamily: 'serif', letterSpacing: '0.1em' }}
                >
                  ― 勇者の石版 ―
                </p>

                {/* Radar chart */}
                <div className="flex justify-center">
                  <RadarChart stats={data.stats} size={180} animate={true} />
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full my-3"
                  style={{ background: 'linear-gradient(90deg, transparent, #8b7355, transparent)' }}
                />

                {/* Stat XP values */}
                <div className="w-full space-y-1">
                  {data.stats.map(stat => (
                    <div key={stat.id} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: stat.color }}
                      />
                      <span
                        className="text-xs flex-1 truncate font-cinzel"
                        style={{ color: '#5a3a2a', fontSize: 9 }}
                      >
                        {stat.englishName}
                      </span>
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: 40,
                          background: 'rgba(44,24,16,0.12)',
                          border: '1px solid rgba(139,115,85,0.3)',
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (stat.xp / Math.max(...data.stats.map(s => s.xp), 1)) * 100)}%`,
                            background: stat.color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: '#8b6914', fontFamily: 'serif', minWidth: 28, textAlign: 'right', fontSize: 9 }}
                      >
                        {stat.xp.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Page number */}
                <div
                  className="mt-4 text-xs"
                  style={{ color: '#c0a870', fontFamily: 'serif' }}
                >
                  — II —
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quest Button ── */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              soundEngine.playClick();
              navigate('quest');
            }}
            className="w-full py-5 rounded-xl flex items-center justify-center gap-3 font-cinzel tracking-widest font-bold transition-all active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #1a0f3a 0%, #2d1b4e 50%, #1a0f3a 100%)',
              border: '2px solid rgba(212,160,23,0.6)',
              color: '#ffd700',
              boxShadow: '0 0 20px rgba(212,160,23,0.15)',
            }}
          >
            <Sword size={20} />
            <span>クエストを受ける</span>
          </button>
        </div>

        {/* ── Quest History (compact) ── */}
        {data.questHistory.length > 0 && (
          <div className="px-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(26,15,58,0.8)',
                border: '1px solid rgba(212,160,23,0.2)',
              }}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={14} style={{ color: '#d4a017' }} />
                  <span
                    className="text-xs font-cinzel"
                    style={{ color: '#f0c040', letterSpacing: '0.1em' }}
                  >
                    最近の功績
                  </span>
                </div>
                <button
                  onClick={() => navigate('timeline')}
                  className="text-xs"
                  style={{ color: '#7b2d8b' }}
                >
                  すべて見る →
                </button>
              </div>
              <div
                className="h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.3), transparent)' }}
              />
              {data.questHistory.slice(0, 4).map(q => {
                const stat = data.stats.find(s => s.id === q.statId);
                return (
                  <div
                    key={q.id}
                    className="px-4 py-2.5 flex items-center gap-3 border-b border-opacity-20"
                    style={{ borderColor: 'rgba(74,56,112,0.4)' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: stat?.color ?? '#c084fc' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: '#f4e4bc' }}>
                        {q.questName}
                      </p>
                      <p className="text-xs" style={{ color: '#4a3870', fontSize: 10 }}>
                        {q.statEnglishName} · {q.difficulty} · {formatDuration(q.durationMinutes)}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: '#f0c040' }}
                    >
                      +{q.xpGained.toFixed(1)} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Navigation />

      {/* Level Up Overlay */}
      {showLevelUp && lastResult && (
        <LevelUpOverlay
          newLevel={lastResult.newLevel}
          onDismiss={dismissLevelUp}
        />
      )}
    </div>
  );
}
