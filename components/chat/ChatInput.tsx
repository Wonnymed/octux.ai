'use client';

import { useRef, useEffect, useCallback, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { SPRING } from '@/lib/motion/constants';
import { ArrowUp, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useChatStore } from '@/lib/store/chat';
import { useBillingStore } from '@/lib/store/billing';
import { TIER_CONFIGS, type ModelTier } from '@/lib/chat/tiers';
import { TOKEN_COSTS } from '@/lib/billing/tiers';
import { SUGGESTION_CHIP_CONFIG } from '@/lib/design/suggestionChips';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';

interface ChatInputProps {
  /** Legacy prop — called on send if provided (used by pages that manage their own state) */
  onSend?: (message: string, options?: { tier?: string; simulate?: boolean }) => void;
  /** Zustand-connected: auto-sends via useChatStore.sendMessage */
  conversationId?: string;
  /** Show suggestion chips (for empty / new conversations) */
  showSuggestions?: boolean;
  /** @deprecated use showSuggestions */
  isNewConversation?: boolean;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const MAX_ROWS = 6;
const LINE_HEIGHT = 22;

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

  const selectedTier = useChatStore((s) => s.selectedTier);
  const setSelectedTier = useChatStore((s) => s.setSelectedTier);
  const storeSending = useChatStore((s) => s.sending);
  const storeSendMessage = useChatStore((s) => s.sendMessage);

  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const canAfford = useBillingStore((s) => s.canAfford);

  const [value, setValue] = useState('');
  const [hasContent, setHasContent] = useState(false);
  const sending = externalLoading ?? storeSending;
  const chips = showSuggestions ?? isNewConversation ?? false;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = LINE_HEIGHT * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => { autoResize(); }, [value, autoResize]);

  const handleSend = useCallback(() => {
    const message = value.trim();
    if (!message || sending || disabled) return;

    if (onSend) {
      onSend(message, { tier: selectedTier });
    } else if (conversationId) {
      storeSendMessage(conversationId, message);
    }

    setValue('');
    setHasContent(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, sending, disabled, selectedTier, onSend, conversationId, storeSendMessage]);

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
        onSend(text, { tier: selectedTier });
      } else {
        setValue(text);
        setHasContent(true);
        textareaRef.current?.focus();
      }
    },
    [selectedTier, onSend, sending],
  );

  const handleTierClick = useCallback(
    (tier: ModelTier) => {
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
    },
    [canAfford, setSelectedTier],
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
            className="px-4 pt-3 pb-0 max-w-3xl mx-auto w-full"
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

      <div className="p-4 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-2"
        >
          {/* Large input — primary focus */}
          <div
            className={cn(
              'relative rounded-2xl border transition-all duration-[150ms]',
              'border-border-subtle bg-surface-1',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
              'focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10',
              'focus-within:shadow-[0_0_0_4px_var(--accent-ring,rgba(124,58,237,0.12))]',
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
                'w-full min-h-[52px] max-h-[120px] resize-none bg-transparent',
                'px-5 py-3.5 pr-14 text-[15px] text-txt-primary placeholder:text-txt-tertiary',
                'outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              style={{
                lineHeight: `${LINE_HEIGHT}px`,
                overflow: 'hidden',
              }}
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
                    ? 'cursor-not-allowed bg-accent text-txt-on-accent opacity-70'
                    : 'bg-accent text-txt-on-accent hover:scale-105 hover:bg-accent-hover active:scale-95',
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

          {/* Tier row — separate from input */}
          <TooltipProvider delayDuration={300}>
            <LayoutGroup>
              <div className="relative flex flex-wrap items-center justify-center gap-1">
                {(['ink', 'deep', 'kraken'] as const).map((tier) => {
                  const config = TIER_CONFIGS[tier];
                  const isActive = selectedTier === tier;
                  const cost = tier === 'ink' ? 0 : TOKEN_COSTS[tier === 'kraken' ? 'kraken' : 'deep'];
                  const locked = cost > 0 && !canAfford(tier === 'kraken' ? 'kraken' : 'deep');

                  return (
                    <Tooltip key={tier}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleTierClick(tier)}
                          disabled={sending}
                          className={cn(
                            'relative flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors duration-[150ms]',
                            locked
                              ? 'cursor-not-allowed text-txt-tertiary'
                              : isActive
                                ? 'text-txt-primary'
                                : 'text-txt-secondary hover:text-txt-primary',
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="chat-tier-indicator"
                              className="absolute inset-0 rounded-full bg-accent-muted"
                              transition={SPRING.smooth}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1 font-medium">
                            {config.label}
                            {cost > 0 && (
                              <span
                                className={cn(
                                  'text-[10px] tabular-nums',
                                  locked
                                    ? 'text-txt-tertiary'
                                    : isActive
                                      ? 'text-txt-tertiary'
                                      : 'text-txt-secondary',
                                )}
                              >
                                {cost}t
                              </span>
                            )}
                            {locked && <Lock size={9} className="shrink-0 text-txt-tertiary" />}
                          </span>
                        </button>
                      </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-48">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-txt-tertiary">{config.description}</p>
                      {locked && (
                        <p className="text-verdict-delay mt-1">
                          Need {cost} token{cost > 1 ? 's' : ''} · {tokensRemaining} remaining
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  );
                })}
              </div>
            </LayoutGroup>
          </TooltipProvider>
        </motion.div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-micro text-txt-tertiary">
            Enter to send · Shift+Enter for new line
          </span>
          {selectedTier !== 'ink' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-micro flex items-center gap-1 text-txt-tertiary"
            >
              <Zap size={9} className="text-accent" />
              {TOKEN_COSTS[selectedTier === 'kraken' ? 'kraken' : 'deep']} token
              {TOKEN_COSTS[selectedTier === 'kraken' ? 'kraken' : 'deep'] > 1 ? 's' : ''} per sim
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
