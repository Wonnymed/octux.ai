'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/design/cn';
import { Plus, ArrowUp, Paperclip, Camera, FolderPlus, Globe, Bot, Lock } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';
import { useBillingStore } from '@/lib/store/billing';
import { TIER_CONFIGS, type ModelTier } from '@/lib/chat/tiers';
import { TOKEN_COSTS } from '@/lib/billing/tiers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

type AgentCategory = 'investment' | 'career' | 'business' | 'health' | 'relationships' | 'life';
type AgentCategoryMode = AgentCategory | 'auto';

const AGENT_CATEGORIES: AgentCategory[] = [
  'life',
  'relationships',
  'career',
  'business',
  'health',
  'investment',
];

function inferAgentCategory(question: string): AgentCategory {
  const q = question.toLowerCase();
  if (/(invest|stock|equity|valuation|portfolio|asset|fund|crypto|retorno|acao|ações|renda)/.test(q)) {
    return 'investment';
  }
  if (/(career|job|salary|promotion|resume|curriculum|interview|vaga|trabalho|carreira)/.test(q)) {
    return 'career';
  }
  if (/(business|startup|saas|pricing|go.to.market|growth|sales|marketing|empresa|negocio)/.test(q)) {
    return 'business';
  }
  if (/(health|doctor|sleep|diet|exercise|workout|stress|ansiedade|saude|saúde)/.test(q)) {
    return 'health';
  }
  if (/(relationship|marriage|dating|partner|breakup|family|friend|relacionamento|casamento)/.test(q)) {
    return 'relationships';
  }
  return 'life';
}

interface HomeComposerProps {
  onSend: (message: string, options?: { tier?: string; simulate?: boolean }) => void;
  loading?: boolean;
}

export default function HomeComposer({ onSend, loading = false }: HomeComposerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [webSearch, setWebSearch] = useState(true);
  const [agentCategoryMode, setAgentCategoryMode] = useState<AgentCategoryMode>('auto');
  const selectedTier = useChatStore((s) => s.selectedTier);
  const setSelectedTier = useChatStore((s) => s.setSelectedTier);
  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const canAfford = useBillingStore((s) => s.canAfford);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  function send() {
    if (!canSend) return;
    const resolvedCategory = agentCategoryMode === 'auto' ? inferAgentCategory(message) : agentCategoryMode;
    try {
      localStorage.setItem('octux_agent_category', resolvedCategory);
      localStorage.setItem('octux_agent_category_mode', agentCategoryMode);
    } catch {}
    onSend(message.trim(), { tier: selectedTier });
    setMessage('');
  }

  function handleTierClick(tier: ModelTier) {
    if (tier === 'ink') {
      setSelectedTier(tier);
      return;
    }
    const simType = tier === 'kraken' ? 'kraken' : 'deep';
    if (!canAfford(simType)) {
      window.dispatchEvent(
        new CustomEvent('octux:show-upgrade', {
          detail: {
            suggestedTier: tier === 'kraken' ? 'max' : 'pro',
            reason: `Need ${TOKEN_COSTS[simType]} token${TOKEN_COSTS[simType] > 1 ? 's' : ''} for ${TIER_CONFIGS[tier].label}`,
          },
        }),
      );
      return;
    }
    setSelectedTier(tier);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[930px]">
      <input ref={fileInputRef} type="file" multiple className="hidden" />
      <div className="rounded-[22px] border border-border-subtle bg-surface-raised shadow-premium">
        <textarea
          data-chat-input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="How can I help you today?"
          className="w-full resize-none rounded-t-[22px] bg-transparent px-7 pb-2 pt-6 text-[18px] leading-[1.5] text-txt-primary outline-none placeholder:text-txt-tertiary/90"
        />

        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-radius-lg border border-border-subtle bg-surface-1 text-txt-secondary transition-colors hover:text-txt-primary"
                aria-label="Composer tools"
              >
                <Plus size={22} />
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
                    : 'life';
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
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {agentCategoryMode === cat && <span className="ml-auto text-xs text-accent">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-radius-lg border border-border-subtle bg-surface-1 p-1">
              {(['ink', 'deep', 'kraken'] as const).map((tier) => {
                const config = TIER_CONFIGS[tier];
                const cost = tier === 'ink' ? 0 : TOKEN_COSTS[tier === 'kraken' ? 'kraken' : 'deep'];
                const locked = cost > 0 && !canAfford(tier === 'kraken' ? 'kraken' : 'deep');
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierClick(tier)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-radius-md px-2.5 py-1 text-xs font-medium transition-colors',
                      selectedTier === tier
                        ? 'bg-accent text-txt-on-accent'
                        : locked
                          ? 'text-txt-tertiary'
                          : 'text-txt-secondary hover:text-txt-primary',
                    )}
                    title={config.description}
                  >
                    {config.label}
                    {cost > 0 && <span className="text-[10px] opacity-80">{cost}t</span>}
                    {locked && <Lock size={9} className="opacity-80" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-radius-lg transition-colors',
                canSend ? 'bg-accent text-txt-on-accent hover:bg-accent-hover' : 'bg-surface-2 text-txt-disabled',
              )}
              aria-label="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-txt-tertiary">
        <span className="rounded-radius-pill border border-border-subtle bg-surface-1 px-2.5 py-1">
          Tokens available: <span className="font-semibold text-txt-primary">{tokensRemaining}</span>
        </span>
        {selectedTier !== 'ink' && (
          <span className="rounded-radius-pill border border-border-subtle bg-surface-1 px-2.5 py-1">
            Cost now: {TOKEN_COSTS[selectedTier === 'kraken' ? 'kraken' : 'deep']} tokens
          </span>
        )}
      </div>
    </div>
  );
}
