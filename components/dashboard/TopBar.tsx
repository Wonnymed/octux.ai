'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { DARK_THEME } from '@/lib/dashboard/theme';
import type { DashboardTier } from '@/lib/store/dashboard-ui';
import type { TierType } from '@/lib/billing/tiers';

export default function TopBar({
  activeTier,
  onTierChange,
  billingTier,
}: {
  activeTier: DashboardTier;
  onTierChange: (tier: DashboardTier) => void;
  billingTier: TierType;
}) {
  const freeUser = billingTier === 'free';
  const specialistLocked = freeUser;

  const costLabel =
    activeTier === 'specialist'
      ? 'Sonnet + Haiku · ~$0.35'
      : '1000 Haiku · ~$0.08';

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5"
      style={{ borderColor: DARK_THEME.border_default }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onTierChange('swarm')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
          )}
          style={{
            backgroundColor: activeTier === 'swarm' ? DARK_THEME.info + '22' : DARK_THEME.bg_surface,
            color: activeTier === 'swarm' ? DARK_THEME.info : DARK_THEME.text_secondary,
            border: `1px solid ${activeTier === 'swarm' ? DARK_THEME.info + '55' : DARK_THEME.border_default}`,
          }}
        >
          Swarm · 1000 agents
        </button>
        <button
          type="button"
          disabled={specialistLocked}
          onClick={() => {
            if (!specialistLocked) onTierChange('specialist');
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
            specialistLocked && 'cursor-not-allowed opacity-70',
          )}
          style={{
            backgroundColor:
              activeTier === 'specialist' ? DARK_THEME.accent_soft : DARK_THEME.bg_surface,
            color: activeTier === 'specialist' ? DARK_THEME.accent : DARK_THEME.text_secondary,
            border: `1px solid ${
              activeTier === 'specialist' ? DARK_THEME.accent_border : DARK_THEME.border_default
            }`,
          }}
        >
          {specialistLocked && <Lock className="h-3.5 w-3.5" />}
          Specialist · 10 + crowd
          {specialistLocked && (
            <span
              className="ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
              style={{ backgroundColor: DARK_THEME.accent + '33', color: DARK_THEME.accent }}
            >
              Pro
            </span>
          )}
        </button>
      </div>
      <p className="hidden text-[11px] font-medium sm:block" style={{ color: DARK_THEME.text_tertiary }}>
        {costLabel}
      </p>
    </div>
  );
}
