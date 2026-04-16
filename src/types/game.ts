export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type Screen =
  | 'prologue'
  | 'main'
  | 'tavern'
  | 'questCreate'
  | 'timer'
  | 'result'
  | 'timeline'
  | 'settings';
export type LogType = 'quest_complete' | 'level_up' | 'stat_up';

export interface StatItem {
  id: string;
  englishName: string;
  japaneseDescription: string;
  xp: number;
  color: string;
}

/** A saved preset quest in the Tavern */
export interface PresetQuest {
  id: string;
  name: string;
  statId: string;
  difficulty: Difficulty;
  durationMinutes: number;
  createdAt: string;
}

export interface QuestRecord {
  id: string;
  questName: string;
  statId: string;
  statEnglishName: string;
  difficulty: Difficulty;
  durationMinutes: number;
  focusRate: number;
  xpGained: number;
  completedAt: string;
}

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  timestamp: string;
}

export interface GameData {
  isFirstLaunch: boolean;
  userName: string;
  level: number;
  totalXP: number;
  stats: StatItem[];
  presetQuests: PresetQuest[];
  questHistory: QuestRecord[];
  logEntries: LogEntry[];
  soundEnabled: boolean;
}

export interface ActiveQuest {
  questName: string;
  statId: string;
  statEnglishName: string;
  difficulty: Difficulty;
  durationMinutes: number;
  startedAt: number;
}

export interface QuestResult {
  quest: ActiveQuest;
  focusRate: number;
  xpGained: number;
  statXPGained: number;
  leveledUp: boolean;
  newLevel: number;
  oldLevel: number;
}
