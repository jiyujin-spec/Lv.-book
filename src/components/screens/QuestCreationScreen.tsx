'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Difficulty, PresetQuest } from '@/types/game';
import { DIFFICULTY_COLORS, calculateXP, generateId } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQButton } from '../DQWindow';
import soundEngine from '@/lib/soundEngine';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Normal', 'Hard'];
const DURATIONS = [15, 25, 30, 45, 60, 90, 120];

export default function QuestCreationScreen() {
  const { state, navigate, addPresetQuest } = useGame();
  const { data } = state;

  const [name, setName]         = useState('');
  const [statId, setStatId]     = useState(data.stats[0]?.id ?? '');
  const [diff, setDiff]         = useState<Difficulty>('Normal');
  const [duration, setDuration] = useState(25);
  const [custom, setCustom]     = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [saved, setSaved]       = useState(false);

  const effectiveDur = isCustom ? (parseInt(custom) || 25) : duration;
  const previewXP = calculateXP(diff, effectiveDur, 1.0);
  const canSave = name.trim().length > 0 && effectiveDur > 0 && !saved;

  function handleSave() {
    if (!canSave) return;
    const preset: PresetQuest = {
      id: generateId(),
      name: name.trim(),
      statId,
      difficulty: diff,
      durationMinutes: effectiveDur,
      createdAt: new Date().toISOString(),
    };
    addPresetQuest(preset);
    setSaved(true);
    soundEngine.playQuestComplete();
    setTimeout(() => navigate('tavern'), 900);
  }

  const row = (label: string, content: React.ReactNode) => (
    <div className="mb-4">
      <p className="font-cinzel text-xs mb-2" style={{ color: '#4a6080', letterSpacing: '0.2em' }}>
        {label}
      </p>
      {content}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#04091a' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(184,204,224,0.12)' }}
      >
        <button
          onClick={() => { soundEngine.playClick(); navigate('tavern'); }}
          className="p-2 rounded transition-all active:scale-90"
          style={{ color: '#f0c030' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#f0c030' }}>
            クエスト制作
          </h1>
          <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.15em' }}>
            QUEST CREATION
          </p>
        </div>
        <div className="ml-auto">
          <Save size={17} style={{ color: '#4a6080' }} />
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: 32 }}>

        {/* Quest name */}
        <DQWindow>
          {row('QUEST NAME ― クエスト名', (
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.length % 3 === 0) soundEngine.playWriting();
              }}
              placeholder="例: 筋トレ30分、読書タイム..."
              maxLength={40}
              className="w-full bg-transparent text-base outline-none"
              style={{ color: '#e8f0f8', caretColor: '#f0c030', fontFamily: 'serif' }}
              autoFocus
            />
          ))}
        </DQWindow>

        {/* Stat */}
        <DQWindow>
          {row('STAT ― 成長させる能力', (
            <div className="space-y-2">
              {data.stats.map(stat => (
                <button
                  key={stat.id}
                  onClick={() => { soundEngine.playSelect(); setStatId(stat.id); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded transition-all active:scale-98"
                  style={{
                    background: statId === stat.id ? `${stat.color}18` : 'rgba(1,8,16,0.5)',
                    border: `1.5px solid ${statId === stat.id ? stat.color : 'rgba(30,48,80,0.8)'}`,
                    boxShadow: statId === stat.id ? `0 0 10px ${stat.color}30` : 'none',
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: stat.color, boxShadow: statId === stat.id ? `0 0 6px ${stat.color}` : 'none' }}
                  />
                  <span className="font-cinzel text-sm font-bold" style={{ color: statId === stat.id ? stat.color : '#4a6080' }}>
                    {stat.englishName}
                  </span>
                  <span className="text-xs ml-1" style={{ color: '#2a3a50' }}>
                    {stat.japaneseDescription}
                  </span>
                  {statId === stat.id && (
                    <span className="ml-auto text-xs" style={{ color: stat.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </DQWindow>

        {/* Difficulty */}
        <DQWindow>
          {row('DIFFICULTY ― 難易度', (
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => { soundEngine.playSelect(); setDiff(d); }}
                  className="py-3 rounded font-cinzel font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: diff === d ? `${DIFFICULTY_COLORS[d]}20` : 'rgba(1,8,16,0.5)',
                    border: `1.5px solid ${diff === d ? DIFFICULTY_COLORS[d] : 'rgba(30,48,80,0.8)'}`,
                    color: diff === d ? DIFFICULTY_COLORS[d] : '#2a3a50',
                    boxShadow: diff === d ? `0 0 12px ${DIFFICULTY_COLORS[d]}40` : 'none',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          ))}
          <p className="text-xs text-center mt-1" style={{ color: '#2a3a50' }}>
            {diff === 'Easy' && '係数 ×5 — 気軽な挑戦'}
            {diff === 'Normal' && '係数 ×10 — 標準の試練'}
            {diff === 'Hard' && '係数 ×15 — 困難な冒険'}
          </p>
        </DQWindow>

        {/* Duration */}
        <DQWindow>
          {row('DURATION ― 実行時間', (
            <>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => { soundEngine.playSelect(); setDuration(d); setIsCustom(false); }}
                    className="py-2 rounded font-cinzel text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: !isCustom && duration === d ? 'rgba(240,192,48,0.15)' : 'rgba(1,8,16,0.5)',
                      border: `1.5px solid ${!isCustom && duration === d ? '#f0c030' : 'rgba(30,48,80,0.8)'}`,
                      color: !isCustom && duration === d ? '#f0c030' : '#2a3a50',
                    }}
                  >
                    {d}m
                  </button>
                ))}
                <button
                  onClick={() => { soundEngine.playSelect(); setIsCustom(true); }}
                  className="py-2 rounded font-cinzel text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: isCustom ? 'rgba(240,192,48,0.15)' : 'rgba(1,8,16,0.5)',
                    border: `1.5px solid ${isCustom ? '#f0c030' : 'rgba(30,48,80,0.8)'}`,
                    color: isCustom ? '#f0c030' : '#2a3a50',
                  }}
                >
                  自由
                </button>
              </div>
              {isCustom && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    placeholder="分"
                    min={1} max={480}
                    className="flex-1 bg-transparent text-center py-2 rounded text-sm outline-none"
                    style={{ color: '#e8f0f8', border: '1px solid rgba(240,192,48,0.4)', caretColor: '#f0c030' }}
                  />
                  <span className="text-sm" style={{ color: '#4a6080' }}>分</span>
                </div>
              )}
            </>
          ))}
        </DQWindow>

        {/* XP Preview */}
        <DQWindow>
          <div className="text-center">
            <p className="font-cinzel text-xs mb-1" style={{ color: '#4a6080', letterSpacing: '0.25em' }}>
              EXPECTED REWARD
            </p>
            <p>
              <span className="font-cinzel text-4xl font-bold" style={{ color: '#f0c030' }}>
                {previewXP.toFixed(1)}
              </span>
              <span className="text-base ml-1 font-cinzel" style={{ color: '#b8cce0' }}>XP</span>
            </p>
            <p className="text-xs mt-1" style={{ color: '#2a3a50' }}>集中度1.0×時の予測値</p>
          </div>
        </DQWindow>

        {/* Save */}
        <DQButton
          onClick={handleSave}
          disabled={!canSave}
          variant="gold"
        >
          {saved ? '✓ 保存完了！' : '◆ クエストを保存する ◆'}
        </DQButton>

      </div>
    </div>
  );
}
