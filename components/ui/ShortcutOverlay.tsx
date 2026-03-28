'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/design/cn';
import { getShortcutsByCategory, CATEGORY_LABELS, type ShortcutCategory } from '@/lib/shortcuts/registry';

export default function ShortcutOverlay() {
  const [open, setOpen] = useState(false);

  // Listen for show-shortcuts event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('sukgo:show-shortcuts', handler);
    return () => window.removeEventListener('sukgo:show-shortcuts', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  const grouped = getShortcutsByCategory();
  const categoryOrder: ShortcutCategory[] = ['global', 'navigation', 'conversation', 'simulation', 'ui'];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-surface-overlay/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className={cn(
        'relative z-10 w-full max-w-[640px] mx-4 animate-scale-in',
        'bg-surface-raised border border-border-subtle rounded-xl shadow-xl',
        'overflow-hidden max-h-[80vh] flex flex-col',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-medium text-txt-primary">Keyboard Shortcuts</h2>
            <p className="text-xs text-txt-tertiary mt-0.5">Every action is 1-2 keystrokes away</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-icon-secondary hover:text-icon-primary hover:bg-surface-2 transition-colors duration-normal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>

        {/* Shortcut grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-2 gap-6">
            {categoryOrder.map(cat => {
              const shortcuts = grouped[cat];
              if (shortcuts.length === 0) return null;

              return (
                <div key={cat}>
                  <h3 className="text-[10px] font-medium text-txt-disabled uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="space-y-1">
                    {shortcuts.map(shortcut => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-xs text-txt-secondary">{shortcut.label}</span>
                        <ShortcutKeys keys={shortcut.keys} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-subtle">
          <p className="text-micro text-txt-disabled text-center">
            Press <ShortcutKeys keys="?" /> anywhere to show this overlay
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══ Key display component ═══
function ShortcutKeys({ keys }: { keys: string }) {
  // Split compound keys: "⌘⇧S" → ["⌘", "⇧", "S"], "G→H" → ["G", "→", "H"]
  const parts = keys.includes('→')
    ? keys.split('→').flatMap((p, i, arr) => i < arr.length - 1 ? [p.trim(), '→'] : [p.trim()])
    : keys.split('').filter(c => c.trim());

  return (
    <span className="flex items-center gap-0.5">
      {parts.map((part, i) => {
        if (part === '→') {
          return <span key={i} className="text-micro text-txt-disabled mx-0.5">then</span>;
        }
        return (
          <kbd
            key={i}
            className={cn(
              'inline-flex items-center justify-center min-w-[20px] h-5 px-1',
              'text-micro font-medium text-txt-tertiary',
              'bg-surface-2 border border-border-subtle rounded-sm',
            )}
          >
            {part}
          </kbd>
        );
      })}
    </span>
  );
}

export { ShortcutKeys };
