'use client';

import React, { type ReactNode } from 'react';

interface DQWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  parchment?: boolean;
}

/**
 * Grimoire-style double-border window with corner ornaments.
 *
 * Structure:
 *   outer border (2px solid bronze)
 *   3px gap
 *   inner border (1px solid bronze-dim)
 *   corner L-bracket ornaments
 *   content
 */
export default function DQWindow({ children, title, className = '', parchment = false }: DQWindowProps) {
  const borderColor = parchment ? '#8b7355' : '#6b5d3f';
  const borderDim   = parchment ? 'rgba(139,115,85,0.5)' : '#3a3428';
  const outerBg     = parchment ? '#f4e4bc' : '#1a1610';

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: outerBg,
        border: `2px solid ${borderColor}`,
        borderRadius: 3,
        padding: 3,
      }}
    >
      <div
        className="relative"
        style={{
          border: `1px solid ${borderDim}`,
          borderRadius: 1,
          background: parchment
            ? 'linear-gradient(160deg, #f8eecf 0%, #f0e0b0 50%, #f4e4bc 100%)'
            : 'linear-gradient(160deg, #1a1610 0%, #1e1a12 100%)',
          padding: 16,
        }}
      >
        {/* Corner ornaments — L-shaped brackets */}
        <Corner pos="top-0 left-0" border="border-t border-l" parchment={parchment} />
        <Corner pos="top-0 right-0" border="border-t border-r" parchment={parchment} />
        <Corner pos="bottom-0 left-0" border="border-b border-l" parchment={parchment} />
        <Corner pos="bottom-0 right-0" border="border-b border-r" parchment={parchment} />

        {title && (
          <div className="text-center mb-3 pb-2" style={{ borderBottom: `1px solid ${parchment ? 'rgba(139,115,85,0.4)' : 'rgba(107,93,63,0.3)'}` }}>
            <p
              className="font-cinzel text-xs font-bold tracking-[0.3em]"
              style={{ color: parchment ? '#5a3a2a' : '#c4a35a' }}
            >
              ◆ {title} ◆
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** Corner ornament bracket */
function Corner({ pos, border, parchment }: { pos: string; border: string; parchment: boolean }) {
  return (
    <span
      className={`absolute ${pos} w-3 h-3 ${border} pointer-events-none`}
      style={{ borderColor: parchment ? '#8b7355' : '#6b5d3f', opacity: 0.7 }}
    />
  );
}

/** Thin decorative divider */
export function DQDivider({ parchment = false }: { parchment?: boolean }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px" style={{ background: parchment ? 'rgba(139,115,85,0.3)' : 'rgba(107,93,63,0.3)' }} />
      <span style={{ color: parchment ? '#8b7355' : '#6a6050', fontSize: 10 }}>◆</span>
      <div className="flex-1 h-px" style={{ background: parchment ? 'rgba(139,115,85,0.3)' : 'rgba(107,93,63,0.3)' }} />
    </div>
  );
}

/** Gold-bordered action button */
export function DQButton({
  children, onClick, disabled = false, variant = 'gold', className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'gold' | 'ghost' | 'danger';
  className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    gold: {
      background: disabled ? 'rgba(58,52,40,0.5)' : 'linear-gradient(135deg, #8b7a50 0%, #c4a35a 50%, #8b7a50 100%)',
      color: disabled ? '#4a4238' : '#0d0b08',
      border: `1px solid ${disabled ? '#3a3428' : '#c4a35a'}`,
      boxShadow: disabled ? 'none' : '0 0 12px rgba(196,163,90,0.3)',
    },
    ghost: {
      background: 'rgba(26,22,16,0.6)',
      color: '#8a7e6b',
      border: '1px solid rgba(107,93,63,0.3)',
    },
    danger: {
      background: 'rgba(139,32,32,0.2)',
      color: '#c45050',
      border: '1px solid rgba(139,32,32,0.4)',
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded font-cinzel font-bold text-sm tracking-widest transition-all active:scale-97 disabled:cursor-not-allowed ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}
