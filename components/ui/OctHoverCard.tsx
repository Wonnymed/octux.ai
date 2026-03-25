'use client';

import { useState, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

interface OctHoverCardProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  width?: number;
  delay?: number;
  className?: string;
}

export default function OctHoverCard({ trigger, children, side = 'bottom', align = 'center', width = 320, delay = 300, className }: OctHoverCardProps) {
  const [visible, setVisible] = useState(false);
  const enterTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = () => { clearTimeout(leaveTimeout.current); enterTimeout.current = setTimeout(() => setVisible(true), delay); };
  const handleLeave = () => { clearTimeout(enterTimeout.current); leaveTimeout.current = setTimeout(() => setVisible(false), 150); };

  const alignClass: Record<string, string> = { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0' };

  return (
    <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {trigger}
      {visible && (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}
          className={cn('absolute z-50 animate-scale-in', side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2', alignClass[align], className)}
          style={{ width: `${width}px` }}>
          <div className="bg-surface-raised border border-border-subtle rounded-xl shadow-lg p-4 text-sm">{children}</div>
        </div>
      )}
    </div>
  );
}

interface CitationHoverProps {
  citation: { id: number; agent_name: string; round: number; confidence: number; claim: string; evidence?: string; };
  children: ReactNode;
}

export function CitationHover({ citation, children }: CitationHoverProps) {
  return (
    <OctHoverCard trigger={children} width={300} delay={200}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-txt-primary">{citation.agent_name}</span>
          <span className={cn('text-micro px-1.5 py-0.5 rounded-sm',
            citation.confidence >= 7 ? 'bg-confidence-high/15 text-confidence-high' :
            citation.confidence >= 4 ? 'bg-confidence-medium/15 text-confidence-medium' :
            'bg-confidence-low/15 text-confidence-low',
          )}>{citation.confidence}/10</span>
        </div>
        <p className="text-txt-secondary text-xs leading-relaxed">{citation.claim}</p>
        {citation.evidence && <p className="text-micro text-txt-tertiary border-l-2 border-accent/30 pl-2">{citation.evidence}</p>}
        <p className="text-micro text-txt-disabled">Round {citation.round}</p>
      </div>
    </OctHoverCard>
  );
}
