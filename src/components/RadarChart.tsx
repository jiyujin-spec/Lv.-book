'use client';

import React from 'react';
import type { StatItem } from '@/types/game';
import { computePolygonPoints, computeGridPoints, getRadarValues } from '@/lib/gameLogic';

interface RadarChartProps {
  stats: StatItem[];
  level?: number;
  vbSize?: number;
  animate?: boolean;
}

export default function RadarChart({ stats, level = 1, vbSize = 260, animate = true }: RadarChartProps) {
  const cx = vbSize / 2;
  const cy = vbSize / 2;
  const r  = (vbSize / 2) * 0.60;
  const n  = stats.length;

  // Dynamic scale based on level
  const values = getRadarValues(stats, level);

  const dataPoints = computePolygonPoints(cx, cy, r, values);
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const labelPts = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: cx + (r + 28) * Math.cos(angle),
      y: cy + (r + 28) * Math.sin(angle),
    };
  });

  const axes = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x2: cx + r * Math.cos(angle), y2: cy + r * Math.sin(angle) };
  });

  const gradId = 'rg';

  return (
    <svg
      viewBox={`0 0 ${vbSize} ${vbSize}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      className={animate ? 'animate-fade-in-up' : ''}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c4a35a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6b5d3f" stopOpacity="0.10" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((v, i) => (
        <polygon
          key={i}
          points={computeGridPoints(cx, cy, r, n, v)}
          fill="none"
          stroke={v === 1.0 ? '#6b5d3f' : '#3a3428'}
          strokeWidth={v === 1.0 ? 1.2 : 0.7}
          strokeOpacity={v === 1.0 ? 0.6 : 0.4}
          strokeDasharray={v < 1.0 ? '4 3' : undefined}
        />
      ))}

      {/* Axis lines */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.x2} y2={a.y2}
          stroke="#3a3428" strokeWidth={0.7} strokeOpacity={0.5} />
      ))}
      <circle cx={cx} cy={cy} r={2.5} fill="#3a3428" />

      {/* Fill shadow */}
      <polygon points={dataPoints} fill={`url(#${gradId})`}
        stroke="#c4a35a" strokeWidth={3} opacity={0.25} filter="url(#glow)" />

      {/* Fill main */}
      <polygon points={dataPoints} fill={`url(#${gradId})`}
        stroke="#c4a35a" strokeWidth={1.5} filter="url(#glow)" />

      {/* Vertex dots */}
      {stats.map((stat, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const v = values[i];
        return (
          <circle key={stat.id}
            cx={cx + r * v * Math.cos(angle)}
            cy={cy + r * v * Math.sin(angle)}
            r={4}
            fill={stat.color}
            stroke="#1a1610"
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
              fill="#c4a35a" fontSize={11}
              fontFamily="Cinzel, serif" fontWeight="700" letterSpacing="0.04em">
              {stat.englishName}
            </text>
            <text x={pt.x} y={pt.y + 11} textAnchor={anchor}
              fill="#6a6050" fontSize={8.5} fontFamily="sans-serif">
              {stat.japaneseDescription}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
