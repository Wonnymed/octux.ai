# PF-28 — Keyboard Shortcuts

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Linear (keyboard-first, `?` shows all shortcuts, `G→H` sequences), v0 (Cmd+K command surface), Superhuman (every action has a shortcut). Power users judge a product by whether it has keyboard shortcuts. It signals craft.

**What exists (PF-01 → PF-27):**
- Command Palette Cmd+K (PF-05)
- Sidebar with `[` toggle (from Linear discipline PF-04)
- Chat input with Enter/Shift+Enter (PF-06)
- All pages: root `/`, conversation `/c/[id]`, report `/c/[id]/report`
- Zustand stores: app, chat, simulation, billing, onboarding

**What this prompt builds:**

1. `lib/shortcuts/registry.ts` — centralized shortcut definitions
2. `hooks/useKeyboardShortcuts.ts` — global listener (input-aware, sequence support)
3. `ShortcutsOverlay` — `?` shows all shortcuts in a modal
4. `ShortcutToast` — brief feedback on shortcut execution
5. Wire shortcuts into existing components

---

## Part A — Shortcut Registry

CREATE `lib/shortcuts/registry.ts`:

```typescript
/**
 * Centralized keyboard shortcut definitions.
 * All shortcuts are defined here — components read from this registry.
 *
 * Format:
 *   key: shortcut ID
 *   keys: key combo string (parsed by the listener)
 *   label: human-readable description
 *   category: grouping for the overlay
 *   scope: where the shortcut is active
 */

export interface ShortcutDef {
  id: string;
  keys: string;          // e.g. 'mod+k', '/', '?', 'g h', 'mod+enter'
  label: string;
  category: ShortcutCategory;
  scope: ShortcutScope;
  hidden?: boolean;       // don't show in overlay
}

export type ShortcutCategory = 'navigation' | 'chat' | 'simulation' | 'interface' | 'sequence';
export type ShortcutScope = 'global' | 'conversation' | 'home';

export const SHORTCUTS: ShortcutDef[] = [
  // ═══ NAVIGATION ═══
  {
    id: 'cmd-k',
    keys: 'mod+k',
    label: 'Command palette',
    category: 'navigation',
    scope: 'global',
  },
  {
    id: 'go-home',
    keys: 'g h',
    label: 'Go home',
    category: 'sequence',
    scope: 'global',
  },
  {
    id: 'go-new',
    keys: 'g n',
    label: 'New conversation',
    category: 'sequence',
    scope: 'global',
  },
  {
    id: 'search',
    keys: '/',
    label: 'Focus search / input',
    category: 'navigation',
    scope: 'global',
  },

  // ═══ INTERFACE ═══
  {
    id: 'toggle-sidebar',
    keys: '[',
    label: 'Toggle sidebar',
    category: 'interface',
    scope: 'global',
  },
  {
    id: 'show-shortcuts',
    keys: '?',
    label: 'Show keyboard shortcuts',
    category: 'interface',
    scope: 'global',
  },
  {
    id: 'close-modal',
    keys: 'Escape',
    label: 'Close modal / panel',
    category: 'interface',
    scope: 'global',
    hidden: true,
  },

  // ═══ CHAT ═══
  {
    id: 'send-message',
    keys: 'Enter',
    label: 'Send message',
    category: 'chat',
    scope: 'conversation',
    hidden: true,
  },
  {
    id: 'newline',
    keys: 'shift+Enter',
    label: 'New line',
    category: 'chat',
    scope: 'conversation',
    hidden: true,
  },
  {
    id: 'focus-input',
    keys: 'mod+Enter',
    label: 'Focus input from anywhere',
    category: 'chat',
    scope: 'conversation',
  },

  // ═══ SIMULATION ═══
  {
    id: 'trigger-sim',
    keys: 's',
    label: 'Start simulation (if available)',
    category: 'simulation',
    scope: 'conversation',
  },
  {
    id: 'expand-verdict',
    keys: 'v',
    label: 'Expand/collapse verdict',
    category: 'simulation',
    scope: 'conversation',
  },
];

/** Get shortcuts by category for the overlay */
export function getShortcutsByCategory(): Record<ShortcutCategory, ShortcutDef[]> {
  const categories: Record<ShortcutCategory, ShortcutDef[]> = {
    navigation: [],
    chat: [],
    simulation: [],
    interface: [],
    sequence: [],
  };

  for (const s of SHORTCUTS) {
    if (!s.hidden) {
      categories[s.category].push(s);
    }
  }

  return categories;
}

/** Format keys for display (mod → ⌘/Ctrl) */
export function formatKeys(keys: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  return keys
    .split(' ')
    .map((part) =>
      part
        .split('+')
        .map((k) => {
          switch (k.toLowerCase()) {
            case 'mod': return isMac ? '⌘' : 'Ctrl';
            case 'shift': return '⇧';
            case 'alt': return isMac ? '⌥' : 'Alt';
            case 'enter': return '↵';
            case 'escape': return 'Esc';
            default: return k.toUpperCase();
          }
        })
        .join('+')
    )
    .join(' then ');
}
```

---

## Part B — Keyboard Shortcuts Hook

CREATE `hooks/useKeyboardShortcuts.ts`:

```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/app';
import { SHORTCUTS, type ShortcutDef } from '@/lib/shortcuts/registry';

interface UseKeyboardShortcutsOptions {
  onShortcut?: (id: string) => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcut listener.
 *
 * Features:
 * - Input-aware: won't fire when user is typing in input/textarea (except Enter/Escape)
 * - Sequence support: G→H (400ms timeout between keys)
 * - Modifier support: mod+k (⌘K on Mac, Ctrl+K on Windows)
 * - Scope-aware: some shortcuts only fire on certain pages
 */
export function useKeyboardShortcuts({ onShortcut, enabled = true }: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const sequenceRef = useRef<string | null>(null);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const isInConversation = pathname?.startsWith('/c/');

  const handleShortcut = useCallback(
    (shortcut: ShortcutDef) => {
      // Check scope
      if (shortcut.scope === 'conversation' && !isInConversation) return false;
      if (shortcut.scope === 'home' && pathname !== '/') return false;

      // Dispatch
      switch (shortcut.id) {
        case 'cmd-k':
          window.dispatchEvent(new CustomEvent('octux:toggle-command-palette'));
          break;
        case 'go-home':
          router.push('/');
          break;
        case 'go-new':
          router.push('/');
          break;
        case 'search': {
          const input = document.querySelector('textarea, input[type="text"]') as HTMLElement | null;
          input?.focus();
          break;
        }
        case 'toggle-sidebar':
          toggleSidebar();
          break;
        case 'show-shortcuts':
          window.dispatchEvent(new CustomEvent('octux:toggle-shortcuts'));
          break;
        case 'focus-input': {
          const textarea = document.querySelector('textarea') as HTMLElement | null;
          textarea?.focus();
          break;
        }
        case 'trigger-sim': {
          const simBtn = document.querySelector('[data-action="simulate"]') as HTMLElement | null;
          simBtn?.click();
          break;
        }
        case 'expand-verdict': {
          const verdictToggle = document.querySelector('[data-action="toggle-verdict"]') as HTMLElement | null;
          verdictToggle?.click();
          break;
        }
        default:
          break;
      }

      onShortcut?.(shortcut.id);
      return true;
    },
    [isInConversation, pathname, router, toggleSidebar, onShortcut]
  );

  useEffect(() => {
    if (!enabled) return;

    const isMac = navigator.platform?.includes('Mac');

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase() || '';
      const isEditable = !!target?.isContentEditable;
      const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable;

      // Always allow Escape
      if (e.key === 'Escape') {
        const esc = SHORTCUTS.find((s) => s.keys === 'Escape');
        if (esc) handleShortcut(esc);
        window.dispatchEvent(new CustomEvent('octux:close-all-modals'));
        return;
      }

      const hasMod = e.metaKey || e.ctrlKey;
      if (isInput && !hasMod) return;

      // MODIFIER (mod+k, mod+enter)
      if (hasMod) {
        const key = e.key.toLowerCase();
        const combo = `mod+${key}`;
        const shortcut = SHORTCUTS.find((s) => s.keys === combo);
        if (shortcut) {
          e.preventDefault();
          handleShortcut(shortcut);
          return;
        }
      }

      // SEQUENCE (g h, g n)
      if (sequenceRef.current) {
        const fullSequence = `${sequenceRef.current} ${e.key.toLowerCase()}`;
        const shortcut = SHORTCUTS.find((s) => s.keys === fullSequence);

        sequenceRef.current = null;
        if (sequenceTimerRef.current) {
          clearTimeout(sequenceTimerRef.current);
          sequenceTimerRef.current = null;
        }

        if (shortcut) {
          e.preventDefault();
          handleShortcut(shortcut);
          return;
        }
      }

      // Start a sequence if key matches prefix
      const possibleSequences = SHORTCUTS.filter((s) => s.keys.startsWith(`${e.key.toLowerCase()} `));
      if (possibleSequences.length > 0) {
        sequenceRef.current = e.key.toLowerCase();
        sequenceTimerRef.current = setTimeout(() => {
          sequenceRef.current = null;
        }, 400);
        return;
      }

      // SINGLE KEY
      const shortcut = SHORTCUTS.find((s) => s.keys === e.key);
      if (shortcut) {
        e.preventDefault();
        handleShortcut(shortcut);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, handleShortcut]);
}
```

---

## Part C — Shortcuts Overlay Modal

CREATE `components/shortcuts/ShortcutsOverlay.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import {
  getShortcutsByCategory,
  formatKeys,
  type ShortcutCategory,
} from '@/lib/shortcuts/registry';

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  chat: 'Chat',
  simulation: 'Simulation',
  interface: 'Interface',
  sequence: 'Go to...',
};

const CATEGORY_ORDER: ShortcutCategory[] = ['navigation', 'sequence', 'chat', 'simulation', 'interface'];

export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setOpen((o) => !o);
    const handleClose = () => setOpen(false);

    window.addEventListener('octux:toggle-shortcuts', handleToggle);
    window.addEventListener('octux:close-all-modals', handleClose);
    return () => {
      window.removeEventListener('octux:toggle-shortcuts', handleToggle);
      window.removeEventListener('octux:close-all-modals', handleClose);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const categories = getShortcutsByCategory();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface-overlay/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg mx-4 bg-surface-raised border border-border-subtle rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle/50">
              <h2 className="text-sm font-medium text-txt-primary">Keyboard shortcuts</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
              {CATEGORY_ORDER.map((cat) => {
                const shortcuts = categories[cat];
                if (shortcuts.length === 0) return null;

                return (
                  <div key={cat}>
                    <h3 className="text-micro font-medium text-txt-disabled uppercase tracking-wider mb-2.5">
                      {CATEGORY_LABELS[cat]}
                    </h3>
                    <div className="space-y-1">
                      {shortcuts.map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-1.5">
                          <span className="text-xs text-txt-secondary">{s.label}</span>
                          <KeyCombo keys={s.keys} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-border-subtle/50 bg-surface-1/30">
              <p className="text-micro text-txt-disabled text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-surface-2 text-micro font-mono">?</kbd> to toggle this overlay
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function KeyCombo({ keys }: { keys: string }) {
  const parts = formatKeys(keys);
  const segments = parts.split(' then ');

  return (
    <div className="flex items-center gap-1">
      {segments.map((segment, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-micro text-txt-disabled mx-1">then</span>}
          {segment.split('+').map((key, j) => (
            <span key={j}>
              {j > 0 && <span className="text-micro text-txt-disabled">+</span>}
              <kbd
                className={cn(
                  'inline-flex items-center justify-center px-1.5 py-0.5 rounded',
                  'bg-surface-2 border border-border-subtle/50 text-[10px] font-mono text-txt-secondary',
                  'min-w-[20px] text-center',
                )}
              >
                {key}
              </kbd>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## Part D — Shortcut Toast

CREATE `components/shortcuts/ShortcutToast.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatKeys } from '@/lib/shortcuts/registry';

interface ToastItem {
  id: string;
  keys: string;
  label: string;
}

/**
 * Brief toast that shows when a shortcut is executed.
 * Appears bottom-center, auto-dismisses after 1.5s.
 * Only shows for non-obvious shortcuts (not Enter, Escape, etc).
 */
export default function ShortcutToast() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const showToast = useCallback((detail: any) => {
    const skip = ['send-message', 'newline', 'close-modal'];
    if (skip.includes(detail.id)) return;

    setToast({
      id: detail.id,
      keys: detail.keys || '',
      label: detail.label || detail.id,
    });
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => showToast(e.detail);
    window.addEventListener('octux:shortcut-fired', handler as EventListener);
    return () => window.removeEventListener('octux:shortcut-fired', handler as EventListener);
  }, [showToast]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300]"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle shadow-lg">
            <span className="text-micro text-txt-secondary">{toast.label}</span>
            {toast.keys && (
              <kbd className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono text-txt-tertiary">
                {formatKeys(toast.keys)}
              </kbd>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Part E — Wire into ShellClient

UPDATE `app/(shell)/ShellClient.tsx`:

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutsOverlay from '@/components/shortcuts/ShortcutsOverlay';
import ShortcutToast from '@/components/shortcuts/ShortcutToast';
import { SHORTCUTS } from '@/lib/shortcuts/registry';

useKeyboardShortcuts({
  onShortcut: (id) => {
    const def = SHORTCUTS.find((s) => s.id === id);
    if (def) {
      window.dispatchEvent(new CustomEvent('octux:shortcut-fired', {
        detail: { id, keys: def.keys, label: def.label },
      }));
    }
  },
});

return (
  <div className="flex h-dvh bg-surface-0">
    <Sidebar />
    <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {children}
    </main>
    <CommandPalette />
    <ShortcutsOverlay />
    <ShortcutToast />
  </div>
);
```

---

## Part F — Add Data Attributes for Shortcut Targets

Some shortcuts need to find DOM elements. Add `data-action` attributes:

**In DecisionCard (Activate Deep Simulation):**

```typescript
<button data-action="simulate" ... />
```

**In VerdictCard (expand/collapse):**

```typescript
<button data-action="toggle-verdict" ... />
```

---

Manda pro Fernando. Próximo é **PF-29** (Dark Mode Toggle — embora já seja dark by default, precisa do toggle pra futuro light mode). Quer seguir? 🐙

