'use client';

import { cn } from '@/lib/design/cn';
import { OctBadge } from '@/components/octux';
import { OctAvatar } from '@/components/ui';
import { type Citation, type CitationGroup, getConfidenceLevel } from '@/lib/citations/types';

interface CitationHoverContentProps {
  citations: Citation[];
  groupType: CitationGroup['type'];
  simulationId?: string;
  conversationId?: string;
  onAgentChat?: (agentId: string, agentName: string) => void;
  onClose?: () => void;
}

export default function CitationHoverContent({
  citations, groupType, onAgentChat, onClose,
}: CitationHoverContentProps) {
  if (citations.length === 0) return null;

  const isContest = groupType === 'contest';

  return (
    <div className={cn(
      'bg-surface-raised border border-border-subtle rounded-xl shadow-xl',
      'min-w-[280px] max-w-[360px]',
      'text-sm overflow-hidden',
    )}>
      {/* Contest header */}
      {isContest && (
        <div className="px-4 py-2 bg-confidence-contested/5 border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--confidence-contested)" strokeWidth="1.5" className="shrink-0">
              <path d="M6 1l5 10H1L6 1zM6 4.5v2.5M6 9v0.5" />
            </svg>
            <span className="text-micro font-medium text-confidence-contested">Contested — agents disagree</span>
          </div>
        </div>
      )}

      {/* Agreement header */}
      {!isContest && citations.length > 1 && (
        <div className="px-4 py-2 bg-accent-subtle/50 border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="shrink-0">
              <path d="M2.5 6l2.5 2.5 4.5-4.5" />
            </svg>
            <span className="text-micro font-medium text-accent">{citations.length} agents agree</span>
          </div>
        </div>
      )}

      {/* Citation entries */}
      <div className={cn(citations.length > 1 && 'divide-y divide-border-subtle')}>
        {citations.map((citation) => (
          <div key={citation.id} className="px-4 py-3">
            {/* Agent header */}
            <div className="flex items-center gap-2 mb-2">
              <OctAvatar
                type="agent"
                category={(citation.agent_category as any) || 'business'}
                agentIndex={citation.id - 1}
                name={citation.agent_name}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-txt-primary">{citation.agent_name}</span>
              </div>
              <OctBadge
                confidence={getConfidenceLevel(citation.confidence)}
                size="xs"
              >
                {citation.confidence}/10
              </OctBadge>
            </div>

            {/* Claim */}
            <p className="text-xs text-txt-secondary leading-relaxed mb-1.5">
              {citation.claim}
            </p>

            {/* Evidence */}
            {citation.supporting_data && (
              <p className="text-micro text-txt-tertiary border-l-2 border-accent/20 pl-2 mb-1.5">
                {citation.supporting_data}
              </p>
            )}

            {/* Meta + action */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-micro text-txt-disabled">Round {citation.round}</span>
                {citation.position && (
                  <OctBadge
                    verdict={citation.position.toLowerCase() as any}
                    size="xs"
                  >
                    {citation.position}
                  </OctBadge>
                )}
              </div>

              {/* Chat with agent CTA */}
              {onAgentChat && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAgentChat(citation.agent_id, citation.agent_name);
                    onClose?.();
                  }}
                  className="text-micro text-accent hover:text-accent-hover transition-colors duration-normal"
                >
                  Chat with agent →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
