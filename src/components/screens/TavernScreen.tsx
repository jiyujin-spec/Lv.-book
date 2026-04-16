'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Play, X } from 'lucide-react';
import type { PresetQuest, ActiveQuest, Difficulty } from '@/types/game';
import { DIFFICULTY_COLORS, calculateXP, formatDuration } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import Navigation from '../Navigation';
import soundEngine from '@/lib/soundEngine';

export default function TavernScreen() {
  const { state, navigate, startQuest, deletePresetQuest } = useGame();
  const { data } = state;

  const [selected, setSelected] = useState<PresetQuest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleSelect(q: PresetQuest) {
    soundEngine.playMenuOpen();
    setSelected(q);
  }

  function handleStart() {
    if (!selected) return;
    const stat = data.stats.find(s => s.id === selected.statId);
    if (!stat) return;
    const quest: ActiveQuest = {
      questName: selected.name,
      statId: selected.statId,
      statEnglishName: stat.englishName,
      difficulty: selected.difficulty as Difficulty,
      durationMinutes: selected.durationMinutes,
      startedAt: Date.now(),
    };
    setSelected(null);
    startQuest(quest); // navigates to timer internally
  }

  function handleDelete(id: string) {
    deletePresetQuest(id);
    setConfirmDelete(null);
    soundEngine.playClick();
  }

  const presets = data.presetQuests;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#04091a' }}>
      {/* Ambient orb */}
      <div className="bg-orb" style={{ width: 250, height: 250, background: '#201060', top: -40, right: -60, animationDelay: '2s' }} />

      {/* ── Header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(184,204,224,0.12)' }}
      >
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#f0c030' }}>
            冒険者の酒場
          </h1>
          <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.15em' }}>
            ADVENTURER&apos;S TAVERN
          </p>
        </div>
        {/* Create new quest button */}
        <button
          onClick={() => { soundEngine.playMenuOpen(); navigate('questCreate'); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded transition-all active:scale-90"
          style={{
            background: 'rgba(240,192,48,0.12)',
            border: '1px solid rgba(240,192,48,0.4)',
            color: '#f0c030',
          }}
        >
          <Plus size={15} />
          <span className="font-cinzel text-xs">制作</span>
        </button>
      </div>

      {/* ── Quest list ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-3" style={{ paddingBottom: 90 }}>

        {presets.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-5 animate-float">🏰</div>
            <DQWindow className="w-full">
              <p className="text-sm mb-1" style={{ color: '#7090b0', fontFamily: 'serif' }}>
                まだクエストがない
              </p>
              <p className="text-xs mb-4" style={{ color: '#2a3a50' }}>
                右上の「制作」ボタンからクエストを作ろう
              </p>
              <DQButton onClick={() => { soundEngine.playMenuOpen(); navigate('questCreate'); }} variant="gold">
                ◆ 最初のクエストを作る
              </DQButton>
            </DQWindow>
          </div>
        ) : (
          presets.map(q => {
            const stat = data.stats.find(s => s.id === q.statId);
            const diffColor = DIFFICULTY_COLORS[q.difficulty];
            const xpPreview = calculateXP(q.difficulty, q.durationMinutes, 1.0);

            return (
              <div key={q.id} className="relative">
                {/* Quest card */}
                <button
                  onClick={() => handleSelect(q)}
                  className="quest-card w-full text-left"
                >
                  <DQWindow>
                    <div className="flex items-center gap-3">
                      {/* Stat color dot */}
                      <div
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{
                          background: stat?.color ?? '#4080e0',
                          boxShadow: `0 0 8px ${stat?.color ?? '#4080e0'}`,
                        }}
                      />

                      {/* Name + tags */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#e8f0f8', fontFamily: 'serif' }}>
                          {q.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-cinzel text-xs" style={{ color: stat?.color ?? '#4080e0', fontSize: 10 }}>
                            {stat?.englishName ?? q.statId}
                          </span>
                          <span
                            className="font-cinzel text-xs px-1.5 py-0.5 rounded-sm"
                            style={{
                              background: `${diffColor}18`,
                              border: `1px solid ${diffColor}50`,
                              color: diffColor,
                              fontSize: 10,
                            }}
                          >
                            {q.difficulty}
                          </span>
                          <span className="text-xs" style={{ color: '#4a6080', fontSize: 10 }}>
                            {formatDuration(q.durationMinutes)}
                          </span>
                        </div>
                      </div>

                      {/* XP preview */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-cinzel text-sm font-bold" style={{ color: '#f0c030' }}>
                          {xpPreview.toFixed(1)}
                        </p>
                        <p className="font-cinzel text-xs" style={{ color: '#4a6080', fontSize: 9 }}>XP</p>
                      </div>
                    </div>
                  </DQWindow>
                </button>

                {/* Delete button (small, top-right of card) */}
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDelete(q.id); soundEngine.playClick(); }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded transition-all active:scale-90"
                  style={{ color: '#2a3a50' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <Navigation />

      {/* ── Quest detail modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => { soundEngine.playClick(); setSelected(null); }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <DQWindow>
              {/* Close */}
              <button
                onClick={() => { soundEngine.playClick(); setSelected(null); }}
                className="absolute top-3 right-3 p-1 rounded"
                style={{ color: '#4a6080' }}
              >
                <X size={16} />
              </button>

              <div className="text-center mb-4">
                <p className="font-cinzel text-xs mb-1" style={{ color: '#4a6080', letterSpacing: '0.25em' }}>
                  ◆ QUEST DETAILS ◆
                </p>
                <h2 className="text-lg font-bold" style={{ color: '#e8f0f8', fontFamily: 'serif' }}>
                  {selected.name}
                </h2>
              </div>

              <DQDivider />

              {/* Detail rows */}
              {(() => {
                const stat = data.stats.find(s => s.id === selected.statId);
                const diffColor = DIFFICULTY_COLORS[selected.difficulty];
                const xp = calculateXP(selected.difficulty, selected.durationMinutes, 1.0);
                return (
                  <div className="space-y-3 mb-4">
                    {[
                      { label: '成長能力', value: stat?.englishName ?? '?', color: stat?.color },
                      { label: '難易度',   value: selected.difficulty,     color: diffColor },
                      { label: '実行時間', value: formatDuration(selected.durationMinutes) },
                      { label: '予測XP',   value: `${xp.toFixed(1)} XP (1.0× 集中)`, color: '#f0c030' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center text-sm">
                        <span style={{ color: '#4a6080' }}>{row.label}</span>
                        <span
                          className="font-cinzel font-bold"
                          style={{ color: row.color ?? '#b8cce0' }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <DQDivider />

              {/* Start button */}
              <DQButton onClick={handleStart} variant="gold">
                <div className="flex items-center justify-center gap-2">
                  <Play size={16} />
                  <span>クエスト開始</span>
                </div>
              </DQButton>
            </DQWindow>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative z-10 w-full max-w-xs animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <DQWindow>
              <p className="text-center text-sm mb-4" style={{ color: '#b8cce0', fontFamily: 'serif' }}>
                このクエストを削除しますか？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded font-cinzel text-sm"
                  style={{ background: 'rgba(1,8,16,0.5)', border: '1px solid rgba(184,204,224,0.2)', color: '#7090b0' }}
                >
                  いいえ
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                  style={{ background: 'rgba(180,40,40,0.25)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444' }}
                >
                  削除する
                </button>
              </div>
            </DQWindow>
          </div>
        </div>
      )}
    </div>
  );
}
