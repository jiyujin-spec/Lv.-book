import type { Difficulty, StatItem } from '@/types/game';

// ─── Default Stats ────────────────────────────────────────────────────────────
export const DEFAULT_STATS: StatItem[] = [
  {
    id: 'vigor',
    englishName: 'Vigor',
    japaneseDescription: '活力・体力',
    xp: 0,
    color: '#ef4444',
  },
  {
    id: 'intellect',
    englishName: 'Intellect',
    japaneseDescription: '知能・知識',
    xp: 0,
    color: '#3b82f6',
  },
  {
    id: 'social',
    englishName: 'Social',
    japaneseDescription: '対人・人間関係',
    xp: 0,
    color: '#22c55e',
  },
  {
    id: 'fortune',
    englishName: 'Fortune',
    japaneseDescription: 'ビジネス・実績',
    xp: 0,
    color: '#f59e0b',
  },
  {
    id: 'will',
    englishName: 'Will',
    japaneseDescription: 'マインド・精神',
    xp: 0,
    color: '#a855f7',
  },
];

// ─── Difficulty Coefficients ──────────────────────────────────────────────────
export const DIFFICULTY_COEFFICIENT: Record<Difficulty, number> = {
  Easy: 5,
  Normal: 10,
  Hard: 15,
};

/** Fixed XP for task-type quests (no time component) */
export const TASK_XP: Record<Difficulty, number> = {
  Easy: 2,
  Normal: 5,
  Hard: 10,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  Easy: '易 Easy',
  Normal: '普 Normal',
  Hard: '難 Hard',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#22c55e',
  Normal: '#f59e0b',
  Hard: '#ef4444',
};

// ─── XP Calculation ───────────────────────────────────────────────────────────
/**
 * 上昇経験値 = (難易度係数 × 実行分/60) × 集中度係数
 */
export function calculateXP(
  difficulty: Difficulty,
  durationMinutes: number,
  focusRate: number
): number {
  const coeff = DIFFICULTY_COEFFICIENT[difficulty];
  return Math.round((coeff * (durationMinutes / 60)) * focusRate * 10) / 10;
}

// ─── Level System ─────────────────────────────────────────────────────────────
/**
 * 累計必要XP to reach the given level.
 * Lv1 → 2: 5 XP
 * Lv2 → N: cumulative = 10 × (N-1)^2.2
 */
export function requiredCumulativeXP(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  if (targetLevel === 2) return 5;
  return Math.floor(10 * Math.pow(targetLevel - 1, 2.2));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (true) {
    const next = requiredCumulativeXP(level + 1);
    if (totalXP >= next) {
      level++;
    } else {
      break;
    }
    if (level >= 999) break; // safety cap
  }
  return level;
}

export interface XPProgress {
  currentLevelXP: number;  // XP within current level
  requiredXP: number;       // XP needed to reach next level
  percentage: number;       // 0-100
  totalXP: number;
  level: number;
}

export function getXPProgress(totalXP: number): XPProgress {
  const level = getLevelFromXP(totalXP);
  const currentThreshold = requiredCumulativeXP(level);
  const nextThreshold = requiredCumulativeXP(level + 1);
  const currentLevelXP = totalXP - currentThreshold;
  const requiredXP = nextThreshold - currentThreshold;
  const percentage = Math.min(100, (currentLevelXP / requiredXP) * 100);
  return { currentLevelXP, requiredXP, percentage, totalXP, level };
}

// ─── Radar Chart Helpers ──────────────────────────────────────────────────────
/**
 * Returns normalized values (0-1) for the radar chart.
 * Uses the highest stat XP as the reference maximum.
 * Minimum display is 0.05 so stats are visible even at 0.
 */
export function getRadarValues(stats: StatItem[]): number[] {
  const maxXP = Math.max(...stats.map(s => s.xp), 1);
  return stats.map(s => Math.max(0.02, s.xp / maxXP));
}

/**
 * Compute polygon points for an N-sided radar chart.
 * cx, cy = center; r = radius; values = 0-1 per axis.
 * Starts from top (−π/2) going clockwise.
 */
export function computePolygonPoints(
  cx: number,
  cy: number,
  r: number,
  values: number[]
): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      const x = cx + r * v * Math.cos(angle);
      const y = cy + r * v * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

/**
 * Compute grid ring polygon (all values equal to gridValue).
 */
export function computeGridPoints(
  cx: number,
  cy: number,
  r: number,
  n: number,
  gridValue: number
): string {
  const vals = Array(n).fill(gridValue);
  return computePolygonPoints(cx, cy, r, vals);
}

// ─── Title / Rank System ──────────────────────────────────────────────────────
export interface HeroTitle {
  minLevel: number;
  title: string;
  subtitle: string;
}

export const HERO_TITLES: HeroTitle[] = [
  { minLevel: 1,  title: '見習い冒険者',   subtitle: 'Apprentice Adventurer' },
  { minLevel: 5,  title: '若き勇者',       subtitle: 'Young Brave' },
  { minLevel: 10, title: '鉄の意志の者',   subtitle: 'Iron Will' },
  { minLevel: 20, title: '銀の探求者',     subtitle: 'Silver Seeker' },
  { minLevel: 30, title: '金の伝説',       subtitle: 'Golden Legend' },
  { minLevel: 50, title: '英雄',           subtitle: 'Hero' },
  { minLevel: 75, title: '神話の騎士',     subtitle: 'Mythic Knight' },
  { minLevel: 99, title: '不滅の勇者',     subtitle: 'Immortal Hero' },
];

export function getHeroTitle(level: number): HeroTitle {
  let title = HERO_TITLES[0];
  for (const t of HERO_TITLES) {
    if (level >= t.minLevel) title = t;
  }
  return title;
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0秒';
  if (minutes < 1) {
    const secs = Math.round(minutes * 60);
    return `${secs}秒`;
  }
  const totalMins = Math.round(minutes);
  if (totalMins < 60) return `${totalMins}分`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

/** Format elapsed seconds as MM:SS display string */
export function formatElapsedTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
