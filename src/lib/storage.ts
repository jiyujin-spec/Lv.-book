import type { GameData } from '@/types/game';
import { DEFAULT_STATS, getLevelFromXP } from './gameLogic';

const STORAGE_KEY = 'lv_book_game_data';

export const INITIAL_GAME_DATA: GameData = {
  isFirstLaunch: true,
  userName: '勇者',
  level: 1,
  totalXP: 0,
  stats: DEFAULT_STATS,
  questHistory: [],
  logEntries: [],
  soundEnabled: true,
};

export function loadGameData(): GameData {
  if (typeof window === 'undefined') return INITIAL_GAME_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_GAME_DATA };
    const parsed = JSON.parse(raw) as GameData;
    // Ensure all default stats exist (in case new stats were added)
    return {
      ...INITIAL_GAME_DATA,
      ...parsed,
      // Recompute level from stored XP for consistency
      level: getLevelFromXP(parsed.totalXP ?? 0),
    };
  } catch {
    return { ...INITIAL_GAME_DATA };
  }
}

export function saveGameData(data: GameData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail (e.g., storage quota exceeded)
  }
}

export function clearGameData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
