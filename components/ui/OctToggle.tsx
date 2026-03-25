'use client';

import { cn } from '@/lib/design/cn';

interface OctToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export default function OctToggle({ checked, onChange, label, description, size = 'md', disabled = false, className }: OctToggleProps) {
  const trackSize = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]';
  const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const thumbTranslate = size === 'sm' ? 'translate-x-[16px]' : 'translate-x-[20px]';

  return (
    <label className={cn('flex items-start gap-3 select-none', disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer', className)}>
      <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center shrink-0 rounded-full transition-colors duration-normal ease-out mt-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0',
          trackSize, checked ? 'bg-accent' : 'bg-surface-3',
        )}>
        <span className={cn('inline-block rounded-full bg-white shadow-sm transition-transform duration-normal ease-out', thumbSize, 'ml-[3px]', checked && thumbTranslate)} />
      </button>
      {(label || description) && (
        <div className="flex flex-col min-w-0">
          {label && <span className="text-sm text-txt-primary leading-snug">{label}</span>}
          {description && <span className="text-xs text-txt-tertiary mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
}
