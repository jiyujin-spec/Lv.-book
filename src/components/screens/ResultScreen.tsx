'use client';

import React, { useState, useEffect } from 'react';
import { Home, BarChart2 } from 'lucide-react';
import { calculateXP, DIFFICULTY_COLORS, formatDuration } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import { GoldBurst } from '../ParticleEffect';
import soundEngine from '@/lib/soundEngine';

const FOCUS_OPTIONS = [
  { value: 0.5,  label: '0.5×', desc: '集中できなかった',  color: '#6b7280' },
  { value: 0.75, label: '0.75×', desc: 'やや散漫だった',   color: '#f59e0b' },
  { value: 1.0,  label: '1.0×', desc: '普通だった',        color: '#22c55e' },
  { value: 1.25, label: '1.25×', desc: 'よく集中できた',   color: '#3b82f6' },
  { value: 1.5,  label: '1.5×', desc: '完璧な集中！',      color: '#c084fc' },
];

export default function ResultScreen() {
  const { state, navigate, completeQuest } = useGame();
  // Snapshot quest on first render so it survives after completeQuest clears activeQuest
  const [questSnapshot] = useState(state.activeQuest);
  const quest = questSnapshot;
  const { data } = state;

  const [focusRate, setFocusRate] = useState(1.0);
  const [showStamp, setShowStamp] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const previewXP = quest
    ? calculateXP(quest.difficulty, quest.durationMinutes, focusRate)
    : 0;
  const diffColor = quest ? DIFFICULTY_COLORS[quest.difficulty] : '#ffd700';
  const stat = data.stats.find(s => s.id === quest?.statId);
  const focusOption = FOCUS_OPTIONS.find(f => f.value === focusRate) ?? FOCUS_OPTIONS[2];

  useEffect(() => {
    const t = setTimeout(() => {
      setShowStamp(true);
      soundEngine.playStamp();
    }, 400);
    return () => clearTimeout(t);
  }, []);

  function handleRecord() {
    if (recorded || !quest) return;
    setRecorded(true);
    setShowBurst(true);
    completeQuest(focusRate);
    // Navigation to main happens automatically via GameContext (screen='result' → completeQuest sets screen)
    // But we still add a slight delay for the burst animation
    setTimeout(() => navigate('main'), 2000);
  }

  if (!quest) {
    // No active quest – go home
    navigate('main');
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0f3a 0%, #0d0820 70%)' }}
    >
      <GoldBurst active={showBurst} onComplete={() => setShowBurst(false)} />

      <div className="flex-1 overflow-y-auto px-4 pt-safe-top pt-6" style={{ paddingBottom: 120 }}>

        {/* ── SUCCESS Stamp ── */}
        <div className="flex justify-center mb-6">
          <div
            className="transition-all duration-400"
            style={{
              transform: showStamp ? 'scale(1) rotate(-5deg)' : 'scale(1.8) rotate(-5deg)',
              opacity: showStamp ? 1 : 0,
            }}
          >
            <div
              className="px-8 py-3 rounded-lg relative"
              style={{
                border: `4px solid ${diffColor}`,
                boxShadow: `0 0 20px ${diffColor}60, inset 0 0 15px ${diffColor}15`,
              }}
            >
              <p
                className="text-3xl font-bold font-cinzel tracking-[0.2em]"
                style={{ color: diffColor }}
              >
                SUCCESS
              </p>
              <div
                className="absolute inset-0 rounded-lg opacity-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Quest Summary Card (parchment) ── */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 100%)',
            border: '1px solid rgba(212,160,23,0.5)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <div className="text-center mb-3">
            <p className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>― クエスト完了の証 ―</p>
          </div>
          <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent, #8b7355, transparent)' }} />

          <div className="space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>クエスト名</span>
              <span className="text-sm font-bold text-right max-w-[60%]" style={{ color: '#2c1810', fontFamily: 'Georgia, serif' }}>
                {quest.questName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>能力</span>
              <span className="text-sm font-bold font-cinzel" style={{ color: stat?.color ?? '#d4a017' }}>
                {quest.statEnglishName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>難易度</span>
              <span className="text-sm font-bold font-cinzel" style={{ color: diffColor }}>
                {quest.difficulty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: '#8b7355', fontFamily: 'serif' }}>実行時間</span>
              <span className="text-sm" style={{ color: '#2c1810', fontFamily: 'serif' }}>
                {formatDuration(quest.durationMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Focus Rate Selection ── */}
        <div
          className="rounded-xl overflow-hidden mb-4"
          style={{ background: 'rgba(26,15,58,0.9)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(74,56,112,0.4)' }}>
            <p className="text-xs font-cinzel text-center" style={{ color: '#c084fc', letterSpacing: '0.2em' }}>
              FOCUS RATING ― 集中度の自己申告
            </p>
          </div>
          <div className="p-3 space-y-2">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { soundEngine.playClick(); setFocusRate(opt.value); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all active:scale-98"
                style={{
                  background: focusRate === opt.value ? `${opt.color}18` : 'rgba(13,8,32,0.4)',
                  border: `1.5px solid ${focusRate === opt.value ? opt.color : 'rgba(74,56,112,0.3)'}`,
                  boxShadow: focusRate === opt.value ? `0 0 10px ${opt.color}30` : 'none',
                }}
              >
                <span
                  className="font-cinzel font-bold text-sm w-14 text-center flex-shrink-0"
                  style={{ color: focusRate === opt.value ? opt.color : '#4a3870' }}
                >
                  {opt.label}
                </span>
                <span className="text-sm flex-1 text-left" style={{ color: focusRate === opt.value ? '#f4e4bc' : '#4a3870' }}>
                  {opt.desc}
                </span>
                {focusRate === opt.value && (
                  <span style={{ color: opt.color }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── XP Reward Display ── */}
        <div
          className="rounded-xl p-5 mb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(26,15,58,0.95), rgba(45,27,78,0.8))',
            border: '2px solid rgba(212,160,23,0.5)',
            boxShadow: '0 0 25px rgba(212,160,23,0.15)',
          }}
        >
          <p className="text-xs font-cinzel mb-2" style={{ color: '#c084fc', letterSpacing: '0.25em' }}>
            REWARD
          </p>
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span
              className="text-5xl font-bold font-cinzel"
              style={{
                background: 'linear-gradient(180deg, #ffd700 0%, #d4a017 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px #d4a01780)',
              }}
            >
              +{previewXP.toFixed(1)}
            </span>
            <span className="text-xl font-cinzel" style={{ color: '#d4a017' }}>XP</span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#4a3870' }}>
            {quest.statEnglishName}に加算されます
          </p>
          <div className="h-px my-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }} />
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#6b5a30' }}>
            <span>×{quest.difficulty === 'Easy' ? 5 : quest.difficulty === 'Normal' ? 10 : 15}</span>
            <span style={{ color: '#3a2a40' }}>×</span>
            <span>{quest.durationMinutes}m</span>
            <span style={{ color: '#3a2a40' }}>×</span>
            <span style={{ color: focusOption.color }}>{focusRate}</span>
          </div>
        </div>

      </div>

      {/* ── Bottom Buttons ── */}
      <div
        className="relative z-10 px-4 pb-safe-bottom pb-8 pt-2 space-y-3"
        style={{ background: 'linear-gradient(0deg, #0d0820 70%, transparent)' }}
      >
        <button
          onClick={handleRecord}
          disabled={recorded}
          className="w-full py-5 rounded-xl flex items-center justify-center gap-3 font-cinzel tracking-widest font-bold text-base transition-all active:scale-98"
          style={{
            background: recorded
              ? 'rgba(26,15,58,0.6)'
              : 'linear-gradient(135deg, #d4a017 0%, #f0c040 50%, #d4a017 100%)',
            color: recorded ? '#4a3870' : '#1a0f3a',
            boxShadow: recorded ? 'none' : '0 0 25px rgba(212,160,23,0.5)',
          }}
        >
          {recorded ? '記録済み ✓' : (
            <>
              <BarChart2 size={20} />
              <span>結果を記録する</span>
            </>
          )}
        </button>

        <button
          onClick={() => { soundEngine.playClick(); navigate('main'); }}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-cinzel text-sm transition-all active:scale-98"
          style={{ background: 'transparent', border: '1px solid rgba(74,56,112,0.4)', color: '#c084fc' }}
        >
          <Home size={16} />
          <span>記録せずに戻る</span>
        </button>
      </div>
    </div>
  );
}
