'use client';

import React, { useState } from 'react';
import {
  Settings, User, Layers, Volume2, VolumeX,
  Trash2, HelpCircle, ChevronRight, Check, AlertTriangle,
} from 'lucide-react';
import type { StatItem } from '@/types/game';
import { formatDateTime } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import DQWindow, { DQDivider, DQButton } from '../DQWindow';
import Navigation from '../Navigation';
import soundEngine from '@/lib/soundEngine';

type Panel = 'main' | 'editName' | 'editStats' | 'howToUse' | 'confirmDelete';

export default function SettingsScreen() {
  const { state, updateUserName, updateStats, toggleSound, clearData } = useGame();
  const { data } = state;

  const [panel,     setPanel]     = useState<Panel>('main');
  const [nameInput, setNameInput] = useState(data.userName);
  const [editStats, setEditStats] = useState<StatItem[]>(data.stats.map(s => ({ ...s })));
  const [editIdx,   setEditIdx]   = useState<number | null>(null);
  const [editEn,    setEditEn]    = useState('');
  const [editDesc,  setEditDesc]  = useState('');

  function go(p: Panel) { soundEngine.playMenuOpen(); setPanel(p); setEditIdx(null); }

  function saveName() {
    if (!nameInput.trim()) return;
    updateUserName(nameInput.trim());
    soundEngine.playClick();
    setPanel('main');
  }
  function saveStats() {
    updateStats(editStats);
    soundEngine.playClick();
    setPanel('main');
  }
  function openEditStat(idx: number) {
    setEditIdx(idx); setEditEn(editStats[idx].englishName); setEditDesc(editStats[idx].japaneseDescription);
  }
  function saveEditStat() {
    if (editIdx === null) return;
    setEditStats(prev => prev.map((s, i) =>
      i === editIdx ? { ...s, englishName: editEn.trim() || s.englishName, japaneseDescription: editDesc.trim() || s.japaneseDescription } : s
    ));
    setEditIdx(null);
    soundEngine.playClick();
  }

  const backBtn = panel !== 'main' && (
    <button onClick={() => go('main')} className="p-2 rounded transition-all active:scale-90" style={{ color: '#f0c030' }}>
      ←
    </button>
  );

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#04091a' }}>
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(184,204,224,0.12)' }}>
        {backBtn ?? <Settings size={19} style={{ color: '#f0c030' }} />}
        <div>
          <h1 className="font-cinzel text-base font-bold tracking-widest" style={{ color: '#f0c030' }}>
            {panel === 'main' ? '内省の儀' : panel === 'editName' ? '勇者名の変更' : panel === 'editStats' ? '石版を刻み直す' : panel === 'howToUse' ? '使い方' : 'データ削除'}
          </h1>
          {panel === 'main' && (
            <p className="font-cinzel text-xs" style={{ color: '#4a6080', letterSpacing: '0.15em' }}>ORACLE & SETTINGS</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {/* ── MAIN ── */}
        {panel === 'main' && (
          <>
            <DQWindow>
              {[
                { icon: <User size={15}/>,   label: '勇者の名を変える',   sub: data.userName,        action: () => { setNameInput(data.userName); go('editName'); } },
                { icon: <Layers size={15}/>, label: '石版を刻み直す',     sub: 'ステータス名の変更', action: () => { setEditStats(data.stats.map(s=>({...s}))); go('editStats'); } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 py-3.5 transition-all active:opacity-70"
                  style={{ borderBottom: i < 1 ? '1px solid rgba(30,48,80,0.6)' : 'none' }}
                >
                  <span style={{ color: '#f0c030' }}>{item.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm" style={{ color: '#b8cce0' }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#2a3a50' }}>{item.sub}</p>
                  </div>
                  <ChevronRight size={15} style={{ color: '#1e3050' }} />
                </button>
              ))}
            </DQWindow>

            {/* Sound toggle */}
            <DQWindow>
              <button onClick={toggleSound} className="w-full flex items-center gap-3 py-1">
                {data.soundEnabled
                  ? <Volume2 size={15} style={{ color: '#f0c030' }} />
                  : <VolumeX  size={15} style={{ color: '#1e3050' }} />}
                <div className="flex-1 text-left">
                  <p className="text-sm" style={{ color: '#b8cce0' }}>サウンド</p>
                  <p className="text-xs" style={{ color: '#2a3a50' }}>効果音のON/OFF</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative transition-all"
                  style={{
                    background: data.soundEnabled ? '#f0c030' : 'rgba(30,48,80,0.5)',
                    boxShadow: data.soundEnabled ? '0 0 8px rgba(240,192,48,0.4)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: data.soundEnabled ? '24px' : '4px' }}
                  />
                </div>
              </button>
            </DQWindow>

            {/* How to use / Delete */}
            <DQWindow>
              {[
                { icon: <HelpCircle size={15}/>, label: '使い方', action: () => go('howToUse'), color: '#f0c030' },
                { icon: <Trash2     size={15}/>, label: 'すべてのデータを削除', action: () => go('confirmDelete'), color: '#ef4444' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 py-3.5 transition-all active:opacity-70"
                  style={{ borderBottom: i < 1 ? '1px solid rgba(30,48,80,0.6)' : 'none' }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <p className="text-sm flex-1 text-left" style={{ color: i === 1 ? '#ef4444' : '#b8cce0' }}>
                    {item.label}
                  </p>
                  <ChevronRight size={15} style={{ color: '#1e3050' }} />
                </button>
              ))}
            </DQWindow>

            {/* Log */}
            <div>
              <p className="font-cinzel text-xs px-1 mb-3" style={{ color: '#4a6080', letterSpacing: '0.2em' }}>
                ✦ 内省の記録
              </p>
              {data.logEntries.length === 0
                ? <DQWindow><p className="text-sm text-center" style={{ color: '#1e3050', fontFamily: 'serif' }}>記録はまだない</p></DQWindow>
                : (
                  <div className="space-y-2">
                    {data.logEntries.slice(0, 40).map(e => (
                      <div
                        key={e.id}
                        className="flex gap-2 px-3 py-2.5 rounded"
                        style={{
                          background: e.type === 'level_up' ? 'rgba(240,192,48,0.06)' : 'rgba(7,18,31,0.6)',
                          border: `1px solid ${e.type === 'level_up' ? 'rgba(240,192,48,0.25)' : 'rgba(30,48,80,0.5)'}`,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>{e.type === 'level_up' ? '⭐' : '📖'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: e.type === 'level_up' ? '#f0c030' : '#7090b0' }}>
                            {e.message}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#1e3050', fontSize: 10 }}>
                            {formatDateTime(e.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </>
        )}

        {/* ── EDIT NAME ── */}
        {panel === 'editName' && (
          <div>
            <DQWindow parchment className="mb-4">
              <p className="text-xs text-center mb-3" style={{ color: '#8b7355', fontFamily: 'serif' }}>― 新たなる名を刻め ―</p>
              <input
                type="text"
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); soundEngine.playWriting(); }}
                placeholder="勇者の名..."
                maxLength={20}
                className="w-full bg-transparent text-center text-xl outline-none border-b-2 pb-2"
                style={{ borderColor: '#8b7355', color: '#2c1810', fontFamily: 'serif', caretColor: '#2c1810' }}
                autoFocus
              />
            </DQWindow>
            <DQButton onClick={saveName} disabled={!nameInput.trim()} variant="gold">保存する</DQButton>
          </div>
        )}

        {/* ── EDIT STATS ── */}
        {panel === 'editStats' && (
          <div>
            <div className="space-y-2 mb-4">
              {editStats.map((stat, idx) => (
                <button
                  key={stat.id}
                  onClick={() => openEditStat(idx)}
                  className="w-full flex items-center gap-3 transition-all active:scale-98"
                >
                  <DQWindow className="w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ background: stat.color, boxShadow: `0 0 5px ${stat.color}` }}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-cinzel font-bold text-sm" style={{ color: stat.color }}>{stat.englishName}</p>
                        <p className="text-xs" style={{ color: '#2a3a50' }}>{stat.japaneseDescription}</p>
                      </div>
                      <span style={{ color: '#1e3050', fontSize: 13 }}>✎</span>
                    </div>
                  </DQWindow>
                </button>
              ))}
            </div>
            <DQButton onClick={saveStats} variant="gold">
              <div className="flex items-center justify-center gap-2">
                <Check size={15} /><span>変更を保存</span>
              </div>
            </DQButton>
          </div>
        )}

        {/* ── HOW TO USE ── */}
        {panel === 'howToUse' && (
          <div className="space-y-3">
            {[
              { icon: '📖', title: '冒険の書',      desc: 'レベル・XP・能力チャートを確認できます。' },
              { icon: '🏰', title: '冒険者の酒場',  desc: '保存済みクエストの一覧。タップして詳細確認→開始。' },
              { icon: '✏️', title: 'クエスト制作',  desc: 'クエスト名・能力・難易度・時間を設定して保存。' },
              { icon: '⏱️', title: 'タイマー',      desc: '没入モード。終了まで他の機能はロックされます。' },
              { icon: '📊', title: 'リザルト',      desc: '集中度（0.5〜1.5×）を申告してXPを獲得。' },
              { icon: '📜', title: '詩人の書',      desc: '過去クエストの記録一覧。統計も確認できます。' },
              { icon: '⚡', title: 'XP計算式',      desc: '(難易度係数 × 分÷60) × 集中度\nEasy×5 / Normal×10 / Hard×15' },
              { icon: '⬆️', title: 'レベルアップ', desc: 'Lv1→2: 5XP\n以降: 10×(目標Lv-1)^2.2 の累計XP' },
            ].map((item, i) => (
              <DQWindow key={i}>
                <div className="flex items-start gap-2">
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div>
                    <p className="font-cinzel font-bold text-sm" style={{ color: '#f0c030' }}>{item.title}</p>
                    <p className="text-xs mt-0.5 whitespace-pre-line" style={{ color: '#4a6080' }}>{item.desc}</p>
                  </div>
                </div>
              </DQWindow>
            ))}
          </div>
        )}

        {/* ── CONFIRM DELETE ── */}
        {panel === 'confirmDelete' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(180,40,40,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={30} style={{ color: '#ef4444' }} />
            </div>
            <DQWindow className="mb-4">
              <p className="font-cinzel text-sm font-bold mb-2" style={{ color: '#ef4444' }}>本当に削除しますか？</p>
              <p className="text-xs" style={{ color: '#4a6080' }}>すべての冒険の記録が消えます。この操作は取り消せません。</p>
            </DQWindow>
            <div className="space-y-3">
              <DQButton onClick={() => { clearData(); setPanel('main'); }} variant="danger">
                すべて削除する
              </DQButton>
              <DQButton onClick={() => { soundEngine.playClick(); setPanel('main'); }} variant="ghost">
                キャンセル
              </DQButton>
            </div>
          </div>
        )}
      </div>

      <Navigation />

      {/* Stat edit sheet */}
      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setEditIdx(null)}>
          <div className="absolute inset-0 bg-black/65" />
          <div
            className="relative z-10 w-full px-4 pb-safe pb-6 pt-4 animate-slide-up"
            style={{ background: '#07121f', borderTop: '2px solid rgba(184,204,224,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-cinzel text-xs text-center mb-4" style={{ color: '#f0c030', letterSpacing: '0.2em' }}>
              ◆ ステータス名を変更 ◆
            </p>
            <div className="space-y-3 mb-4">
              {[
                { label: '英語名', val: editEn, set: setEditEn },
                { label: '説明',   val: editDesc, set: setEditDesc },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs mb-1" style={{ color: '#4a6080' }}>{f.label}</p>
                  <input
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full p-2 rounded text-sm outline-none"
                    style={{
                      background: '#010810',
                      border: '1px solid rgba(184,204,224,0.25)',
                      color: '#e8f0f8',
                      caretColor: '#f0c030',
                    }}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
            <DQButton onClick={saveEditStat} variant="gold">保存</DQButton>
          </div>
        </div>
      )}
    </div>
  );
}
