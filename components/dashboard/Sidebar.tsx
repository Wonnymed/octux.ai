'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeftClose, Home, Gem, UserCircle } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { normalizeTierType } from '@/lib/billing/tiers';
import { useBillingStore } from '@/lib/store/billing';
import { useDashboardUiStore, type DashboardMode } from '@/lib/store/dashboard-ui';
import { DARK_THEME } from '@/lib/dashboard/theme';
import SidebarModes, { DASHBOARD_SIDEBAR_MODES } from '@/components/dashboard/SidebarModes';
import SidebarHistory from '@/components/dashboard/SidebarHistory';
import UserProfilePopover from '@/components/dashboard/UserProfilePopover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import SukgoLogo from '@/components/brand/SukgoLogo';

const TERRA = '#e8593c';

const RAIL_TOOLTIP =
  'border border-white/[0.08] bg-[#1a1a1f] px-2 py-1 text-[12px] text-white/80 shadow-md';

function CollapsedRailIconWrap({
  label,
  active,
  href,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const body = (
    <>
      {active ? (
        <span
          className="pointer-events-none absolute left-0 top-1/2 z-0 h-5 w-[3px] -translate-y-1/2 rounded-r-[2px]"
          style={{ backgroundColor: TERRA }}
          aria-hidden
        />
      ) : null}
      <span className="relative z-[1] flex h-[18px] w-[18px] items-center justify-center">{children}</span>
    </>
  );

  const className = cn(
    'group relative mx-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-[background,color] duration-150',
    active ? 'text-white/90' : 'text-white/40 hover:bg-white/[0.06] hover:text-white/55',
  );

  const trigger =
    href !== undefined ? (
      <Link href={href} className={className} aria-label={label}>
        {body}
      </Link>
    ) : (
      <button type="button" onClick={onClick} className={className} aria-label={label}>
        {body}
      </button>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className={RAIL_TOOLTIP}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

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
  const isFreeTier = normalizeTierType(tier) === 'free';

  const activeMode = useDashboardUiStore((s) => s.activeMode);
  const setActiveMode = useDashboardUiStore((s) => s.setActiveMode);
  const setActiveTier = useDashboardUiStore((s) => s.setActiveTier);
  const setPreviewTier = useDashboardUiStore((s) => s.setPreviewTier);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  /** Free accounts bill at swarm; align preview canvas to swarm on load/tier sync. */
  useEffect(() => {
    if (normalizeTierType(tier) === 'free') {
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
    const homeActive = pathname === '/home';

    return (
      <TooltipProvider delayDuration={200}>
        <aside
          className="flex h-full w-full flex-col items-center border-r py-2 font-sans antialiased"
          style={asideBase}
        >
          <div className="flex w-full flex-col items-center pt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onExpand}
                  className="flex cursor-pointer items-center justify-center rounded-lg p-0 transition-opacity hover:opacity-90"
                  aria-label="Open sidebar"
                >
                  <SukgoLogo variant="dark" size="sm" showWordmark={false} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className={RAIL_TOOLTIP}>
                Open sidebar
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-3 shrink-0" aria-hidden />

          <div className="flex w-full flex-col items-center gap-0.5">
            <CollapsedRailIconWrap label="Home" active={homeActive} href="/home">
              <Home size={18} strokeWidth={1.5} />
            </CollapsedRailIconWrap>
            <CollapsedRailIconWrap label="My Operator" active={operatorActive} href="/operator">
              <UserCircle size={18} strokeWidth={1.5} />
            </CollapsedRailIconWrap>
          </div>

          <div
            className="my-2 h-px w-6 shrink-0 bg-white/[0.06]"
            role="presentation"
            aria-hidden
          />

          <div className="flex w-full flex-col items-stretch gap-0.5 px-0">
            {DASHBOARD_SIDEBAR_MODES.map((m) => {
              const active = activeMode === m.id;
              const Icon = m.Icon;
              return (
                <Tooltip key={m.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => selectMode(m.id)}
                      className={cn(
                        'group relative flex h-8 w-full shrink-0 items-center justify-center rounded-lg transition-[background,color] duration-150',
                        active ? 'text-white/90' : 'text-white/40 hover:bg-white/[0.06] hover:text-white/55',
                      )}
                      aria-label={m.name}
                    >
                      {active ? (
                        <span
                          className="pointer-events-none absolute left-0 top-1/2 z-0 h-5 w-[3px] -translate-y-1/2 rounded-r-[2px]"
                          style={{ backgroundColor: TERRA }}
                          aria-hidden
                        />
                      ) : null}
                      <Icon size={18} strokeWidth={1.5} className="relative z-[1]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className={RAIL_TOOLTIP}>
                    {m.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="min-h-0 w-full flex-1 overflow-hidden">
            <SidebarHistory variant="rail" />
          </div>

          {isFreeTier ? (
            <div className="flex w-full shrink-0 justify-center py-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/pricing"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/45"
                    aria-label="Upgrade"
                  >
                    <Gem size={18} strokeWidth={1.5} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className={RAIL_TOOLTIP}>
                  Upgrade
                </TooltipContent>
              </Tooltip>
            </div>
          ) : null}

          <div className="mt-auto w-full shrink-0 pb-1 pt-0.5">
            <UserProfilePopover variant="rail" />
          </div>
        </aside>
      </TooltipProvider>
    );
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r font-sans antialiased" style={asideBase}>
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: DARK_THEME.border_default }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <SukgoLogo variant="dark" size="md" showWordmark />
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

      {isFreeTier && (
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
