'use client';

import React, { useState, useEffect } from 'react';
import type { StatItem } from '@/types/game';
import { DEFAULT_STATS } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import ParticleEffect from '../ParticleEffect';
import soundEngine from '@/lib/soundEngine';

type Step = 'intro' | 'name' | 'stats' | 'confirm';

export default function PrologueScreen() {
  const { completePrologue } = useGame();
  const [step, setStep]     = useState<Step>('intro');
  const [userName, setUserName] = useState('');
  const [stats, setStats]   = useState<StatItem[]>(DEFAULT_STATS.map(s => ({ ...s })));
  const [editIdx, setEditIdx]   = useState<number | null>(null);
  const [editEn,  setEditEn]    = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [visible, setVisible]   = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  function advance() {
    soundEngine.playSelect();
    if (step === 'intro')        setStep('name');
    else if (step === 'name')   { if (!userName.trim()) return; setStep('stats'); }
    else if (step === 'stats')   setStep('confirm');
    else                         completePrologue(userName.trim() || '勇者', stats);
  }

  function openEdit(idx: number) {
    setEditIdx(idx); setEditEn(stats[idx].englishName); setEditDesc(stats[idx].japaneseDescription);
    soundEngine.playClick();
  }
  function saveEdit() {
    if (editIdx === null) return;
    setStats(prev => prev.map((s, i) => i === editIdx
      ? { ...s, englishName: editEn.trim() || s.englishName, japaneseDescription: editDesc.trim() || s.japaneseDescription }
      : s
    ));
    setEditIdx(null);
    soundEngine.playClick();
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#0d0b08' }}>
      {/* Ambient orbs — warm tones */}
      <div className="bg-orb" style={{ width: 350, height: 350, background: '#3a2810', top: -80, left: -80 }} />
      <div className="bg-orb" style={{ width: 250, height: 250, background: '#2a1808', bottom: -60, right: -60, animationDelay: '5s' }} />
      <ParticleEffect count={22} />

      <div
        className="relative z-10 w-full max-w-sm mx-auto px-5"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
      >
        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="text-center animate-fade-in-up">
            <div className="text-7xl mb-5 animate-float inline-block" style={{ filter: 'drop-shadow(0 0 15px rgba(196,163,90,0.4))' }}>
              📖
            </div>
            <h1 className="font-cinzel text-3xl font-bold mb-1 tracking-widest" style={{ color: '#c4a35a' }}>
              Lv. BOOK
            </h1>
            <p className="font-cinzel text-xs tracking-[0.3em] mb-6" style={{ color: '#6a6050' }}>
              THE MAGIC GRIMOIRE
            </p>
            <DQWindow className="mb-6 text-left">
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#d4cfc0' }}>勇者よ、ようこそ。</p>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#8a7e6b' }}>
                この魔法の書は、あなたの日々の努力を刻み、冒険の軌跡を永遠に綴り続ける。
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#8a7e6b' }}>
                一歩ずつの歩みが、やがて伝説へと変わる。
              </p>
            </DQWindow>
            <DQButton onClick={advance} variant="gold">冒険を始める</DQButton>
          </div>
        )}

        {/* ── NAME ── */}
        {step === 'name' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-5">
              <p className="font-cinzel text-xl font-bold" style={{ color: '#c4a35a' }}>勇者の名</p>
              <p className="font-cinzel text-xs mt-1" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>HERO&apos;S NAME</p>
            </div>
            <DQWindow parchment className="mb-4">
              <p className="text-xs text-center mb-3" style={{ color: '#8b7355', fontFamily: 'serif' }}>― あなたの名を刻め ―</p>
              <input
                type="text"
                value={userName}
                onChange={e => { setUserName(e.target.value); soundEngine.playWriting(); }}
                placeholder="勇者の名..."
                maxLength={20}
                className="w-full bg-transparent text-center text-2xl outline-none border-b-2 pb-2"
                style={{ borderColor: '#8b7355', color: '#2c1810', fontFamily: 'serif', caretColor: '#2c1810' }}
                autoFocus
              />
            </DQWindow>
            <p className="text-xs text-center mb-4" style={{ color: '#3a3428' }}>※後から変更できます</p>
            <DQButton onClick={advance} disabled={!userName.trim()} variant="gold">次へ進む</DQButton>
          </div>
        )}

        {/* ── STATS ── */}
        {step === 'stats' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="font-cinzel text-xl font-bold" style={{ color: '#c4a35a' }}>勇者の石版</p>
              <p className="font-cinzel text-xs mt-1" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>HERO&apos;S STONE TABLET</p>
              <p className="text-xs mt-2" style={{ color: '#3a3428' }}>タップして名前を変更できます</p>
            </div>
            <DQWindow className="mb-4">
              <div className="space-y-2">
                {stats.map((stat, idx) => (
                  <button
                    key={stat.id}
                    onClick={() => openEdit(idx)}
                    className="w-full flex items-center gap-3 py-2.5 px-1 transition-all active:opacity-70"
                    style={{ borderBottom: idx < stats.length - 1 ? '1px solid rgba(107,93,63,0.25)' : 'none' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: stat.color, boxShadow: `0 0 4px ${stat.color}` }}
                    />
                    <span className="font-cinzel font-bold text-sm" style={{ color: stat.color }}>{stat.englishName}</span>
                    <span className="text-xs" style={{ color: '#4a4238' }}>{stat.japaneseDescription}</span>
                    <span className="ml-auto text-xs" style={{ color: '#3a3428' }}>✎</span>
                  </button>
                ))}
              </div>
            </DQWindow>
            <DQButton onClick={advance} variant="gold">これで始める</DQButton>
          </div>
        )}

        {/* ── CONFIRM ── */}
        {step === 'confirm' && (
          <div className="animate-fade-in-up text-center">
            <div className="text-5xl mb-4 animate-float inline-block">✦</div>
            <p className="font-cinzel text-xl font-bold mb-1" style={{ color: '#c4a35a' }}>準備完了</p>
            <p className="font-cinzel text-xs mb-5" style={{ color: '#6a6050', letterSpacing: '0.2em' }}>READY TO BEGIN</p>
            <DQWindow parchment className="mb-5">
              <p className="text-xs text-center mb-2" style={{ color: '#8b7355', fontFamily: 'serif' }}>勇者の名</p>
              <p className="text-2xl font-bold text-center mb-3" style={{ color: '#2c1810', fontFamily: 'serif' }}>{userName}</p>
              <DQDivider parchment />
              <p className="text-xs text-center" style={{ color: '#8b7355' }}>Lv.1 見習い冒険者 として出発</p>
            </DQWindow>
            <DQButton onClick={advance} variant="gold">◆ 冒険の書を開く ◆</DQButton>
          </div>
        )}
      </div>

      {/* Stat edit sheet */}
      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setEditIdx(null)}>
          <div className="absolute inset-0 bg-black/65" />
          <div
            className="relative z-10 w-full px-4 pb-8 pt-4 animate-slide-up"
            style={{ background: '#1a1610', borderTop: '2px solid rgba(107,93,63,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-cinzel text-xs text-center mb-4" style={{ color: '#c4a35a', letterSpacing: '0.2em' }}>
              ◆ ステータス名を変更 ◆
            </p>
            <div className="space-y-3 mb-4">
              {[
                { label: '英語名', val: editEn, set: setEditEn },
                { label: '説明',   val: editDesc, set: setEditDesc },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs mb-1" style={{ color: '#6a6050' }}>{f.label}</p>
                  <input
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full p-2 rounded text-sm outline-none"
                    style={{ background: '#0a0806', border: '1px solid rgba(107,93,63,0.3)', color: '#d4cfc0', caretColor: '#c4a35a' }}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
            <DQButton onClick={saveEdit} variant="gold">保存</DQButton>
          </div>
        </div>
      )}
    </div>
  );
}
