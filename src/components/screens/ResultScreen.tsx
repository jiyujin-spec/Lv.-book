'use client';

import React, { useState, useEffect } from 'react';
import { Home, BarChart2 } from 'lucide-react';
import { calculateXP, DIFFICULTY_COLORS, TASK_XP } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import { GoldBurst } from '../ParticleEffect';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import QuestClearStamp from '../QuestClearStamp';
import soundEngine from '@/lib/soundEngine';

const FOCUS_OPTIONS = [
  { value: 0.5,  label: '0.5×',  desc: '集中できなかった',  color: '#6a6050' },
  { value: 0.75, label: '0.75×', desc: 'やや散漫だった',    color: '#a88040' },
  { value: 1.0,  label: '1.0×',  desc: '普通だった',        color: '#5a8a4a' },
  { value: 1.25, label: '1.25×', desc: 'よく集中できた',    color: '#3a6a8a' },
  { value: 1.5,  label: '1.5×',  desc: '完璧な集中！',      color: '#6a3a5a' },
];

export default function ResultScreen() {
  const { state, navigate, completeQuest } = useGame();
  const [questSnapshot] = useState(state.activeQuest);
  const quest = questSnapshot;
  const { data } = state;

  const [focusRate,  setFocusRate]  = useState(1.0);
  const [showStamp,  setShowStamp]  = useState(false);
  const [showBurst,  setShowBurst]  = useState(false);
  const [recorded,   setRecorded]   = useState(false);

  const elapsedMs      = quest?.stoppedAt ? quest.stoppedAt - quest.startedAt : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const elapsedSec     = Math.round(elapsedMs / 1000);
  const elapsedMins    = Math.floor(elapsedSec / 60);
  const elapsedSecRem  = elapsedSec % 60;
  const durationDisplay = elapsedSec > 0
    ? `${elapsedMins}分${String(elapsedSecRem).padStart(2,'0')}秒`
    : '—';

  const diffColor  = quest ? DIFFICULTY_COLORS[quest.difficulty] : '#c4a35a';
  const stat       = data.stats.find(s => s.id === quest?.statId);
  const focusOpt   = FOCUS_OPTIONS.find(f => f.value === focusRate) ?? FOCUS_OPTIONS[2];
  const isTask     = quest?.questType === 'task';

  const previewXP = quest
    ? isTask
      ? TASK_XP[quest.difficulty]
      : calculateXP(quest.difficulty, elapsedMinutes, focusRate)
    : 0;

  useEffect(() => {
    const t = setTimeout(() => setShowStamp(true), 250);
    return () => clearTimeout(t);
  }, []);

  function handleRecord() {
    if (recorded || !quest) return;
    setRecorded(true);
    setShowBurst(true);
    completeQuest(focusRate);
    setTimeout(() => navigate('main'), 2400);
  }

  if (!quest) { navigate('main'); return null; }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#0d0b08' }}
    >
      <GoldBurst active={showBurst} onComplete={() => setShowBurst(false)} />

      <QuestClearStamp
        visible={showStamp}
        xpGained={recorded ? previewXP : undefined}
        onDone={() => setShowStamp(false)}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-safe pt-6" style={{ paddingBottom: 110 }}>

        {/* ── Quest summary (parchment) ── */}
        <DQWindow parchment className="mb-4">
          <div className="text-center mb-2">
            <p className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>― クエスト完了の証 ―</p>
          </div>
          <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg,transparent,#8b7355,transparent)' }} />
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'クエスト名', value: quest.questName,         color: '#2c1810', serif: true },
              { label: '成長能力',   value: quest.statEnglishName,    color: stat?.color ?? '#a88040' },
              { label: '難易度',     value: quest.difficulty,         color: diffColor },
              { label: '冒険時間',   value: durationDisplay,          color: '#5a3a2a' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span style={{ color: '#8b7355', fontFamily: 'serif' }}>{row.label}</span>
                <span
                  className="font-bold font-cinzel"
                  style={{ color: row.color, fontFamily: row.serif ? 'Georgia, serif' : undefined }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </DQWindow>

        {/* ── Focus rating (only for time quests) ── */}
        {!isTask && (
          <DQWindow className="mb-4">
            <div className="text-center mb-3">
              <p className="font-cinzel text-xs" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>
                FOCUS RATING ― 集中度の自己申告
              </p>
            </div>
            <div className="space-y-2">
              {FOCUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { soundEngine.playSelect(); setFocusRate(opt.value); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all active:scale-98"
                  style={{
                    background: focusRate === opt.value ? `${opt.color}15` : 'rgba(10,8,6,0.5)',
                    border: `1.5px solid ${focusRate === opt.value ? opt.color : 'rgba(107,93,63,0.3)'}`,
                    boxShadow: focusRate === opt.value ? `0 0 6px ${opt.color}25` : 'none',
                  }}
                >
                  <span
                    className="font-cinzel font-bold text-sm w-14 text-center flex-shrink-0"
                    style={{ color: focusRate === opt.value ? opt.color : '#4a4238' }}
                  >
                    {opt.label}
                  </span>
                  <span className="text-sm flex-1 text-left" style={{ color: focusRate === opt.value ? '#d4cfc0' : '#6a6050' }}>
                    {opt.desc}
                  </span>
                  {focusRate === opt.value && <span style={{ color: opt.color }}>✓</span>}
                </button>
              ))}
            </div>
          </DQWindow>
        )}

        {/* ── XP reward ── */}
        <DQWindow className="mb-4">
          <div className="text-center">
            <p className="font-cinzel text-xs mb-2" style={{ color: '#6a6050', letterSpacing: '0.25em' }}>REWARD</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span
                className="font-cinzel text-5xl font-bold"
                style={{ color: '#c4a35a', filter: 'drop-shadow(0 0 6px rgba(196,163,90,0.5))' }}
              >
                +{previewXP.toFixed(1)}
              </span>
              <span className="font-cinzel text-xl" style={{ color: '#b8a88a' }}>XP</span>
            </div>
            <p className="text-xs" style={{ color: '#4a4238' }}>
              {quest.statEnglishName}に加算されます
            </p>
            <DQDivider />
            {isTask ? (
              <p className="text-xs" style={{ color: '#4a4238' }}>
                難易度 {quest.difficulty} の固定値
              </p>
            ) : (
              <div className="flex justify-center gap-2 text-xs" style={{ color: '#4a4238' }}>
                <span>×{quest.difficulty === 'Easy' ? 5 : quest.difficulty === 'Normal' ? 10 : 15}</span>
                <span>×</span>
                <span>{elapsedMinutes.toFixed(2)}h</span>
                <span>×</span>
                <span style={{ color: focusOpt.color }}>{focusRate}</span>
              </div>
            )}
          </div>
        </DQWindow>

      </div>

      {/* ── Action buttons ── */}
      <div
        className="relative z-10 px-4 pb-safe pb-8 pt-2 space-y-3"
        style={{ background: 'linear-gradient(0deg, #0d0b08 65%, transparent)' }}
      >
        <DQButton onClick={handleRecord} disabled={recorded} variant="gold">
          {recorded ? '✓ 記録済み' : (
            <div className="flex items-center justify-center gap-2">
              <BarChart2 size={18} />
              <span>結果を記録する</span>
            </div>
          )}
        </DQButton>
        <DQButton onClick={() => { soundEngine.playClick(); navigate('main'); }} variant="ghost">
          <div className="flex items-center justify-center gap-2">
            <Home size={16} />
            <span>記録せずに戻る</span>
          </div>
        </DQButton>
      </div>
    </div>
  );
}
