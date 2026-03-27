'use client';

import { cn } from '@/lib/design/cn';
import { type Citation, type CitationGroup } from '@/lib/citations/types';
import { getCitationById } from '@/lib/citations/parser';
import CitationHoverContent from './CitationHoverContent';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/shadcn/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';
import { usePrefersCoarsePointer } from '@/lib/hooks/usePrefersCoarsePointer';

interface CitationPillProps {
  group: CitationGroup;
  citations: Citation[];
  simulationId?: string;
  conversationId?: string;
  onAgentChat?: (agentId: string, agentName: string) => void;
}

const SURFACE_CLASS =
  'w-auto min-w-[280px] max-w-[min(22rem,360px)] border-0 bg-transparent p-0 shadow-none';

/** Phase 1.3–1.4 — HoverCard (fine pointer) or Popover (coarse / touch-primary). */
export default function CitationPill({
  group, citations, simulationId, conversationId, onAgentChat,
}: CitationPillProps) {
  const coarse = usePrefersCoarsePointer();

  const resolvedCitations = group.ids
    .map(id => getCitationById(citations, id))
    .filter(Boolean) as Citation[];

  if (resolvedCitations.length === 0) return null;

  const pillStyle = group.type === 'contest'
    ? 'bg-confidence-contested/15 text-confidence-contested hover:bg-confidence-contested/25'
    : 'bg-accent-muted text-accent hover:bg-accent-glow';

  const trigger = (
    <span
      className={cn('inline-flex align-super', coarse ? 'cursor-pointer' : 'cursor-help')}
      aria-label={coarse ? 'Citation — tap for details' : 'Citation — hover or focus for details'}
    >
      <span className="inline-flex items-center gap-px">
        {group.type === 'contest' ? (
          <>
            {group.ids.slice(0, Math.ceil(group.ids.length / 2)).map(id => (
              <PillButton key={id} id={id} className={pillStyle} />
            ))}
            <span className="text-micro text-txt-disabled mx-0.5">vs</span>
            {group.ids.slice(Math.ceil(group.ids.length / 2)).map(id => (
              <PillButton key={id} id={id} className={pillStyle} />
            ))}
          </>
        ) : (
          group.ids.map(id => (
            <PillButton key={id} id={id} className={pillStyle} />
          ))
        )}
      </span>
    </span>
  );

  const panel = (
    <CitationHoverContent
      citations={resolvedCitations}
      groupType={group.type}
      simulationId={simulationId}
      conversationId={conversationId}
      onAgentChat={onAgentChat}
    />
  );

  if (coarse) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={12}
          className={SURFACE_CLASS}
        >
          {panel}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard openDelay={150} closeDelay={120}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        sideOffset={10}
        collisionPadding={12}
        className={SURFACE_CLASS}
      >
        {panel}
      </HoverCardContent>
    </HoverCard>
  );
}

function PillButton({ id, className }: { id: number; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-radius-xs text-[10px] font-semibold',
        'cursor-inherit transition-colors duration-normal ease-out',
        className,
      )}
      aria-hidden
    >
      {id}
    </span>
  );
}
