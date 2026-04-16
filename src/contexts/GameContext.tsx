'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  GameData, ActiveQuest, QuestResult, Screen,
  StatItem, Difficulty, PresetQuest,
} from '@/types/game';
import {
  loadGameData, saveGameData, clearGameData, INITIAL_GAME_DATA,
} from '@/lib/storage';
import {
  calculateXP, getLevelFromXP, generateId,
} from '@/lib/gameLogic';
import soundEngine from '@/lib/soundEngine';

// ─── State ────────────────────────────────────────────────────────────────────
interface GameState {
  data: GameData;
  screen: Screen;
  activeQuest: ActiveQuest | null;
  lastResult: QuestResult | null;
  showLevelUp: boolean;
  isLoaded: boolean;
}

const initialState: GameState = {
  data: INITIAL_GAME_DATA,
  screen: 'prologue',
  activeQuest: null,
  lastResult: null,
  showLevelUp: false,
  isLoaded: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOAD'; payload: GameData }
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'COMPLETE_PROLOGUE'; payload: { userName: string; stats: StatItem[] } }
  | { type: 'START_QUEST'; payload: ActiveQuest }
  | { type: 'COMPLETE_QUEST'; payload: QuestResult }
  | { type: 'DISMISS_LEVEL_UP' }
  | { type: 'UPDATE_USER_NAME'; payload: string }
  | { type: 'UPDATE_STATS'; payload: StatItem[] }
  | { type: 'ADD_PRESET_QUEST'; payload: PresetQuest }
  | { type: 'DELETE_PRESET_QUEST'; payload: string }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'CLEAR_DATA' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD': {
      const data = action.payload;
      return { ...state, data, screen: data.isFirstLaunch ? 'prologue' : 'main', isLoaded: true };
    }
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'COMPLETE_PROLOGUE': {
      const { userName, stats } = action.payload;
      const newData: GameData = {
        ...state.data,
        isFirstLaunch: false,
        userName,
        stats,
        logEntries: [{
          id: generateId(),
          type: 'quest_complete',
          message: `「${userName}」の冒険が始まった！`,
          timestamp: new Date().toISOString(),
        }],
      };
      return { ...state, data: newData, screen: 'main' };
    }

    case 'START_QUEST':
      return { ...state, activeQuest: action.payload, screen: 'timer' };

    case 'COMPLETE_QUEST': {
      const result = action.payload;
      const { quest, xpGained, statXPGained } = result;

      const updatedStats = state.data.stats.map(s =>
        s.id === quest.statId ? { ...s, xp: s.xp + statXPGained } : s
      );
      const newTotalXP = state.data.totalXP + xpGained;
      const newLevel = getLevelFromXP(newTotalXP);
      const didLevelUp = newLevel > state.data.level;

      const newLogs = [...state.data.logEntries];
      newLogs.unshift({
        id: generateId(),
        type: 'quest_complete',
        message: `「${quest.questName}」クエスト完了。${quest.statEnglishName}が ${statXPGained.toFixed(1)} 上がった！`,
        timestamp: new Date().toISOString(),
      });
      if (didLevelUp) {
        newLogs.unshift({
          id: generateId(),
          type: 'level_up',
          message: `Lv.${newLevel} になった！✨`,
          timestamp: new Date().toISOString(),
        });
      }

      const record = {
        id: generateId(),
        questName: quest.questName,
        statId: quest.statId,
        statEnglishName: quest.statEnglishName,
        difficulty: quest.difficulty,
        durationMinutes: quest.durationMinutes,
        focusRate: result.focusRate,
        xpGained,
        completedAt: new Date().toISOString(),
      };

      const newData: GameData = {
        ...state.data,
        totalXP: newTotalXP,
        level: newLevel,
        stats: updatedStats,
        questHistory: [record, ...state.data.questHistory],
        logEntries: newLogs,
      };

      return {
        ...state,
        data: newData,
        activeQuest: null,
        lastResult: result,
        showLevelUp: didLevelUp,
        screen: 'result',
      };
    }

    case 'DISMISS_LEVEL_UP':
      return { ...state, showLevelUp: false };

    case 'UPDATE_USER_NAME':
      return { ...state, data: { ...state.data, userName: action.payload } };

    case 'UPDATE_STATS':
      return { ...state, data: { ...state.data, stats: action.payload } };

    case 'ADD_PRESET_QUEST': {
      const newData = {
        ...state.data,
        presetQuests: [...state.data.presetQuests, action.payload],
      };
      return { ...state, data: newData };
    }

    case 'DELETE_PRESET_QUEST': {
      const newData = {
        ...state.data,
        presetQuests: state.data.presetQuests.filter(q => q.id !== action.payload),
      };
      return { ...state, data: newData };
    }

    case 'TOGGLE_SOUND': {
      const newEnabled = !state.data.soundEnabled;
      soundEngine.setEnabled(newEnabled);
      return { ...state, data: { ...state.data, soundEnabled: newEnabled } };
    }

    case 'CLEAR_DATA': {
      clearGameData();
      return { ...initialState, data: { ...INITIAL_GAME_DATA }, screen: 'prologue', isLoaded: true };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameState;
  navigate: (screen: Screen) => void;
  completePrologue: (userName: string, stats: StatItem[]) => void;
  startQuest: (quest: ActiveQuest) => void;
  completeQuest: (focusRate: number) => void;
  dismissLevelUp: () => void;
  updateUserName: (name: string) => void;
  updateStats: (stats: StatItem[]) => void;
  addPresetQuest: (q: PresetQuest) => void;
  deletePresetQuest: (id: string) => void;
  toggleSound: () => void;
  clearData: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const data = loadGameData();
    dispatch({ type: 'LOAD', payload: data });
    soundEngine.setEnabled(data.soundEnabled);
  }, []);

  useEffect(() => {
    if (state.isLoaded) saveGameData(state.data);
  }, [state.data, state.isLoaded]);

  const navigate     = useCallback((s: Screen) => dispatch({ type: 'SET_SCREEN', payload: s }), []);
  const completePrologue = useCallback((userName: string, stats: StatItem[]) =>
    dispatch({ type: 'COMPLETE_PROLOGUE', payload: { userName, stats } }), []);

  const startQuest   = useCallback((quest: ActiveQuest) => {
    dispatch({ type: 'START_QUEST', payload: quest });
    soundEngine.playQuestStart();
  }, []);

  const completeQuest = useCallback((focusRate: number) => {
    const { activeQuest, data } = state;
    if (!activeQuest) return;
    const xpGained = calculateXP(activeQuest.difficulty as Difficulty, activeQuest.durationMinutes, focusRate);
    const statXPGained = xpGained;
    const newTotalXP = data.totalXP + xpGained;
    const newLevel   = getLevelFromXP(newTotalXP);
    const result: QuestResult = {
      quest: activeQuest,
      focusRate,
      xpGained,
      statXPGained,
      leveledUp: newLevel > data.level,
      newLevel,
      oldLevel: data.level,
    };
    dispatch({ type: 'COMPLETE_QUEST', payload: result });
    soundEngine.playQuestComplete();
    if (newLevel > data.level) setTimeout(() => soundEngine.playLevelUp(), 800);
  }, [state]);

  const dismissLevelUp = useCallback(() => dispatch({ type: 'DISMISS_LEVEL_UP' }), []);
  const updateUserName = useCallback((n: string) => dispatch({ type: 'UPDATE_USER_NAME', payload: n }), []);
  const updateStats    = useCallback((s: StatItem[]) => dispatch({ type: 'UPDATE_STATS', payload: s }), []);

  const addPresetQuest = useCallback((q: PresetQuest) =>
    dispatch({ type: 'ADD_PRESET_QUEST', payload: q }), []);
  const deletePresetQuest = useCallback((id: string) =>
    dispatch({ type: 'DELETE_PRESET_QUEST', payload: id }), []);

  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const clearData   = useCallback(() => dispatch({ type: 'CLEAR_DATA' }), []);

  return (
    <GameContext.Provider value={{
      state, navigate, completePrologue, startQuest, completeQuest,
      dismissLevelUp, updateUserName, updateStats,
      addPresetQuest, deletePresetQuest, toggleSound, clearData,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
