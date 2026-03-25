'use client';

import { cn } from '@/lib/design/cn';
import { OctCard } from '@/components/ui';
import { useSimulationStream } from '@/lib/hooks/useSimulationStream';
import PlanDisclosure from '@/components/simulation/PlanDisclosure';
import AgentStreamCard from '@/components/simulation/AgentStreamCard';
import AdversarialBanner from '@/components/simulation/AdversarialBanner';
import HITLCheckpoint from '@/components/simulation/HITLCheckpoint';
import ConsensusTracker from '@/components/simulation/ConsensusTracker';
import VerdictEmergence from '@/components/simulation/VerdictEmergence';

interface SimulationBlockProps {
  question: string;
  streamUrl: string;
  onComplete: (result: any) => void;
  onStateChange?: (state: string) => void;
}

export default function SimulationBlock({ question, streamUrl, onComplete, onStateChange }: SimulationBlockProps) {
  const { state, respondToHITL } = useSimulationStream(streamUrl, question);

  // Notify parent of state changes
  const entityState = state.phase === 'idle' ? 'idle' :
    state.phase === 'complete' ? 'resting' :
    state.phase === 'verdict' ? 'diving' : 'chatting';

  // Call onComplete when verdict is done
  if (state.verdict.complete && state.phase === 'complete') {
    onComplete(state.verdict);
  }

  // Notify parent of entity state
  if (onStateChange) {
    onStateChange(entityState);
  }

  const agents = state.agentOrder.map(id => state.agents.get(id)!).filter(Boolean);
  const isActive = state.phase !== 'idle' && state.phase !== 'complete' && state.phase !== 'error';

  return (
    <div className="mb-4 animate-slide-in-up">
      <OctCard variant="outline" padding="none" className={cn(
        'overflow-hidden transition-all duration-slow',
        isActive && 'border-accent/20 shadow-accent',
        state.phase === 'complete' && 'border-border-subtle',
        state.phase === 'error' && 'border-verdict-abandon/20',
      )}>
        {/* Header */}
        <div className="px-4 py-3 bg-accent-subtle/30 border-b border-border-subtle flex items-center gap-3">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            isActive ? 'bg-accent/20 animate-pulse-accent' : state.phase === 'complete' ? 'bg-verdict-proceed/20' : 'bg-surface-2',
          )}>
            {state.phase === 'complete' ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--verdict-proceed)" strokeWidth="2"><path d="M2.5 6l2.5 2.5 4.5-4.5" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-accent">
                <path d="M6 0L1 3v4l5 3 5-3V3L6 0z" opacity="0.5" />
                <path d="M6 2L3 4v3l3 2 3-2V4L6 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-txt-primary">
              {state.phase === 'complete' ? 'Simulation Complete' : 'Deep Simulation'}
            </p>
            <p className="text-micro text-txt-tertiary truncate">{question}</p>
          </div>
          {state.elapsed > 0 && (
            <span className="text-micro text-txt-disabled tabular-nums shrink-0">{state.elapsed}s</span>
          )}
        </div>

        {/* Plan disclosure */}
        <div className="px-3 py-2 border-b border-border-subtle">
          <PlanDisclosure phases={state.phases} elapsed={state.elapsed} />
        </div>

        {/* Agent cards */}
        {agents.length > 0 && (
          <div className="px-3 py-3 space-y-2 border-b border-border-subtle">
            {agents.map((agent, i) => (
              <AgentStreamCard key={agent.agent_id} agent={agent} index={i} />
            ))}
          </div>
        )}

        {/* Adversarial tension */}
        {state.challenges.length > 0 && (
          <div className="px-3 py-2 border-b border-border-subtle">
            <AdversarialBanner challenges={state.challenges} />
          </div>
        )}

        {/* HITL Checkpoint */}
        {state.hitl.active && (
          <div className="px-3 py-3 border-b border-border-subtle">
            <HITLCheckpoint hitl={state.hitl} onRespond={respondToHITL} />
          </div>
        )}

        {/* Consensus tracker */}
        {state.consensus.total > 0 && (
          <div className="px-3 py-3 border-b border-border-subtle">
            <ConsensusTracker consensus={state.consensus} />
          </div>
        )}

        {/* Verdict emergence */}
        {(state.verdict.streaming || state.verdict.complete) && (
          <div className="px-3 py-3">
            <VerdictEmergence verdict={state.verdict} />
          </div>
        )}

        {/* Error state */}
        {state.error && (
          <div className="px-4 py-3 bg-verdict-abandon/5 border-t border-verdict-abandon/20">
            <p className="text-xs text-verdict-abandon">{state.error}</p>
          </div>
        )}
      </OctCard>
    </div>
  );
}
