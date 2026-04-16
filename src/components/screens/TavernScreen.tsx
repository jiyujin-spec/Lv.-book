'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Play, X, Check, Timer, CheckSquare, Beer } from 'lucide-react';
import type { PresetQuest, ActiveQuest, Difficulty } from '@/types/game';
import { DIFFICULTY_COLORS, TASK_XP } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import Navigation from '../Navigation';
import QuestClearStamp from '../QuestClearStamp';
import LevelUpOverlay from '../LevelUpOverlay';
import soundEngine from '@/lib/soundEngine';

export default function TavernScreen() {
  const { state, navigate, startQuest, deletePresetQuest, completeTaskQuest, isTaskCompletedToday } = useGame();
  const { data } = state;

  const [selected,       setSelected]       = useState<PresetQuest | null>(null);
  const [confirmDelete,  setConfirmDelete]   = useState<string | null>(null);
  const [stampPreset,    setStampPreset]     = useState<{ xp: number } | null>(null);
  const [levelUpLevel,   setLevelUpLevel]    = useState<number | null>(null);

  // Separate task quests and time quests
  const taskQuests = data.presetQuests.filter(q => q.questType === 'task');
  const timeQuests = data.presetQuests.filter(q => q.questType === 'time');

  // ── Open detail modal ─────────────────────────────────────────────────────
  function handleSelect(q: PresetQuest) {
    soundEngine.playMenuOpen();
    setSelected(q);
  }

  // ── Time quest: start timer ───────────────────────────────────────────────
  function handleStartTimeQuest() {
    if (!selected) return;
    const stat = data.stats.find(s => s.id === selected.statId);
    if (!stat) return;
    const quest: ActiveQuest = {
      questName: selected.name,
      statId: selected.statId,
      statEnglishName: stat.englishName,
      difficulty: selected.difficulty as Difficulty,
      questType: 'time',
      durationMinutes: 0,
      startedAt: Date.now(),
    };
    setSelected(null);
    startQuest(quest);
  }

  // ── Task quest: complete via detail modal ─────────────────────────────────
  const handleCompleteTask = useCallback((q: PresetQuest, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTaskCompletedToday(q.id)) return;
    const result = completeTaskQuest(q);
    if (!result) return;

    setStampPreset({ xp: result.xpGained });

    if (result.leveledUp) {
      setTimeout(() => setLevelUpLevel(result.newLevel), 3100);
    }
  }, [completeTaskQuest, isTaskCompletedToday]);

  function handleDelete(id: string) {
    deletePresetQuest(id);
    setConfirmDelete(null);
    soundEngine.playClick();
  }

  const presets = data.presetQuests;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0d0b08' }}>
      {/* Ambient orb */}
      <div className="bg-orb" style={{ width: 250, height: 250, background: '#1a1208', top: -40, right: -60, animationDelay: '2s' }} />

      {/* ── Header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(107,93,63,0.2)' }}
      >
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#c4a35a' }}>
            冒険者の酒場
          </h1>
          <p className="font-cinzel text-xs" style={{ color: '#6a6050', letterSpacing: '0.15em' }}>
            ADVENTURER&apos;S TAVERN
          </p>
        </div>
        <button
          onClick={() => { soundEngine.playMenuOpen(); navigate('questCreate'); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded transition-all active:scale-90"
          style={{
            background: 'rgba(196,163,90,0.1)',
            border: '1px solid rgba(196,163,90,0.35)',
            color: '#c4a35a',
          }}
        >
          <Plus size={15} />
          <span className="font-cinzel text-xs">制作</span>
        </button>
      </div>

      {/* ── Quest list — two sections ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 animate-float" style={{ filter: 'drop-shadow(0 0 10px rgba(196,163,90,0.25))' }}>
              <Beer size={52} style={{ color: '#c4a35a' }} />
            </div>
            <DQWindow className="w-full">
              <p className="text-sm mb-1" style={{ color: '#8a7e6b', fontFamily: 'serif' }}>
                まだクエストがない
              </p>
              <p className="text-xs mb-4" style={{ color: '#4a4238' }}>
                右上の「制作」ボタンからクエストを作ろう
              </p>
              <DQButton onClick={() => { soundEngine.playMenuOpen(); navigate('questCreate'); }} variant="gold">
                ◆ 最初のクエストを作る
              </DQButton>
            </DQWindow>
          </div>
        ) : (
          <>
            {/* ── Section: 今日の任務 (Task quests) ── */}
            {taskQuests.length > 0 && (
              <div>
                <p className="font-cinzel text-xs mb-2 px-1" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>
                  ✦ 今日の任務
                </p>
                <div className="space-y-2.5">
                  {taskQuests.map(q => {
                    const stat = data.stats.find(s => s.id === q.statId);
                    const diffColor = DIFFICULTY_COLORS[q.difficulty];
                    const taskXp = TASK_XP[q.difficulty];
                    const completed = isTaskCompletedToday(q.id);

                    return (
                      <div key={q.id} className={`relative ${completed ? 'task-completed' : ''}`}>
                        <button
                          onClick={() => handleSelect(q)}
                          className="quest-card w-full text-left"
                        >
                          <DQWindow>
                            <div className="flex items-center gap-3">
                              {/* Quest type icon */}
                              <div
                                className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: completed ? 'rgba(139,32,32,0.08)' : 'rgba(90,138,74,0.10)',
                                  border: `1px solid ${completed ? 'rgba(139,32,32,0.2)' : 'rgba(90,138,74,0.3)'}`,
                                }}
                              >
                                {completed
                                  ? <Check size={14} style={{ color: '#8b2020' }} />
                                  : <CheckSquare size={14} style={{ color: '#5a8a4a' }} />
                                }
                              </div>

                              {/* Name + tags */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: completed ? '#6a6050' : '#d4cfc0', fontFamily: 'serif' }}>
                                  {q.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="font-cinzel text-xs" style={{ color: stat?.color ?? '#a88040', fontSize: 10 }}>
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
                                </div>
                              </div>

                              {/* Right side: XP */}
                              <div className="text-right flex-shrink-0">
                                {completed ? (
                                  <p className="font-cinzel text-xs" style={{ color: '#8b2020', fontSize: 10 }}>済</p>
                                ) : (
                                  <>
                                    <p className="font-cinzel text-sm font-bold" style={{ color: '#c4a35a' }}>
                                      {taskXp}
                                    </p>
                                    <p className="font-cinzel text-xs" style={{ color: '#6a6050', fontSize: 9 }}>XP</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </DQWindow>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete(q.id); soundEngine.playClick(); }}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded transition-all active:scale-90"
                          style={{ color: '#3a3428' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Section: 冒険の道中 (Time quests) ── */}
            {timeQuests.length > 0 && (
              <div>
                <p className="font-cinzel text-xs mb-2 px-1" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>
                  ✦ 冒険の道中
                </p>
                <div className="space-y-2.5">
                  {timeQuests.map(q => {
                    const stat = data.stats.find(s => s.id === q.statId);
                    const diffColor = DIFFICULTY_COLORS[q.difficulty];

                    return (
                      <div key={q.id} className="relative">
                        <button
                          onClick={() => handleSelect(q)}
                          className="quest-card w-full text-left"
                        >
                          <DQWindow>
                            <div className="flex items-center gap-3">
                              {/* Quest type icon */}
                              <div
                                className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: 'rgba(107,140,170,0.10)',
                                  border: '1px solid rgba(107,140,170,0.3)',
                                }}
                              >
                                <Timer size={14} style={{ color: '#6b8caa' }} />
                              </div>

                              {/* Name + tags */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: '#d4cfc0', fontFamily: 'serif' }}>
                                  {q.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="font-cinzel text-xs" style={{ color: stat?.color ?? '#a88040', fontSize: 10 }}>
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
                                  <span
                                    className="font-cinzel text-xs px-1.5 py-0.5 rounded-sm"
                                    style={{
                                      background: 'rgba(107,140,170,0.08)',
                                      border: '1px solid rgba(107,140,170,0.25)',
                                      color: '#6b8caa',
                                      fontSize: 10,
                                    }}
                                  >
                                    時間
                                  </span>
                                </div>
                              </div>

                              {/* Right side */}
                              <div className="text-right flex-shrink-0">
                                <p className="font-cinzel text-xs" style={{ color: '#6a6050', fontSize: 9 }}>時間に比例</p>
                                <p className="font-cinzel text-xs" style={{ color: '#4a4238', fontSize: 9 }}>XP</p>
                              </div>
                            </div>
                          </DQWindow>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete(q.id); soundEngine.playClick(); }}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded transition-all active:scale-90"
                          style={{ color: '#3a3428' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
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
              <button
                onClick={() => { soundEngine.playClick(); setSelected(null); }}
                className="absolute top-3 right-3 p-1 rounded"
                style={{ color: '#6a6050' }}
              >
                <X size={16} />
              </button>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {selected.questType === 'time'
                    ? <Timer size={14} style={{ color: '#6b8caa' }} />
                    : <CheckSquare size={14} style={{ color: '#5a8a4a' }} />
                  }
                  <p className="font-cinzel text-xs" style={{ color: '#6a6050', letterSpacing: '0.25em' }}>
                    ◆ QUEST DETAILS ◆
                  </p>
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#d4cfc0', fontFamily: 'serif' }}>
                  {selected.name}
                </h2>
              </div>

              <DQDivider />

              {(() => {
                const stat      = data.stats.find(s => s.id === selected.statId);
                const diffColor = DIFFICULTY_COLORS[selected.difficulty];
                const isTime    = selected.questType === 'time';
                const taskXp    = TASK_XP[selected.difficulty];
                const completed = isTaskCompletedToday(selected.id);
                return (
                  <div className="space-y-3 mb-4">
                    {[
                      { label: 'クエスト形式', value: isTime ? 'ストップウォッチ（時間形式）' : 'チェックリスト（タスク形式）', color: isTime ? '#6b8caa' : '#5a8a4a' },
                      { label: '成長能力',   value: stat?.englishName ?? '?', color: stat?.color },
                      { label: '難易度',     value: selected.difficulty,     color: diffColor },
                      { label: '報酬XP',     value: isTime ? '時間 × 集中度で変動' : `${taskXp} XP（固定）`, color: '#c4a35a' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center text-sm">
                        <span style={{ color: '#6a6050' }}>{row.label}</span>
                        <span className="font-cinzel font-bold text-right" style={{ color: row.color ?? '#b8a88a', maxWidth: '60%', fontSize: 12 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                    {!isTime && completed && (
                      <p className="text-xs text-center" style={{ color: '#8b2020' }}>
                        ※ 本日はすでに完了済み
                      </p>
                    )}
                  </div>
                );
              })()}

              <DQDivider />

              {selected.questType === 'time' ? (
                <DQButton onClick={handleStartTimeQuest} variant="gold">
                  <div className="flex items-center justify-center gap-2">
                    <Play size={16} />
                    <span>冒険を開始する</span>
                  </div>
                </DQButton>
              ) : (
                <DQButton
                  onClick={() => { setSelected(null); handleCompleteTask(selected); }}
                  disabled={isTaskCompletedToday(selected.id)}
                  variant="gold"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Check size={16} strokeWidth={2.5} />
                    <span>{isTaskCompletedToday(selected.id) ? '本日完了済み' : '任務完了！'}</span>
                  </div>
                </DQButton>
              )}
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
              <p className="text-center text-sm mb-4" style={{ color: '#b8a88a', fontFamily: 'serif' }}>
                このクエストを削除しますか？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded font-cinzel text-sm"
                  style={{ background: 'rgba(26,22,16,0.6)', border: '1px solid rgba(107,93,63,0.3)', color: '#8a7e6b' }}
                >
                  いいえ
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 rounded font-cinzel text-sm font-bold"
                  style={{ background: 'rgba(139,32,32,0.2)', border: '1px solid rgba(139,32,32,0.4)', color: '#c45050' }}
                >
                  削除する
                </button>
              </div>
            </DQWindow>
          </div>
        </div>
      )}

      {/* ── QUEST CLEAR stamp (task quests) ── */}
      <QuestClearStamp
        visible={stampPreset !== null}
        xpGained={stampPreset?.xp}
        onDone={() => setStampPreset(null)}
      />

      {/* ── Level-up overlay ── */}
      {levelUpLevel !== null && (
        <LevelUpOverlay newLevel={levelUpLevel} onDismiss={() => setLevelUpLevel(null)} />
      )}
    </div>
  );
}
