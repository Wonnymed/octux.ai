'use client';

import { useState, useCallback, useRef } from 'react';
import type { SuggestionContext } from '@/lib/suggestions/generate';

export interface Suggestion {
  id: string;
  text: string;
  type: 'what_if' | 'deep_dive' | 'compare' | 'simulate' | 'explore' | 'challenge';
  priority: number;
}

interface UseSuggestionsOptions {
  conversationId: string;
  enabled?: boolean;
}

export function useSuggestions({ conversationId, enabled = true }: UseSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Suggestion[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (
    context: SuggestionContext,
    payload?: Record<string, any>,
  ) => {
    if (!enabled || !conversationId) return;

    // Check cache
    const cacheKey = `${context}_${JSON.stringify(payload || {}).substring(0, 100)}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/c/${conversationId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, ...payload }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');

      const data = await res.json();
      const results = data.suggestions || [];

      setSuggestions(results);
      cacheRef.current.set(cacheKey, results);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId, enabled]);

  const refresh = useCallback(async (
    context: SuggestionContext,
    payload?: Record<string, any>,
  ) => {
    const cacheKey = `${context}_${JSON.stringify(payload || {}).substring(0, 100)}`;
    cacheRef.current.delete(cacheKey);
    await fetchSuggestions(context, payload);
  }, [fetchSuggestions]);

  const clear = useCallback(() => {
    setSuggestions([]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  return { suggestions, loading, error, fetchSuggestions, refresh, clear, dismiss };
}
