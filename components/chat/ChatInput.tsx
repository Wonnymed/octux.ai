'use client';

import { useRef, useEffect, useCallback, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useChatStore } from '@/lib/store/chat';
import { useBillingStore } from '@/lib/store/billing';
import { TIER_CONFIGS, type ModelTier } from '@/lib/chat/tiers';
import { TOKEN_COSTS } from '@/lib/billing/tiers';
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

const SUGGESTION_CHIPS = [
  'Should I invest $10K in NVIDIA?',
  'Time to break up or work on it?',
  'Quit my 9-5 for a startup?',
  'Open a restaurant in Gangnam?',
  'Move abroad or stay close to family?',
];

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

  // Zustand
  const selectedTier = useChatStore((s) => s.selectedTier);
  const setSelectedTier = useChatStore((s) => s.setSelectedTier);
  const storeSending = useChatStore((s) => s.sending);
  const storeSendMessage = useChatStore((s) => s.sendMessage);

  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const canAfford = useBillingStore((s) => s.canAfford);

  // Local state
  const [value, setValue] = useState('');
  const [hasContent, setHasContent] = useState(false);
  const sending = externalLoading ?? storeSending;
  const chips = showSuggestions ?? isNewConversation ?? false;

  // ─── AUTO-RESIZE ───
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = LINE_HEIGHT * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => { autoResize(); }, [value, autoResize]);

  // ─── SEND ───
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

  // ─── KEYBOARD ───
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ─── CHIP CLICK ───
  const handleChipClick = useCallback(
    (text: string) => {
      setValue(text);
      setHasContent(true);
      textareaRef.current?.focus();
      // Auto-send after brief moment
      setTimeout(() => {
        if (onSend) {
          onSend(text, { tier: selectedTier });
          setValue('');
          setHasContent(false);
        }
      }, 150);
    },
    [selectedTier, onSend],
  );

  // ─── TIER CLICK ───
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

  // ─── FOCUS ON MOUNT ───
  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, [conversationId]);

  return (
    <div className={cn('shrink-0 border-t border-border-subtle bg-surface-0', className)}>
      {/* ─── SUGGESTION CHIPS ─── */}
      <AnimatePresence>
        {chips && !hasContent && !sending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-3 pb-0 max-w-3xl mx-auto w-full"
          >
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTION_CHIPS.map((chip, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => handleChipClick(chip)}
                  disabled={sending}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full border transition-all duration-normal',
                    'border-border-subtle text-txt-tertiary',
                    'hover:text-txt-secondary hover:border-border-default hover:bg-surface-2/50',
                    'active:scale-[0.97]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── INPUT AREA ─── */}
      <div className="p-4 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            'flex items-end gap-2 rounded-xl border transition-colors duration-normal',
            'bg-surface-1',
            'focus-within:border-accent/30 focus-within:shadow-sm focus-within:shadow-accent/5',
            sending ? 'border-border-subtle opacity-70' : 'border-border-default',
          )}
        >
          {/* ─── TIER SELECTOR ─── */}
          <TooltipProvider delayDuration={300}>
            <div className="pl-3 pb-2.5 pt-2.5 shrink-0">
              <div className="flex items-center gap-0.5 p-0.5 bg-surface-2 rounded-md">
                {(['ink', 'deep', 'kraken'] as const).map((tier) => {
                  const config = TIER_CONFIGS[tier];
                  const isActive = selectedTier === tier;
                  const cost = tier === 'ink' ? 0 : TOKEN_COSTS[tier === 'kraken' ? 'kraken' : 'deep'];
                  const locked = cost > 0 && !canAfford(tier === 'kraken' ? 'kraken' : 'deep');

                  return (
                    <Tooltip key={tier}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTierClick(tier)}
                          disabled={sending}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-normal',
                            isActive
                              ? tier === 'ink'
                                ? 'bg-surface-raised text-txt-primary shadow-xs'
                                : tier === 'deep'
                                ? 'bg-accent-muted text-accent shadow-xs'
                                : 'bg-[#00e5ff]/10 text-[#00e5ff] shadow-xs'
                              : locked
                              ? 'text-txt-disabled cursor-not-allowed opacity-50'
                              : 'text-txt-tertiary hover:text-txt-secondary',
                          )}
                        >
                          {config.label}
                          {cost > 0 && (
                            <span className={cn('text-[10px] tabular-nums', isActive ? 'opacity-80' : 'opacity-50')}>
                              {cost}t
                            </span>
                          )}
                          {locked && <Lock size={9} className="opacity-60" />}
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
            </div>
          </TooltipProvider>

          {/* ─── TEXTAREA ─── */}
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
              'flex-1 resize-none bg-transparent text-sm text-txt-primary',
              'placeholder:text-txt-disabled',
              'outline-none border-none',
              'min-h-[22px] py-2.5',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            style={{
              lineHeight: `${LINE_HEIGHT}px`,
              overflow: 'hidden',
            }}
          />

          {/* ─── SEND BUTTON ─── */}
          <div className="pr-2 pb-2 flex items-center gap-1 shrink-0">
            <button
              onClick={handleSend}
              disabled={!hasContent || sending || disabled}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-normal',
                hasContent && !sending
                  ? 'bg-accent text-white hover:bg-accent-hover active:scale-95'
                  : 'bg-surface-2 text-txt-disabled',
                (sending || disabled) && 'opacity-50 cursor-not-allowed',
              )}
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap size={14} />
                </motion.div>
              ) : (
                <ArrowUp size={14} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </motion.div>

        {/* ─── FOOTER HINTS ─── */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-micro text-txt-disabled">
            Enter to send · Shift+Enter for new line
          </span>
          {selectedTier !== 'ink' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 text-micro text-txt-disabled"
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
