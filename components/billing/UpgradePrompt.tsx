'use client';

import { cn } from '@/lib/design/cn';
import { OctButton, OctCard } from '@/components/sukgo';
import { TIERS, type TierType } from '@/lib/billing/tiers';

interface UpgradePromptProps {
  reason: string;
  tokensUsed?: number;
  tokensTotal?: number;
  suggestedTier?: TierType;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function UpgradePrompt({
  reason, tokensUsed, tokensTotal, suggestedTier = 'pro',
  onUpgrade, onDismiss, className,
}: UpgradePromptProps) {
  const tier = TIERS[suggestedTier];

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: suggestedTier }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { /* noop */ }
    onUpgrade?.();
  };

  return (
    <OctCard variant="accent" padding="md" className={cn('border-accent/20', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(232,180,160,0.15)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#E8B4A0]">
            <path d="M8 2l6 12H2L8 2zM8 6v4M8 12v0.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-sm font-medium text-txt-primary">{reason}</p>
          {tokensUsed !== undefined && tokensTotal !== undefined && (
            <p className="mb-3 text-xs text-txt-tertiary">
              Tokens: {tokensUsed}/{tokensTotal} used this month
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <OctButton variant="default" size="sm" onClick={handleUpgrade}>
              Upgrade to {tier.name} — {tier.limits.tokensPerMonth} tokens/mo
            </OctButton>
            {onDismiss && (
              <OctButton variant="ghost" size="xs" onClick={onDismiss}>
                Maybe later
              </OctButton>
            )}
          </div>
        </div>
      </div>
    </OctCard>
  );
}
