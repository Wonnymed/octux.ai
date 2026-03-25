/**
 * Citation Parser — extracts [1][2][3] patterns from text.
 *
 * Handles:
 *   [1]           → single citation
 *   [1][3]        → agreement (adjacent, same claim)
 *   [1][3][5]     → multi-agreement
 *   [1] vs [2]    → contest (explicit disagreement)
 *   Mixed text with citations inline
 *
 * Returns an array of ParsedTextSegment for rendering.
 */

import { type ParsedTextSegment, type CitationGroup, type Citation, areCitationsContesting } from './types';

/**
 * Parse text into segments of plain text and citation groups.
 */
export function parseTextWithCitations(text: string, citations?: Citation[]): ParsedTextSegment[] {
  if (!text) return [];
  if (!citations || citations.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: ParsedTextSegment[] = [];
  let lastIndex = 0;

  // More precise regex that handles all patterns
  const regex = /(\[\d+\](?:\s*\[\d+\])*(?:\s+vs\s+\[\d+\](?:\s*\[\d+\])*)?)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before this citation
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    // Parse the citation group
    const fullMatch = match[1];
    const group = parseCitationGroup(fullMatch, citations);
    if (group) {
      segments.push({ type: 'citation_group', group });
    } else {
      // Couldn't parse — treat as text
      segments.push({ type: 'text', content: fullMatch });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Parse a single citation group string like "[1][3]" or "[1] vs [2]"
 */
function parseCitationGroup(groupStr: string, citations: Citation[]): CitationGroup | null {
  // Check for "vs" pattern: [1] vs [2]
  const vsParts = groupStr.split(/\s+vs\s+/);

  if (vsParts.length === 2) {
    const leftIds = extractIds(vsParts[0]);
    const rightIds = extractIds(vsParts[1]);
    if (leftIds.length > 0 && rightIds.length > 0) {
      // Verify these citations actually exist
      const allIds = [...leftIds, ...rightIds];
      const valid = allIds.every(id => citations.some(c => c.id === id));
      if (!valid) return null;
      return { ids: allIds, type: 'contest' };
    }
  }

  // Regular group: [1][3] or [1]
  const ids = extractIds(groupStr);
  if (ids.length === 0) return null;

  // Verify all cited IDs exist
  const valid = ids.every(id => citations.some(c => c.id === id));
  if (!valid) return null;

  // Determine if agreement or single
  if (ids.length === 1) {
    return { ids, type: 'single' };
  }

  // Multiple IDs — check if they're contesting
  const citationObjects = ids.map(id => citations.find(c => c.id === id)!).filter(Boolean);
  const hasContest = citationObjects.length >= 2 &&
    citationObjects.some((a, i) =>
      citationObjects.slice(i + 1).some(b => areCitationsContesting(a, b))
    );

  return { ids, type: hasContest ? 'contest' : 'agreement' };
}

/**
 * Extract numeric IDs from a string like "[1][3][5]"
 */
function extractIds(str: string): number[] {
  const ids: number[] = [];
  const regex = /\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(str)) !== null) {
    ids.push(parseInt(m[1]));
  }
  return ids;
}

/**
 * Get citation by ID from array
 */
export function getCitationById(citations: Citation[], id: number): Citation | undefined {
  return citations.find(c => c.id === id);
}

/**
 * Get all unique agents referenced in citations
 */
export function getUniqueCitedAgents(citations: Citation[]): { agent_id: string; agent_name: string; count: number }[] {
  const map = new Map<string, { agent_id: string; agent_name: string; count: number }>();
  for (const c of citations) {
    const existing = map.get(c.agent_id);
    if (existing) {
      existing.count++;
    } else {
      map.set(c.agent_id, { agent_id: c.agent_id, agent_name: c.agent_name, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
