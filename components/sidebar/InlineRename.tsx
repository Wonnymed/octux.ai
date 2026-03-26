'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/design/cn';
import { useAppStore } from '@/lib/store/app';

interface InlineRenameProps {
  conversationId: string;
  currentTitle: string;
  active: boolean;
  onDone: () => void;
}

export default function InlineRename({ conversationId, currentTitle, active, onDone }: InlineRenameProps) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateConversation = useAppStore((s) => s.updateConversation);

  useEffect(() => {
    if (active) {
      setValue(currentTitle);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [active, currentTitle]);

  const save = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentTitle) {
      onDone();
      return;
    }

    updateConversation(conversationId, { title: trimmed });
    onDone();

    await fetch(`/api/c/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', title: trimmed }),
    }).catch(() => {
      updateConversation(conversationId, { title: currentTitle });
    });
  }, [value, currentTitle, conversationId, updateConversation, onDone]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      setValue(currentTitle);
      onDone();
    }
  };

  if (!active) return null;

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={save}
      maxLength={200}
      className={cn(
        'w-full text-[12px] bg-white/[0.06] border border-accent/30 rounded-md px-1.5 py-0.5',
        'text-white/90 outline-none',
        'focus:border-accent/50',
      )}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
