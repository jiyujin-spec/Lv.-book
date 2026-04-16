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
  StatItem, Difficulty, PresetQuest, QuestRecord,
} from '@/types/game';
import {
  loadGameData, saveGameData, clearGameData, INITIAL_GAME_DATA,
} from '@/lib/storage';
import {
  calculateXP, getLevelFromXP, generateId, TASK_XP, getGameDay,
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
  | { type: 'STOP_TIMER' }
  | { type: 'COMPLETE_QUEST'; payload: QuestResult }
  | { type: 'COMPLETE_TASK_QUEST'; payload: { preset: PresetQuest; statEnglishName: string; xpGained: number } }
  | { type: 'DISMISS_LEVEL_UP' }
  | { type: 'UPDATE_USER_NAME'; payload: string }
  | { type: 'UPDATE_STATS'; payload: StatItem[] }
  | { type: 'ADD_PRESET_QUEST'; payload: PresetQuest }
  | { type: 'DELETE_PRESET_QUEST'; payload: string }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'CLEAR_DATA' };

/**
 * Purge dailyCompletions entries that are older than the current game day.
 */
function resetStaleCompletions(completions: Record<string, string>): Record<string, string> {
  const today = getGameDay();
  const cleaned: Record<string, string> = {};
  for (const [id, day] of Object.entries(completions)) {
    if (day === today) cleaned[id] = day;
  }
  return cleaned;
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD': {
      const data = {
        ...action.payload,
        dailyCompletions: resetStaleCompletions(action.payload.dailyCompletions ?? {}),
      };
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

    case 'STOP_TIMER':
      if (!state.activeQuest) return state;
      return { ...state, activeQuest: { ...state.activeQuest, stoppedAt: Date.now() } };

    case 'COMPLETE_QUEST': {
      const result = action.payload;
      const { quest, xpGained, statXPGained } = result;

      const updatedStats = state.data.stats.map(s =>
        s.id === quest.statId ? { ...s, xp: s.xp + statXPGained } : s
      );
      const newTotalXP = state.data.totalXP + xpGained;
      const newLevel = getLevelFromXP(newTotalXP);
      const didLevelUp = newLevel > state.data.level;

      const durationMin = Math.round(quest.durationMinutes);
      const questTypeText = quest.questType === 'task'
        ? '任務遂行'
        : `${durationMin > 0 ? durationMin : 1}分間の冒険`;

      const newLogs = [...state.data.logEntries];
      newLogs.unshift({
        id: generateId(),
        type: 'quest_complete',
        message: `「${quest.questName}」${questTypeText}を完遂。${quest.statEnglishName}が ${statXPGained.toFixed(1)} 上昇！`,
        timestamp: new Date().toISOString(),
      });
      if (didLevelUp) {
        newLogs.unshift({
          id: generateId(),
          type: 'level_up',
          message: `Lv.${newLevel} になった！`,
          timestamp: new Date().toISOString(),
        });
      }

      const record: QuestRecord = {
        id: generateId(),
        questName: quest.questName,
        statId: quest.statId,
        statEnglishName: quest.statEnglishName,
        difficulty: quest.difficulty,
        questType: quest.questType ?? 'time',
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

    case 'COMPLETE_TASK_QUEST': {
      const { preset, statEnglishName, xpGained } = action.payload;

      const updatedStats = state.data.stats.map(s =>
        s.id === preset.statId ? { ...s, xp: s.xp + xpGained } : s
      );
      const newTotalXP = state.data.totalXP + xpGained;
      const newLevel = getLevelFromXP(newTotalXP);
      const didLevelUp = newLevel > state.data.level;

      const newLogs = [...state.data.logEntries];
      newLogs.unshift({
        id: generateId(),
        type: 'quest_complete',
        message: `「${preset.name}」任務遂行を完遂。${statEnglishName}が ${xpGained.toFixed(1)} 上昇！`,
        timestamp: new Date().toISOString(),
      });
      if (didLevelUp) {
        newLogs.unshift({
          id: generateId(),
          type: 'level_up',
          message: `Lv.${newLevel} になった！`,
          timestamp: new Date().toISOString(),
        });
      }

      const record: QuestRecord = {
        id: generateId(),
        questName: preset.name,
        statId: preset.statId,
        statEnglishName,
        difficulty: preset.difficulty,
        questType: 'task',
        durationMinutes: 0,
        focusRate: 1.0,
        xpGained,
        completedAt: new Date().toISOString(),
      };

      // Mark this task as completed for today
      const today = getGameDay();
      const newCompletions = { ...state.data.dailyCompletions, [preset.id]: today };

      const newData: GameData = {
        ...state.data,
        totalXP: newTotalXP,
        level: newLevel,
        stats: updatedStats,
        questHistory: [record, ...state.data.questHistory],
        logEntries: newLogs,
        dailyCompletions: newCompletions,
      };

      // Stay on current screen (tavern)
      return { ...state, data: newData };
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
interface TaskQuestResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
}

interface GameContextValue {
  state: GameState;
  navigate: (screen: Screen) => void;
  completePrologue: (userName: string, stats: StatItem[]) => void;
  startQuest: (quest: ActiveQuest) => void;
  stopTimer: () => void;
  completeQuest: (focusRate: number) => void;
  completeTaskQuest: (preset: PresetQuest) => TaskQuestResult | null;
  isTaskCompletedToday: (presetId: string) => boolean;
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

  const navigate = useCallback((s: Screen) => dispatch({ type: 'SET_SCREEN', payload: s }), []);
  const completePrologue = useCallback((userName: string, stats: StatItem[]) =>
    dispatch({ type: 'COMPLETE_PROLOGUE', payload: { userName, stats } }), []);

  const startQuest = useCallback((quest: ActiveQuest) => {
    dispatch({ type: 'START_QUEST', payload: quest });
    soundEngine.playQuestStart();
  }, []);

  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP_TIMER' });
  }, []);

  const completeQuest = useCallback((focusRate: number) => {
    const { activeQuest, data } = state;
    if (!activeQuest) return;

    let xpGained: number;
    let durationMinutes: number;

    if (activeQuest.questType === 'task') {
      xpGained = TASK_XP[activeQuest.difficulty as Difficulty];
      durationMinutes = 0;
    } else {
      const endTime = activeQuest.stoppedAt ?? Date.now();
      durationMinutes = (endTime - activeQuest.startedAt) / 60000;
      xpGained = calculateXP(activeQuest.difficulty as Difficulty, durationMinutes, focusRate);
    }

    const statXPGained = xpGained;
    const newTotalXP = data.totalXP + xpGained;
    const newLevel = getLevelFromXP(newTotalXP);

    const result: QuestResult = {
      quest: { ...activeQuest, durationMinutes },
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

  const completeTaskQuest = useCallback((preset: PresetQuest): TaskQuestResult | null => {
    const stat = state.data.stats.find(s => s.id === preset.statId);
    if (!stat) return null;

    // Check if already completed today
    const today = getGameDay();
    if (state.data.dailyCompletions[preset.id] === today) return null;

    const xpGained = TASK_XP[preset.difficulty];
    const newTotalXP = state.data.totalXP + xpGained;
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > state.data.level;

    dispatch({
      type: 'COMPLETE_TASK_QUEST',
      payload: { preset, statEnglishName: stat.englishName, xpGained },
    });

    soundEngine.playStamp();
    setTimeout(() => soundEngine.playQuestComplete(), 250);
    if (leveledUp) setTimeout(() => soundEngine.playLevelUp(), 3200);

    return { xpGained, leveledUp, newLevel };
  }, [state]);

  const isTaskCompletedToday = useCallback((presetId: string): boolean => {
    const today = getGameDay();
    return state.data.dailyCompletions[presetId] === today;
  }, [state.data.dailyCompletions]);

  const dismissLevelUp = useCallback(() => dispatch({ type: 'DISMISS_LEVEL_UP' }), []);
  const updateUserName  = useCallback((n: string) => dispatch({ type: 'UPDATE_USER_NAME', payload: n }), []);
  const updateStats     = useCallback((s: StatItem[]) => dispatch({ type: 'UPDATE_STATS', payload: s }), []);

  const addPresetQuest = useCallback((q: PresetQuest) =>
    dispatch({ type: 'ADD_PRESET_QUEST', payload: q }), []);
  const deletePresetQuest = useCallback((id: string) =>
    dispatch({ type: 'DELETE_PRESET_QUEST', payload: id }), []);

  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const clearData   = useCallback(() => dispatch({ type: 'CLEAR_DATA' }), []);

  return (
    <GameContext.Provider value={{
      state, navigate, completePrologue, startQuest, stopTimer,
      completeQuest, completeTaskQuest, isTaskCompletedToday,
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
