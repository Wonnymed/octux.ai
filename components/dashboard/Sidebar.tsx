'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeftClose, Home, Gem, UserCircle } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useBillingStore } from '@/lib/store/billing';
import { useDashboardUiStore, type DashboardMode } from '@/lib/store/dashboard-ui';
import { DARK_THEME } from '@/lib/dashboard/theme';
import SidebarModes, { DASHBOARD_SIDEBAR_MODES } from '@/components/dashboard/SidebarModes';
import SidebarHistory from '@/components/dashboard/SidebarHistory';
import UserProfilePopover from '@/components/dashboard/UserProfilePopover';

export type DashboardSidebarLayout = 'expanded' | 'collapsed' | 'drawer';

export default function DashboardSidebar({
  layout,
  onCollapse,
  onExpand,
}: {
  layout: DashboardSidebarLayout;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const operatorActive = pathname === '/operator';
  const tier = useBillingStore((s) => s.tier);
  const fetchBalance = useBillingStore((s) => s.fetchBalance);

  const activeMode = useDashboardUiStore((s) => s.activeMode);
  const setActiveMode = useDashboardUiStore((s) => s.setActiveMode);
  const setActiveTier = useDashboardUiStore((s) => s.setActiveTier);
  const setPreviewTier = useDashboardUiStore((s) => s.setPreviewTier);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  /** Free accounts bill at swarm; align preview canvas to swarm on load/tier sync. */
  useEffect(() => {
    if (tier === 'free') {
      setActiveTier('swarm');
      setPreviewTier('swarm');
    }
  }, [tier, setActiveTier, setPreviewTier]);

  const selectMode = (mode: DashboardMode) => {
    setActiveMode(mode);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const asideBase = {
    backgroundColor: DARK_THEME.bg_sidebar,
    color: DARK_THEME.text_primary,
    borderColor: 'rgba(255,255,255,0.06)',
  } as const;

  if (layout === 'collapsed') {
    return (
      <aside
        className="flex h-full w-full flex-col items-center border-r font-sans antialiased"
        style={asideBase}
      >
        <div className="flex w-full flex-col items-center px-2 pt-4">
          <button
            type="button"
            title="Open sidebar"
            aria-label="Open sidebar"
            onClick={onExpand}
            className="group flex h-8 w-8 items-center justify-center rounded-full transition-[transform,box-shadow] hover:scale-[1.03]"
          >
            <span
              className="h-[10px] w-[10px] shrink-0 rounded-full bg-[#e8593c] transition-shadow group-hover:shadow-[0_0_14px_rgba(232,89,60,0.85)]"
              style={{ boxShadow: '0 0 8px rgba(232,89,60,0.5)' }}
            />
          </button>
        </div>

        <div className="mt-3 flex w-full flex-col items-center gap-1 px-2">
          <Link
            href="/home"
            title="Home"
            aria-label="Home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          >
            <Home size={18} strokeWidth={1.75} />
          </Link>
          <Link
            href="/operator"
            title="My Operator"
            aria-label="My Operator"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white/80',
              operatorActive ? 'border-[#e8593c]/50 bg-[rgba(232,89,60,0.08)] text-white/90' : 'border-white/10',
            )}
          >
            <UserCircle size={16} strokeWidth={1.75} />
          </Link>
        </div>

        <div className="mt-1 flex w-full flex-col items-stretch px-0">
          {DASHBOARD_SIDEBAR_MODES.map((m) => {
            const active = activeMode === m.id;
            const Icon = m.Icon;
            return (
              <button
                key={m.id}
                type="button"
                title={m.name}
                aria-label={m.name}
                onClick={() => selectMode(m.id)}
                className="group relative flex w-full items-center justify-center py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                {active ? (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r"
                    style={{ backgroundColor: m.accent }}
                    aria-hidden
                  />
                ) : null}
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors',
                    active ? '' : 'text-white/40 group-hover:text-white/50',
                  )}
                  style={active ? { color: m.accent } : undefined}
                />
              </button>
            );
          })}
        </div>

        <SidebarHistory variant="rail" />

        {tier === 'free' && (
          <div className="mt-2 flex w-full justify-center px-2">
            <Link
              href="/pricing"
              title="Upgrade to Pro"
              aria-label="Upgrade to Pro"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#e8593c] transition-colors hover:bg-white/[0.06]"
            >
              <Gem size={16} strokeWidth={1.75} />
            </Link>
          </div>
        )}

        <div className="mt-auto w-full border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <UserProfilePopover variant="rail" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r font-sans antialiased" style={asideBase}>
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: DARK_THEME.border_default }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-[10px] w-[10px] shrink-0 rounded-full bg-[#e8593c]"
            style={{ boxShadow: '0 0 8px rgba(232,89,60,0.5)' }}
          />
          <span className="truncate text-[14px] font-medium tracking-tight text-white/90">Octux</span>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          title="Close sidebar"
          aria-label="Close sidebar"
          className="group shrink-0 rounded-md p-1 transition-colors"
        >
          <PanelLeftClose
            size={18}
            strokeWidth={1.75}
            className="text-white/30 transition-colors group-hover:text-white/60"
          />
        </button>
      </div>

      <div className="space-y-2 px-3 pt-3">
        <Link
          href="/home"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-all',
            pathname === '/home'
              ? 'border-[#e8593c]/40 bg-[rgba(232,89,60,0.06)] text-white/85'
              : 'border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white/70',
          )}
        >
          <Home size={16} strokeWidth={1.5} />
          Home
        </Link>
        <Link
          href="/operator"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-all',
            operatorActive
              ? 'border-[#e8593c]/40 bg-[rgba(232,89,60,0.06)] text-white/85'
              : 'border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white/70',
          )}
        >
          <UserCircle size={16} strokeWidth={1.5} />
          My Operator
        </Link>
      </div>

      <div className="mt-4 min-h-0 flex flex-1 flex-col">
        <SidebarModes activeMode={activeMode} onSelect={setActiveMode} />
        <div className="mt-4 min-h-0 flex flex-1 flex-col">
          <SidebarHistory variant="full" />
        </div>
      </div>

      {tier === 'free' && (
        <div className="shrink-0 px-3 pb-3">
          <Link
            href="/pricing"
            className="block rounded-[10px] border p-3 transition-colors hover:bg-white/[0.04]"
            style={{
              borderColor: DARK_THEME.accent + '55',
              background: `linear-gradient(${DARK_THEME.bg_sidebar}, ${DARK_THEME.bg_sidebar}) padding-box, linear-gradient(135deg, ${DARK_THEME.accent}55, ${DARK_THEME.info}44) border-box`,
              border: '1px solid transparent',
            }}
          >
            <p className="text-[13px] font-semibold text-white/80">Upgrade to Pro — $29/mo</p>
            <p className="mt-0.5 text-[11px] text-white/35">Unlimited specialist sims</p>
          </Link>
        </div>
      )}

      <UserProfilePopover variant="full" />
    </aside>
  );
}
