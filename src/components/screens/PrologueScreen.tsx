'use client';

import React, { useState, useEffect } from 'react';
import type { StatItem } from '@/types/game';
import { DEFAULT_STATS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import soundEngine from '@/lib/soundEngine';
import ParticleEffect from '../ParticleEffect';

type Step = 'intro' | 'name' | 'stats' | 'confirm';

export default function PrologueScreen() {
  const { completePrologue } = useGame();
  const [step, setStep] = useState<Step>('intro');
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS.map(s => ({ ...s })));
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editEnglish, setEditEnglish] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  function advance() {
    soundEngine.playClick();
    if (step === 'intro') setStep('name');
    else if (step === 'name') {
      if (!userName.trim()) return;
      setStep('stats');
    } else if (step === 'stats') setStep('confirm');
    else {
      completePrologue(userName.trim() || '勇者', stats);
    }
  }

  function startEditStat(stat: StatItem) {
    setEditingStatId(stat.id);
    setEditEnglish(stat.englishName);
    setEditDesc(stat.japaneseDescription);
    soundEngine.playClick();
  }

  function saveEditStat() {
    if (!editingStatId) return;
    setStats(prev => prev.map(s =>
      s.id === editingStatId
        ? { ...s, englishName: editEnglish || s.englishName, japaneseDescription: editDesc || s.japaneseDescription }
        : s
    ));
    setEditingStatId(null);
    soundEngine.playClick();
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #1a0f3a 0%, #0d0820 70%)' }}
    >
      <ParticleEffect count={30} />

      <div
        className="relative z-10 w-full max-w-sm mx-auto px-6"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
      >
        {/* ── Intro ── */}
        {step === 'intro' && (
          <div className="text-center animate-fade-in-up">
            {/* Magical book icon */}
            <div className="text-7xl mb-6 animate-float inline-block" style={{ filter: 'drop-shadow(0 0 20px #c084fc)' }}>
              📖
            </div>

            <h1
              className="text-3xl font-bold mb-2 font-cinzel tracking-widest"
              style={{
                background: 'linear-gradient(180deg, #ffd700 0%, #d4a017 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Lv. BOOK
            </h1>

            <p className="text-xs tracking-[0.3em] mb-8 font-cinzel" style={{ color: '#c084fc' }}>
              ～ THE MAGIC GRIMOIRE ～
            </p>

            <div
              className="rounded-lg p-5 mb-8 text-left"
              style={{
                background: 'rgba(45,27,78,0.7)',
                border: '1px solid rgba(212,160,23,0.3)',
              }}
            >
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#f4e4bc' }}>
                勇者よ、ようこそ。
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#d4c49c' }}>
                この魔法の書は、あなたの日々の努力を刻み、冒険の軌跡を永遠に綴り続ける。
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#d4c49c' }}>
                一歩ずつの歩みが、やがて伝説へと変わる。さあ、冒険を始めよう。
              </p>
            </div>

            <button
              onClick={advance}
              className="w-full py-4 rounded-lg font-cinzel tracking-widest text-sm font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f0c040, #d4a017)',
                color: '#1a0f3a',
                boxShadow: '0 0 20px rgba(212,160,23,0.4)',
              }}
            >
              冒険を始める
            </button>
          </div>
        )}

        {/* ── Name Input ── */}
        {step === 'name' && (
          <div className="text-center animate-fade-in-up">
            <div className="text-5xl mb-6">⚔️</div>

            <h2
              className="text-xl font-bold mb-1 font-cinzel tracking-wider"
              style={{ color: '#ffd700' }}
            >
              勇者の名
            </h2>
            <p className="text-xs mb-8 font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.2em' }}>
              HERO&apos;S NAME
            </p>

            <div
              className="rounded-lg p-5 mb-6"
              style={{
                background: 'rgba(244,228,188,0.97)',
                border: '2px solid #d4a017',
                boxShadow: '0 0 15px rgba(212,160,23,0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <p className="text-xs mb-3 text-center" style={{ color: '#8b7355', fontFamily: 'serif' }}>
                ― あなたの名を刻め ―
              </p>
              <input
                type="text"
                value={userName}
                onChange={e => {
                  setUserName(e.target.value);
                  soundEngine.playWriting();
                }}
                placeholder="勇者の名..."
                maxLength={20}
                className="w-full bg-transparent text-center text-xl outline-none border-b-2 pb-2"
                style={{
                  borderColor: '#8b7355',
                  color: '#2c1810',
                  fontFamily: 'serif',
                  caretColor: '#2c1810',
                }}
                autoFocus
              />
            </div>

            <p className="text-xs mb-6" style={{ color: '#8b7355' }}>
              ※後から変更できます
            </p>

            <button
              onClick={advance}
              disabled={!userName.trim()}
              className="w-full py-4 rounded-lg font-cinzel tracking-widest text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: userName.trim()
                  ? 'linear-gradient(135deg, #d4a017, #f0c040, #d4a017)'
                  : '#4a3870',
                color: userName.trim() ? '#1a0f3a' : '#8b7355',
                boxShadow: userName.trim() ? '0 0 20px rgba(212,160,23,0.4)' : 'none',
              }}
            >
              次へ進む
            </button>
          </div>
        )}

        {/* ── Stats Confirmation ── */}
        {step === 'stats' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <h2
                className="text-xl font-bold mb-1 font-cinzel tracking-wider"
                style={{ color: '#ffd700' }}
              >
                勇者の石版
              </h2>
              <p className="text-xs font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.2em' }}>
                HERO&apos;S STONE TABLET
              </p>
              <p className="text-xs mt-2" style={{ color: '#8b7355' }}>
                タップして名前を変更できます
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {stats.map(stat => (
                <div
                  key={stat.id}
                  onClick={() => startEditStat(stat)}
                  className="flex items-center gap-3 rounded-lg p-3 cursor-pointer active:scale-98 transition-transform"
                  style={{
                    background: 'rgba(45,27,78,0.7)',
                    border: `1px solid ${stat.color}40`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: stat.color, boxShadow: `0 0 6px ${stat.color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-cinzel font-bold text-sm"
                      style={{ color: stat.color }}
                    >
                      {stat.englishName}
                    </span>
                    <span className="text-xs ml-2" style={{ color: '#8b7355' }}>
                      {stat.japaneseDescription}
                    </span>
                  </div>
                  <span style={{ color: '#4a3870', fontSize: 12 }}>✎</span>
                </div>
              ))}
            </div>

            <button
              onClick={advance}
              className="w-full py-4 rounded-lg font-cinzel tracking-widest text-sm font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f0c040, #d4a017)',
                color: '#1a0f3a',
                boxShadow: '0 0 20px rgba(212,160,23,0.4)',
              }}
            >
              これで始める
            </button>
          </div>
        )}

        {/* ── Confirm ── */}
        {step === 'confirm' && (
          <div className="text-center animate-fade-in-up">
            <div className="text-5xl mb-5 animate-float inline-block">✨</div>

            <h2
              className="text-xl font-bold mb-1 font-cinzel tracking-wider"
              style={{ color: '#ffd700' }}
            >
              準備完了
            </h2>
            <p className="text-xs mb-6 font-cinzel" style={{ color: '#c084fc', letterSpacing: '0.2em' }}>
              READY TO BEGIN
            </p>

            <div
              className="rounded-lg p-5 mb-6"
              style={{
                background: 'rgba(244,228,188,0.95)',
                border: '2px solid #d4a017',
              }}
            >
              <p className="text-sm mb-1" style={{ color: '#8b7355', fontFamily: 'serif' }}>
                勇者の名
              </p>
              <p
                className="text-2xl font-bold mb-4"
                style={{ color: '#2c1810', fontFamily: 'serif' }}
              >
                {userName}
              </p>
              <div
                className="h-px w-full mb-4"
                style={{ background: 'linear-gradient(90deg, transparent, #8b7355, transparent)' }}
              />
              <p className="text-xs" style={{ color: '#8b7355' }}>
                Lv.1 見習い冒険者 として出発
              </p>
            </div>

            <button
              onClick={advance}
              className="w-full py-4 rounded-lg font-cinzel tracking-widest text-sm font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f0c040, #d4a017)',
                color: '#1a0f3a',
                boxShadow: '0 0 30px rgba(212,160,23,0.6)',
              }}
            >
              ✨ 冒険の書を開く ✨
            </button>
          </div>
        )}
      </div>

      {/* Stat edit modal */}
      {editingStatId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setEditingStatId(null)}
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-t-2xl p-6"
            style={{ background: '#1a0f3a', border: '1px solid rgba(212,160,23,0.4)' }}
          >
            <h3 className="text-center font-cinzel text-sm mb-4" style={{ color: '#ffd700' }}>
              ステータス名を変更
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs" style={{ color: '#8b7355' }}>英語名</label>
                <input
                  value={editEnglish}
                  onChange={e => setEditEnglish(e.target.value)}
                  className="w-full mt-1 p-2 rounded text-sm bg-transparent outline-none border"
                  style={{ borderColor: '#4a3870', color: '#f4e4bc' }}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="text-xs" style={{ color: '#8b7355' }}>説明</label>
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full mt-1 p-2 rounded text-sm bg-transparent outline-none border"
                  style={{ borderColor: '#4a3870', color: '#f4e4bc' }}
                  maxLength={20}
                />
              </div>
            </div>
            <button
              onClick={saveEditStat}
              className="w-full py-3 rounded-lg font-cinzel text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #d4a017, #f0c040)', color: '#1a0f3a' }}
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
