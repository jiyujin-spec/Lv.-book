'use client';

import React, { useState } from 'react';
import { ScrollText, Flame, Star, TrendingUp } from 'lucide-react';
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
    <div className="fixed inset-0 flex flex-col" style={{ background: '#04091a' }}>
      <div className="bg-orb" style={{ width: 200, height: 200, background: '#102050', top: -40, right: -30, animationDelay: '1s' }} />

      {/* Header */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(184,204,224,0.12)' }}
      >
        <ScrollText size={19} style={{ color: '#f0c030' }} />
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#f0c030' }}>
            吟遊詩人の書
          </h1>
          <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.15em' }}>
            CHRONICLE OF BARDS
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={15} />, label: '総クエスト', value: `${data.questHistory.length}回` },
            { icon: <Flame size={15} />, label: '総時間',
              value: totalTime >= 60 ? `${Math.floor(totalTime/60)}h${totalTime%60}m` : `${totalTime}m` },
            { icon: <TrendingUp size={15} />, label: '最高XP', value: `${bestXP.toFixed(1)}` },
          ].map((s, i) => (
            <DQWindow key={i} className="text-center">
              <div className="flex justify-center mb-1" style={{ color: '#f0c030' }}>{s.icon}</div>
              <p className="font-cinzel font-bold text-sm" style={{ color: '#f0c030' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#2a3a50', fontSize: 10 }}>{s.label}</p>
            </DQWindow>
          ))}
        </div>

        {/* Stat filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...data.stats.map(s => s.id)].map(f => {
            const stat = f !== 'all' ? data.stats.find(s => s.id === f) : null;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => { soundEngine.playSelect(); setFilter(f); }}
                className="flex-shrink-0 px-3 py-1.5 rounded font-cinzel text-xs transition-all"
                style={{
                  background: active ? (stat ? `${stat.color}20` : 'rgba(240,192,48,0.15)') : 'rgba(7,18,31,0.8)',
                  border: `1px solid ${active ? (stat?.color ?? '#f0c030') : 'rgba(30,48,80,0.8)'}`,
                  color: active ? (stat?.color ?? '#f0c030') : '#2a3a50',
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
              <p className="text-sm" style={{ color: '#4a6080', fontFamily: 'serif' }}>まだ物語は始まっていない</p>
              <p className="text-xs mt-1" style={{ color: '#1e3050' }}>クエストを完了すると記録されます</p>
            </DQWindow>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const stat = data.stats.find(s => s.id === q.statId);
              const diffColor = DIFFICULTY_COLORS[q.difficulty];
              return (
                <DQWindow key={q.id}>
                  {/* Color accent */}
                  <div
                    className="absolute top-3 left-0 w-1 h-8 rounded-r-sm"
                    style={{ background: stat?.color ?? '#4080e0' }}
                  />
                  <div className="pl-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-bold truncate" style={{ color: '#e8f0f8', fontFamily: 'serif' }}>
                          {q.questName}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#2a3a50', fontSize: 10 }}>
                          {formatDateTime(q.completedAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-cinzel text-base font-bold" style={{ color: '#f0c030' }}>
                          +{q.xpGained.toFixed(1)}
                        </p>
                        <p className="font-cinzel text-xs" style={{ color: '#4a6080', fontSize: 9 }}>XP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { text: stat?.englishName ?? q.statId, color: stat?.color ?? '#4080e0' },
                        { text: q.difficulty, color: diffColor },
                        { text: formatDuration(q.durationMinutes), color: '#4a6080' },
                        { text: `集中${q.focusRate}×`, color: '#4a6080' },
                      ].map((tag, i) => (
                        <span
                          key={i}
                          className="font-cinzel px-1.5 py-0.5 rounded-sm"
                          style={{
                            background: `${tag.color}15`,
                            border: `1px solid ${tag.color}40`,
                            color: tag.color,
                            fontSize: 9,
                          }}
                        >
                          {tag.text}
                        </span>
                      ))}
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
