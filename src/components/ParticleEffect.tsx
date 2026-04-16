'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  twinkle: number;
}

// Warm grimoire palette — no purple or bright blue
const COLORS = [
  '#c4a35a', '#a88040', '#8b7a50',
  '#d4a854', '#6b5d3f',
  '#d4cfc0',
];

interface ParticleEffectProps {
  count?: number;
  className?: string;
}

/** Ambient floating particle background — warm ember/dust atmosphere. */
export default function ParticleEffect({ count = 40, className = '' }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: count }, () => spawnParticle(canvas));

    function spawnParticle(c: HTMLCanvasElement, atBottom = false): Particle {
      return {
        x: Math.random() * c.width,
        y: atBottom ? c.height + 5 : Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.2),
        size: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.4 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: Math.random() * 200,
        maxLife: Math.random() * 200 + 100,
        twinkle: Math.random() * Math.PI * 2,
      };
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.map(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.twinkle += 0.04;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.1
          ? (progress / 0.1) * p.opacity
          : progress > 0.8
          ? ((1 - progress) / 0.2) * p.opacity
          : p.opacity;

        const twinkleAlpha = alpha * (0.6 + 0.4 * Math.sin(p.twinkle));

        ctx.save();
        ctx.globalAlpha = Math.max(0, twinkleAlpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife || p.y < -5 || p.x < -5 || p.x > canvas.width + 5) {
          return spawnParticle(canvas, true);
        }
        return p;
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

// ─── Gold Burst Effect (for level-up / quest complete) ────────────────────────
interface BurstParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  color: string; life: number;
}

interface GoldBurstProps {
  active: boolean;
  onComplete?: () => void;
}

export function GoldBurst({ active, onComplete }: GoldBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const burst: BurstParticle[] = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 1,
        opacity: 1,
        color: ['#c4a35a', '#d4a854', '#8b7a50', '#a88040'][Math.floor(Math.random() * 4)],
        life: 0,
      };
    });

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of burst) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.life += 1;
        p.opacity = Math.max(0, 1 - p.life / 60);

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
