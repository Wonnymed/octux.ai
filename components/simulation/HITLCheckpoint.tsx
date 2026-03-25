'use client';

import { useState } from 'react';
import { cn } from '@/lib/design/cn';
import { OctButton, OctCard, OctInput } from '@/components/ui';
import type { HITLState } from '@/lib/hooks/useSimulationStream';

interface HITLCheckpointProps {
  hitl: HITLState;
  onRespond: (response: { approved: boolean; corrections?: Record<string, string> }) => void;
  className?: string;
}

export default function HITLCheckpoint({ hitl, onRespond, className }: HITLCheckpointProps) {
  const [editing, setEditing] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, string>>({});

  if (!hitl.active) return null;

  const handleApprove = () => {
    onRespond({ approved: true });
  };

  const handleCorrect = () => {
    if (!editing) {
      setEditing(true);
      // Pre-fill corrections with current values
      const initial: Record<string, string> = {};
      hitl.assumptions.forEach(a => { initial[a.key] = a.value; });
      setCorrections(initial);
      return;
    }
    // Submit corrections
    const changed: Record<string, string> = {};
    hitl.assumptions.forEach(a => {
      if (corrections[a.key] && corrections[a.key] !== a.value) {
        changed[a.key] = corrections[a.key];
      }
    });
    onRespond({ approved: false, corrections: changed });
  };

  return (
    <div className={cn('animate-scale-in', className)}>
      <OctCard variant="elevated" padding="md" className="border-verdict-delay/30">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-verdict-delay/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--verdict-delay)" strokeWidth="1.5">
              <rect x="2" y="2" width="3" height="8" rx="0.5" />
              <rect x="7" y="2" width="3" height="8" rx="0.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-txt-primary">Checkpoint — Round {hitl.round}</p>
            <p className="text-micro text-txt-tertiary">The agents are assuming the following. Is this correct?</p>
          </div>
        </div>

        {/* Assumptions */}
        <div className="space-y-2 mb-4">
          {hitl.assumptions.map((assumption, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-txt-tertiary w-28 shrink-0">{assumption.key}:</span>
              {editing ? (
                <OctInput
                  inputSize="sm"
                  value={corrections[assumption.key] || assumption.value}
                  onChange={e => setCorrections(prev => ({ ...prev, [assumption.key]: e.target.value }))}
                  className="flex-1"
                />
              ) : (
                <span className="text-xs text-txt-primary font-medium">{assumption.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <OctButton variant="primary" size="sm" onClick={handleApprove}>
            Everything correct
          </OctButton>
          <OctButton variant="secondary" size="sm" onClick={handleCorrect}>
            {editing ? 'Submit corrections' : 'I need to adjust...'}
          </OctButton>
        </div>
      </OctCard>
    </div>
  );
}
