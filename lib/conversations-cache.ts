import type { ConversationSummary } from '@/lib/store/app';

const CACHE_KEY = 'sukgo:conversations-cache';

export function readConversationCache(): ConversationSummary[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as ConversationSummary[];
  } catch {
    return null;
  }
}

export function writeConversationCache(conversations: ConversationSummary[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(conversations));
  } catch {
    /* quota / private mode */
  }
}
