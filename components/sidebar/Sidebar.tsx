'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  PanelLeftClose,
  MessageSquare,
  Pin,
  MoreHorizontal,
  Settings,
  Zap,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useAppStore, type ConversationSummary } from '@/lib/store/app';
import { useBillingStore } from '@/lib/store/billing';
import { useAuth } from '@/components/auth/AuthProvider';
import { TIERS, type TierType } from '@/lib/billing/tiers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import ConversationContextMenu from './ConversationContextMenu';
import InlineRename from './InlineRename';

const SIDEBAR_BG = '#0E0E16';
const ICON_STROKE = 1.5;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const expanded = useAppStore((s) => s.sidebarExpanded);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setExpanded = useAppStore((s) => s.setSidebarExpanded);
  const conversations = useAppStore((s) => s.conversations);
  const loading = useAppStore((s) => s.conversationsLoading);
  const setActiveId = useAppStore((s) => s.setActiveConversationId);

  const tier = useBillingStore((s) => s.tier);
  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const tokensTotal = useBillingStore((s) => s.tokensTotal);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const match = pathname?.match(/^\/c\/(.+)/);
    setActiveId(match ? match[1] : null);
  }, [pathname, setActiveId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !isInputFocused()) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  useEffect(() => {
    const focusSearch = () => {
      setExpanded(true);
      setTimeout(() => setSearchActive(true), 150);
    };
    window.addEventListener('octux:focus-sidebar-search', focusSearch);
    return () => window.removeEventListener('octux:focus-sidebar-search', focusSearch);
  }, [setExpanded]);

  const filtered = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  const pinned = filtered.filter((c) => c.is_pinned);
  const unpinned = filtered.filter((c) => !c.is_pinned);
  const groups = groupByDate(unpinned);

  const handleNew = useCallback(() => router.push('/'), [router]);

  const pro = TIERS.pro;

  // ─── COLLAPSED (icon rail) ───
  if (!expanded) {
    return (
      <TooltipProvider delayDuration={200}>
        <div
          className="w-[52px] h-full shrink-0 flex flex-col items-center py-3 gap-2 border-r border-white/[0.04] select-none"
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/70 to-cyan-500/40 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <span className="text-sm">🐙</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleNew}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-white/65 hover:bg-white/[0.04] transition-all"
              >
                <Plus size={16} strokeWidth={ICON_STROKE} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New conversation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setTimeout(() => setSearchActive(true), 200);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-white/65 hover:bg-white/[0.04] transition-all"
              >
                <Search size={16} strokeWidth={ICON_STROKE} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Search ⌘K</TooltipContent>
          </Tooltip>

          <div className="flex-1 min-h-4" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-white/45 hover:bg-white/[0.04] transition-all"
              >
                <Settings size={16} strokeWidth={ICON_STROKE} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // ─── EXPANDED ───
  return (
    <TooltipProvider delayDuration={200}>
      <motion.aside
        initial={false}
        animate={{ width: 260, opacity: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="h-full shrink-0 flex flex-col overflow-hidden border-r border-white/[0.04] select-none"
        style={{ width: 260, backgroundColor: SIDEBAR_BG }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/70 to-cyan-500/40 flex items-center justify-center shrink-0">
              <span className="text-[11px] leading-none">🐙</span>
            </div>
            <span className="text-sm font-medium text-white/80 tracking-wide truncate">octux</span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/55 hover:bg-white/[0.06] transition-all shrink-0"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} strokeWidth={ICON_STROKE} />
          </button>
        </div>

        {/* New conversation */}
        <div className="px-3 mb-1">
          <button
            type="button"
            onClick={handleNew}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/45 hover:text-white/85 hover:bg-white/[0.04] transition-all"
          >
            <Plus size={15} strokeWidth={ICON_STROKE} />
            <span className="text-[13px]">New conversation</span>
          </button>
        </div>

        <div className="mx-4 my-2 h-px bg-white/[0.04]" />

        {/* Search */}
        <div className="px-3 mb-2">
          {searchActive ? (
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Search size={13} className="text-white/25 shrink-0" strokeWidth={ICON_STROKE} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchActive(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setSearchActive(false);
                  }
                }}
                placeholder="Search conversations..."
                className="flex-1 text-xs bg-transparent text-white/80 placeholder:text-white/20 outline-none min-w-0"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchActive(true)}
              className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl text-white/25 hover:text-white/45 hover:bg-white/[0.03] transition-all"
            >
              <Search size={13} strokeWidth={ICON_STROKE} />
              <span className="text-xs flex-1 text-left">Search...</span>
              <kbd className="text-[9px] font-mono text-white/15 bg-white/[0.04] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          )}
        </div>

        <div className="mx-4 mb-2 h-px bg-white/[0.04]" />

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 min-h-0">
          {loading ? (
            <SidebarLoadingSkeleton />
          ) : (
            <>
              {pinned.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-medium text-white/15 uppercase tracking-[0.08em] px-2 mb-2 block">
                    Pinned
                  </span>
                  <div className="space-y-0.5">
                    {pinned.map((c) => (
                      <ConversationRow key={c.id} convo={c} isActive={pathname === `/c/${c.id}`} />
                    ))}
                  </div>
                </div>
              )}

              {groups.map((group) => (
                <div key={group.label} className="mb-4">
                  <span className="text-[10px] font-medium text-white/15 uppercase tracking-[0.08em] px-2 mb-2 block">
                    {group.label}
                  </span>
                  <div className="space-y-0.5">
                    {group.conversations.map((c) => (
                      <ConversationRow key={c.id} convo={c} isActive={pathname === `/c/${c.id}`} />
                    ))}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12 px-2">
                  <MessageSquare size={20} className="text-white/10 mx-auto mb-2" strokeWidth={ICON_STROKE} />
                  <p className="text-xs text-white/25">
                    {searchQuery.trim() ? 'No results' : 'No conversations yet'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom */}
        <div className="shrink-0 p-3 space-y-2 border-t border-white/[0.04]">
          {tier === 'free' ? (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('octux:show-upgrade', { detail: { suggestedTier: 'pro' } }),
                )
              }
              className="w-full p-3 rounded-xl bg-gradient-to-br from-accent/[0.12] to-accent/[0.02] border border-accent/[0.12] hover:border-accent/[0.22] transition-all group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                  <Zap size={14} className="text-accent" strokeWidth={ICON_STROKE} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80">Upgrade to Pro</p>
                  <p className="text-[10px] text-white/35">
                    {pro.limits.tokensPerMonth} tokens/mo · {pro.priceLabel}
                    {pro.period}
                  </p>
                </div>
                <ChevronRight size={13} className="text-white/15 group-hover:text-white/35 transition-colors shrink-0" strokeWidth={ICON_STROKE} />
              </div>
            </button>
          ) : (
            <div className="px-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap size={13} className="text-accent/70 shrink-0" strokeWidth={ICON_STROKE} />
                <span className="text-[10px] text-white/35">
                  {tokensRemaining}/{tokensTotal} tokens
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    tokensRemaining === 0
                      ? 'bg-verdict-abandon'
                      : tokensRemaining <= 2
                        ? 'bg-verdict-delay'
                        : 'bg-accent',
                  )}
                  style={{ width: `${tokensTotal > 0 ? (tokensRemaining / tokensTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 border border-accent/10">
              <span className="text-[10px] font-bold text-accent">
                {isAuthenticated && user?.email ? user.email[0].toUpperCase() : 'G'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/55 truncate">
                {isAuthenticated
                  ? (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
                    user?.email ||
                    'User'
                  : 'Guest'}
              </p>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('octux:show-auth', { detail: { mode: 'login' } }),
                    )
                  }
                  className="text-[10px] text-accent/80 hover:text-accent flex items-center gap-0.5 mt-0.5"
                >
                  <LogIn size={10} strokeWidth={ICON_STROKE} />
                  Sign in
                </button>
              )}
            </div>
            <TierPill tier={tier} />
            <button
              type="button"
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-white/45 hover:bg-white/[0.04] transition-all shrink-0"
              aria-label="Settings"
            >
              <Settings size={14} strokeWidth={ICON_STROKE} />
            </button>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

// ─── Row ───

function ConversationRow({ convo, isActive }: { convo: ConversationSummary; isActive: boolean }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [hovered, setHovered] = useState(false);

  const title = convo.title || 'New conversation';

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 rounded-lg cursor-pointer transition-colors pl-2 pr-1.5 py-2 min-h-[36px]',
        isActive
          ? 'bg-accent/[0.08] text-white/90'
          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]',
      )}
      onClick={() => {
        if (!renaming) router.push(`/c/${convo.id}`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      <ConvoIcon convo={convo} />

      <div className="flex-1 min-w-0 pl-0.5">
        {renaming ? (
          <InlineRename
            conversationId={convo.id}
            currentTitle={title}
            active={renaming}
            onDone={() => setRenaming(false)}
          />
        ) : (
          <span className="text-[12px] truncate block">{title}</span>
        )}
      </div>

      {convo.is_pinned && !hovered && !renaming && (
        <Pin size={10} className="text-accent/45 shrink-0" strokeWidth={ICON_STROKE} />
      )}

      {hovered && !renaming && (
        <ConversationContextMenu
          conversationId={convo.id}
          title={title}
          isPinned={!!convo.is_pinned}
          onRename={() => setRenaming(true)}
          onShare={() => navigator.clipboard.writeText(`${window.location.origin}/c/${convo.id}/report`)}
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-white/55 hover:bg-white/[0.06] transition-all shrink-0"
            aria-label="More"
          >
            <MoreHorizontal size={13} strokeWidth={ICON_STROKE} />
          </button>
        </ConversationContextMenu>
      )}
    </div>
  );
}

function ConvoIcon({ convo }: { convo: ConversationSummary }) {
  if (convo.is_pinned) {
    return <Pin size={13} className="text-accent/50 shrink-0" strokeWidth={ICON_STROKE} />;
  }
  if (convo.has_simulation && convo.latest_verdict) {
    const colors: Record<string, string> = {
      proceed: '#10b981',
      delay: '#f59e0b',
      abandon: '#ef4444',
    };
    return (
      <span
        className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/10"
        style={{ backgroundColor: colors[convo.latest_verdict || ''] || '#7C3AED' }}
      />
    );
  }
  return <MessageSquare size={13} className="text-white/22 shrink-0" strokeWidth={ICON_STROKE} />;
}

function TierPill({ tier }: { tier: TierType }) {
  const label =
    tier === 'free'
      ? 'Free'
      : tier === 'pro'
        ? 'Pro'
        : tier === 'max'
          ? 'Max'
          : 'Octopus';
  return (
    <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider shrink-0">{label}</span>
  );
}

function SidebarLoadingSkeleton() {
  return (
    <div className="space-y-3 px-1 py-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5">
          <Skeleton className="w-2 h-2 rounded-full shrink-0 bg-white/[0.06]" />
          <Skeleton className="h-3 flex-1 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function groupByDate(convos: ConversationSummary[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);

  const buckets = {
    today: [] as ConversationSummary[],
    yesterday: [] as ConversationSummary[],
    week: [] as ConversationSummary[],
    older: [] as ConversationSummary[],
  };

  for (const c of convos) {
    const d = new Date(c.updated_at);
    if (d >= todayStart) buckets.today.push(c);
    else if (d >= yesterdayStart) buckets.yesterday.push(c);
    else if (d >= weekAgo) buckets.week.push(c);
    else buckets.older.push(c);
  }

  const groups: { label: string; conversations: ConversationSummary[] }[] = [];
  if (buckets.today.length) groups.push({ label: 'Today', conversations: buckets.today });
  if (buckets.yesterday.length) groups.push({ label: 'Yesterday', conversations: buckets.yesterday });
  if (buckets.week.length) groups.push({ label: 'This week', conversations: buckets.week });
  if (buckets.older.length) groups.push({ label: 'Older', conversations: buckets.older });

  return groups;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
}
