'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

interface OctCollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
}

export default function OctCollapsible({ trigger, children, defaultOpen = false, open: controlledOpen, onOpenChange, className, contentClassName }: OctCollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isOpen) {
      setHeight(el.scrollHeight);
      const timer = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timer);
    } else {
      setHeight(el.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [isOpen]);

  const toggle = () => {
    const next = !isOpen;
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cn('', className)}>
      <button onClick={toggle} className="w-full flex items-center gap-2 text-left group" aria-expanded={isOpen}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={cn('shrink-0 text-icon-secondary transition-transform duration-normal ease-out', isOpen && 'rotate-90')}>
          <path d="M5 3l4 4-4 4" />
        </svg>
        <div className="flex-1 min-w-0">{trigger}</div>
      </button>
      <div ref={contentRef} className={cn('overflow-hidden transition-[height] duration-normal ease-out', contentClassName)}
        style={{ height: height !== undefined ? `${height}px` : 'auto' }} aria-hidden={!isOpen}>
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
