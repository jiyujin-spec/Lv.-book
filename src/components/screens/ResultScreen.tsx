'use client';

import React, { useState, useEffect } from 'react';
import { Home, BarChart2 } from 'lucide-react';
import { calculateXP, DIFFICULTY_COLORS, formatDuration } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import { GoldBurst } from '../ParticleEffect';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import soundEngine from '@/lib/soundEngine';

const FOCUS_OPTIONS = [
  { value: 0.5,  label: '0.5×', desc: '集中できなかった',  color: '#6b7280' },
  { value: 0.75, label: '0.75×', desc: 'やや散漫だった',   color: '#f59e0b' },
  { value: 1.0,  label: '1.0×', desc: '普通だった',        color: '#30c840' },
  { value: 1.25, label: '1.25×', desc: 'よく集中できた',   color: '#4080e0' },
  { value: 1.5,  label: '1.5×', desc: '完璧な集中！',      color: '#c084fc' },
];

export default function ResultScreen() {
  const { state, navigate, completeQuest } = useGame();
  const [questSnapshot] = useState(state.activeQuest);
  const quest = questSnapshot;
  const { data } = state;

  const [focusRate, setFocusRate] = useState(1.0);
  const [showStamp, setShowStamp] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [recorded,  setRecorded]  = useState(false);

  const previewXP  = quest ? calculateXP(quest.difficulty, quest.durationMinutes, focusRate) : 0;
  const diffColor  = quest ? DIFFICULTY_COLORS[quest.difficulty] : '#f0c030';
  const stat       = data.stats.find(s => s.id === quest?.statId);
  const focusOpt   = FOCUS_OPTIONS.find(f => f.value === focusRate) ?? FOCUS_OPTIONS[2];

  useEffect(() => {
    const t = setTimeout(() => { setShowStamp(true); soundEngine.playStamp(); }, 350);
    return () => clearTimeout(t);
  }, []);

  function handleRecord() {
    if (recorded || !quest) return;
    setRecorded(true);
    setShowBurst(true);
    completeQuest(focusRate);
    setTimeout(() => navigate('main'), 2200);
  }

  if (!quest) { navigate('main'); return null; }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#04091a' }}
    >
      <GoldBurst active={showBurst} onComplete={() => setShowBurst(false)} />

      <div className="flex-1 overflow-y-auto px-4 pt-safe pt-6" style={{ paddingBottom: 110 }}>

        {/* ── SUCCESS stamp ── */}
        <div className="flex justify-center mb-5">
          <div
            style={{
              transform: showStamp ? 'scale(1) rotate(-6deg)' : 'scale(2) rotate(-6deg)',
              opacity: showStamp ? 1 : 0,
              transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s',
            }}
          >
            <div
              className="px-7 py-2.5 rounded-sm relative overflow-hidden"
              style={{
                border: `4px solid ${diffColor}`,
                boxShadow: `0 0 18px ${diffColor}60, inset 0 0 12px ${diffColor}12`,
              }}
            >
              <p className="font-cinzel text-3xl font-bold tracking-[0.2em]" style={{ color: diffColor }}>
                SUCCESS
              </p>
              {/* Cross-hatch texture */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.2) 3px,rgba(255,255,255,0.2) 4px)' }}
              />
            </div>
          </div>
        </div>

        {/* ── Quest summary (parchment) ── */}
        <DQWindow parchment className="mb-4">
          <div className="text-center mb-2">
            <p className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>― クエスト完了の証 ―</p>
          </div>
          <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg,transparent,#8b7355,transparent)' }} />
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'クエスト名', value: quest.questName, color: '#2c1810', serif: true },
              { label: '成長能力', value: quest.statEnglishName, color: stat?.color ?? '#d4a017' },
              { label: '難易度',   value: quest.difficulty, color: diffColor },
              { label: '実行時間', value: formatDuration(quest.durationMinutes), color: '#5a3a2a' },
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

        {/* ── Focus rating ── */}
        <DQWindow className="mb-4">
          <div className="text-center mb-3">
            <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.2em' }}>
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
                  background: focusRate === opt.value ? `${opt.color}15` : 'rgba(1,8,16,0.4)',
                  border: `1.5px solid ${focusRate === opt.value ? opt.color : 'rgba(30,48,80,0.8)'}`,
                  boxShadow: focusRate === opt.value ? `0 0 8px ${opt.color}30` : 'none',
                }}
              >
                <span className="font-cinzel font-bold text-sm w-14 text-center flex-shrink-0"
                  style={{ color: focusRate === opt.value ? opt.color : '#2a3a50' }}>
                  {opt.label}
                </span>
                <span className="text-sm flex-1 text-left"
                  style={{ color: focusRate === opt.value ? '#e8f0f8' : '#4a6080' }}>
                  {opt.desc}
                </span>
                {focusRate === opt.value && <span style={{ color: opt.color }}>✓</span>}
              </button>
            ))}
          </div>
        </DQWindow>

        {/* ── XP reward ── */}
        <DQWindow className="mb-4">
          <div className="text-center">
            <p className="font-cinzel text-xs mb-2" style={{ color: '#4a6080', letterSpacing: '0.25em' }}>REWARD</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="font-cinzel text-5xl font-bold" style={{ color: '#f0c030', filter: 'drop-shadow(0 0 8px #f0c03080)' }}>
                +{previewXP.toFixed(1)}
              </span>
              <span className="font-cinzel text-xl" style={{ color: '#b8cce0' }}>XP</span>
            </div>
            <p className="text-xs" style={{ color: '#2a3a50' }}>
              {quest.statEnglishName}に加算されます
            </p>
            <DQDivider />
            <div className="flex justify-center gap-2 text-xs" style={{ color: '#2a3a50' }}>
              <span>×{quest.difficulty === 'Easy' ? 5 : quest.difficulty === 'Normal' ? 10 : 15}</span>
              <span>×</span>
              <span>{quest.durationMinutes}m</span>
              <span>×</span>
              <span style={{ color: focusOpt.color }}>{focusRate}</span>
            </div>
          </div>
        </DQWindow>

      </div>

      {/* ── Action buttons ── */}
      <div
        className="relative z-10 px-4 pb-safe pb-8 pt-2 space-y-3"
        style={{ background: 'linear-gradient(0deg, #04091a 65%, transparent)' }}
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
