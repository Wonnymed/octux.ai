'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/design/cn';

interface ToastData {
  label: string;
  keys: string;
}

export default function ShortcutToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent<ToastData>) => {
      setToast(e.detail);
      setVisible(true);
      setTimeout(() => setVisible(false), 1500);
      setTimeout(() => setToast(null), 1800);
    };
    window.addEventListener('octux:shortcut-executed', handler as EventListener);
    return () => window.removeEventListener('octux:shortcut-executed', handler as EventListener);
  }, []);

  if (!toast) return null;

  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-[300]',
      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
      'bg-surface-raised border border-border-subtle shadow-lg',
      'transition-all duration-normal',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
    )}>
      <span className="text-xs text-txt-secondary">{toast.label}</span>
      <span className="flex items-center gap-0.5">
        {toast.keys.split('').map((c, i) => (
          <kbd key={i} className="inline-flex items-center justify-center min-w-[16px] h-4 px-0.5 text-[9px] text-txt-disabled bg-surface-2 rounded-sm">
            {c}
          </kbd>
        ))}
      </span>
    </div>
  );
}
