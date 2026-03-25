'use client';

import { cn } from '@/lib/design/cn';
import { OctSkeleton } from '@/components/ui';
import type { Suggestion } from '@/lib/hooks/useSuggestions';

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  loading?: boolean;
  onSelect: (text: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const typeIcons: Record<string, string> = {
  what_if: '\u{1F500}',
  deep_dive: '\u{1F50D}',
  compare: '\u2696\uFE0F',
  simulate: '\u{1F419}',
  explore: '\u{1F4A1}',
  challenge: '\u26A1',
};

const typeStyles: Record<string, string> = {
  what_if: 'border-accent/30 hover:border-accent/50 hover:bg-accent-subtle/50',
  deep_dive: 'border-category-career/30 hover:border-category-career/50 hover:bg-category-career/5',
  compare: 'border-category-business/30 hover:border-category-business/50 hover:bg-category-business/5',
  simulate: 'border-accent/30 hover:border-accent/50 hover:bg-accent-subtle/50',
  explore: 'border-border-default hover:border-border-strong hover:bg-surface-1',
  challenge: 'border-confidence-contested/30 hover:border-confidence-contested/50 hover:bg-confidence-contested/5',
};

export default function SuggestionChips({
  suggestions, loading = false, onSelect, onRefresh, className,
}: SuggestionChipsProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 overflow-x-auto scrollbar-hide py-1', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <OctSkeleton key={i} variant="badge" className="h-8 w-48 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto scrollbar-hide py-1', className)}>
      {suggestions.map((suggestion, i) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.text)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
            'text-xs text-txt-secondary transition-all duration-normal ease-out',
            'hover:text-txt-primary active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            typeStyles[suggestion.type] || typeStyles.explore,
            `stagger-${Math.min(i + 1, 10)} animate-fade-in`,
          )}
          style={{ animationFillMode: 'backwards' }}
        >
          <span className="text-xs">{typeIcons[suggestion.type] || '\u{1F4A1}'}</span>
          <span>{suggestion.text}</span>
        </button>
      ))}

      {onRefresh && (
        <button
          onClick={onRefresh}
          className={cn(
            'shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
            'text-icon-secondary hover:text-icon-primary hover:bg-surface-2',
            'transition-colors duration-normal',
            `stagger-${Math.min(suggestions.length + 1, 10)} animate-fade-in`,
          )}
          title="Get new suggestions"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1.5 6a4.5 4.5 0 018.25-2.5M10.5 6a4.5 4.5 0 01-8.25 2.5" />
            <path d="M10 1v2.5H7.5M2 11V8.5h2.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
