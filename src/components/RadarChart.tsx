'use client';

import React, { useEffect, useRef } from 'react';
import type { StatItem } from '@/types/game';
import { computePolygonPoints, computeGridPoints } from '@/lib/gameLogic';

interface RadarChartProps {
  stats: StatItem[];
  size?: number;
  animate?: boolean;
}

export default function RadarChart({ stats, size = 220, animate = true }: RadarChartProps) {
  const polygonRef = useRef<SVGPolygonElement>(null);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.72;
  const n = stats.length;

  // Compute normalized values (0.02 minimum so zero stats are visible)
  const maxXP = Math.max(...stats.map(s => s.xp), 1);
  const values = stats.map(s => Math.max(0.02, s.xp / maxXP));

  const dataPoints = computePolygonPoints(cx, cy, r, values);

  // Grid rings at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Axis endpoint labels
  const axisPoints = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: cx + (r + 22) * Math.cos(angle),
      y: cy + (r + 22) * Math.sin(angle),
    };
  });

  // Tick marks on axes
  const axisTicks = stats.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x1: cx,
      y1: cy,
      x2: cx + r * Math.cos(angle),
      y2: cy + r * Math.sin(angle),
    };
  });

  // Gradient color: blend between stat colors
  const gradientId = `radar-gradient-${stats.map(s => s.id).join('-')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={animate ? 'animate-chart-grow' : ''}
    >
      <defs>
        {/* Radial gradient for fill */}
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7b2d8b" stopOpacity="0.2" />
        </radialGradient>
        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((level, i) => (
        <polygon
          key={i}
          points={computeGridPoints(cx, cy, r, n, level)}
          fill="none"
          stroke={level === 1.0 ? '#d4a017' : '#4a3870'}
          strokeWidth={level === 1.0 ? 1.5 : 0.8}
          strokeOpacity={level === 1.0 ? 0.7 : 0.4}
          strokeDasharray={level < 1.0 ? '3 3' : undefined}
        />
      ))}

      {/* Center point */}
      <circle cx={cx} cy={cy} r={2} fill="#4a3870" />

      {/* Axis lines */}
      {axisTicks.map((tick, i) => (
        <line
          key={i}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="#4a3870"
          strokeWidth={0.8}
          strokeOpacity={0.5}
        />
      ))}

      {/* Data polygon – shadow */}
      <polygon
        points={dataPoints}
        fill={`url(#${gradientId})`}
        stroke="#9b59b6"
        strokeWidth={3}
        filter="url(#glow-filter)"
        opacity={0.35}
      />

      {/* Data polygon – main */}
      <polygon
        ref={polygonRef}
        points={dataPoints}
        fill={`url(#${gradientId})`}
        stroke="#c084fc"
        strokeWidth={2}
        filter="url(#glow-filter)"
      />

      {/* Vertex dots */}
      {stats.map((stat, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const v = values[i];
        return (
          <circle
            key={stat.id}
            cx={cx + r * v * Math.cos(angle)}
            cy={cy + r * v * Math.sin(angle)}
            r={4}
            fill={stat.color}
            stroke="#1a0f3a"
            strokeWidth={1.5}
            filter="url(#glow-filter)"
          />
        );
      })}

      {/* Axis labels */}
      {stats.map((stat, i) => {
        const pt = axisPoints[i];
        const isLeft = pt.x < cx - 5;
        const isRight = pt.x > cx + 5;
        const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

        return (
          <g key={stat.id}>
            {/* English name */}
            <text
              x={pt.x}
              y={pt.y - 2}
              textAnchor={textAnchor}
              fill="#f0c040"
              fontSize={10}
              fontFamily="Cinzel, serif"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              {stat.englishName}
            </text>
            {/* Japanese description */}
            <text
              x={pt.x}
              y={pt.y + 10}
              textAnchor={textAnchor}
              fill="#d4c49c"
              fontSize={8}
              fontFamily="sans-serif"
            >
              {stat.japaneseDescription}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
