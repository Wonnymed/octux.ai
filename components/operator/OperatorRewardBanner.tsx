'use client';

import { Check, Gift } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import type { ValidationResult } from '@/lib/operator/validation';

export default function OperatorRewardBanner({
  rewardClaimed,
  validation,
  claiming,
  onClaim,
  onRequestHints,
  claimError,
}: {
  rewardClaimed: boolean;
  validation: ValidationResult;
  claiming: boolean;
  onClaim: () => void;
  onRequestHints: () => void;
  claimError: string | null;
}) {
  const pct =
    validation.totalRequired > 0
      ? Math.round((validation.filledRequired / validation.totalRequired) * 100)
      : 0;

  if (rewardClaimed) {
    return (
      <div className="mb-6 rounded-[14px] border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-4 text-[13px] text-white/75">
        <div className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} />
          <div>
            <p className="font-medium text-white/85">Profile complete · Reward claimed</p>
            <p className="mt-1 text-[12px] text-white/50">
              Your token has been added. Simulations are now personalized to your situation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canClaim = validation.complete;
  const missing = validation.missingFields.length;

  return (
    <div
      className={cn(
        'relative mb-6 overflow-hidden rounded-[14px] px-4 py-4',
        canClaim
          ? 'border border-emerald-500/35 bg-emerald-500/[0.07] shadow-[0_0_24px_-4px_rgba(16,185,129,0.25)]'
          : 'border border-[#e8593c]/35 bg-gradient-to-br from-[rgba(232,89,60,0.1)] to-transparent shadow-[0_0_28px_-6px_rgba(232,89,60,0.35)]',
      )}
    >
      <div className="flex items-center gap-2 text-[14px] font-semibold text-white/88">
        <Gift className="h-4 w-4 shrink-0 text-[#e8593c]" strokeWidth={2} />
        {canClaim ? 'Profile complete!' : 'Complete your profile to earn 1 FREE simulation token'}
      </div>
      <p className="mt-1 text-[12px] text-white/45">
        {canClaim
          ? 'All required fields for the reward are filled.'
          : 'Required fields are marked with *. Minimum lengths apply on key text areas.'}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            canClaim ? 'bg-emerald-500/90' : 'bg-[#e8593c]/85',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[12px] text-white/50">
        <span className="font-medium tabular-nums text-white/70">{pct}%</span> required fields complete
        {!canClaim && missing > 0 ? (
          <>
            {' '}
            · Fill {missing} more required field{missing === 1 ? '' : 's'} to claim your reward
          </>
        ) : null}
      </p>

      {claimError ? (
        <p className="mt-2 text-[12px] text-red-400/90" role="alert">
          {claimError}
        </p>
      ) : null}

      {canClaim ? (
        <button
          type="button"
          disabled={claiming}
          onClick={onClaim}
          className="mt-4 w-full rounded-[10px] bg-[#e8593c] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {claiming ? 'Claiming…' : 'Claim your free token →'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onRequestHints}
          className="mt-3 text-[11px] font-medium text-white/40 underline-offset-2 hover:text-white/55 hover:underline"
        >
          Highlight required fields
        </button>
      )}
    </div>
  );
}
