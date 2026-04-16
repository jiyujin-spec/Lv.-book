'use client';

import React, { useState } from 'react';
import { ScrollText, Flame, Star, TrendingUp, Timer, CheckSquare } from 'lucide-react';
import { formatDateTime, formatDuration, DIFFICULTY_COLORS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow from '../DQWindow';
import Navigation from '../Navigation';
import soundEngine from '@/lib/soundEngine';

export default function TimelineScreen() {
  const { state } = useGame();
  const { data } = state;
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? data.questHistory
    : data.questHistory.filter(q => q.statId === filter);

  const totalTime = data.questHistory.reduce((s, q) => s + q.durationMinutes, 0);
  const bestXP    = data.questHistory.reduce((m, q) => Math.max(m, q.xpGained), 0);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0d0b08' }}>
      <div className="bg-orb" style={{ width: 200, height: 200, background: '#1a1208', top: -40, right: -30, animationDelay: '1s' }} />

      {/* Header */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(107,93,63,0.2)' }}
      >
        <ScrollText size={19} style={{ color: '#c4a35a' }} />
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#c4a35a' }}>
            吟遊詩人の書
          </h1>
          <p className="font-cinzel text-xs" style={{ color: '#6a6050', letterSpacing: '0.15em' }}>
            CHRONICLE OF BARDS
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={15} />, label: '総クエスト', value: `${data.questHistory.length}回` },
            {
              icon: <Flame size={15} />,
              label: '総時間',
              value: totalTime >= 60
                ? `${Math.floor(totalTime/60)}h${Math.round(totalTime%60)}m`
                : `${Math.round(totalTime)}m`,
            },
            { icon: <TrendingUp size={15} />, label: '最高XP', value: `${bestXP.toFixed(1)}` },
          ].map((s, i) => (
            <DQWindow key={i} className="text-center">
              <div className="flex justify-center mb-1" style={{ color: '#c4a35a' }}>{s.icon}</div>
              <p className="font-cinzel font-bold text-sm" style={{ color: '#c4a35a' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#4a4238', fontSize: 10 }}>{s.label}</p>
            </DQWindow>
          ))}
        </div>

        {/* Stat filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...data.stats.map(s => s.id)].map(f => {
            const stat   = f !== 'all' ? data.stats.find(s => s.id === f) : null;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => { soundEngine.playSelect(); setFilter(f); }}
                className="flex-shrink-0 px-3 py-1.5 rounded font-cinzel text-xs transition-all"
                style={{
                  background: active ? (stat ? `${stat.color}18` : 'rgba(196,163,90,0.12)') : 'rgba(26,22,16,0.8)',
                  border: `1px solid ${active ? (stat?.color ?? '#c4a35a') : 'rgba(107,93,63,0.2)'}`,
                  color: active ? (stat?.color ?? '#c4a35a') : '#4a4238',
                }}
              >
                {f === 'all' ? 'すべて' : stat?.englishName ?? f}
              </button>
            );
          })}
        </div>

        {/* Quest log */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📜</p>
            <DQWindow>
              <p className="text-sm" style={{ color: '#6a6050', fontFamily: 'serif' }}>まだ物語は始まっていない</p>
              <p className="text-xs mt-1" style={{ color: '#3a3428' }}>クエストを完了すると記録されます</p>
            </DQWindow>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const stat      = data.stats.find(s => s.id === q.statId);
              const diffColor = DIFFICULTY_COLORS[q.difficulty];
              const isTime    = (q.questType ?? 'time') === 'time';

              return (
                <DQWindow key={q.id}>
                  {/* Color accent bar */}
                  <div
                    className="absolute top-3 left-0 w-1 h-8 rounded-r-sm"
                    style={{ background: stat?.color ?? '#a88040' }}
                  />
                  <div className="pl-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-bold truncate" style={{ color: '#d4cfc0', fontFamily: 'serif' }}>
                          {q.questName}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#4a4238', fontSize: 10 }}>
                          {formatDateTime(q.completedAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-cinzel text-base font-bold" style={{ color: '#c4a35a' }}>
                          +{q.xpGained.toFixed(1)}
                        </p>
                        <p className="font-cinzel text-xs" style={{ color: '#6a6050', fontSize: 9 }}>XP</p>
                      </div>
                    </div>

                    {/* Tag row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="font-cinzel px-1.5 py-0.5 rounded-sm"
                        style={{ background: `${stat?.color ?? '#a88040'}15`, border: `1px solid ${stat?.color ?? '#a88040'}40`, color: stat?.color ?? '#a88040', fontSize: 9 }}
                      >
                        {stat?.englishName ?? q.statId}
                      </span>

                      <span
                        className="font-cinzel px-1.5 py-0.5 rounded-sm"
                        style={{ background: `${diffColor}15`, border: `1px solid ${diffColor}40`, color: diffColor, fontSize: 9 }}
                      >
                        {q.difficulty}
                      </span>

                      {isTime ? (
                        <>
                          <span
                            className="font-cinzel px-1.5 py-0.5 rounded-sm flex items-center gap-0.5"
                            style={{ background: 'rgba(107,140,170,0.08)', border: '1px solid rgba(107,140,170,0.25)', color: '#6b8caa', fontSize: 9 }}
                          >
                            <Timer size={8} />
                            {q.durationMinutes > 0 ? formatDuration(q.durationMinutes) + 'の冒険' : '時間形式'}
                          </span>
                          <span
                            className="font-cinzel px-1.5 py-0.5 rounded-sm"
                            style={{ background: 'rgba(107,93,63,0.06)', border: '1px solid rgba(107,93,63,0.2)', color: '#6a6050', fontSize: 9 }}
                          >
                            集中{q.focusRate}×
                          </span>
                        </>
                      ) : (
                        <span
                          className="font-cinzel px-1.5 py-0.5 rounded-sm flex items-center gap-0.5"
                          style={{ background: 'rgba(90,138,74,0.08)', border: '1px solid rgba(90,138,74,0.25)', color: '#5a8a4a', fontSize: 9 }}
                        >
                          <CheckSquare size={8} />
                          任務遂行
                        </span>
                      )}
                    </div>
                  </div>
                </DQWindow>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
