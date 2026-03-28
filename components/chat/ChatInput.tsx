'use client';

import { useRef, useEffect, useCallback, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useChatStore } from '@/lib/store/chat';
import { useBillingStore } from '@/lib/store/billing';
import { getTokenCost, type SimulationChargeType } from '@/lib/billing/token-costs';
import type { TierType } from '@/lib/billing/tiers';
import { SUGGESTION_CHIP_CONFIG } from '@/lib/design/suggestionChips';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';

const SIM_MODES: { id: SimulationChargeType; label: string }[] = [
  { id: 'swarm', label: 'Swarm' },
  { id: 'specialist', label: 'Specialist' },
  { id: 'compare', label: 'Compare' },
  { id: 'stress_test', label: 'Stress test' },
  { id: 'premortem', label: 'Pre-mortem' },
];

function modeLockedByTier(tier: TierType, mode: SimulationChargeType): boolean {
  if (tier !== 'free') return false;
  return mode !== 'swarm';
}

interface ChatInputProps {
  onSend?: (message: string, options?: { simMode?: SimulationChargeType; simulate?: boolean }) => void;
  conversationId?: string;
  showSuggestions?: boolean;
  isNewConversation?: boolean;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const MAX_TEXTAREA_HEIGHT = 200;

export default function ChatInput({
  onSend,
  conversationId,
  showSuggestions,
  isNewConversation,
  placeholder = 'What decision are you facing?',
  loading: externalLoading,
  disabled = false,
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedSimMode = useChatStore((s) => s.selectedSimMode);
  const setSelectedSimMode = useChatStore((s) => s.setSelectedSimMode);
  const storeSending = useChatStore((s) => s.sending);
  const storeSendMessage = useChatStore((s) => s.sendMessage);

  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const subscriptionTier = useBillingStore((s) => s.tier);
  const canAffordMode = useBillingStore((s) => s.canAffordMode);

  const [value, setValue] = useState('');
  const [hasContent, setHasContent] = useState(false);
  const sending = externalLoading ?? storeSending;
  const chips = showSuggestions ?? isNewConversation ?? false;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleSend = useCallback(() => {
    const message = value.trim();
    if (!message || sending || disabled) return;

    if (onSend) {
      onSend(message, { simMode: selectedSimMode });
    } else if (conversationId) {
      storeSendMessage(conversationId, message);
    }

    setValue('');
    setHasContent(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, sending, disabled, selectedSimMode, onSend, conversationId, storeSendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChipClick = useCallback(
    (text: string) => {
      if (sending) return;
      if (onSend) {
        onSend(text, { simMode: selectedSimMode });
      } else {
        setValue(text);
        setHasContent(true);
        textareaRef.current?.focus();
      }
    },
    [selectedSimMode, onSend, sending],
  );

  const handleModeClick = useCallback(
    (mode: SimulationChargeType) => {
      if (modeLockedByTier(subscriptionTier, mode)) {
        window.dispatchEvent(
          new CustomEvent('sukgo:show-upgrade', {
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
          new CustomEvent('sukgo:show-upgrade', {
            detail: {
              suggestedTier: subscriptionTier === 'free' ? 'pro' : 'max',
              reason: `Not enough tokens. This mode needs ${cost} tokens (${tokensRemaining} remaining).`,
            },
          }),
        );
        return;
      }
      setSelectedSimMode(mode);
    },
    [subscriptionTier, canAffordMode, tokensRemaining, setSelectedSimMode],
  );

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, [conversationId]);

  return (
    <div className={cn('shrink-0 border-t border-border-subtle bg-surface-0', className)}>
      <AnimatePresence>
        {chips && !hasContent && !sending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-[720px] px-4 pt-3 pb-0"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTION_CHIP_CONFIG.map((chip, i) => {
                const Icon = chip.Icon;
                return (
                  <motion.button
                    key={chip.text}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    onClick={() => handleChipClick(chip.text)}
                    disabled={sending}
                    type="button"
                    className={cn(
                      'group flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200',
                      'border-border-subtle bg-surface-0',
                      'hover:bg-surface-2 hover:border-border-strong active:scale-[0.98]',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    <Icon
                      size={13}
                      className="opacity-35 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: chip.color }}
                    />
                    <span className="text-[13px] text-txt-tertiary group-hover:text-txt-secondary transition-colors">
                      {chip.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-[720px] p-4">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-2"
        >
          <div
            className={cn(
              'relative rounded-2xl border transition-all duration-[150ms]',
              'border-border-default bg-[var(--bg-input)]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
              'focus-within:border-border-strong focus-within:ring-2 focus-within:ring-[color:rgba(255,255,255,0.06)]',
              'hover:border-border-default',
              sending && 'pointer-events-none opacity-70',
            )}
          >
            <textarea
              ref={textareaRef}
              data-chat-input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                const newHas = e.target.value.trim().length > 0;
                if (newHas !== hasContent) setHasContent(newHas);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={sending || disabled}
              rows={1}
              className={cn(
                'w-full min-h-[52px] max-h-[200px] resize-none bg-transparent',
                'px-5 py-4 pr-14 text-[15px] leading-[1.5] text-txt-primary placeholder:text-[color:var(--text-muted)]',
                'outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              style={{ overflow: 'hidden' }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || sending || disabled}
              className={cn(
                'absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-[120ms]',
                !hasContent || disabled
                  ? 'pointer-events-none bg-surface-2 text-txt-disabled opacity-30'
                  : sending
                    ? 'cursor-not-allowed bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] opacity-70'
                    : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:scale-105 hover:bg-[var(--btn-primary-hover)] active:scale-95',
              )}
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap size={16} />
                </motion.div>
              ) : (
                <ArrowUp size={16} strokeWidth={2.5} />
              )}
            </button>
          </div>

          <TooltipProvider delayDuration={300}>
            <div className="relative flex flex-wrap items-center justify-center gap-1">
              {SIM_MODES.map((m) => {
                const isActive = selectedSimMode === m.id;
                const tierLocked = modeLockedByTier(subscriptionTier, m.id);
                const cost = getTokenCost(m.id);
                const tokenLocked = cost > 0 && !canAffordMode(m.id);
                const locked = tierLocked || tokenLocked;

                return (
                  <Tooltip key={m.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleModeClick(m.id)}
                        disabled={sending}
                        className={cn(
                          'relative flex items-center gap-1 rounded-2xl border-0 px-3 py-1 text-[12px] font-medium transition-colors duration-[150ms]',
                          locked
                            ? 'cursor-not-allowed text-txt-tertiary'
                            : isActive
                              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                              : 'bg-transparent text-txt-secondary hover:text-txt-primary',
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {m.label}
                          {locked && <Lock size={9} className="shrink-0 text-txt-tertiary" />}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-56">
                      <p className="font-medium">{m.label}</p>
                      {tierLocked ? (
                        <p className="text-txt-tertiary mt-1">Upgrade to Pro to unlock this mode.</p>
                      ) : (
                        <p className="text-txt-tertiary mt-1">
                          Uses simulation tokens from your balance (see sidebar).
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </motion.div>

        <div className="flex items-center justify-between mt-1.5 px-1 gap-2">
          <span className="text-micro text-[color:var(--text-muted)]">
            Enter to send · Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
