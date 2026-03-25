'use client';

import { useMemo } from 'react';
import { type Citation } from '@/lib/citations/types';
import { parseTextWithCitations } from '@/lib/citations/parser';
import CitationPill from './CitationPill';

interface CitatedTextProps {
  text: string;
  citations?: Citation[];
  simulationId?: string;
  conversationId?: string;
  onAgentChat?: (agentId: string, agentName: string) => void;
  className?: string;
  // Text rendering customization
  as?: 'p' | 'span' | 'div';
}

/**
 * CitatedText — Renders text with inline [1][2][3] citation pills.
 *
 * Usage:
 *   <CitatedText
 *     text="Market conditions favor launch [1][3], but permits [2] add risk [4]."
 *     citations={verdict.citations}
 *     onAgentChat={(agentId, name) => openChatPanel(agentId, name)}
 *   />
 *
 * Renders text with purple pills at each [N] reference.
 * Hover → shows agent info + confidence + evidence.
 * Click (mobile: tap) → same.
 * "Chat with agent →" in hover card opens agent chat.
 */
export default function CitatedText({
  text, citations, simulationId, conversationId, onAgentChat, className, as: Tag = 'span',
}: CitatedTextProps) {
  const segments = useMemo(
    () => parseTextWithCitations(text, citations),
    [text, citations]
  );

  // No citations or no text → plain text
  if (!citations || citations.length === 0 || segments.length === 0) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {segments.map((segment, i) => {
        if (segment.type === 'text') {
          return <span key={i}>{segment.content}</span>;
        }

        if (segment.type === 'citation_group' && segment.group) {
          return (
            <CitationPill
              key={i}
              group={segment.group}
              citations={citations}
              simulationId={simulationId}
              conversationId={conversationId}
              onAgentChat={onAgentChat}
            />
          );
        }

        return null;
      })}
    </Tag>
  );
}
