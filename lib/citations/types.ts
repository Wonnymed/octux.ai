/**
 * Citation System Types — Perplexity-style inline agent references.
 *
 * Every claim in a verdict traces to specific agents.
 * Citations provide: who said it, how confident they were,
 * what evidence they used, and which round it came from.
 *
 * Ref: Perplexity #14 (inline citations, trust through transparency)
 */

export interface Citation {
  id: number;                    // Display number: [1], [2], [3]
  agent_id: string;              // e.g., "base_rate_archivist"
  agent_name: string;            // e.g., "Base Rate Archivist"
  agent_category?: string;       // e.g., "business"
  round: number;                 // Which debate round (1-10)
  confidence: number;            // Agent confidence (1-10)
  claim: string;                 // The specific claim being cited
  supporting_data?: string | null; // Evidence or data source
  position?: string;             // Agent's position when citing (proceed/delay/abandon)
}

export interface CitationGroup {
  ids: number[];                 // [1, 3] = two citations together
  type: 'agreement' | 'contest' | 'single';
  // agreement: [1][3] — multiple agents agree
  // contest: [1] vs [2] — agents disagree
  // single: [1] — one citation
}

export interface ParsedTextSegment {
  type: 'text' | 'citation_group';
  content?: string;              // for text segments
  group?: CitationGroup;         // for citation segments
}

export interface CitationContext {
  citations: Citation[];
  simulationId?: string;
  conversationId?: string;
}

// Confidence levels for visual mapping
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'contested';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 7) return 'high';
  if (confidence >= 4) return 'medium';
  return 'low';
}

// Check if two citations represent a contest (opposing positions)
export function areCitationsContesting(a: Citation, b: Citation): boolean {
  if (!a.position || !b.position) return false;
  const posA = a.position.toLowerCase();
  const posB = b.position.toLowerCase();
  return (
    (posA === 'proceed' && (posB === 'delay' || posB === 'abandon')) ||
    (posA === 'delay' && posB === 'proceed') ||
    (posA === 'abandon' && posB === 'proceed')
  );
}
