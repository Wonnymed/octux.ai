'use client';

import { cn } from '@/lib/design/cn';
import MarkdownRenderer from './MarkdownRenderer';
import DisclaimerBanner from './DisclaimerBanner';

interface AssistantMessageProps {
  content: string;
  tier?: string;
  disclaimer?: string;
  isCode?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  ink: 'Ink',
  deep: 'Deep',
  kraken: 'Kraken',
};

export default function AssistantMessage({ content, tier, disclaimer, isCode }: AssistantMessageProps) {
  return (
    <div className="mb-4 flex w-full flex-col items-start">
      <div className="flex items-start gap-3 max-w-[min(85%,42rem)] w-full">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/15 shadow-sm shadow-black/20 mt-0.5"
          aria-hidden
        >
          <span className="text-[10px] leading-none">🐙</span>
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 rounded-2xl rounded-bl-sm border border-border-subtle px-4 py-3',
            'bg-surface-raised text-[14px] leading-relaxed text-txt-primary shadow-sm shadow-black/20 dark:bg-surface-1',
          )}
        >
          {isCode ? (
            <pre className="text-xs text-txt-secondary font-mono whitespace-pre-wrap overflow-x-auto">
              {content}
            </pre>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>

      {tier && TIER_LABELS[tier] && (
        <span className="text-micro mt-1 ml-10 text-txt-tertiary">
          {TIER_LABELS[tier]}
        </span>
      )}

      {disclaimer && <DisclaimerBanner text={disclaimer} className="mt-2 ml-10" />}
    </div>
  );
}
