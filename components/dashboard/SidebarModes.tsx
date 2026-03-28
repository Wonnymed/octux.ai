'use client';

import type { LucideIcon } from 'lucide-react';
import { Zap, ArrowLeftRight, ShieldAlert, Skull } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { DARK_THEME } from '@/lib/dashboard/theme';
import type { DashboardMode } from '@/lib/store/dashboard-ui';

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
    description: '10 specialists analyze your decision',
    Icon: Zap,
    accent: '#e8593c',
  },
  {
    id: 'compare',
    name: 'Compare',
    description: 'A vs B — which path wins?',
    Icon: ArrowLeftRight,
    accent: '#60a5fa',
  },
  {
    id: 'stress',
    name: 'Stress test',
    description: 'Find every way this plan can fail',
    Icon: ShieldAlert,
    accent: '#f87171',
  },
  {
    id: 'premortem',
    name: 'Pre-mortem',
    description: 'It failed in 1 year. Why?',
    Icon: Skull,
    accent: '#fbbf24',
  },
];

export default function SidebarModes({
  activeMode,
  onSelect,
}: {
  activeMode: DashboardMode;
  onSelect: (mode: DashboardMode) => void;
}) {
  return (
    <div className="px-3">
      <p
        className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.2em]"
        style={{ color: DARK_THEME.text_tertiary }}
      >
        Simulation modes
      </p>
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_SIDEBAR_MODES.map((m) => {
          const active = activeMode === m.id;
          const Icon = m.Icon;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left transition-all duration-150',
                  active ? 'bg-white/[0.03]' : 'border-transparent hover:bg-white/[0.04]',
                )}
                style={
                  active
                    ? { borderLeftColor: m.accent }
                    : { borderLeftColor: 'transparent' }
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className={cn(
                    'mt-0.5 shrink-0 transition-colors',
                    active ? '' : 'text-white/[0.35] group-hover:text-white/60',
                  )}
                  style={active ? { color: m.accent } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-[13px] font-medium transition-colors',
                      active ? 'text-white/80' : 'text-white/50 group-hover:text-white/60',
                    )}
                  >
                    {m.name}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5 text-[11px] leading-snug transition-colors',
                      active ? 'text-white/35' : 'text-white/25 group-hover:text-white/35',
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
