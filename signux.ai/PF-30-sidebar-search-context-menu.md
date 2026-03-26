# PF-30 — Sidebar Search + Context Menu

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Linear (sidebar search instant, context menu on right-click, keyboard-first), ChatGPT (conversation management, rename inline), Claude.ai (clean sidebar with search).

**What exists (PF-04):**
- Sidebar with: entity logo, "octux" wordmark, "+" new conversation, Search ⌘K, conversation list grouped by date (YESTERDAY, etc.)
- Conversation items show: MessageSquare icon (or verdict dot), truncated title
- `useAppStore` has: `conversations`, `activeConversationId`, `sidebarOpen`, `fetchConversations`, `addConversation`, `updateConversation`
- Conversations have: `id`, `title`, `domain`, `has_simulation`, `latest_verdict`, `latest_verdict_probability`, `is_pinned`, `message_count`, `simulation_count`, `created_at`, `updated_at`
- shadcn/ui: `DropdownMenu`, `Dialog`, `Command`, `Input`, `Badge`
- Keyboard shortcuts system (PF-28) with Cmd+F wired

**What this prompt builds:**

1. `SidebarSearch` — inline fuzzy search (Cmd+F) across titles + verdicts
2. `ConversationContextMenu` — right-click menu: Pin, Rename, Share, Delete
3. `InlineRename` — click title to rename (Enter saves, Escape cancels)
4. `DeleteConfirmDialog` — "Are you sure?" with conversation title
5. `CategoryFilters` — filter bar: All / Investment / Career / Business / Relationships / Life
6. API routes: `PATCH /api/c/[id]` (rename, pin), `DELETE /api/c/[id]`

---

## Part A — Sidebar Search

CREATE `components/sidebar/SidebarSearch.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useAppStore } from '@/lib/store/app';

interface SidebarSearchProps {
  className?: string;
}

export default function SidebarSearch({ className }: SidebarSearchProps) {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const conversations = useAppStore((s) => s.conversations);
  const setSearchFilter = useAppStore((s) => s.setSearchFilter);

  // Listen for Cmd+F / keyboard shortcut
  useEffect(() => {
    const handler = () => {
      setActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener('octux:focus-sidebar-search', handler);
    return () => window.removeEventListener('octux:focus-sidebar-search', handler);
  }, []);

  // Fuzzy search
  const filtered = useMemo(() => {
    if (!query.trim()) return null; // null = show all
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const titleMatch = c.title?.toLowerCase().includes(q);
      const verdictMatch = c.latest_verdict?.toLowerCase().includes(q);
      const domainMatch = c.domain?.toLowerCase().includes(q);
      return titleMatch || verdictMatch || domainMatch;
    });
  }, [query, conversations]);

  // Push filter to store
  useEffect(() => {
    setSearchFilter(query.trim() ? query : null);
  }, [query, setSearchFilter]);

  const handleClear = () => {
    setQuery('');
    setActive(false);
    setSearchFilter(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2/50 border border-border-subtle"
        >
          <Search size={13} className="text-txt-disabled shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (!query) setActive(false); }}
            placeholder="Search conversations..."
            className="flex-1 text-xs bg-transparent text-txt-primary placeholder:text-txt-disabled outline-none"
            autoFocus
          />
          {query && (
            <button onClick={handleClear} className="p-0.5 rounded text-txt-disabled hover:text-txt-tertiary">
              <X size={12} />
            </button>
          )}
        </motion.div>
      ) : (
        <button
          onClick={() => { setActive(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-2 w-full h-8 px-2.5 rounded-lg text-xs text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2/30 transition-colors"
        >
          <Search size={13} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="px-1 py-0.5 rounded bg-surface-2/50 text-[9px] font-mono text-txt-disabled">⌘F</kbd>
        </button>
      )}

      {/* Result count */}
      <AnimatePresence>
        {query && filtered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-4 left-0 text-micro text-txt-disabled"
          >
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## Part B — Category Filters

CREATE `components/sidebar/CategoryFilters.tsx`:

```typescript
'use client';

import { cn } from '@/lib/design/cn';
import { useAppStore } from '@/lib/store/app';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'investment', label: 'Investment', color: '#6366f1' },
  { id: 'career', label: 'Career', color: '#f59e0b' },
  { id: 'business', label: 'Business', color: '#10b981' },
  { id: 'relationships', label: 'Relationships', color: '#ec4899' },
  { id: 'life', label: 'Life', color: '#06b6d4' },
];

export default function CategoryFilters({ className }: { className?: string }) {
  const categoryFilter = useAppStore((s) => s.categoryFilter);
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter);

  return (
    <div className={cn('flex gap-1 flex-wrap', className)}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategoryFilter(cat.id === 'all' ? null : cat.id)}
          className={cn(
            'px-2 py-0.5 rounded-md text-[10px] transition-colors',
            (categoryFilter === cat.id || (cat.id === 'all' && !categoryFilter))
              ? 'bg-accent/15 text-accent border border-accent/20'
              : 'text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2/30',
          )}
        >
          {cat.color && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: cat.color }}
            />
          )}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Part C — Conversation Context Menu

CREATE `components/sidebar/ConversationContextMenu.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Pin, PinOff, Pencil, Share2, Trash2, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store/app';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ConversationContextMenuProps {
  conversationId: string;
  title: string;
  isPinned: boolean;
  children: React.ReactNode;
  onRename: () => void;
  onShare: () => void;
}

export default function ConversationContextMenu({
  conversationId, title, isPinned, children, onRename, onShare,
}: ConversationContextMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateConversation = useAppStore((s) => s.updateConversation);
  const removeConversation = useAppStore((s) => s.removeConversation);

  const handlePin = async () => {
    const newPinned = !isPinned;
    // Optimistic update
    updateConversation(conversationId, { is_pinned: newPinned });
    // API call
    await fetch(`/api/c/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: newPinned }),
    }).catch(() => {
      // Revert on failure
      updateConversation(conversationId, { is_pinned: isPinned });
    });
  };

  const handleDelete = async () => {
    // Optimistic remove
    removeConversation(conversationId);
    // API call
    await fetch(`/api/c/${conversationId}`, {
      method: 'DELETE',
    }).catch(() => {
      // Could re-fetch conversations to revert, but deletion is rare
    });
    setDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-44 bg-surface-raised border-border-subtle">
          <DropdownMenuItem onClick={handlePin} className="flex items-center gap-2.5 text-xs cursor-pointer">
            {isPinned ? <PinOff size={13} className="text-txt-tertiary" /> : <Pin size={13} className="text-txt-tertiary" />}
            {isPinned ? 'Unpin' : 'Pin to top'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onRename} className="flex items-center gap-2.5 text-xs cursor-pointer">
            <Pencil size={13} className="text-txt-tertiary" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onShare} className="flex items-center gap-2.5 text-xs cursor-pointer">
            <Share2 size={13} className="text-txt-tertiary" />
            Share report
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border-subtle/50" />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2.5 text-xs cursor-pointer text-verdict-abandon focus:text-verdict-abandon"
          >
            <Trash2 size={13} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={title}
      />
    </>
  );
}
```

---

## Part D — Delete Confirm Dialog

CREATE `components/sidebar/DeleteConfirmDialog.tsx`:

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, title }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface-overlay/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-surface-raised border border-border-subtle rounded-xl shadow-xl p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-verdict-abandon/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-verdict-abandon" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-txt-primary mb-1">Delete conversation?</h3>
            <p className="text-xs text-txt-tertiary mb-1">
              "<span className="text-txt-secondary">{title}</span>"
            </p>
            <p className="text-micro text-txt-disabled">
              This will permanently delete the conversation, messages, and any simulations. This cannot be undone.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-txt-disabled hover:text-txt-tertiary">
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-txt-secondary bg-surface-2 hover:bg-surface-2/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-verdict-abandon hover:bg-verdict-abandon/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## Part E — Inline Rename

CREATE `components/sidebar/InlineRename.tsx`:

```typescript
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

    // Optimistic
    updateConversation(conversationId, { title: trimmed });
    onDone();

    // API
    await fetch(`/api/c/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
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
      maxLength={100}
      className={cn(
        'w-full text-xs bg-surface-2 border border-accent/30 rounded px-1.5 py-0.5',
        'text-txt-primary outline-none',
        'focus:border-accent/50',
      )}
    />
  );
}
```

---

## Part F — Updated Conversation Item

CREATE `components/sidebar/ConversationItem.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MoreHorizontal, MessageSquare, Pin } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { verdictColors } from '@/lib/design/tokens';
import ConversationContextMenu from './ConversationContextMenu';
import InlineRename from './InlineRename';

interface ConversationItemProps {
  convo: {
    id: string;
    title: string;
    domain?: string;
    has_simulation?: boolean;
    latest_verdict?: string | null;
    latest_verdict_probability?: number | null;
    is_pinned?: boolean;
    updated_at: string;
  };
}

export default function ConversationItem({ convo }: ConversationItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === `/c/${convo.id}`;
  const [renaming, setRenaming] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (!renaming) router.push(`/c/${convo.id}`);
  }, [renaming, router, convo.id]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/c/${convo.id}/report`;
    navigator.clipboard.writeText(url);
  }, [convo.id]);

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors relative',
        isActive
          ? 'bg-accent/10 text-txt-primary'
          : 'text-txt-secondary hover:bg-surface-2/30 hover:text-txt-primary',
      )}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        // The DropdownMenu handles right-click via the trigger
      }}
    >
      {/* Icon */}
      <ConversationIcon convo={convo} />

      {/* Title (or inline rename) */}
      <div className="flex-1 min-w-0">
        {renaming ? (
          <InlineRename
            conversationId={convo.id}
            currentTitle={convo.title}
            active={renaming}
            onDone={() => setRenaming(false)}
          />
        ) : (
          <span className="text-xs truncate block">{convo.title}</span>
        )}
      </div>

      {/* Pin indicator */}
      {convo.is_pinned && !hovered && (
        <Pin size={10} className="text-accent shrink-0 opacity-50" />
      )}

      {/* Context menu trigger (three dots on hover) */}
      {hovered && !renaming && (
        <ConversationContextMenu
          conversationId={convo.id}
          title={convo.title}
          isPinned={!!convo.is_pinned}
          onRename={() => setRenaming(true)}
          onShare={handleShare}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-0.5 rounded text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2 transition-colors shrink-0"
          >
            <MoreHorizontal size={13} />
          </button>
        </ConversationContextMenu>
      )}
    </div>
  );
}

function ConversationIcon({ convo }: { convo: ConversationItemProps['convo'] }) {
  if (convo.is_pinned) {
    return <Pin size={13} className="text-accent shrink-0" />;
  }

  if (convo.has_simulation && convo.latest_verdict) {
    const color = verdictColors[convo.latest_verdict as keyof typeof verdictColors];
    return <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color || '#7C3AED' }} />;
  }

  return <MessageSquare size={13} className="text-txt-tertiary opacity-50 shrink-0" />;
}
```

---

## Part G — Update App Store (Add search/filter state)

ADD these fields and actions to `lib/store/app.ts`:

```typescript
// ADD to the state interface:
searchFilter: string | null;
categoryFilter: string | null;
setSearchFilter: (query: string | null) => void;
setCategoryFilter: (category: string | null) => void;
removeConversation: (id: string) => void;
getFilteredConversations: () => Conversation[];

// ADD to the store:
searchFilter: null,
categoryFilter: null,

setSearchFilter: (query) => set({ searchFilter: query }),
setCategoryFilter: (category) => set({ categoryFilter: category }),

removeConversation: (id) => set((s) => ({
  conversations: s.conversations.filter((c) => c.id !== id),
  activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
})),

getFilteredConversations: () => {
  const state = get();
  let convos = [...state.conversations];

  // Category filter
  if (state.categoryFilter) {
    convos = convos.filter((c) => c.domain === state.categoryFilter);
  }

  // Search filter
  if (state.searchFilter) {
    const q = state.searchFilter.toLowerCase();
    convos = convos.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.latest_verdict?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q)
    );
  }

  // Sort: pinned first, then by updated_at
  convos.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return convos;
},
```

---

## Part H — API Routes (PATCH + DELETE)

These may already exist from earlier prompts. If not, create/update:

**UPDATE `app/api/c/[id]/route.ts` — add PATCH and DELETE:**

```typescript
// PATCH /api/c/[id] — rename, pin, update metadata
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updates.title = body.title.substring(0, 200);
    if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned;
    if (body.domain !== undefined) updates.domain = body.domain;

    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/c/[id] — delete conversation + cascade
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
```

---

## Part I — Wire into Sidebar

UPDATE the Sidebar component to use the new components. Replace the current conversation list rendering:

```typescript
import SidebarSearch from './SidebarSearch';
import CategoryFilters from './CategoryFilters';
import ConversationItem from './ConversationItem';
import { useAppStore } from '@/lib/store/app';

// Inside the sidebar expanded view:

// Replace the existing search button + conversation list with:
<SidebarSearch className="mb-2" />
<CategoryFilters className="mb-3" />

<div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
  {/* Pinned section */}
  {pinnedConvos.length > 0 && (
    <div className="mb-3">
      <span className="text-micro text-txt-disabled uppercase tracking-wider px-2 mb-1 block">Pinned</span>
      {pinnedConvos.map((c) => (
        <ConversationItem key={c.id} convo={c} />
      ))}
    </div>
  )}

  {/* Grouped by date */}
  {dateGroups.map((group) => (
    <div key={group.label} className="mb-3">
      <span className="text-micro text-txt-disabled uppercase tracking-wider px-2 mb-1 block">{group.label}</span>
      {group.conversations.map((c) => (
        <ConversationItem key={c.id} convo={c} />
      ))}
    </div>
  ))}

  {/* Empty state */}
  {filteredConvos.length === 0 && (
    <p className="text-micro text-txt-disabled text-center py-8">
      {searchFilter || categoryFilter ? 'No conversations match' : 'No conversations yet'}
    </p>
  )}
</div>
```

Use `getFilteredConversations()` from the store to get the filtered list, then group by date:

```typescript
const filteredConvos = useAppStore((s) => s.getFilteredConversations());
const pinnedConvos = filteredConvos.filter((c) => c.is_pinned);
const unpinnedConvos = filteredConvos.filter((c) => !c.is_pinned);

// Group unpinned by date
const dateGroups = groupByDate(unpinnedConvos);

function groupByDate(convos: any[]) {
  const groups: { label: string; conversations: any[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const todayItems: any[] = [];
  const yesterdayItems: any[] = [];
  const weekItems: any[] = [];
  const olderItems: any[] = [];

  for (const c of convos) {
    const d = new Date(c.updated_at);
    if (d >= today) todayItems.push(c);
    else if (d >= yesterday) yesterdayItems.push(c);
    else if (d >= weekAgo) weekItems.push(c);
    else olderItems.push(c);
  }

  if (todayItems.length) groups.push({ label: 'Today', conversations: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Yesterday', conversations: yesterdayItems });
  if (weekItems.length) groups.push({ label: 'This week', conversations: weekItems });
  if (olderItems.length) groups.push({ label: 'Older', conversations: olderItems });

  return groups;
}
```

---

## Testing

### Test 1 — Search filters conversations:
Click search or press Cmd+F → type "nvidia" → only conversations with "nvidia" in title show. Clear → all show again.

### Test 2 — Category filter:
Click "Investment" → only investment-domain conversations show. Click "All" → all show.

### Test 3 — Combined filters:
Select "Career" + type "quit" → shows only career conversations matching "quit".

### Test 4 — Right-click context menu:
Right-click conversation → dropdown: Pin, Rename, Share, Delete.

### Test 5 — Pin conversation:
Click "Pin to top" → conversation moves to "Pinned" section at top. Pin icon shows. Right-click again → "Unpin".

### Test 6 — Inline rename:
Click "Rename" → title becomes editable input, pre-selected. Type new name → Enter → saves. Escape → reverts.

### Test 7 — Share from context menu:
Click "Share report" → copies `/c/[id]/report` URL to clipboard.

### Test 8 — Delete with confirm:
Click "Delete" → modal: "Delete conversation? 'Should I invest...'" with Cancel + red Delete button. Confirm → conversation removed from sidebar.

### Test 9 — Three dots on hover:
Hover conversation item → three dots (⋯) appear on right. Click → opens context menu (same as right-click).

### Test 10 — Empty state:
Search for "xyz123" with no matches → "No conversations match" message.

### Test 11 — Pinned always first:
Pin 2 conversations → they always appear in "Pinned" section above date groups, regardless of date.

### Test 12 — Optimistic updates:
Pin/rename/delete → UI updates instantly. API call happens in background. On failure, reverts.

---

## Files Created/Modified

```
CREATED:
  components/sidebar/SidebarSearch.tsx — fuzzy search with Cmd+F
  components/sidebar/CategoryFilters.tsx — domain filter chips
  components/sidebar/ConversationContextMenu.tsx — right-click menu
  components/sidebar/ConversationItem.tsx — full conversation row component
  components/sidebar/InlineRename.tsx — editable title
  components/sidebar/DeleteConfirmDialog.tsx — delete confirmation

MODIFIED:
  lib/store/app.ts — add searchFilter, categoryFilter, removeConversation, getFilteredConversations
  app/api/c/[id]/route.ts — add PATCH + DELETE handlers
  Sidebar main component — wire search + filters + ConversationItem
```

---

Manda pro Fernando. Próximo é **PF-31** — quer continuar? 🐙
