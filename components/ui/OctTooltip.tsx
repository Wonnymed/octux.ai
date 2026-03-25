'use client';

import { useState, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface OctTooltipProps {
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const placementStyles: Record<Placement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function OctTooltip({ content, placement = 'top', delay = 200, children, className, disabled = false }: OctTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => { if (disabled) return; timeoutRef.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { clearTimeout(timeoutRef.current); setVisible(false); };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && content && (
        <div role="tooltip" className={cn(
          'absolute z-50 pointer-events-none animate-fade-in',
          'bg-surface-raised text-txt-primary text-xs px-2.5 py-1.5 rounded-md shadow-lg',
          'border border-border-subtle max-w-[240px] whitespace-normal',
          placementStyles[placement], className,
        )}>
          {content}
        </div>
      )}
    </div>
  );
}
