'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Sword, ChevronRight } from 'lucide-react';
import type { Difficulty, ActiveQuest } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, calculateXP } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import soundEngine from '@/lib/soundEngine';
import Navigation from '../Navigation';

const DURATION_OPTIONS = [15, 25, 30, 45, 60, 90, 120];

const DIFFICULTIES: Difficulty[] = ['Easy', 'Normal', 'Hard'];

export default function QuestScreen() {
  const { state, navigate, startQuest } = useGame();
  const { data } = state;

  const [questName, setQuestName] = useState('');
  const [selectedStat, setSelectedStat] = useState(data.stats[0]?.id ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const effectiveDuration = showCustom
    ? (parseInt(customDuration) || 25)
    : duration;

  const previewXP = calculateXP(difficulty, effectiveDuration, 1.0);
  const canStart = questName.trim().length > 0 && effectiveDuration > 0;

  function handleStart() {
    if (!canStart) return;
    const stat = data.stats.find(s => s.id === selectedStat);
    if (!stat) return;

    const quest: ActiveQuest = {
      questName: questName.trim(),
      statId: stat.id,
      statEnglishName: stat.englishName,
      difficulty,
      durationMinutes: effectiveDuration,
      startedAt: Date.now(),
    };
    startQuest(quest);
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a0f3a 0%, #0d0820 70%)' }}
    >
      {/* ── Header ── */}
      <div
        className="relative z-10 px-4 pt-safe-top pt-6 pb-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(212,160,23,0.15)' }}
      >
        <button
          onClick={() => { soundEngine.playClick(); navigate('main'); }}
          className="p-2 rounded-lg active:scale-90 transition-transform"
          style={{ color: '#d4a017' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1
            className="text-base font-bold font-cinzel tracking-widest"
            style={{ color: '#ffd700' }}
          >
            クエスト受注
          </h1>
          <p className="text-xs font-cinzel" style={{ color: '#7b2d8b', letterSpacing: '0.15em' }}>
            QUEST RECEPTION
          </p>
        </div>
        <div className="ml-auto">
          <Sword size={18} style={{ color: '#d4a017', opacity: 0.6 }} />
        </div>
      </div>

      {/* ── Scrollable Form ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-5" style={{ paddingBottom: 100 }}>

        {/* ── Quest Name ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(26,15,58,0.9)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(74,56,112,0.4)' }}>
            <p className="text-xs font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.15em' }}>
              QUEST NAME ― クエスト名
            </p>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={questName}
              onChange={e => {
                setQuestName(e.target.value);
                if (e.target.value.length % 3 === 0) soundEngine.playWriting();
              }}
              placeholder="何に挑むか記せ..."
              maxLength={40}
              className="w-full bg-transparent outline-none text-base"
              style={{
                color: '#f4e4bc',
                caretColor: '#d4a017',
                fontFamily: 'Georgia, serif',
              }}
            />
          </div>
        </div>

        {/* ── Stat Selection ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(26,15,58,0.9)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(74,56,112,0.4)' }}>
            <p className="text-xs font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.15em' }}>
              STAT ― 成長させる能力
            </p>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2">
            {data.stats.map(stat => (
              <button
                key={stat.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedStat(stat.id);
                }}
                className="flex items-center gap-3 p-3 rounded-lg transition-all active:scale-98"
                style={{
                  background: selectedStat === stat.id
                    ? `${stat.color}20`
                    : 'rgba(13,8,32,0.4)',
                  border: `1.5px solid ${selectedStat === stat.id ? stat.color : 'rgba(74,56,112,0.4)'}`,
                  boxShadow: selectedStat === stat.id ? `0 0 12px ${stat.color}30` : 'none',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: stat.color,
                    boxShadow: selectedStat === stat.id ? `0 0 8px ${stat.color}` : 'none',
                  }}
                />
                <div className="flex-1 text-left">
                  <span
                    className="font-cinzel font-bold text-sm block"
                    style={{ color: selectedStat === stat.id ? stat.color : '#8b7355' }}
                  >
                    {stat.englishName}
                  </span>
                  <span className="text-xs" style={{ color: '#4a3870' }}>
                    {stat.japaneseDescription}
                  </span>
                </div>
                {selectedStat === stat.id && (
                  <ChevronRight size={14} style={{ color: stat.color }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Difficulty ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(26,15,58,0.9)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(74,56,112,0.4)' }}>
            <p className="text-xs font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.15em' }}>
              DIFFICULTY ― 難易度
            </p>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => {
                  soundEngine.playClick();
                  setDifficulty(d);
                }}
                className="py-3 rounded-lg font-cinzel font-bold text-sm transition-all active:scale-95"
                style={{
                  background: difficulty === d
                    ? `${DIFFICULTY_COLORS[d]}25`
                    : 'rgba(13,8,32,0.4)',
                  border: `1.5px solid ${difficulty === d ? DIFFICULTY_COLORS[d] : 'rgba(74,56,112,0.4)'}`,
                  color: difficulty === d ? DIFFICULTY_COLORS[d] : '#4a3870',
                  boxShadow: difficulty === d ? `0 0 12px ${DIFFICULTY_COLORS[d]}40` : 'none',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="px-4 pb-3">
            <p className="text-xs text-center" style={{ color: '#4a3870' }}>
              {difficulty === 'Easy' && 'XP係数 ×5 ― 気軽な挑戦'}
              {difficulty === 'Normal' && 'XP係数 ×10 ― 標準的な試練'}
              {difficulty === 'Hard' && 'XP係数 ×15 ― 困難な冒険'}
            </p>
          </div>
        </div>

        {/* ── Duration ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(26,15,58,0.9)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(74,56,112,0.4)' }}>
            <div className="flex items-center gap-2">
              <Clock size={12} style={{ color: '#c084fc' }} />
              <p className="text-xs font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.15em' }}>
                DURATION ― 実行時間
              </p>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => {
                    soundEngine.playClick();
                    setDuration(d);
                    setShowCustom(false);
                  }}
                  className="py-2 rounded-lg text-xs font-bold font-cinzel transition-all active:scale-95"
                  style={{
                    background: !showCustom && duration === d
                      ? 'rgba(212,160,23,0.2)'
                      : 'rgba(13,8,32,0.4)',
                    border: `1.5px solid ${!showCustom && duration === d ? '#d4a017' : 'rgba(74,56,112,0.4)'}`,
                    color: !showCustom && duration === d ? '#ffd700' : '#4a3870',
                  }}
                >
                  {d}m
                </button>
              ))}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowCustom(true);
                }}
                className="py-2 rounded-lg text-xs font-bold font-cinzel transition-all active:scale-95"
                style={{
                  background: showCustom ? 'rgba(212,160,23,0.2)' : 'rgba(13,8,32,0.4)',
                  border: `1.5px solid ${showCustom ? '#d4a017' : 'rgba(74,56,112,0.4)'}`,
                  color: showCustom ? '#ffd700' : '#4a3870',
                }}
              >
                自由
              </button>
            </div>
            {showCustom && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  placeholder="分"
                  min={1}
                  max={480}
                  className="flex-1 bg-transparent outline-none text-center py-2 rounded-lg text-sm"
                  style={{
                    color: '#f4e4bc',
                    border: '1px solid rgba(212,160,23,0.4)',
                    caretColor: '#d4a017',
                  }}
                />
                <span className="text-sm" style={{ color: '#8b7355' }}>分</span>
              </div>
            )}
          </div>
        </div>

        {/* ── XP Preview ── */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(26,15,58,0.9), rgba(45,27,78,0.6))',
            border: '1px solid rgba(212,160,23,0.4)',
          }}
        >
          <p className="text-xs text-center font-cinzel mb-2" style={{ color: '#c084fc', letterSpacing: '0.2em' }}>
            EXPECTED REWARD
          </p>
          <p className="text-center" style={{ color: '#f4e4bc' }}>
            <span
              className="text-3xl font-bold font-cinzel"
              style={{ color: '#ffd700' }}
            >
              {previewXP.toFixed(1)}
            </span>
            <span className="text-sm ml-2" style={{ color: '#d4a017' }}>XP</span>
          </p>
          <p className="text-xs text-center mt-1" style={{ color: '#4a3870' }}>
            集中度1.0倍での予測値
          </p>
        </div>

      </div>

      {/* ── Start Button ── */}
      <div
        className="relative z-10 px-4 pb-safe-bottom pb-24"
        style={{ background: 'linear-gradient(0deg, #0d0820 60%, transparent)' }}
      >
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full py-5 rounded-xl flex items-center justify-center gap-3 font-cinzel tracking-widest font-bold text-base transition-all active:scale-98"
          style={{
            background: canStart
              ? 'linear-gradient(135deg, #d4a017 0%, #f0c040 50%, #d4a017 100%)'
              : 'rgba(26,15,58,0.6)',
            color: canStart ? '#1a0f3a' : '#4a3870',
            border: canStart ? 'none' : '1px solid rgba(74,56,112,0.4)',
            boxShadow: canStart ? '0 0 25px rgba(212,160,23,0.5)' : 'none',
          }}
        >
          <Sword size={20} />
          <span>試練を開始する</span>
        </button>
      </div>

      <Navigation />
    </div>
  );
}
