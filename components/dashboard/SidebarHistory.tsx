'use client';

import { DARK_THEME } from '@/lib/dashboard/theme';

export type MockHistoryItem = {
  title: string;
  result: 'proceed' | 'delay' | 'abandon';
  mode: 'simulate' | 'compare' | 'stress' | 'premortem';
};

export const MOCK_HISTORY: MockHistoryItem[] = [
  { title: 'Import smartphones China→BR', result: 'proceed', mode: 'simulate' },
  { title: 'China vs Vietnam supplier', result: 'proceed', mode: 'compare' },
  { title: 'Cafe in Gangnam — risks', result: 'abandon', mode: 'stress' },
  { title: 'SaaS launch failure analysis', result: 'delay', mode: 'premortem' },
  { title: 'Open cafe in Gangnam', result: 'proceed', mode: 'simulate' },
  { title: 'Invest $10K NVIDIA', result: 'delay', mode: 'simulate' },
];

const RESULT_DOT: Record<MockHistoryItem['result'], string> = {
  proceed: DARK_THEME.success,
  delay: DARK_THEME.warning,
  abandon: DARK_THEME.danger,
};

const MODE_BADGE: Record<MockHistoryItem['mode'], { label: string; color: string }> = {
  simulate: { label: 'sim', color: DARK_THEME.accent },
  compare: { label: 'A/B', color: DARK_THEME.info },
  stress: { label: 'stress', color: DARK_THEME.danger },
  premortem: { label: 'pre-m', color: DARK_THEME.warning },
};

export default function SidebarHistory() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
      <p
        className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.2em]"
        style={{ color: DARK_THEME.text_tertiary }}
      >
        History
      </p>
      <ul className="flex flex-col gap-1">
        {MOCK_HISTORY.map((item, i) => {
          const badge = MODE_BADGE[item.mode];
          return (
            <li key={`${item.title}-${i}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                onClick={() => {}}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: RESULT_DOT[item.result] }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">{item.title}</span>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                  style={{
                    color: badge.color,
                    backgroundColor: badge.color + '22',
                  }}
                >
                  {badge.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
