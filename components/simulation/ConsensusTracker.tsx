'use client';

import { cn } from '@/lib/design/cn';
import { LinearProgress } from '@/components/ui';
import type { ConsensusState } from '@/lib/hooks/useSimulationStream';

interface ConsensusTrackerProps {
  consensus: ConsensusState;
  compact?: boolean;
  className?: string;
}

export default function ConsensusTracker({ consensus, compact = false, className }: ConsensusTrackerProps) {
  if (consensus.total === 0) return null;

  const pctProceed = (consensus.proceed / consensus.total) * 100;
  const pctDelay = (consensus.delay / consensus.total) * 100;
  const pctAbandon = (consensus.abandon / consensus.total) * 100;

  if (compact) {
    // Single-line compact version
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden flex">
          {pctProceed > 0 && <div className="h-full bg-verdict-proceed transition-all duration-slow" style={{ width: `${pctProceed}%` }} />}
          {pctDelay > 0 && <div className="h-full bg-verdict-delay transition-all duration-slow" style={{ width: `${pctDelay}%` }} />}
          {pctAbandon > 0 && <div className="h-full bg-verdict-abandon transition-all duration-slow" style={{ width: `${pctAbandon}%` }} />}
        </div>
        <span className="text-micro text-txt-disabled tabular-nums shrink-0">{consensus.total} agents</span>
      </div>
    );
  }

  // Full tracker
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-micro font-medium text-txt-secondary">Consensus</span>
        <div className="flex items-center gap-3">
          {consensus.avg_confidence > 0 && (
            <span className="text-micro text-txt-tertiary">
              Avg: {consensus.avg_confidence.toFixed(1)}/10
            </span>
          )}
          <span className="text-micro text-txt-disabled">Round {consensus.round || '?'}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-1.5">
        {consensus.proceed > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-micro text-verdict-proceed w-16 shrink-0">Proceed</span>
            <LinearProgress value={pctProceed} color="bg-verdict-proceed" size="sm" className="flex-1" />
            <span className="text-micro text-txt-disabled tabular-nums w-5 text-right">{consensus.proceed}</span>
          </div>
        )}
        {consensus.delay > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-micro text-verdict-delay w-16 shrink-0">Delay</span>
            <LinearProgress value={pctDelay} color="bg-verdict-delay" size="sm" className="flex-1" />
            <span className="text-micro text-txt-disabled tabular-nums w-5 text-right">{consensus.delay}</span>
          </div>
        )}
        {consensus.abandon > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-micro text-verdict-abandon w-16 shrink-0">Abandon</span>
            <LinearProgress value={pctAbandon} color="bg-verdict-abandon" size="sm" className="flex-1" />
            <span className="text-micro text-txt-disabled tabular-nums w-5 text-right">{consensus.abandon}</span>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="flex items-center gap-3 flex-wrap">
        {consensus.positions_changed > 0 && (
          <span className="text-micro text-txt-tertiary">
            {consensus.positions_changed} position{consensus.positions_changed > 1 ? 's' : ''} changed
          </span>
        )}
        {consensus.key_disagreement && (
          <span className="text-micro text-confidence-contested">
            Dispute: {consensus.key_disagreement}
          </span>
        )}
      </div>
    </div>
  );
}
