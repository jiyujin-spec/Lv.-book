'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Timer, CheckSquare } from 'lucide-react';
import type { Difficulty, PresetQuest, QuestType } from '@/types/game';
import { DIFFICULTY_COLORS, TASK_XP, generateId } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQButton } from '../DQWindow';
import soundEngine from '@/lib/soundEngine';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Normal', 'Hard'];

export default function QuestCreationScreen() {
  const { state, navigate, addPresetQuest } = useGame();
  const { data } = state;

  const [name,      setName]      = useState('');
  const [statId,    setStatId]    = useState(data.stats[0]?.id ?? '');
  const [diff,      setDiff]      = useState<Difficulty>('Normal');
  const [questType, setQuestType] = useState<QuestType>('time');
  const [saved,     setSaved]     = useState(false);

  const canSave = name.trim().length > 0 && !saved;

  function handleSave() {
    if (!canSave) return;
    const preset: PresetQuest = {
      id: generateId(),
      name: name.trim(),
      statId,
      difficulty: diff,
      questType,
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

  const taskXP = TASK_XP[diff];

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
              placeholder="例: 筋トレ、読書、メール返信..."
              maxLength={40}
              className="w-full bg-transparent text-base outline-none"
              style={{ color: '#e8f0f8', caretColor: '#f0c030', fontFamily: 'serif' }}
              autoFocus
            />
          ))}
        </DQWindow>

        {/* Quest type */}
        <DQWindow>
          {row('QUEST TYPE ― クエスト形式', (
            <div className="grid grid-cols-2 gap-3">
              {/* Time quest */}
              <button
                onClick={() => { soundEngine.playSelect(); setQuestType('time'); }}
                className="flex flex-col items-center gap-2 p-4 rounded transition-all active:scale-95"
                style={{
                  background: questType === 'time' ? 'rgba(64,128,224,0.15)' : 'rgba(1,8,16,0.5)',
                  border: `2px solid ${questType === 'time' ? '#4080e0' : 'rgba(30,48,80,0.8)'}`,
                  boxShadow: questType === 'time' ? '0 0 14px rgba(64,128,224,0.3)' : 'none',
                }}
              >
                <Timer
                  size={26}
                  style={{ color: questType === 'time' ? '#4080e0' : '#2a3a50' }}
                />
                <div className="text-center">
                  <p className="font-cinzel text-sm font-bold" style={{ color: questType === 'time' ? '#4080e0' : '#2a3a50' }}>
                    時間形式
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: questType === 'time' ? '#7090b0' : '#1e3050', fontSize: 10 }}>
                    ストップウォッチ
                  </p>
                </div>
                {questType === 'time' && (
                  <span className="text-xs font-cinzel" style={{ color: '#4080e0' }}>✓ 選択中</span>
                )}
              </button>

              {/* Task quest */}
              <button
                onClick={() => { soundEngine.playSelect(); setQuestType('task'); }}
                className="flex flex-col items-center gap-2 p-4 rounded transition-all active:scale-95"
                style={{
                  background: questType === 'task' ? 'rgba(48,200,64,0.12)' : 'rgba(1,8,16,0.5)',
                  border: `2px solid ${questType === 'task' ? '#30c840' : 'rgba(30,48,80,0.8)'}`,
                  boxShadow: questType === 'task' ? '0 0 14px rgba(48,200,64,0.25)' : 'none',
                }}
              >
                <CheckSquare
                  size={26}
                  style={{ color: questType === 'task' ? '#30c840' : '#2a3a50' }}
                />
                <div className="text-center">
                  <p className="font-cinzel text-sm font-bold" style={{ color: questType === 'task' ? '#30c840' : '#2a3a50' }}>
                    タスク形式
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: questType === 'task' ? '#5a9060' : '#1e3050', fontSize: 10 }}>
                    チェックリスト
                  </p>
                </div>
                {questType === 'task' && (
                  <span className="text-xs font-cinzel" style={{ color: '#30c840' }}>✓ 選択中</span>
                )}
              </button>
            </div>
          ))}

          {/* Description */}
          <p className="text-xs text-center mt-2" style={{ color: '#1e3050' }}>
            {questType === 'time'
              ? '⏱ 開始からストップまでの時間でXPを計算'
              : '✅ 完了タップで固定XPを即付与'}
          </p>
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
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
            {diff === 'Easy' && (questType === 'time' ? '係数 ×5 — 気軽な挑戦' : `固定 ${taskXP} XP — 気軽な任務`)}
            {diff === 'Normal' && (questType === 'time' ? '係数 ×10 — 標準の試練' : `固定 ${taskXP} XP — 標準の任務`)}
            {diff === 'Hard' && (questType === 'time' ? '係数 ×15 — 困難な冒険' : `固定 ${taskXP} XP — 困難な任務`)}
          </p>
        </DQWindow>

        {/* XP Preview */}
        <DQWindow>
          <div className="text-center">
            <p className="font-cinzel text-xs mb-1" style={{ color: '#4a6080', letterSpacing: '0.25em' }}>
              EXPECTED REWARD
            </p>
            {questType === 'task' ? (
              <>
                <p>
                  <span className="font-cinzel text-4xl font-bold" style={{ color: '#f0c030' }}>
                    {taskXP}
                  </span>
                  <span className="text-base ml-1 font-cinzel" style={{ color: '#b8cce0' }}>XP</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#2a3a50' }}>難易度による固定値</p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-cinzel text-2xl font-bold" style={{ color: '#f0c030' }}>
                    {diff === 'Easy' ? '5' : diff === 'Normal' ? '10' : '15'}
                  </span>
                  <span className="text-sm ml-1 font-cinzel" style={{ color: '#b8cce0' }}>× 時間(h) × 集中度</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#2a3a50' }}>例: 1時間・集中1.0× → {diff === 'Easy' ? '5' : diff === 'Normal' ? '10' : '15'} XP</p>
              </>
            )}
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
