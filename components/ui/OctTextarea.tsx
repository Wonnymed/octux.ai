'use client';

import { forwardRef, useRef, useEffect, useCallback, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/design/cn';

interface OctTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  onSubmit?: () => void;
}

const OctTextarea = forwardRef<HTMLTextAreaElement, OctTextareaProps>(({
  label,
  error,
  helperText,
  showCharCount = false,
  maxLength,
  minRows = 1,
  maxRows = 8,
  onSubmit,
  className,
  value,
  onChange,
  id,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxRows, textareaRef]);

  useEffect(() => { autoResize(); }, [value, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    props.onKeyDown?.(e);
  };

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-txt-secondary">
          {label}
        </label>
      )}
      <div className={cn(
        'relative rounded-md border transition-all duration-normal ease-out',
        'bg-surface-1',
        error
          ? 'border-verdict-abandon focus-within:border-verdict-abandon focus-within:ring-1 focus-within:ring-verdict-abandon/30'
          : 'border-border-default focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30',
        props.disabled && 'opacity-40 cursor-not-allowed',
      )}>
        <textarea
          ref={textareaRef}
          id={inputId}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          rows={minRows}
          maxLength={maxLength}
          className={cn(
            'w-full bg-transparent text-sm text-txt-primary placeholder:text-txt-disabled outline-none resize-none',
            'px-3 py-2.5',
            'disabled:cursor-not-allowed',
          )}
          {...props}
        />
        {(showCharCount && maxLength) && (
          <div className="flex justify-end px-3 pb-1.5">
            <span className={cn(
              'text-micro',
              charCount > maxLength * 0.9 ? 'text-verdict-abandon' : 'text-txt-disabled',
            )}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-micro text-verdict-abandon">{error}</p>}
      {helperText && !error && (
        <div className="flex items-center justify-between">
          <p className="text-micro text-txt-tertiary">{helperText}</p>
          {onSubmit && <p className="text-micro text-txt-disabled">Cmd + Enter to submit</p>}
        </div>
      )}
    </div>
  );
});
OctTextarea.displayName = 'OctTextarea';
export default OctTextarea;
