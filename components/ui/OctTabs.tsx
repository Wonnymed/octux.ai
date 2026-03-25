'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

interface Tab { id: string; label: string; icon?: ReactNode; badge?: string | number; disabled?: boolean; }

interface OctTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'pills';
  className?: string;
}

export default function OctTabs({ tabs, activeTab, onTabChange, size = 'md', variant = 'default', className }: OctTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || variant === 'pills') return;
    const activeEl = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeEl) setIndicatorStyle({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [activeTab, variant]);

  const sizeClass = size === 'sm' ? 'text-xs h-8' : 'text-sm h-9';

  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1 p-0.5 bg-surface-1 rounded-lg', className)}>
        {tabs.map(tab => (
          <button key={tab.id} disabled={tab.disabled} onClick={() => onTabChange(tab.id)} className={cn(
            'flex items-center gap-1.5 px-3 rounded-md font-medium transition-all duration-normal', sizeClass,
            activeTab === tab.id ? 'bg-surface-raised text-txt-primary shadow-sm' : 'text-txt-tertiary hover:text-txt-secondary',
            tab.disabled && 'opacity-30 pointer-events-none',
          )}>
            {tab.icon && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && <span className="ml-0.5 text-micro bg-surface-2 px-1.5 rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className="flex items-center gap-0 border-b border-border-subtle">
        {tabs.map(tab => (
          <button key={tab.id} data-tab-id={tab.id} disabled={tab.disabled} onClick={() => onTabChange(tab.id)} className={cn(
            'flex items-center gap-1.5 px-3 font-medium transition-colors duration-normal relative', sizeClass,
            activeTab === tab.id ? 'text-txt-primary' : 'text-txt-tertiary hover:text-txt-secondary',
            tab.disabled && 'opacity-30 pointer-events-none',
          )}>
            {tab.icon && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && <span className="ml-1 text-micro bg-accent-muted text-accent px-1.5 rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>
      <div className="absolute bottom-0 h-0.5 bg-accent rounded-full transition-all duration-normal ease-out" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
    </div>
  );
}
