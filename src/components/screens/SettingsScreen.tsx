'use client';

import React, { useState } from 'react';
import {
  Settings, User, Layers, Volume2, VolumeX,
  Trash2, HelpCircle, ChevronRight, Check, AlertTriangle,
} from 'lucide-react';
import type { StatItem } from '@/types/game';
import { formatDateTime } from '@/lib/gameLogic';
import { useGame } from '@/contexts/GameContext';
import Navigation from '../Navigation';
import soundEngine from '@/lib/soundEngine';

type Panel = 'main' | 'editName' | 'editStats' | 'howToUse' | 'confirmDelete';

export default function SettingsScreen() {
  const { state, updateUserName, updateStats, toggleSound, clearData } = useGame();
  const { data } = state;

  const [panel, setPanel] = useState<Panel>('main');
  const [nameInput, setNameInput] = useState(data.userName);

  // Stat editing
  const [editStats, setEditStats] = useState<StatItem[]>(data.stats.map(s => ({ ...s })));
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editEnglish, setEditEnglish] = useState('');
  const [editDesc, setEditDesc] = useState('');

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
    setEditingIdx(idx);
    setEditEnglish(editStats[idx].englishName);
    setEditDesc(editStats[idx].japaneseDescription);
  }

  function saveEditStat() {
    if (editingIdx === null) return;
    setEditStats(prev => prev.map((s, i) =>
      i === editingIdx
        ? { ...s, englishName: editEnglish.trim() || s.englishName, japaneseDescription: editDesc.trim() || s.japaneseDescription }
        : s
    ));
    setEditingIdx(null);
    soundEngine.playClick();
  }

  function handleDelete() {
    clearData();
    setPanel('main');
  }

  const SECTION_STYLE = {
    background: 'rgba(26,15,58,0.9)',
    border: '1px solid rgba(212,160,23,0.2)',
  };

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
        {panel !== 'main' ? (
          <button
            onClick={() => { soundEngine.playClick(); setPanel('main'); setEditingIdx(null); }}
            className="p-2 rounded-lg"
            style={{ color: '#d4a017' }}
          >
            ←
          </button>
        ) : (
          <Settings size={20} style={{ color: '#d4a017' }} />
        )}
        <div>
          <h1 className="text-base font-bold font-cinzel tracking-widest" style={{ color: '#ffd700' }}>
            {panel === 'main' && '内省の儀'}
            {panel === 'editName' && '勇者の名を変える'}
            {panel === 'editStats' && '石版を刻み直す'}
            {panel === 'howToUse' && '使い方'}
            {panel === 'confirmDelete' && 'データ削除'}
          </h1>
          <p className="text-xs font-cinzel" style={{ color: '#7b2d8b', letterSpacing: '0.15em' }}>
            {panel === 'main' && 'ORACLE & SETTINGS'}
          </p>
        </div>
      </div>

      {/* ── Scrollable ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4 space-y-4" style={{ paddingBottom: 90 }}>

        {/* ─────────────────── MAIN PANEL ─────────────────── */}
        {panel === 'main' && (
          <>
            {/* Settings sections */}
            <div className="rounded-xl overflow-hidden" style={SECTION_STYLE}>
              {[
                {
                  icon: <User size={16} />, label: '勇者の名を変える',
                  sub: data.userName, action: () => { setNameInput(data.userName); setPanel('editName'); },
                },
                {
                  icon: <Layers size={16} />, label: '石版を刻み直す',
                  sub: 'ステータス名の変更', action: () => { setEditStats(data.stats.map(s => ({ ...s }))); setPanel('editStats'); },
                },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { soundEngine.playClick(); item.action(); }}
                  className="w-full flex items-center gap-3 px-4 py-4 transition-all active:bg-white/5"
                  style={{ borderBottom: i < 1 ? '1px solid rgba(74,56,112,0.3)' : 'none' }}
                >
                  <span style={{ color: '#d4a017' }}>{item.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm" style={{ color: '#f4e4bc' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#4a3870' }}>{item.sub}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#4a3870' }} />
                </button>
              ))}
            </div>

            {/* Sound toggle */}
            <div className="rounded-xl overflow-hidden" style={SECTION_STYLE}>
              <button
                onClick={() => { toggleSound(); }}
                className="w-full flex items-center gap-3 px-4 py-4"
              >
                {data.soundEnabled
                  ? <Volume2 size={16} style={{ color: '#d4a017' }} />
                  : <VolumeX size={16} style={{ color: '#4a3870' }} />}
                <div className="flex-1 text-left">
                  <p className="text-sm" style={{ color: '#f4e4bc' }}>サウンド</p>
                  <p className="text-xs" style={{ color: '#4a3870' }}>効果音のON/OFF</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative transition-all"
                  style={{
                    background: data.soundEnabled ? '#d4a017' : 'rgba(74,56,112,0.4)',
                    boxShadow: data.soundEnabled ? '0 0 8px rgba(212,160,23,0.4)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: data.soundEnabled ? '24px' : '4px' }}
                  />
                </div>
              </button>
            </div>

            {/* How to use / Delete */}
            <div className="rounded-xl overflow-hidden" style={SECTION_STYLE}>
              <button
                onClick={() => { soundEngine.playClick(); setPanel('howToUse'); }}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-white/5"
                style={{ borderBottom: '1px solid rgba(74,56,112,0.3)' }}
              >
                <HelpCircle size={16} style={{ color: '#d4a017' }} />
                <p className="text-sm flex-1 text-left" style={{ color: '#f4e4bc' }}>使い方</p>
                <ChevronRight size={16} style={{ color: '#4a3870' }} />
              </button>
              <button
                onClick={() => { soundEngine.playClick(); setPanel('confirmDelete'); }}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-white/5"
              >
                <Trash2 size={16} style={{ color: '#ef4444' }} />
                <p className="text-sm flex-1 text-left" style={{ color: '#ef4444' }}>すべてのデータを削除</p>
                <ChevronRight size={16} style={{ color: '#ef444440' }} />
              </button>
            </div>

            {/* ── Acquisition Log ── */}
            <div>
              <p
                className="text-xs font-cinzel mb-3 px-1"
                style={{ color: '#c084fc', letterSpacing: '0.2em' }}
              >
                ✦ 内省の記録 ✦
              </p>
              {data.logEntries.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#2d1b4e', fontFamily: 'serif' }}>
                  記録はまだない
                </p>
              ) : (
                <div className="space-y-2">
                  {data.logEntries.slice(0, 30).map(entry => (
                    <div
                      key={entry.id}
                      className="rounded-lg px-3 py-2.5 flex gap-3"
                      style={{
                        background: entry.type === 'level_up'
                          ? 'rgba(212,160,23,0.08)'
                          : 'rgba(26,15,58,0.6)',
                        border: `1px solid ${entry.type === 'level_up' ? 'rgba(212,160,23,0.3)' : 'rgba(74,56,112,0.3)'}`,
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {entry.type === 'level_up'
                          ? <span style={{ fontSize: 14 }}>⭐</span>
                          : <span style={{ fontSize: 14 }}>📖</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs"
                          style={{ color: entry.type === 'level_up' ? '#ffd700' : '#d4c49c' }}
                        >
                          {entry.message}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#3a2a50', fontSize: 10 }}>
                          {formatDateTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─────────────────── EDIT NAME ─────────────────── */}
        {panel === 'editName' && (
          <div>
            <div
              className="rounded-xl p-5 mb-4"
              style={{
                background: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 100%)',
                border: '2px solid rgba(212,160,23,0.5)',
              }}
            >
              <p className="text-xs text-center mb-3" style={{ color: '#8b7355', fontFamily: 'serif' }}>
                ― 新たなる名を刻め ―
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={e => {
                  setNameInput(e.target.value);
                  soundEngine.playWriting();
                }}
                placeholder="勇者の名..."
                maxLength={20}
                className="w-full bg-transparent text-center text-xl outline-none border-b-2 pb-2"
                style={{ borderColor: '#8b7355', color: '#2c1810', fontFamily: 'serif', caretColor: '#2c1810' }}
                autoFocus
              />
            </div>
            <button
              onClick={saveName}
              disabled={!nameInput.trim()}
              className="w-full py-4 rounded-xl font-cinzel tracking-widest font-bold text-sm transition-all active:scale-98 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f0c040)',
                color: '#1a0f3a',
              }}
            >
              保存する
            </button>
          </div>
        )}

        {/* ─────────────────── EDIT STATS ─────────────────── */}
        {panel === 'editStats' && (
          <div>
            <div className="space-y-2 mb-4">
              {editStats.map((stat, idx) => (
                <button
                  key={stat.id}
                  onClick={() => openEditStat(idx)}
                  className="w-full flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-98"
                  style={{
                    background: 'rgba(26,15,58,0.9)',
                    border: `1px solid ${stat.color}40`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: stat.color, boxShadow: `0 0 6px ${stat.color}` }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-cinzel font-bold text-sm" style={{ color: stat.color }}>
                      {stat.englishName}
                    </p>
                    <p className="text-xs" style={{ color: '#4a3870' }}>{stat.japaneseDescription}</p>
                  </div>
                  <span style={{ color: '#4a3870', fontSize: 13 }}>✎</span>
                </button>
              ))}
            </div>
            <button
              onClick={saveStats}
              className="w-full py-4 rounded-xl font-cinzel tracking-widest font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f0c040)',
                color: '#1a0f3a',
              }}
            >
              <Check size={16} className="inline mr-2" />
              変更を保存
            </button>
          </div>
        )}

        {/* ─────────────────── HOW TO USE ─────────────────── */}
        {panel === 'howToUse' && (
          <div className="space-y-3">
            {[
              { icon: '📖', title: '冒険の書', desc: 'メイン画面。現在のレベル、XP、能力チャートが表示されます。' },
              { icon: '⚔️', title: 'クエスト受注', desc: 'クエスト名・能力・難易度・時間を設定してタスクを開始します。' },
              { icon: '⏱️', title: 'クエストタイマー', desc: '没入モード。タイマー終了まで他の機能はロックされます。' },
              { icon: '📊', title: 'クエストの報告', desc: '集中度（0.5〜1.5×）を自己申告してXPを獲得します。' },
              { icon: '📜', title: '吟遊詩人の書', desc: '過去のクエスト記録が年代記として閲覧できます。' },
              { icon: '🔮', title: 'XP計算式', desc: '(難易度係数 × 実行分÷60) × 集中度\n例: Normal 60分 集中1.0× = 10 XP' },
              { icon: '⬆️', title: 'レベルアップ', desc: 'Lv1→2: 5XP\nLv2以降: 10×(目標Lv-1)^2.2 の累計XP' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(26,15,58,0.8)',
                  border: '1px solid rgba(74,56,112,0.4)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <p className="font-cinzel font-bold text-sm" style={{ color: '#f0c040' }}>
                    {item.title}
                  </p>
                </div>
                <p className="text-xs whitespace-pre-line" style={{ color: '#8b7355', paddingLeft: 26 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────── CONFIRM DELETE ─────────────────── */}
        {panel === 'confirmDelete' && (
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
            >
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>
            <h3 className="text-lg font-bold font-cinzel mb-2" style={{ color: '#ef4444' }}>
              本当に削除しますか？
            </h3>
            <p className="text-sm mb-1" style={{ color: '#f4e4bc' }}>
              すべての冒険の記録が消えます
            </p>
            <p className="text-xs mb-8" style={{ color: '#4a3870' }}>
              この操作は取り消せません
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 rounded-xl font-cinzel font-bold text-sm"
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '2px solid rgba(239,68,68,0.5)',
                  color: '#ef4444',
                }}
              >
                すべて削除する
              </button>
              <button
                onClick={() => { soundEngine.playClick(); setPanel('main'); }}
                className="w-full py-4 rounded-xl font-cinzel text-sm"
                style={{
                  background: 'rgba(26,15,58,0.8)',
                  border: '1px solid rgba(74,56,112,0.4)',
                  color: '#c084fc',
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

      </div>

      <Navigation />

      {/* Stat edit sheet */}
      {editingIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setEditingIdx(null)}
          />
          <div
            className="relative z-10 w-full rounded-t-2xl p-6"
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
                <label className="text-xs" style={{ color: '#8b7355' }}>説明（日本語）</label>
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
