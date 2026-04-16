'use client';

import React from 'react';
import type { StatItem } from '@/types/game';
import { computePolygonPoints, computeGridPoints } from '@/lib/gameLogic';

interface RadarChartProps {
  stats: StatItem[];
  /**
   * The SVG viewBox size (virtual pixels).
   * The element will render with width=100% / height=auto, so it always
   * fills the parent container while maintaining aspect ratio.
   */
  vbSize?: number;
  animate?: boolean;
}

export default function RadarChart({ stats, vbSize = 260, animate = true }: RadarChartProps) {
  const cx = vbSize / 2;
  const cy = vbSize / 2;
  const r  = (vbSize / 2) * 0.68;
  const n  = stats.length;

  // Normalise: highest stat = 1.0, zero stats = 0.03 (visible)
  const maxXP = Math.max(...stats.map(s => s.xp), 1);
  const values = stats.map(s => Math.max(0.03, s.xp / maxXP));

  const dataPoints = computePolygonPoints(cx, cy, r, values);
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Label positions (outside the radar)
  const labelPts = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: cx + (r + 28) * Math.cos(angle),
      y: cy + (r + 28) * Math.sin(angle),
    };
  });

  // Axis lines
  const axes = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x2: cx + r * Math.cos(angle), y2: cy + r * Math.sin(angle) };
  });

  const gradId = 'rg';

  return (
    <svg
      viewBox={`0 0 ${vbSize} ${vbSize}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      className={animate ? 'animate-fade-in-up' : ''}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#60a0ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1850c0" stopOpacity="0.15" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((v, i) => (
        <polygon
          key={i}
          points={computeGridPoints(cx, cy, r, n, v)}
          fill="none"
          stroke={v === 1.0 ? '#b8cce0' : '#1e3050'}
          strokeWidth={v === 1.0 ? 1.2 : 0.7}
          strokeOpacity={v === 1.0 ? 0.6 : 0.5}
          strokeDasharray={v < 1.0 ? '4 3' : undefined}
        />
      ))}

      {/* Axis lines */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.x2} y2={a.y2}
          stroke="#1e3050" strokeWidth={0.7} strokeOpacity={0.6} />
      ))}
      <circle cx={cx} cy={cy} r={2.5} fill="#1e3050" />

      {/* Fill shadow */}
      <polygon points={dataPoints} fill={`url(#${gradId})`}
        stroke="#4080e0" strokeWidth={3} opacity={0.3} filter="url(#glow)" />

      {/* Fill main */}
      <polygon points={dataPoints} fill={`url(#${gradId})`}
        stroke="#4080e0" strokeWidth={1.8} filter="url(#glow)" />

      {/* Vertex dots */}
      {stats.map((stat, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const v = values[i];
        return (
          <circle key={stat.id}
            cx={cx + r * v * Math.cos(angle)}
            cy={cy + r * v * Math.sin(angle)}
            r={4.5}
            fill={stat.color}
            stroke="#07121f"
            strokeWidth={1.5}
            filter="url(#glow)"
          />
        );
      })}

      {/* Labels */}
      {stats.map((stat, i) => {
        const pt = labelPts[i];
        const isLeft  = pt.x < cx - 8;
        const isRight = pt.x > cx + 8;
        const anchor  = isLeft ? 'end' : isRight ? 'start' : 'middle';
        return (
          <g key={stat.id}>
            <text x={pt.x} y={pt.y - 2} textAnchor={anchor}
              fill="#f0c030" fontSize={11}
              fontFamily="Cinzel, serif" fontWeight="700" letterSpacing="0.04em">
              {stat.englishName}
            </text>
            <text x={pt.x} y={pt.y + 11} textAnchor={anchor}
              fill="#7090b0" fontSize={8.5} fontFamily="sans-serif">
              {stat.japaneseDescription}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
