'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  onClick: () => void;
}

interface OctDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number | 'trigger';
  className?: string;
}

export default function OctDropdown({ trigger, items, align = 'left', width, className }: OctDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActiveIndex(0); }
      return;
    }
    const enabledItems = items.filter(i => !i.disabled);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(prev => (prev + 1) % enabledItems.length); break;
      case 'ArrowUp': e.preventDefault(); setActiveIndex(prev => (prev - 1 + enabledItems.length) % enabledItems.length); break;
      case 'Enter': e.preventDefault(); if (activeIndex >= 0) { enabledItems[activeIndex]?.onClick(); setOpen(false); } break;
      case 'Escape': e.preventDefault(); setOpen(false); break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)} onKeyDown={handleKeyDown}>
      <div onClick={() => { setOpen(!open); setActiveIndex(-1); }} className="cursor-pointer">{trigger}</div>
      {open && (
        <div role="menu" className={cn(
          'absolute z-50 mt-1 py-1 animate-scale-in origin-top',
          'bg-surface-raised border border-border-subtle rounded-lg shadow-lg',
          'min-w-[180px] max-h-[320px] overflow-y-auto',
          align === 'right' ? 'right-0' : 'left-0', 'top-full',
        )} style={typeof width === 'number' ? { width: `${width}px` } : undefined}>
          {items.map((item, i) => (
            <div key={item.id}>
              {item.dividerBefore && <div className="my-1 border-t border-border-subtle" />}
              <button role="menuitem" disabled={item.disabled} onClick={() => { item.onClick(); setOpen(false); }} onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors duration-fast',
                  item.danger ? 'text-verdict-abandon' : 'text-txt-primary',
                  item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                  activeIndex === i && !item.disabled && 'bg-surface-2',
                )}>
                {item.icon && <span className="shrink-0 text-icon-secondary [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  {item.description && <div className="text-micro text-txt-tertiary truncate">{item.description}</div>}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
