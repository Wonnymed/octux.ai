'use client';

import { cn } from '@/lib/design/cn';
import { OctBadge, OctButton } from '@/components/sukgo';
import { OctAvatar, OctCollapsible } from '@/components/ui';

export interface SelectedAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  reason?: string;
}

interface AgentAutoSelectProps {
  agents: SelectedAgent[];
  question: string;
  onEdit: () => void;
  onRemove: (agentId: string) => void;
  className?: string;
}

export default function AgentAutoSelect({ agents, question, onEdit, onRemove, className }: AgentAutoSelectProps) {
  if (agents.length === 0) return null;

  return (
    <div className={cn('rounded-lg border border-border-subtle bg-surface-1 overflow-hidden', className)}>
      <OctCollapsible
        trigger={
          <div className="flex items-center justify-between w-full py-0.5">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {agents.slice(0, 4).map((a, i) => (
                  <OctAvatar
                    key={a.id}
                    type="agent"
                    category={a.category as any}
                    agentIndex={i}
                    name={a.name}
                    size="xs"
                    className="ring-1 ring-surface-1"
                  />
                ))}
                {agents.length > 4 && (
                  <span className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-[9px] text-txt-disabled ring-1 ring-surface-1">
                    +{agents.length - 4}
                  </span>
                )}
              </div>
              <span className="text-xs text-txt-secondary">
                {agents.length} specialists selected
              </span>
            </div>
            <OctButton variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              Edit panel
            </OctButton>
          </div>
        }
        className="px-3 py-2"
      >
        <div className="space-y-1.5 mt-2">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface-2/50 transition-colors duration-normal group"
            >
              <OctAvatar
                type="agent"
                category={agent.category as any}
                agentIndex={i}
                name={agent.name}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-txt-primary block truncate">{agent.name}</span>
                {agent.reason && (
                  <span className="text-micro text-txt-tertiary block truncate">{agent.reason}</span>
                )}
              </div>
              <OctBadge category={agent.category as any} size="xs">{agent.category}</OctBadge>
              <button
                onClick={() => onRemove(agent.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-icon-secondary hover:text-verdict-abandon transition-all duration-normal"
                title="Remove agent"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </OctCollapsible>
    </div>
  );
}
