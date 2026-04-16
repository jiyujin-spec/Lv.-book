import type { GameData, PresetQuest, QuestRecord } from '@/types/game';
import { DEFAULT_STATS, getLevelFromXP } from './gameLogic';

const STORAGE_KEY = 'lv_book_game_data';

export const INITIAL_GAME_DATA: GameData = {
  isFirstLaunch: true,
  userName: '勇者',
  level: 1,
  totalXP: 0,
  stats: DEFAULT_STATS,
  presetQuests: [],
  questHistory: [],
  logEntries: [],
  soundEnabled: true,
};

export function loadGameData(): GameData {
  if (typeof window === 'undefined') return INITIAL_GAME_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_GAME_DATA };
    const parsed = JSON.parse(raw) as Partial<GameData> & {
      presetQuests?: (Partial<PresetQuest> & Record<string, unknown>)[];
      questHistory?: (Partial<QuestRecord> & Record<string, unknown>)[];
    };
    return {
      ...INITIAL_GAME_DATA,
      ...parsed,
      // Migrate: ensure every preset has questType
      presetQuests: (parsed.presetQuests ?? []).map(q => ({
        id: q.id ?? '',
        name: q.name ?? '',
        statId: q.statId ?? '',
        difficulty: (q.difficulty as PresetQuest['difficulty']) ?? 'Normal',
        questType: (q.questType as PresetQuest['questType']) ?? 'time',
        createdAt: q.createdAt ?? new Date().toISOString(),
      })),
      // Migrate: ensure every history record has questType
      questHistory: (parsed.questHistory ?? []).map(q => ({
        id: q.id ?? '',
        questName: q.questName ?? '',
        statId: q.statId ?? '',
        statEnglishName: q.statEnglishName ?? '',
        difficulty: (q.difficulty as QuestRecord['difficulty']) ?? 'Normal',
        questType: (q.questType as QuestRecord['questType']) ?? 'time',
        durationMinutes: q.durationMinutes ?? 0,
        focusRate: q.focusRate ?? 1.0,
        xpGained: q.xpGained ?? 0,
        completedAt: q.completedAt ?? new Date().toISOString(),
      })),
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
  } catch { /* quota exceeded — ignore */ }
}

export function clearGameData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
