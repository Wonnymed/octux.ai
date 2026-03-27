'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/design/cn';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/shadcn/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';
import { usePrefersCoarsePointer } from '@/lib/hooks/usePrefersCoarsePointer';

interface OctHoverCardProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  width?: number;
  delay?: number;
  className?: string;
}

/** Shared hover surface: HoverCard (fine pointer) or Popover (coarse / touch-primary). */
export default function OctHoverCard({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  width = 320,
  delay = 300,
  className,
}: OctHoverCardProps) {
  const coarse = usePrefersCoarsePointer();

  const widthStyle: CSSProperties = {
    width: `${width}px`,
    maxWidth: `min(${width}px, calc(100vw - 24px))`,
  };

  const contentClassName = cn('w-auto min-w-0 p-4 text-sm text-txt-primary', className);

  if (coarse) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="inline-flex">{trigger}</span>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className={contentClassName}
          style={widthStyle}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard openDelay={delay} closeDelay={150}>
      <HoverCardTrigger asChild>
        <span className="inline-flex">{trigger}</span>
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        sideOffset={8}
        collisionPadding={12}
        className={contentClassName}
        style={widthStyle}
      >
        {children}
      </HoverCardContent>
    </HoverCard>
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
