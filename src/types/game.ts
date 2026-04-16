export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type QuestType = 'time' | 'task';
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
  questType: QuestType;
  createdAt: string;
}

export interface QuestRecord {
  id: string;
  questName: string;
  statId: string;
  statEnglishName: string;
  difficulty: Difficulty;
  questType: QuestType;
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
  questType: QuestType;
  durationMinutes: number;  // 0 at start; elapsed minutes at stop (time quests)
  startedAt: number;        // Date.now() when quest started
  stoppedAt?: number;       // Date.now() when stopwatch stopped (time quests only)
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
