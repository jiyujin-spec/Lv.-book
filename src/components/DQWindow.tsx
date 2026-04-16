'use client';

import React, { type ReactNode } from 'react';

interface DQWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  parchment?: boolean; /** Use parchment interior instead of dark navy */
}

/**
 * Dragon Quest-style double-border window.
 *
 * Structure:
 *   outer border (2px solid)
 *   3px gap (bg same as border — creates gap illusion)
 *   inner border (1px solid)
 *   content
 */
export default function DQWindow({ children, title, className = '', parchment = false }: DQWindowProps) {
  const borderColor = '#b8cce0';
  const outerBg = parchment ? '#f4e4bc' : '#07121f';

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
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: 1,
          background: parchment
            ? 'linear-gradient(160deg, #f8eecf 0%, #f0e0b0 50%, #f4e4bc 100%)'
            : 'linear-gradient(160deg, #07121f 0%, #0a1a30 100%)',
          padding: 16,
        }}
      >
        {title && (
          <div className="text-center mb-3 pb-2" style={{ borderBottom: `1px solid ${parchment ? 'rgba(139,115,85,0.4)' : 'rgba(184,204,224,0.25)'}` }}>
            <p
              className="font-cinzel text-xs font-bold tracking-[0.3em]"
              style={{ color: parchment ? '#5a3a2a' : '#ffd700' }}
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

/** Thin decorative divider in DQ style */
export function DQDivider({ parchment = false }: { parchment?: boolean }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px" style={{ background: parchment ? 'rgba(139,115,85,0.3)' : 'rgba(184,204,224,0.2)' }} />
      <span style={{ color: parchment ? '#8b7355' : '#4a6080', fontSize: 10 }}>◆</span>
      <div className="flex-1 h-px" style={{ background: parchment ? 'rgba(139,115,85,0.3)' : 'rgba(184,204,224,0.2)' }} />
    </div>
  );
}

/** Gold-bordered action button in DQ style */
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
      background: disabled ? 'rgba(74,96,128,0.3)' : 'linear-gradient(135deg, #c89010 0%, #f0c030 50%, #c89010 100%)',
      color: disabled ? '#2a3a50' : '#07121f',
      border: `1px solid ${disabled ? '#1e3050' : '#f0c030'}`,
      boxShadow: disabled ? 'none' : '0 0 16px rgba(240,192,48,0.35)',
    },
    ghost: {
      background: 'rgba(7,18,31,0.4)',
      color: '#7090b0',
      border: '1px solid rgba(184,204,224,0.3)',
    },
    danger: {
      background: 'rgba(180,40,40,0.2)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.4)',
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
