export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type Screen = 'prologue' | 'main' | 'quest' | 'timer' | 'result' | 'timeline' | 'settings';
export type LogType = 'quest_complete' | 'level_up' | 'stat_up';

export interface StatItem {
  id: string;
  englishName: string;
  japaneseDescription: string;
  xp: number;
  color: string;
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
  completedAt: string; // ISO string
}

export interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  timestamp: string; // ISO string
}

export interface GameData {
  isFirstLaunch: boolean;
  userName: string;
  level: number;
  totalXP: number;
  stats: StatItem[];
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
  startedAt: number; // Date.now()
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
