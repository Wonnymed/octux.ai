# PROMPT 54 — Keyboard Shortcuts System (Linear Systematic Shortcuts)

## Context for AI

You are working on Octux AI — a Decision Operating System built with Next.js 14 App Router + TypeScript + Tailwind CSS + Claude API + Supabase.

**What exists:**
- P44: Design system (animations, transitions 150ms)
- P45: Base components (OctDialog, OctTooltip, OctBadge)
- P46: ChatLayout with [ sidebar toggle, ChatInput with Cmd+Enter send
- P52: Sidebar with Cmd+F search
- P53: Command Palette with Cmd+K
- Various CustomEvents already dispatched: `octux:agent-chat`, `octux:send-message`, `octux:auto-simulate`, `octux:show-shortcuts`, `octux:open-settings`, `octux:switch-tier`

**Shortcuts already implemented (scattered):**
- `Cmd+K` → Command Palette (P53)
- `[` → Toggle sidebar (P46)
- `Cmd+F` → Sidebar search (P52)
- `Cmd+Enter` → Send message (ChatInput)
- `Escape` → Close modals

**What is MISSING:**
Shortcuts exist but are scattered across components with no central registry, no way to discover them, no conflict detection, and no visual feedback. Linear (#17) has a SYSTEMATIC shortcut system: G prefix for navigation, C for create, every action 1-2 keystrokes. Users who learn shortcuts become power users — retention gold.

**What you will build (4 things):**

1. **`lib/shortcuts/registry.ts`** — Central shortcut registry with categories, conflict detection, focus-awareness
2. **`lib/hooks/useKeyboardShortcuts.ts`** — Global listener that dispatches registered shortcuts, respects input focus
3. **`components/ui/ShortcutOverlay.tsx`** — Modal showing all shortcuts (triggered by `?`)
4. **`components/ui/ShortcutHint.tsx`** — Inline hint component for showing key combos in tooltips/buttons

**Shortcut design principles (Linear #17):**
- Single keys for frequent actions (no modifier needed): `[`, `C`, `S`, `D`, `/`, `?`
- Cmd+Key for system actions: `Cmd+K`, `Cmd+N`, `Cmd+Enter`
- G prefix for navigation ("Go to"): `G→H` (home), `G→S` (settings)
- NEVER fire when user is typing in input/textarea
- Visual feedback on every shortcut execution (subtle toast or navigation)
- Discoverable: `?` shows everything, tooltips show shortcuts

**Refs applied:** Linear #17 (systematic G-prefix, single-key actions), v0 #6 (keyboard-first)

---

## Part A — Shortcut Registry

CREATE `lib/shortcuts/registry.ts`:

```typescript
export type ShortcutCategory = 'global' | 'navigation' | 'conversation' | 'simulation' | 'ui';

export interface Shortcut {
  id: string;
  keys: string; // Display format: "⌘K", "G→H", "[", "⌘⇧S"
  keySequence: string[]; // Actual key sequence: ['Meta+k'], ['g', 'h'], ['[']
  label: string;
  description?: string;
  category: ShortcutCategory;
  action: string; // event name or action identifier
  allowInInput?: boolean; // default false — don't fire when typing
  global?: boolean; // works on any page (default true)
}

// ═══ ALL SHORTCUTS ═══

export const SHORTCUTS: Shortcut[] = [
  // ─── GLOBAL ───
  {
    id: 'cmd-k',
    keys: '⌘K',
    keySequence: ['Meta+k'],
    label: 'Command Palette',
    description: 'Search everything',
    category: 'global',
    action: 'command-palette',
    allowInInput: true,
  },
  {
    id: 'cmd-n',
    keys: '⌘N',
    keySequence: ['Meta+n'],
    label: 'New conversation',
    description: 'Start a fresh decision',
    category: 'global',
    action: 'new-conversation',
    allowInInput: true,
  },
  {
    id: 'escape',
    keys: 'Esc',
    keySequence: ['Escape'],
    label: 'Close',
    description: 'Close modal, palette, or panel',
    category: 'global',
    action: 'close-modal',
    allowInInput: true,
  },
  {
    id: 'question-mark',
    keys: '?',
    keySequence: ['?'],
    label: 'Show shortcuts',
    description: 'This overlay',
    category: 'global',
    action: 'show-shortcuts',
  },

  // ─── NAVIGATION (G prefix) ───
  {
    id: 'g-h',
    keys: 'G→H',
    keySequence: ['g', 'h'],
    label: 'Go to Home',
    description: 'Navigate to /c',
    category: 'navigation',
    action: 'navigate-home',
  },
  {
    id: 'g-s',
    keys: 'G→S',
    keySequence: ['g', 's'],
    label: 'Go to Settings',
    description: 'Open settings panel',
    category: 'navigation',
    action: 'navigate-settings',
  },
  {
    id: 'g-p',
    keys: 'G→P',
    keySequence: ['g', 'p'],
    label: 'Go to Profile',
    description: 'Behavioral parameters',
    category: 'navigation',
    action: 'navigate-profile',
  },
  {
    id: 'g-1',
    keys: 'G→1',
    keySequence: ['g', '1'],
    label: 'Filter: Investment',
    description: 'Show investment decisions',
    category: 'navigation',
    action: 'filter-investment',
  },
  {
    id: 'g-2',
    keys: 'G→2',
    keySequence: ['g', '2'],
    label: 'Filter: Relationships',
    description: 'Show relationship decisions',
    category: 'navigation',
    action: 'filter-relationships',
  },
  {
    id: 'g-3',
    keys: 'G→3',
    keySequence: ['g', '3'],
    label: 'Filter: Career',
    description: 'Show career decisions',
    category: 'navigation',
    action: 'filter-career',
  },
  {
    id: 'g-4',
    keys: 'G→4',
    keySequence: ['g', '4'],
    label: 'Filter: Business',
    description: 'Show business decisions',
    category: 'navigation',
    action: 'filter-business',
  },
  {
    id: 'g-5',
    keys: 'G→5',
    keySequence: ['g', '5'],
    label: 'Filter: Life',
    description: 'Show life decisions',
    category: 'navigation',
    action: 'filter-life',
  },

  // ─── CONVERSATION ───
  {
    id: 'c-key',
    keys: 'C',
    keySequence: ['c'],
    label: 'New conversation',
    description: 'Create new from sidebar',
    category: 'conversation',
    action: 'new-conversation',
  },
  {
    id: 'slash',
    keys: '/',
    keySequence: ['/'],
    label: 'Focus input',
    description: 'Jump to chat input',
    category: 'conversation',
    action: 'focus-input',
  },
  {
    id: 'cmd-enter',
    keys: '⌘↵',
    keySequence: ['Meta+Enter'],
    label: 'Send message',
    description: 'Send current message',
    category: 'conversation',
    action: 'send-message',
    allowInInput: true,
  },
  {
    id: 'cmd-shift-c',
    keys: '⌘⇧C',
    keySequence: ['Meta+Shift+c'],
    label: 'Copy last verdict',
    description: 'Copy verdict link to clipboard',
    category: 'conversation',
    action: 'copy-verdict',
    allowInInput: true,
  },
  {
    id: 'cmd-shift-e',
    keys: '⌘⇧E',
    keySequence: ['Meta+Shift+e'],
    label: 'Expand verdict',
    description: 'Toggle last verdict expanded view',
    category: 'conversation',
    action: 'expand-verdict',
    allowInInput: true,
  },

  // ─── SIMULATION ───
  {
    id: 's-key',
    keys: 'S',
    keySequence: ['s'],
    label: 'Start Deep sim',
    description: 'Begin Deep simulation',
    category: 'simulation',
    action: 'start-deep-sim',
  },
  {
    id: 'cmd-shift-s',
    keys: '⌘⇧S',
    keySequence: ['Meta+Shift+s'],
    label: 'Start Kraken sim',
    description: 'Begin Kraken simulation',
    category: 'simulation',
    action: 'start-kraken-sim',
    allowInInput: true,
  },

  // ─── UI ───
  {
    id: 'bracket',
    keys: '[',
    keySequence: ['['],
    label: 'Toggle sidebar',
    description: 'Collapse/expand sidebar',
    category: 'ui',
    action: 'toggle-sidebar',
  },
  {
    id: 'd-key',
    keys: 'D',
    keySequence: ['d'],
    label: 'Toggle dark mode',
    description: 'Switch theme',
    category: 'ui',
    action: 'toggle-theme',
  },
  {
    id: 'cmd-comma',
    keys: '⌘,',
    keySequence: ['Meta+,'],
    label: 'Settings',
    description: 'Open settings',
    category: 'ui',
    action: 'open-settings',
    allowInInput: true,
  },
  {
    id: 'cmd-f',
    keys: '⌘F',
    keySequence: ['Meta+f'],
    label: 'Search conversations',
    description: 'Fuzzy search sidebar',
    category: 'ui',
    action: 'search-conversations',
    allowInInput: true,
  },
];

// ═══ HELPERS ═══

export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  global: 'Global',
  navigation: 'Navigation',
  conversation: 'Conversation',
  simulation: 'Simulation',
  ui: 'Interface',
};

export function getShortcutsByCategory(): Record<ShortcutCategory, Shortcut[]> {
  const grouped: Record<ShortcutCategory, Shortcut[]> = {
    global: [], navigation: [], conversation: [], simulation: [], ui: [],
  };
  for (const s of SHORTCUTS) {
    grouped[s.category].push(s);
  }
  return grouped;
}

export function getShortcutById(id: string): Shortcut | undefined {
  return SHORTCUTS.find(s => s.id === id);
}
```

---

## Part B — useKeyboardShortcuts Hook

CREATE `lib/hooks/useKeyboardShortcuts.ts`:

```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/hooks/useTheme';
import { SHORTCUTS, type Shortcut } from '@/lib/shortcuts/registry';

interface ShortcutHandlers {
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
  onCopyVerdict?: () => void;
  onExpandVerdict?: () => void;
  onStartDeepSim?: () => void;
  onStartKrakenSim?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const isInputFocused = useCallback((): boolean => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if ((el as HTMLElement).contentEditable === 'true') return true;
    return false;
  }, []);

  const executeAction = useCallback((action: string) => {
    switch (action) {
      // Global
      case 'command-palette':
        break;
      case 'new-conversation':
        router.push('/c');
        break;
      case 'close-modal':
        break;
      case 'show-shortcuts':
        window.dispatchEvent(new CustomEvent('octux:show-shortcuts'));
        break;

      // Navigation
      case 'navigate-home':
        router.push('/c');
        break;
      case 'navigate-settings':
        window.dispatchEvent(new CustomEvent('octux:open-settings'));
        break;
      case 'navigate-profile':
        window.dispatchEvent(new CustomEvent('octux:open-profile'));
        break;
      case 'filter-investment':
        window.dispatchEvent(new CustomEvent('octux:category-filter', { detail: { category: 'investment' } }));
        break;
      case 'filter-relationships':
        window.dispatchEvent(new CustomEvent('octux:category-filter', { detail: { category: 'relationships' } }));
        break;
      case 'filter-career':
        window.dispatchEvent(new CustomEvent('octux:category-filter', { detail: { category: 'career' } }));
        break;
      case 'filter-business':
        window.dispatchEvent(new CustomEvent('octux:category-filter', { detail: { category: 'business' } }));
        break;
      case 'filter-life':
        window.dispatchEvent(new CustomEvent('octux:category-filter', { detail: { category: 'life' } }));
        break;

      // Conversation
      case 'focus-input':
        handlers.onFocusInput?.();
        break;
      case 'copy-verdict':
        handlers.onCopyVerdict?.();
        break;
      case 'expand-verdict':
        handlers.onExpandVerdict?.();
        break;

      // Simulation
      case 'start-deep-sim':
        handlers.onStartDeepSim?.();
        break;
      case 'start-kraken-sim':
        handlers.onStartKrakenSim?.();
        break;

      // UI
      case 'toggle-sidebar':
        handlers.onToggleSidebar?.();
        break;
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'open-settings':
        window.dispatchEvent(new CustomEvent('octux:open-settings'));
        break;
      case 'search-conversations':
        break;
    }

    const shortcut = SHORTCUTS.find(s => s.action === action);
    if (shortcut && action !== 'command-palette' && action !== 'close-modal') {
      window.dispatchEvent(new CustomEvent('octux:shortcut-executed', {
        detail: { label: shortcut.label, keys: shortcut.keys },
      }));
    }
  }, [router, toggleTheme, handlers]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = isInputFocused();

      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('Meta');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      if (!['Meta', 'Control', 'Shift', 'Alt'].includes(e.key)) parts.push(e.key);
      const keyCombo = parts.join('+');

      for (const shortcut of SHORTCUTS) {
        if (shortcut.keySequence.length === 1) {
          const expected = shortcut.keySequence[0];

          if (expected.includes('+')) {
            if (keyCombo === expected) {
              if (!shortcut.allowInInput && inInput) continue;
              if (shortcut.action === 'command-palette') continue;
              if (shortcut.action === 'search-conversations') continue;
              e.preventDefault();
              executeAction(shortcut.action);
              return;
            }
          }
          else if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            if (e.key === expected) {
              if (!shortcut.allowInInput && inInput) continue;
              if (expected === '?' && e.key === '?') {
                e.preventDefault();
                executeAction(shortcut.action);
                return;
              }
              if (expected === e.key) {
                e.preventDefault();
                sequenceRef.current = [e.key];
                clearTimeout(sequenceTimerRef.current);
                sequenceTimerRef.current = setTimeout(() => {
                  if (sequenceRef.current.length === 1) {
                    executeAction(shortcut.action);
                  }
                  sequenceRef.current = [];
                }, 400);
                return;
              }
            }
          }
        }
      }

      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !inInput) {
        if (sequenceRef.current.length > 0) {
          clearTimeout(sequenceTimerRef.current);
          sequenceRef.current.push(e.key);

          for (const shortcut of SHORTCUTS) {
            if (shortcut.keySequence.length === 2) {
              if (
                sequenceRef.current[0] === shortcut.keySequence[0] &&
                sequenceRef.current[1] === shortcut.keySequence[1]
              ) {
                e.preventDefault();
                sequenceRef.current = [];
                executeAction(shortcut.action);
                return;
              }
            }
          }

          sequenceRef.current = [];
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      clearTimeout(sequenceTimerRef.current);
    };
  }, [isInputFocused, executeAction]);
}
```

---

## Part C — ShortcutOverlay

CREATE `components/ui/ShortcutOverlay.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/design/cn';
import { getShortcutsByCategory, CATEGORY_LABELS, type ShortcutCategory } from '@/lib/shortcuts/registry';

export default function ShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('octux:show-shortcuts', handler);
    return () => window.removeEventListener('octux:show-shortcuts', handler);
  }, []);

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
      <div
        className="absolute inset-0 bg-surface-overlay/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      <div className={cn(
        'relative z-10 w-full max-w-[640px] mx-4 animate-scale-in',
        'bg-surface-raised border border-border-subtle rounded-xl shadow-xl',
        'overflow-hidden max-h-[80vh] flex flex-col',
      )}>
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

        <div className="px-5 py-3 border-t border-border-subtle">
          <p className="text-micro text-txt-disabled text-center">
            Press <ShortcutKeys keys="?" /> anywhere to show this overlay
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutKeys({ keys }: { keys: string }) {
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
```

---

## Part D — ShortcutHint

CREATE `components/ui/ShortcutHint.tsx`:

```typescript
import { cn } from '@/lib/design/cn';

interface ShortcutHintProps {
  keys: string;
  className?: string;
}

export default function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 ml-2', className)}>
      {keys.split('').map((char, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[14px] h-4 px-0.5 text-[9px] font-medium text-txt-disabled bg-surface-2/80 rounded-sm"
        >
          {char}
        </kbd>
      ))}
    </span>
  );
}
```

---

## Part E — Shortcut Toast

CREATE `components/ui/ShortcutToast.tsx`:

```typescript
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
```

---

## Part F — Mount Everything

UPDATE `app/c/layout.tsx`:

```typescript
import ChatLayout from '@/components/chat/ChatLayout';
import CommandProvider from '@/components/command/CommandProvider';
import ShortcutOverlay from '@/components/ui/ShortcutOverlay';
import ShortcutToast from '@/components/ui/ShortcutToast';

export default function CLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandProvider>
      <ChatLayout>{children}</ChatLayout>
      <ShortcutOverlay />
      <ShortcutToast />
    </CommandProvider>
  );
}
```

The `useKeyboardShortcuts` hook should be called inside `ChatLayout` (or the page component) where handlers are available.

Also add `data-chat-input` attribute to the textarea in `ChatInput.tsx` for the `/` focus shortcut.

---

## Part G — Barrel Exports

CREATE `lib/shortcuts/index.ts`:

```typescript
export { SHORTCUTS, CATEGORY_LABELS, getShortcutsByCategory, getShortcutById } from './registry';
export type { Shortcut, ShortcutCategory } from './registry';
```

---

## Architecture Summary

```
AFTER P54:
  COMPLETE KEYBOARD-FIRST SYSTEM:

  REGISTRY (lib/shortcuts/registry.ts):
    22 shortcuts across 5 categories
    Type-safe: id, keys, keySequence, action, category
    Focus-aware: allowInInput flag

  LISTENER (lib/hooks/useKeyboardShortcuts.ts):
    Global keydown listener
    Sequence detection: G→H (400ms timeout)
    Input focus guard

  OVERLAY (components/ui/ShortcutOverlay.tsx):
    ? to open from anywhere
    2-column grid, categories labeled

  TOAST (components/ui/ShortcutToast.tsx):
    Subtle feedback on shortcut execution
    Auto-fades after 1.5s

  HINT (components/ui/ShortcutHint.tsx):
    Inline component for tooltips/buttons

  ALL SHORTCUTS:
    ⌘K    Command Palette       ⌘N    New conversation
    ?     Show shortcuts         Esc   Close modal
    G→H   Go Home               G→S   Go Settings
    G→P   Go Profile            G→1-5 Category filter
    C     New conversation       /     Focus input
    ⌘↵    Send message           ⌘⇧C  Copy verdict
    ⌘⇧E   Expand verdict        S     Deep simulation
    ⌘⇧S   Kraken simulation     [     Toggle sidebar
    D     Dark mode              ⌘,    Settings
    ⌘F    Search conversations
```

P54 completo. Phase 4 COMPLETA. P44-P54 = Design System + Polish.
