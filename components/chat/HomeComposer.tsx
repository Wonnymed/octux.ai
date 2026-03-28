'use client';

import { useMemo, useRef, useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/design/cn';
import { Plus, ArrowUp, Paperclip, Camera, FolderPlus, Globe, Bot, Lock } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';
import { useBillingStore } from '@/lib/store/billing';
import { getTokenCost, type SimulationChargeType } from '@/lib/billing/token-costs';
import type { TierType } from '@/lib/billing/tiers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

type AgentCategory = 'investment' | 'career' | 'business';
type AgentCategoryMode = AgentCategory | 'auto';

const AGENT_CATEGORIES: AgentCategory[] = ['business', 'career', 'investment'];

const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  business: 'Business',
  career: 'Career',
  investment: 'Investment',
};

function inferAgentCategory(question: string): AgentCategory {
  const q = question.toLowerCase();
  if (/(invest|stock|equity|valuation|portfolio|asset|fund|crypto|retorno|acao|ações|renda|index fund|nvidia)/.test(q)) {
    return 'investment';
  }
  if (/(career|job|salary|promotion|resume|curriculum|interview|vaga|trabalho|carreira|cto|outsource|hire)/.test(q)) {
    return 'career';
  }
  if (/(business|startup|saas|pricing|go.to.market|growth|sales|marketing|empresa|negocio|import|china|restaurant|gangnam|café|cafe|latam|latin america)/.test(q)) {
    return 'business';
  }
  return 'business';
}

const SIM_MODES: { id: SimulationChargeType; label: string }[] = [
  { id: 'swarm', label: 'Swarm' },
  { id: 'specialist', label: 'Specialist' },
  { id: 'compare', label: 'Compare' },
  { id: 'stress_test', label: 'Stress' },
  { id: 'premortem', label: 'Pre-mortem' },
];

function modeLockedByTier(tier: TierType, mode: SimulationChargeType): boolean {
  if (tier !== 'free') return false;
  return mode !== 'swarm';
}

interface HomeComposerProps {
  onSend: (message: string, options?: { simMode?: SimulationChargeType; simulate?: boolean }) => void;
  loading?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 200;

export default function HomeComposer({ onSend, loading = false }: HomeComposerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [webSearch, setWebSearch] = useState(true);
  const [agentCategoryMode, setAgentCategoryMode] = useState<AgentCategoryMode>('auto');
  const selectedSimMode = useChatStore((s) => s.selectedSimMode);
  const setSelectedSimMode = useChatStore((s) => s.setSelectedSimMode);
  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const subscriptionTier = useBillingStore((s) => s.tier);
  const canAffordMode = useBillingStore((s) => s.canAffordMode);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoResize();
  }, [message, autoResize]);

  function send() {
    if (!canSend) return;
    const resolvedCategory = agentCategoryMode === 'auto' ? inferAgentCategory(message) : agentCategoryMode;
    try {
      localStorage.setItem('octux_agent_category', resolvedCategory);
      localStorage.setItem('octux_agent_category_mode', agentCategoryMode);
    } catch {}
    onSend(message.trim(), { simMode: selectedSimMode });
    setMessage('');
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.overflowY = 'hidden';
      }
    });
  }

  function handleModeClick(mode: SimulationChargeType) {
    if (modeLockedByTier(subscriptionTier, mode)) {
      window.dispatchEvent(
        new CustomEvent('octux:show-upgrade', {
          detail: {
            suggestedTier: 'pro',
            reason: 'Upgrade to Pro for specialist, compare, stress test, and pre-mortem modes.',
          },
        }),
      );
      return;
    }
    const cost = getTokenCost(mode);
    if (cost > 0 && !canAffordMode(mode)) {
      window.dispatchEvent(
        new CustomEvent('octux:show-upgrade', {
          detail: {
            suggestedTier: subscriptionTier === 'free' ? 'pro' : 'max',
            reason: `Not enough tokens. This mode needs ${cost} tokens (${tokensRemaining} remaining).`,
          },
        }),
      );
      return;
    }
    setSelectedSimMode(mode);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <input ref={fileInputRef} type="file" multiple className="hidden" />
      <div className="rounded-2xl border border-border-subtle/90 bg-surface-raised shadow-[0_2px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
        <textarea
          ref={textareaRef}
          data-chat-input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="How can I help you today?"
          className="min-h-[52px] max-h-[200px] w-full resize-none rounded-t-2xl bg-transparent px-5 py-4 text-[15px] leading-[1.5] text-txt-primary outline-none placeholder:text-txt-tertiary/80"
        />

        <div className="flex items-center justify-between px-5 pb-4 pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-txt-secondary transition-colors hover:text-txt-primary"
                aria-label="Composer tools"
              >
                <Plus size={20} strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-[320px] rounded-radius-xl border-border-default bg-surface-raised shadow-premium"
            >
              <DropdownMenuItem
                className="gap-2 text-sm"
                onSelect={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
              >
                <Paperclip size={16} />
                Add files or photos
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm">
                <Camera size={16} />
                Take a screenshot
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm">
                <FolderPlus size={16} />
                Add to project
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-txt-tertiary">Research</DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 text-sm"
                onSelect={(e) => {
                  e.preventDefault();
                  setWebSearch((v) => !v);
                }}
              >
                <Globe size={16} />
                Web search
                <span className="ml-auto text-xs text-txt-tertiary">{webSearch ? 'On' : 'Off'}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-txt-tertiary">Agents</DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 text-sm"
                onSelect={(e) => {
                  e.preventDefault();
                  const resolvedCategory = message.trim()
                    ? (agentCategoryMode === 'auto' ? inferAgentCategory(message) : agentCategoryMode)
                    : 'business';
                  router.push(`/agents?category=${encodeURIComponent(resolvedCategory)}`);
                }}
              >
                <Bot size={16} />
                Open Agents page
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-sm"
                onSelect={(e) => {
                  e.preventDefault();
                  setAgentCategoryMode('auto');
                }}
              >
                <Bot size={16} />
                Auto (detect from question)
                {agentCategoryMode === 'auto' && <span className="ml-auto text-xs text-accent">Selected</span>}
              </DropdownMenuItem>
              {AGENT_CATEGORIES.map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  className="gap-2 text-sm"
                  onSelect={(e) => {
                    e.preventDefault();
                    setAgentCategoryMode(cat);
                  }}
                >
                  <Bot size={16} />
                  {AGENT_CATEGORY_LABELS[cat]}
                  {agentCategoryMode === cat && <span className="ml-auto text-xs text-accent">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={220}>
              <div className="flex items-center rounded-2xl border-0 bg-transparent p-0.5">
                {SIM_MODES.map((m) => {
                  const cost = getTokenCost(m.id);
                  const tierLocked = modeLockedByTier(subscriptionTier, m.id);
                  const tokenLocked = cost > 0 && !canAffordMode(m.id);
                  const locked = tierLocked || tokenLocked;
                  return (
                    <Tooltip key={m.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleModeClick(m.id)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-2xl border-0 px-3 py-1 text-[12px] font-medium transition-colors',
                            selectedSimMode === m.id
                              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                              : locked
                                ? 'text-txt-tertiary'
                                : 'text-txt-secondary hover:text-txt-primary',
                          )}
                        >
                          {m.label}
                          {locked && <Lock size={9} className="opacity-80" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56 text-xs">
                        <p className="font-medium">{m.label}</p>
                        {tierLocked ? (
                          <p className="mt-1 text-txt-tertiary">Upgrade to Pro to unlock.</p>
                        ) : (
                          <p className="mt-1 text-txt-tertiary">
                            Uses simulation tokens from your balance (see sidebar).
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                canSend
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90'
                  : 'bg-surface-2 text-txt-disabled',
              )}
              aria-label="Send message"
            >
              <ArrowUp size={17} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
