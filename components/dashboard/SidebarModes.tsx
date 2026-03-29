'use client';

import type { LucideIcon } from 'lucide-react';
import { Zap, ArrowLeftRight, ShieldAlert, Skull } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/design/cn';
import { TRANSITIONS } from '@/lib/design/transitions';
import { MODE_ACCENTS } from '@/lib/design/r16-colors';
import { useDashboardUiStore, type DashboardMode, type DashboardModeNavFocus } from '@/lib/store/dashboard-ui';
import { useSimulationStore } from '@/lib/store/simulation';

export const DASHBOARD_SIDEBAR_MODES: {
  id: DashboardMode;
  name: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
}[] = [
  {
    id: 'simulate',
    name: 'Simulate',
    description: 'Run the full analysis',
    Icon: Zap,
    accent: MODE_ACCENTS.simulate.color,
  },
  {
    id: 'compare',
    name: 'Compare',
    description: 'A vs B — which wins?',
    Icon: ArrowLeftRight,
    accent: MODE_ACCENTS.compare.color,
  },
  {
    id: 'stress',
    name: 'Stress test',
    description: 'Find the breaking point',
    Icon: ShieldAlert,
    accent: MODE_ACCENTS.stress.color,
  },
  {
    id: 'premortem',
    name: 'Pre-mortem',
    description: 'The failure autopsy',
    Icon: Skull,
    accent: MODE_ACCENTS.premortem.color,
  },
];

export default function SidebarModes({
  activeMode,
  modeNavFocus,
  onSelect,
}: {
  activeMode: DashboardMode;
  modeNavFocus: DashboardModeNavFocus;
  onSelect: (mode: DashboardMode) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleModeClick(mode: DashboardMode) {
    if (mode === activeMode && pathname === '/' && modeNavFocus === 'mode') {
      useDashboardUiStore.getState().resetSession();
      useSimulationStore.getState().reset();
    }
    onSelect(mode);
    if (pathname !== '/') {
      router.push('/');
    }
  }

  return (
    <div className="px-3">
      <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[2px] text-white/40">
        Simulation modes
      </p>
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_SIDEBAR_MODES.map((m) => {
          const active = modeNavFocus === 'mode' && activeMode === m.id;
          const Icon = m.Icon;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => handleModeClick(m.id)}
                className={cn(
                  'group relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150',
                  active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="dashboard-mode-indicator"
                    className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r bg-white"
                    transition={TRANSITIONS.spring}
                    aria-hidden
                  />
                ) : null}
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 transition-colors"
                  style={{ color: active ? m.accent : 'rgba(255,255,255,0.45)' }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-[13px] transition-colors',
                      active ? 'font-semibold text-white' : 'font-medium text-white/50 group-hover:text-white/70',
                    )}
                  >
                    {m.name}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5 text-[11px] leading-snug transition-colors',
                      active ? 'text-white/60' : 'text-white/40 group-hover:text-white/50',
                    )}
                  >
                    {m.description}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
