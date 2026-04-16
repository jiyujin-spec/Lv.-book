'use client';

import React, { useState } from 'react';
import { ScrollText, Flame, Star, TrendingUp } from 'lucide-react';
import { formatDateTime, formatDuration, DIFFICULTY_COLORS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import Navigation from '../Navigation';

type Filter = 'all' | string; // 'all' or stat id

export default function TimelineScreen() {
  const { state } = useGame();
  const { data } = state;
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all'
    ? data.questHistory
    : data.questHistory.filter(q => q.statId === filter);

  // Stats summary
  const totalQuests = data.questHistory.length;
  const totalTime = data.questHistory.reduce((sum, q) => sum + q.durationMinutes, 0);
  const bestXP = data.questHistory.reduce((max, q) => Math.max(max, q.xpGained), 0);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a0f3a 0%, #0d0820 70%)' }}
    >
      {/* ── Header ── */}
      <div
        className="relative z-10 px-4 pt-safe-top pt-6 pb-4"
        style={{ borderBottom: '1px solid rgba(212,160,23,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <ScrollText size={20} style={{ color: '#d4a017' }} />
          <div>
            <h1
              className="text-base font-bold font-cinzel tracking-widest"
              style={{ color: '#ffd700' }}
            >
              吟遊詩人の書
            </h1>
            <p className="text-xs font-cinzel" style={{ color: '#7b2d8b', letterSpacing: '0.15em' }}>
              CHRONICLE OF BARDS
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={16} />, label: '総クエスト', value: totalQuests, unit: '回' },
            { icon: <Flame size={16} />, label: '総時間', value: totalTime >= 60 ? `${Math.floor(totalTime/60)}h${totalTime%60}m` : `${totalTime}m`, unit: '' },
            { icon: <TrendingUp size={16} />, label: '最高XP', value: bestXP.toFixed(1), unit: 'XP' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center"
              style={{
                background: 'rgba(26,15,58,0.9)',
                border: '1px solid rgba(212,160,23,0.2)',
              }}
            >
              <div className="flex justify-center mb-1" style={{ color: '#d4a017' }}>
                {s.icon}
              </div>
              <p
                className="font-cinzel font-bold text-sm"
                style={{ color: '#ffd700' }}
              >
                {s.value}
                <span className="text-xs ml-0.5" style={{ color: '#d4a017' }}>{s.unit}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#4a3870', fontSize: 10 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Stat Filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...data.stats.map(s => s.id)].map(f => {
            const stat = f !== 'all' ? data.stats.find(s => s.id === f) : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all"
                style={{
                  background: filter === f
                    ? (stat ? `${stat.color}25` : 'rgba(212,160,23,0.2)')
                    : 'rgba(26,15,58,0.6)',
                  border: `1px solid ${filter === f ? (stat?.color ?? '#d4a017') : 'rgba(74,56,112,0.4)'}`,
                  color: filter === f ? (stat?.color ?? '#ffd700') : '#4a3870',
                }}
              >
                {f === 'all' ? 'すべて' : stat?.englishName ?? f}
              </button>
            );
          })}
        </div>

        {/* ── Quest Log ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📜</p>
            <p className="text-sm" style={{ color: '#4a3870', fontFamily: 'serif' }}>
              まだ物語は始まっていない
            </p>
            <p className="text-xs mt-2" style={{ color: '#2d1b4e' }}>
              クエストを完了すると記録されます
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const stat = data.stats.find(s => s.id === q.statId);
              const diffColor = DIFFICULTY_COLORS[q.difficulty];
              return (
                <div
                  key={q.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(26,15,58,0.85)',
                    border: '1px solid rgba(74,56,112,0.4)',
                  }}
                >
                  {/* Color accent bar */}
                  <div
                    className="h-1"
                    style={{ background: `linear-gradient(90deg, ${stat?.color ?? '#c084fc'}, transparent)` }}
                  />

                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3
                          className="font-bold text-sm truncate"
                          style={{ color: '#f4e4bc', fontFamily: 'Georgia, serif' }}
                        >
                          {q.questName}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#4a3870' }}>
                          {formatDateTime(q.completedAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-lg font-bold font-cinzel"
                          style={{ color: '#ffd700' }}
                        >
                          +{q.xpGained.toFixed(1)}
                        </p>
                        <p className="text-xs" style={{ color: '#d4a017' }}>XP</p>
                      </div>
                    </div>

                    {/* Bottom row – tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-cinzel"
                        style={{
                          background: `${stat?.color ?? '#c084fc'}18`,
                          border: `1px solid ${stat?.color ?? '#c084fc'}40`,
                          color: stat?.color ?? '#c084fc',
                        }}
                      >
                        {q.statEnglishName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-cinzel"
                        style={{
                          background: `${diffColor}18`,
                          border: `1px solid ${diffColor}40`,
                          color: diffColor,
                        }}
                      >
                        {q.difficulty}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(74,56,112,0.3)',
                          border: '1px solid rgba(74,56,112,0.4)',
                          color: '#8b7355',
                        }}
                      >
                        {formatDuration(q.durationMinutes)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(74,56,112,0.3)',
                          border: '1px solid rgba(74,56,112,0.4)',
                          color: '#8b7355',
                        }}
                      >
                        集中{q.focusRate}×
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
