'use client';

import React, { useEffect, useState } from 'react';
import { Sword } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { getXPProgress, getHeroTitle } from '@/lib/gameLogic';
import RadarChart from '../RadarChart';
import ParticleEffect from '../ParticleEffect';
import Navigation from '../Navigation';
import LevelUpOverlay from '../LevelUpOverlay';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import soundEngine from '@/lib/soundEngine';

export default function MainScreen() {
  const { state, navigate, dismissLevelUp } = useGame();
  const { data, showLevelUp, lastResult } = state;
  const [xpFilled, setXpFilled] = useState(false);

  const progress = getXPProgress(data.totalXP);
  const heroTitle = getHeroTitle(data.level);
  const maxStatXP = Math.max(...data.stats.map(s => s.xp), 1);

  useEffect(() => {
    const t = setTimeout(() => setXpFilled(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#04091a' }}
    >
      {/* Ambient orbs */}
      <div className="bg-orb" style={{ width: 300, height: 300, background: '#1020a0', top: -80, left: -60, animationDelay: '0s' }} />
      <div className="bg-orb" style={{ width: 200, height: 200, background: '#301060', bottom: 60, right: -40, animationDelay: '4s' }} />
      <ParticleEffect count={18} />

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 pt-safe" style={{ paddingBottom: 80 }}>

        {/* ── Title bar ── */}
        <div className="text-center pt-5 pb-4">
          <h1 className="font-cinzel text-lg font-bold tracking-[0.35em]" style={{ color: '#f0c030' }}>
            ◆ Lv. BOOK ◆
          </h1>
          <p className="font-cinzel text-xs tracking-[0.25em] mt-0.5" style={{ color: '#4a6080' }}>
            冒険の書
          </p>
        </div>

        {/* ── Character Window ── */}
        <DQWindow className="mb-4">
          {/* Hero name + title + level */}
          <div className="text-center mb-4">
            <p className="text-xl font-bold" style={{ color: '#e8f0f8', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
              {data.userName}
            </p>
            <p className="text-xs mt-1 font-cinzel" style={{ color: '#7090b0', letterSpacing: '0.15em' }}>
              {heroTitle.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div
                className="flex items-baseline gap-1 px-4 py-1.5 rounded"
                style={{ background: '#010810', border: '1px solid #b8cce0' }}
              >
                <span className="font-cinzel text-xs" style={{ color: '#7090b0' }}>Lv.</span>
                <span className="font-cinzel text-3xl font-bold leading-none" style={{ color: '#ffd700' }}>
                  {data.level}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold font-cinzel" style={{ color: '#b8cce0' }}>
                  {heroTitle.title}
                </p>
              </div>
            </div>
          </div>

          <DQDivider />

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#4a6080' }}>
              <span className="font-cinzel">EXP</span>
              <span>{progress.currentLevelXP.toFixed(1)} / {progress.requiredXP}</span>
            </div>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: xpFilled ? `${progress.percentage}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-right mt-1" style={{ color: '#4a6080' }}>
              総計 {data.totalXP.toFixed(1)} XP
            </p>
          </div>

          <DQDivider />

          {/* ── Stat list with bars ── */}
          <div>
            <p className="font-cinzel text-xs text-center mb-3" style={{ color: '#4a6080', letterSpacing: '0.2em' }}>
              ステータス
            </p>
            <div className="space-y-3">
              {data.stats.map(stat => {
                const ratio = Math.min(1, stat.xp / maxStatXP);
                return (
                  <div key={stat.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: stat.color, boxShadow: `0 0 5px ${stat.color}` }}
                        />
                        <span className="font-cinzel text-xs font-bold" style={{ color: stat.color }}>
                          {stat.englishName}
                        </span>
                        <span className="text-xs" style={{ color: '#4a6080', fontSize: 10 }}>
                          {stat.japaneseDescription}
                        </span>
                      </div>
                      <span className="text-xs font-bold ml-2" style={{ color: '#e8f0f8', whiteSpace: 'nowrap' }}>
                        {stat.xp.toFixed(1)}
                      </span>
                    </div>
                    <div className="stat-bar-track">
                      <div
                        className="h-full rounded-sm transition-all duration-1000"
                        style={{
                          width: xpFilled ? `${ratio * 100}%` : '0%',
                          background: stat.color,
                          boxShadow: `0 0 6px ${stat.color}80`,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DQWindow>

        {/* ── Radar chart — full width, responsive ── */}
        <DQWindow title="勇者の石版" className="mb-4">
          <div style={{ maxWidth: 340, margin: '0 auto' }}>
            <RadarChart stats={data.stats} animate />
          </div>
        </DQWindow>

        {/* ── Quest shortcut ── */}
        <div className="mb-4">
          <DQButton
            onClick={() => { soundEngine.playSelect(); navigate('tavern'); }}
            variant="gold"
          >
            <div className="flex items-center justify-center gap-2">
              <Sword size={17} />
              <span>冒険者の酒場へ</span>
            </div>
          </DQButton>
        </div>

        {/* ── Recent log ── */}
        {data.questHistory.length > 0 && (
          <DQWindow title="最近の功績" className="mb-4">
            <div className="space-y-2">
              {data.questHistory.slice(0, 4).map(q => {
                const stat = data.stats.find(s => s.id === q.statId);
                return (
                  <div key={q.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: stat?.color ?? '#4080e0' }}
                    />
                    <span className="flex-1 truncate" style={{ color: '#b8cce0' }}>
                      {q.questName}
                    </span>
                    <span className="flex-shrink-0 font-cinzel font-bold" style={{ color: '#f0c030' }}>
                      +{q.xpGained.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </DQWindow>
        )}
      </div>

      <Navigation />

      {showLevelUp && lastResult && (
        <LevelUpOverlay newLevel={lastResult.newLevel} onDismiss={dismissLevelUp} />
      )}
    </div>
  );
}
