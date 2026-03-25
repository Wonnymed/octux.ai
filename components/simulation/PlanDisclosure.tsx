'use client';

import { cn } from '@/lib/design/cn';
import type { PhaseStep } from '@/lib/hooks/useSimulationStream';

interface PlanDisclosureProps {
  phases: PhaseStep[];
  elapsed: number;
  className?: string;
}

export default function PlanDisclosure({ phases, elapsed, className }: PlanDisclosureProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {phases.map((phase, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-3 py-2 px-3 rounded-lg transition-all duration-normal',
            phase.status === 'active' && 'bg-accent-subtle/50',
            phase.status === 'complete' && 'opacity-70',
          )}
        >
          {/* Status icon */}
          <div className="shrink-0 mt-0.5">
            {phase.status === 'complete' && (
              <div className="w-5 h-5 rounded-full bg-verdict-proceed/20 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--verdict-proceed)" strokeWidth="1.5">
                  <path d="M2 5l2 2 4-4" />
                </svg>
              </div>
            )}
            {phase.status === 'active' && (
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center animate-pulse-accent">
                <svg className="animate-spin w-3 h-3 text-accent" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {phase.status === 'pending' && (
              <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center">
                <span className="text-micro text-txt-disabled">{i + 1}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-medium',
                phase.status === 'active' && 'text-accent',
                phase.status === 'complete' && 'text-txt-secondary',
                phase.status === 'pending' && 'text-txt-disabled',
              )}>
                {phase.name}
              </span>
              {phase.description && (
                <span className="text-micro text-txt-tertiary">{phase.description}</span>
              )}
            </div>

            {/* Expandable sub-tasks (only for planning phase) */}
            {phase.details && phase.details.length > 0 && phase.status !== 'pending' && (
              <div className="mt-1.5 space-y-1">
                {phase.details.map((task, j) => (
                  <div key={j} className="flex items-center gap-2 text-micro">
                    <span className={cn(
                      'w-1 h-1 rounded-full shrink-0',
                      task.status === 'complete' ? 'bg-verdict-proceed' :
                      task.status === 'active' ? 'bg-accent animate-pulse-accent' :
                      'bg-txt-disabled',
                    )} />
                    <span className="text-txt-tertiary truncate">{task.task}</span>
                    {task.assigned_agent && (
                      <span className="text-txt-disabled shrink-0">&rarr; {task.assigned_agent}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Elapsed timer */}
      {elapsed > 0 && (
        <div className="flex justify-end px-3">
          <span className="text-micro text-txt-disabled tabular-nums">{elapsed}s</span>
        </div>
      )}
    </div>
  );
}
