'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBillingStore } from '@/lib/store/billing';
import { useDashboardUiStore } from '@/lib/store/dashboard-ui';
import type { TierType } from '@/lib/billing/tiers';
import { DARK_THEME } from '@/lib/dashboard/theme';
import SidebarModes from '@/components/dashboard/SidebarModes';
import SidebarHistory from '@/components/dashboard/SidebarHistory';

function initialsFromUser(user: { email?: string | null; user_metadata?: { full_name?: string } } | null) {
  const name = user?.user_metadata?.full_name || user?.email || '?';
  const parts = name.split(/[\s@]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardSidebar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const tier = useBillingStore((s) => s.tier);
  const tokensRemaining = useBillingStore((s) => s.tokensRemaining);
  const fetchBalance = useBillingStore((s) => s.fetchBalance);

  const activeMode = useDashboardUiStore((s) => s.activeMode);
  const setActiveMode = useDashboardUiStore((s) => s.setActiveMode);
  const resetSession = useDashboardUiStore((s) => s.resetSession);
  const setActiveTier = useDashboardUiStore((s) => s.setActiveTier);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (tier === 'free') {
      setActiveTier('swarm');
    }
  }, [tier, setActiveTier]);

  const planLabel = (t: TierType) => (t === 'free' ? 'Free' : t === 'pro' ? 'Pro' : 'Max');

  return (
    <aside
      className="flex h-full w-[250px] shrink-0 flex-col border-r font-sans antialiased"
      style={{
        backgroundColor: DARK_THEME.bg_sidebar,
        borderColor: DARK_THEME.border_default,
        color: DARK_THEME.text_primary,
      }}
    >
      {/* Brand */}
      <div
        className="flex shrink-0 items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: DARK_THEME.border_default }}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: DARK_THEME.accent,
            boxShadow: `0 0 12px ${DARK_THEME.accent}99`,
          }}
        />
        <span className="text-[14px] font-medium tracking-tight text-white/90">Octux</span>
      </div>

      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => {
            resetSession();
            router.push('/');
          }}
          className="w-full rounded-[10px] border py-2.5 text-[13px] font-medium transition-colors hover:bg-white/[0.04]"
          style={{ borderColor: DARK_THEME.border_default, color: DARK_THEME.text_primary }}
        >
          + New simulation
        </button>
      </div>

      <div className="mt-4 min-h-0 flex flex-1 flex-col">
        <SidebarModes activeMode={activeMode} onSelect={setActiveMode} />
        <div className="mt-4 min-h-0 flex flex-1 flex-col">
          <SidebarHistory />
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
            <p className="text-[12px] font-semibold text-white/90">Upgrade to Pro — $29/mo</p>
            <p className="mt-0.5 text-[10px]" style={{ color: DARK_THEME.text_secondary }}>
              Unlimited specialist sims
            </p>
          </Link>
        </div>
      )}

      <div
        className="flex shrink-0 items-center gap-2.5 border-t px-3 py-3"
        style={{ borderColor: DARK_THEME.border_default }}
      >
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: DARK_THEME.accent }}
        >
          {initialsFromUser(user)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-white/85">
            {user?.user_metadata?.full_name || user?.email || 'Account'}
          </p>
          <p className="text-[10px]" style={{ color: DARK_THEME.text_tertiary }}>
            {planLabel(tier)} · {tokensRemaining} tokens left
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-[10px] font-medium underline-offset-2 hover:underline"
          style={{ color: DARK_THEME.text_tertiary }}
        >
          Out
        </button>
      </div>
    </aside>
  );
}
